import { prisma } from '../config/database';
import { ATTENDANCE_STATUS, LATE_THRESHOLDS, ATTENDANCE_THRESHOLDS, CONSECUTIVE_ABSENCE_ALERTS } from '../config/constants';
import { getAllDatesInRange, isWorkingDay, formatDate } from '../utils/dateUtils';
import { logger } from '../config/logger';
import { sendEmail, buildAbsenceAlertEmail } from '../utils/emailSender.util';

export interface AttendanceStats {
  totalWorkingDays: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  totalHalfDay: number;
  attendancePercentage: number;
  tier: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'AT_RISK';
}

export interface WorkingDaysResult {
  count: number;
  dates: string[];
}

// Deferred import to avoid circular dependency at module load time
async function getCreateNotification() {
  const mod = await import('../modules/notifications/notifications.service');
  return mod.createNotification;
}

/**
 * Calculates working days in a date range, excluding weekends and holidays.
 */
export async function calculateWorkingDays(
  schoolId: string,
  startDate: Date,
  endDate: Date,
  enrollmentDate?: Date
): Promise<WorkingDaysResult> {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { workingDays: true },
  });

  const workingDays = school?.workingDays ?? [1, 2, 3, 4, 5];

  const holidays = await prisma.holiday.findMany({
    where: { schoolId, date: { gte: startDate, lte: endDate } },
    select: { date: true, endDate: true },
  });

  const holidayDates = new Set<string>();
  for (const h of holidays) {
    if (h.endDate) {
      getAllDatesInRange(h.date, h.endDate).forEach((d) => holidayDates.add(formatDate(d)));
    } else {
      holidayDates.add(formatDate(h.date));
    }
  }

  const validDates: string[] = [];
  for (const date of getAllDatesInRange(startDate, endDate)) {
    const dateStr = formatDate(date);
    if (enrollmentDate && date < enrollmentDate) continue;
    if (!isWorkingDay(date, workingDays)) continue;
    if (holidayDates.has(dateStr)) continue;
    validDates.push(dateStr);
  }

  return { count: validDates.length, dates: validDates };
}

/**
 * Calculates attendance stats for a student over a date range using the
 * configured late-minute thresholds and half-day weighting.
 */
export async function calculateStudentAttendanceStats(
  studentId: string,
  schoolId: string,
  startDate: Date,
  endDate: Date
): Promise<AttendanceStats> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { enrollmentDate: true },
  });

  const { count: totalWorkingDays } = await calculateWorkingDays(
    schoolId,
    startDate,
    endDate,
    student?.enrollmentDate
  );

  const attendances = await prisma.attendance.findMany({
    where: { studentId, date: { gte: startDate, lte: endDate } },
    select: { status: true, lateMinutes: true },
  });

  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  let totalExcused = 0;
  let totalHalfDay = 0;

  for (const record of attendances) {
    switch (record.status) {
      case ATTENDANCE_STATUS.PRESENT:
        totalPresent++;
        break;
      case ATTENDANCE_STATUS.ABSENT:
        totalAbsent++;
        break;
      case ATTENDANCE_STATUS.LATE:
        if (record.lateMinutes <= LATE_THRESHOLDS.PRESENT_MAX) {
          totalPresent++;
        } else if (record.lateMinutes <= LATE_THRESHOLDS.LATE_MAX) {
          totalLate++;
        } else {
          totalAbsent++;
        }
        break;
      case ATTENDANCE_STATUS.EXCUSED:
        totalExcused++;
        break;
      case ATTENDANCE_STATUS.HALF_DAY:
        totalHalfDay++;
        break;
    }
  }

  const effectiveDays = totalPresent + totalLate * 0.75 + totalHalfDay * 0.5;
  const attendancePercentage =
    totalWorkingDays > 0 ? Math.round((effectiveDays / totalWorkingDays) * 100 * 10) / 10 : 0;

  let tier: AttendanceStats['tier'];
  if (attendancePercentage >= ATTENDANCE_THRESHOLDS.EXCELLENT) tier = 'EXCELLENT';
  else if (attendancePercentage >= ATTENDANCE_THRESHOLDS.GOOD) tier = 'GOOD';
  else if (attendancePercentage >= ATTENDANCE_THRESHOLDS.WARNING) tier = 'WARNING';
  else tier = 'AT_RISK';

  return { totalWorkingDays, totalPresent, totalAbsent, totalLate, totalExcused, totalHalfDay, attendancePercentage, tier };
}

