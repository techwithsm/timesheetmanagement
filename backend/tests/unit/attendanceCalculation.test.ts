import { calculateStudentAttendanceStats, calculateWorkingDays } from '../../src/services/attendanceCalculation.service';
import { prisma } from '../../src/config/database';

jest.mock('../../src/config/database', () => ({
  prisma: {
    school: { findUnique: jest.fn() },
    holiday: { findMany: jest.fn() },
    student: { findUnique: jest.fn() },
    attendance: { findMany: jest.fn() },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('AttendanceCalculationService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('calculateWorkingDays', () => {
    it('counts Mon–Fri only, excluding weekends', async () => {
      (mockPrisma.school.findUnique as jest.Mock).mockResolvedValue({ workingDays: [1, 2, 3, 4, 5] });
      (mockPrisma.holiday.findMany as jest.Mock).mockResolvedValue([]);

      // 6–10 Jan 2025 = 5 working days
      const result = await calculateWorkingDays('school1', new Date('2025-01-06'), new Date('2025-01-10'));
      expect(result.count).toBe(5);
    });

    it('excludes single holidays', async () => {
      (mockPrisma.school.findUnique as jest.Mock).mockResolvedValue({ workingDays: [1, 2, 3, 4, 5] });
      (mockPrisma.holiday.findMany as jest.Mock).mockResolvedValue([
        { date: new Date('2025-01-06'), endDate: null },
      ]);

      const result = await calculateWorkingDays('school1', new Date('2025-01-06'), new Date('2025-01-10'));
      expect(result.count).toBe(4);
    });

    it('excludes multi-day holiday ranges', async () => {
      (mockPrisma.school.findUnique as jest.Mock).mockResolvedValue({ workingDays: [1, 2, 3, 4, 5] });
      (mockPrisma.holiday.findMany as jest.Mock).mockResolvedValue([
        { date: new Date('2025-01-06'), endDate: new Date('2025-01-08') }, // Mon–Wed
      ]);

      const result = await calculateWorkingDays('school1', new Date('2025-01-06'), new Date('2025-01-10'));
      expect(result.count).toBe(2); // Thu + Fri
    });
  });

  describe('calculateStudentAttendanceStats', () => {
    const mockBase = () => {
      (mockPrisma.student.findUnique as jest.Mock).mockResolvedValue({ enrollmentDate: new Date('2025-01-01') });
      (mockPrisma.school.findUnique as jest.Mock).mockResolvedValue({ workingDays: [1, 2, 3, 4, 5] });
      (mockPrisma.holiday.findMany as jest.Mock).mockResolvedValue([]);
    };

    it('returns 100% EXCELLENT when all days are PRESENT', async () => {
      mockBase();
      (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue(
        Array(5).fill({ status: 'PRESENT', lateMinutes: 0 })
      );

      const stats = await calculateStudentAttendanceStats('s1', 'sch1', new Date('2025-01-06'), new Date('2025-01-10'));
      expect(stats.attendancePercentage).toBe(100);
      expect(stats.tier).toBe('EXCELLENT');
    });

    it('returns 60% WARNING for 3 present / 2 absent in 5-day week', async () => {
      mockBase();
      (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([
        { status: 'PRESENT', lateMinutes: 0 },
        { status: 'PRESENT', lateMinutes: 0 },
        { status: 'PRESENT', lateMinutes: 0 },
        { status: 'ABSENT', lateMinutes: 0 },
        { status: 'ABSENT', lateMinutes: 0 },
      ]);

      const stats = await calculateStudentAttendanceStats('s1', 'sch1', new Date('2025-01-06'), new Date('2025-01-10'));
      expect(stats.totalPresent).toBe(3);
      expect(stats.totalAbsent).toBe(2);
      expect(stats.attendancePercentage).toBe(60);
      expect(stats.tier).toBe('WARNING');
    });

    it('treats LATE with lateMinutes ≤ 15 as PRESENT', async () => {
      mockBase();
      (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([
        { status: 'LATE', lateMinutes: 10 },
        ...Array(4).fill({ status: 'PRESENT', lateMinutes: 0 }),
      ]);

      const stats = await calculateStudentAttendanceStats('s1', 'sch1', new Date('2025-01-06'), new Date('2025-01-10'));
      expect(stats.totalPresent).toBe(5);
      expect(stats.totalLate).toBe(0);
    });

    it('treats LATE with lateMinutes > 60 as ABSENT', async () => {
      mockBase();
      (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([
        { status: 'LATE', lateMinutes: 90 },
        ...Array(4).fill({ status: 'PRESENT', lateMinutes: 0 }),
      ]);

      const stats = await calculateStudentAttendanceStats('s1', 'sch1', new Date('2025-01-06'), new Date('2025-01-10'));
      expect(stats.totalAbsent).toBe(1);
      expect(stats.totalPresent).toBe(4);
    });

    it('marks AT_RISK when percentage < 60', async () => {
      mockBase();
      (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([
        { status: 'PRESENT', lateMinutes: 0 },
        ...Array(4).fill({ status: 'ABSENT', lateMinutes: 0 }),
      ]);

      const stats = await calculateStudentAttendanceStats('s1', 'sch1', new Date('2025-01-06'), new Date('2025-01-10'));
      expect(stats.tier).toBe('AT_RISK');
    });

    it('gives HALF_DAY 0.5 weight', async () => {
      mockBase();
      (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([
        ...Array(4).fill({ status: 'PRESENT', lateMinutes: 0 }),
        { status: 'HALF_DAY', lateMinutes: 0 },
      ]);

      const stats = await calculateStudentAttendanceStats('s1', 'sch1', new Date('2025-01-06'), new Date('2025-01-10'));
      expect(stats.attendancePercentage).toBe(90);
    });
  });
});
