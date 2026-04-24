import { prisma } from '../../config/database';
import { formatDate, getMonthDateRange, isWorkingDay } from '../../utils/dateUtils';
import { ATTENDANCE_THRESHOLDS } from '../../config/constants';

export class DashboardService {
  async getSchoolOverview(schoolId: string) {
    const now = new Date();
    // Use UTC date to match how attendance is stored (UTC midnight)
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    const [totalStudents, totalTeachers, totalClasses, todayAttendance] = await Promise.all([
      prisma.student.count({ where: { schoolId, isActive: true } }),
      prisma.teacher.count({ where: { schoolId } }),
      prisma.class.count({ where: { schoolId } }),
      prisma.attendance.groupBy({
        by: ['status'],
        where: {
          class: { schoolId },
          date: { gte: todayUTC, lt: tomorrowUTC },
        },
        _count: true,
      }),
    ]);

    const attendanceByStatus = Object.fromEntries(
      todayAttendance.map((g) => [g.status, g._count])
    );
    const presentToday =
      (attendanceByStatus['PRESENT'] ?? 0) +
      (attendanceByStatus['LATE'] ?? 0) +
      (attendanceByStatus['HALF_DAY'] ?? 0);
    const markedToday = Object.values(attendanceByStatus).reduce((sum, c) => sum + c, 0);
    const avgAttendance = markedToday > 0
      ? Math.round((presentToday / markedToday) * 1000) / 10
      : 0;

    // Count working days elapsed this month
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    const workingDaysArr = school?.workingDays ?? [1, 2, 3, 4, 5];
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    let workingDays = 0;
    const cur = new Date(monthStart);
    while (cur <= todayUTC) {
      if (isWorkingDay(cur, workingDaysArr)) workingDays++;
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      avgAttendance,
      workingDays,
      todayAttendance: {
        marked: markedToday,
        present: presentToday,
        absent: attendanceByStatus['ABSENT'] ?? 0,
        late: attendanceByStatus['LATE'] ?? 0,
      },
    };
  }

  async getClassSummary(schoolId: string) {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    const classes = await prisma.class.findMany({
      where: { schoolId },
      include: {
        students: { where: { isActive: true }, select: { id: true } },
        attendances: {
          where: { date: { gte: todayUTC, lt: tomorrowUTC } },
          select: { status: true, studentId: true },
        },
      },
      orderBy: [{ grade: 'asc' }, { section: 'asc' }],
    });

    return classes.map((cls) => {
      const totalStudents = cls.students.length;
      const present = cls.attendances.filter((a) =>
        ['PRESENT', 'LATE', 'HALF_DAY'].includes(a.status)
      ).length;
      const absent = cls.attendances.filter((a) => a.status === 'ABSENT').length;
      const unmarked = totalStudents - cls.attendances.length;
      const attendanceRate = cls.attendances.length > 0
        ? Math.round((present / cls.attendances.length) * 1000) / 10
        : 0;

      return {
        class: { id: cls.id, name: cls.name, grade: cls.grade, section: cls.section },
        totalStudents,
        present,
        absent,
        unmarked,
        attendanceRate,
      };
    });
  }

  async getAttendanceTrend(schoolId: string, months = 6) {
    const now = new Date();
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const year = now.getMonth() - i < 0
        ? now.getFullYear() - 1
        : now.getFullYear();
      const month = ((now.getMonth() - i) % 12 + 12) % 12 + 1;

      const { start, end } = getMonthDateRange(year, month);
      const cappedEnd = end > now ? now : end;

      const records = await prisma.attendance.findMany({
        where: { class: { schoolId }, date: { gte: start, lte: cappedEnd } },
        select: { status: true },
      });

      if (records.length === 0) {
        result.push({ month: `${year}-${String(month).padStart(2, '0')}`, total: 0, present: 0, percentage: 0 });
        continue;
      }

      const present = records.filter((r) => ['PRESENT', 'LATE', 'HALF_DAY'].includes(r.status)).length;
      result.push({
        month: `${year}-${String(month).padStart(2, '0')}`,
        total: records.length,
        present,
        percentage: Math.round((present / records.length) * 1000) / 10,
      });
    }

    return result;
  }

  async getAtRiskStudents(schoolId: string, threshold = ATTENDANCE_THRESHOLDS.WARNING) {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const students = await prisma.student.findMany({
      where: { schoolId, isActive: true },
      include: {
        class: { select: { id: true, name: true, grade: true, section: true } },
        attendances: {
          where: { date: { gte: start } },
          select: { status: true },
        },
      },
    });

    return students
      .map((s) => {
        const total = s.attendances.length;
        if (total === 0) return null;
        const present = s.attendances.filter((a) =>
          ['PRESENT', 'LATE', 'HALF_DAY'].includes(a.status)
        ).length;
        const rate = Math.round((present / total) * 1000) / 10;
        return {
          studentId: s.id,
          studentNo: s.studentId,
          name: `${s.firstName} ${s.lastName}`,
          class: s.class,
          attendanceRate: rate,
          totalDays: total,
          presentDays: present,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null && s.attendanceRate < threshold)
      .sort((a, b) => a.attendanceRate - b.attendanceRate);
  }
}