/**
 * Checks for consecutive absences and triggers parent/admin notifications.
 * 3 consecutive absences → notify parent; 5 → escalate to admin.
 */
export async function checkConsecutiveAbsences(studentId: string, schoolId: string): Promise<void> {
  try {
    const recent = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: CONSECUTIVE_ABSENCE_ALERTS.ADMIN_ESCALATE + 2,
      select: { status: true, date: true },
    });

    let count = 0;
    for (const r of recent) {
      if (r.status === ATTENDANCE_STATUS.ABSENT) count++;
      else break;
    }

    if (count < CONSECUTIVE_ABSENCE_ALERTS.PARENT_NOTIFY) return;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { parent: { select: { id: true, email: true, firstName: true } } },
    });

    if (!student) return;

    const studentName = `${student.firstName} ${student.lastName}`;
    const createNotification = await getCreateNotification();

    if (student.parent) {
      await createNotification({
        userId: student.parent.id,
        title: `Attendance Alert: ${studentName}`,
        message: `${studentName} has been absent for ${count} consecutive school days.`,
        type: 'ABSENCE_ALERT',
        relatedEntityId: studentId,
      });

      await sendEmail({
        to: student.parent.email,
        subject: `Attendance Alert – ${studentName}`,
        html: buildAbsenceAlertEmail(studentName, student.parent.firstName, formatDate(recent[0].date), count),
      }).catch((err) => logger.error('Email send failed:', err));
    }

    if (count >= CONSECUTIVE_ABSENCE_ALERTS.ADMIN_ESCALATE) {
      const admins = await prisma.user.findMany({
        where: { schoolId, role: 'ADMIN', isActive: true },
        select: { id: true },
      });

      await Promise.all(
        admins.map((admin) =>
          createNotification({
            userId: admin.id,
            title: `Escalation: ${studentName} absent ${count} days`,
            message: `${studentName} has been absent for ${count} consecutive days. Immediate follow-up required.`,
            type: 'ABSENCE_ALERT',
            relatedEntityId: studentId,
          })
        )
      );
    }
  } catch (err) {
    logger.error('checkConsecutiveAbsences failed:', err);
  }
}

/**
 * Notifies parent if a student's YTD attendance falls below the AT_RISK threshold.
 */
export async function checkAttendanceThreshold(studentId: string, schoolId: string): Promise<void> {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const stats = await calculateStudentAttendanceStats(studentId, schoolId, startOfYear, now);

    if (stats.tier !== 'AT_RISK') return;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { parent: { select: { id: true } } },
    });

    if (student?.parent) {
      const createNotification = await getCreateNotification();
      await createNotification({
        userId: student.parent.id,
        title: 'Low Attendance Warning',
        message: `${student.firstName} ${student.lastName}'s attendance is ${stats.attendancePercentage}%, below the required threshold.`,
        type: 'AT_RISK',
        relatedEntityId: studentId,
      });
    }
  } catch (err) {
    logger.error('checkAttendanceThreshold failed:', err);
  }
}

/**
 * Returns students whose attendance percentage is below the given threshold.
 */
export async function getAtRiskStudents(
  schoolId: string,
  threshold = 75,
  classId?: string
): Promise<Array<{ student: object; stats: AttendanceStats }>> {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const students = await prisma.student.findMany({
    where: { schoolId, isActive: true, ...(classId && { classId }) },
    include: { class: { select: { id: true, name: true, grade: true, section: true } } },
  });

  const results = await Promise.all(
    students.map(async (student) => {
      const stats = await calculateStudentAttendanceStats(student.id, schoolId, startOfYear, now);
      return { student, stats };
    })
  );

  return results.filter((r) => r.stats.attendancePercentage < threshold);
}
