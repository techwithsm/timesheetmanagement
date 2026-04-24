import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS, CONSECUTIVE_ABSENCE_ALERTS } from '../../config/constants';
import { buildPagination } from '../../utils/response.util';
import { getPaginationParams } from '../../utils/pagination.util';
import { getMonthDateRange, isWorkingDay, formatDate } from '../../utils/dateUtils';
import { sendEmail, buildAbsenceAlertEmail } from '../../utils/emailSender.util';
import { BulkAttendancePayload, AttendanceFilters, AttendanceSummary } from './attendance.types';
import { Request } from 'express';

export class AttendanceService {
  async bulkMarkAttendance(payload: BulkAttendancePayload, markedById: string) {
    const { classId, date, entries } = payload;

    // Validate class exists
    const classRecord = await prisma.class.findUnique({ where: { id: classId } });
    if (!classRecord) {
      throw new AppError('Class not found', HTTP_STATUS.NOT_FOUND);
    }

    const attendanceDate = new Date(date);

    // Upsert each entry
    const results = await prisma.$transaction(
      entries.map((entry) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: { studentId: entry.studentId, date: attendanceDate },
          },
          update: {
            status: entry.status,
            note: entry.note,
            lateMinutes: entry.lateMinutes ?? 0,
            markedById,
          },
          create: {
            studentId: entry.studentId,
            classId,
            date: attendanceDate,
            status: entry.status,
            note: entry.note,
            lateMinutes: entry.lateMinutes ?? 0,
            markedById,
          },
        })
      )
    );

    // Send absence alerts asynchronously (don't block response)
    this.processAbsenceAlerts(entries, date).catch(() => {});

    return results;
  }

  private async processAbsenceAlerts(
    entries: BulkAttendancePayload['entries'],
    date: string
  ): Promise<void> {
    const absentEntries = entries.filter((e) => e.status === 'ABSENT');

    for (const entry of absentEntries) {
      const student = await prisma.student.findUnique({
        where: { id: entry.studentId },
        include: {
          parent: { select: { email: true, firstName: true } },
        },
      });

      if (!student || !student.parent?.email) continue;

      // Count consecutive absences
      const recentAttendances = await prisma.attendance.findMany({
        where: {
          studentId: entry.studentId,
          date: { lte: new Date(date) },
          status: 'ABSENT',
        },
        orderBy: { date: 'desc' },
        take: CONSECUTIVE_ABSENCE_ALERTS.ADMIN_ESCALATE,
      });

      const consecutiveCount = recentAttendances.length;

      if (consecutiveCount >= CONSECUTIVE_ABSENCE_ALERTS.PARENT_NOTIFY) {
        await sendEmail({
          to: student.parent.email,
          subject: `Attendance Alert: ${student.firstName} ${student.lastName}`,
          html: buildAbsenceAlertEmail(
            `${student.firstName} ${student.lastName}`,
            student.parent.firstName,
            date,
            consecutiveCount
          ),
        }).catch(() => {});
      }
    }
  }

  async getAttendance(filters: AttendanceFilters, req: Request) {
    const { page, limit, skip } = getPaginationParams(req);

    const where: Record<string, unknown> = {};
    if (filters.classId) where.classId = filters.classId;
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.status) where.status = filters.status;

    if (filters.date) {
      // Single-day filter: cover the full UTC day
      const dayStart = new Date(filters.date);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(filters.date);
      dayEnd.setUTCHours(23, 59, 59, 999);
      where.date = { gte: dayStart, lte: dayEnd };
    } else if (filters.startDate || filters.endDate) {
      where.date = {
        ...(filters.startDate && { gte: new Date(filters.startDate) }),
        ...(filters.endDate && { lte: new Date(filters.endDate) }),
      };
    }

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { student: { firstName: 'asc' } },
          { student: { lastName: 'asc' } },
        ],
        include: {
          student: { select: { id: true, studentId: true, firstName: true, lastName: true } },
          class: { select: { id: true, name: true, grade: true, section: true } },
          markedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }

  async getAttendanceById(id: string) {
    const record = await prisma.attendance.findUnique({
      where: { id },
      include: {
        student: true,
        class: true,
        markedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!record) throw new AppError('Attendance record not found', HTTP_STATUS.NOT_FOUND);
    return record;
  }

  async updateAttendance(id: string, data: Partial<BulkAttendancePayload['entries'][0]>) {
    const existing = await prisma.attendance.findUnique({ where: { id } });
    if (!existing) throw new AppError('Attendance record not found', HTTP_STATUS.NOT_FOUND);

    return prisma.attendance.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.note !== undefined && { note: data.note }),
        ...(data.lateMinutes !== undefined && { lateMinutes: data.lateMinutes }),
      },
    });
  }

  async deleteAttendance(id: string) {
    const existing = await prisma.attendance.findUnique({ where: { id } });
    if (!existing) throw new AppError('Attendance record not found', HTTP_STATUS.NOT_FOUND);
    await prisma.attendance.delete({ where: { id } });
  }

  async getStudentSummary(studentId: string, year: number, month: number): Promise<AttendanceSummary> {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new AppError('Student not found', HTTP_STATUS.NOT_FOUND);

    const { start, end } = getMonthDateRange(year, month);

    const records = await prisma.attendance.findMany({
      where: { studentId, date: { gte: start, lte: end } },
    });

    const school = await prisma.school.findUnique({ where: { id: student.schoolId } });
    const workingDays = school?.workingDays ?? [1, 2, 3, 4, 5];

    // Count school working days in range (excluding holidays)
    const holidays = await prisma.holiday.findMany({
      where: { schoolId: student.schoolId, date: { gte: start, lte: end } },
    });
    const holidayDates = new Set(holidays.map((h) => formatDate(h.date)));

    let totalDays = 0;
    const current = new Date(start);
    while (current <= end) {
      if (isWorkingDay(current, workingDays) && !holidayDates.has(formatDate(current))) {
        totalDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, HALF_DAY: 0 };
    records.forEach((r) => { counts[r.status]++; });

    const attendingDays = counts.PRESENT + counts.LATE + counts.HALF_DAY;
    const attendanceRate = totalDays > 0 ? Math.round((attendingDays / totalDays) * 1000) / 10 : 0;
    const lateRate = totalDays > 0 ? Math.round((counts.LATE / totalDays) * 1000) / 10 : 0;

    return {
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      totalDays,
      present: counts.PRESENT,
      absent: counts.ABSENT,
      late: counts.LATE,
      excused: counts.EXCUSED,
      halfDay: counts.HALF_DAY,
      attendanceRate,
      lateRate,
    };
  }

  async getClassAttendanceForDate(classId: string, date: string) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: { students: { where: { isActive: true } } },
    });
    if (!classRecord) throw new AppError('Class not found', HTTP_STATUS.NOT_FOUND);

    const attendanceDate = new Date(date);
    const records = await prisma.attendance.findMany({
      where: { classId, date: attendanceDate },
      include: {
        student: { select: { id: true, studentId: true, firstName: true, lastName: true } },
      },
    });

    // Build a map of studentId -> attendance
    const recordMap = new Map(records.map((r) => [r.studentId, r]));

    const students = classRecord.students.map((s) => ({
      student: s,
      attendance: recordMap.get(s.id) ?? null,
    }));

    const counts = { present: 0, absent: 0, late: 0, excused: 0, halfDay: 0 };
    records.forEach((r) => {
      if (r.status === 'PRESENT') counts.present++;
      else if (r.status === 'ABSENT') counts.absent++;
      else if (r.status === 'LATE') counts.late++;
      else if (r.status === 'EXCUSED') counts.excused++;
      else if (r.status === 'HALF_DAY') counts.halfDay++;
    });

    const total = classRecord.students.length;
    return {
      class: { id: classRecord.id, name: classRecord.name, grade: classRecord.grade, section: classRecord.section },
      date,
      totalStudents: total,
      ...counts,
      attendanceRate: total > 0 ? Math.round(((counts.present + counts.late + counts.halfDay) / total) * 1000) / 10 : 0,
      students,
    };
  }
}
