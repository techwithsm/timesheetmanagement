import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS } from '../../config/constants';
import { getMonthDateRange, formatDate, isWorkingDay } from '../../utils/dateUtils';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

export class ReportsService {
  async getStudentAttendanceReport(
    studentId: string,
    year: number,
    month: number
  ) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: { select: { name: true, grade: true, section: true } },
        school: { select: { name: true, workingDays: true } },
      },
    });
    if (!student) throw new AppError('Student not found', HTTP_STATUS.NOT_FOUND);

    const { start, end } = getMonthDateRange(year, month);
    const records = await prisma.attendance.findMany({
      where: { studentId, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    });

    const holidays = await prisma.holiday.findMany({
      where: { schoolId: student.schoolId, date: { gte: start, lte: end } },
    });
    const holidayDates = new Set(holidays.map((h) => formatDate(h.date)));
    const workingDays = student.school.workingDays ?? [1, 2, 3, 4, 5];

    let totalDays = 0;
    const current = new Date(start);
    while (current <= end) {
      if (isWorkingDay(current, workingDays) && !holidayDates.has(formatDate(current))) totalDays++;
      current.setDate(current.getDate() + 1);
    }

    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, HALF_DAY: 0 };
    records.forEach((r) => { counts[r.status]++; });
    const attendingDays = counts.PRESENT + counts.LATE + counts.HALF_DAY;

    return {
      student: {
        id: student.id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        class: student.class,
        school: student.school.name,
      },
      period: { year, month, start: formatDate(start), end: formatDate(end) },
      summary: {
        totalDays,
        ...counts,
        attendingDays,
        attendanceRate: totalDays > 0 ? Math.round((attendingDays / totalDays) * 1000) / 10 : 0,
      },
      records: records.map((r) => ({
        date: formatDate(r.date),
        status: r.status,
        note: r.note,
        lateMinutes: r.lateMinutes,
      })),
      holidays: holidays.map((h) => ({ name: h.name, date: formatDate(h.date), type: h.type })),
    };
  }

  async getClassAttendanceReport(classId: string, year: number, month: number) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: { where: { isActive: true }, orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }] },
        school: { select: { name: true, workingDays: true } },
      },
    });
    if (!classRecord) throw new AppError('Class not found', HTTP_STATUS.NOT_FOUND);

    const { start, end } = getMonthDateRange(year, month);
    const records = await prisma.attendance.findMany({
      where: { classId, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    });

    const holidays = await prisma.holiday.findMany({
      where: { schoolId: classRecord.schoolId, date: { gte: start, lte: end } },
    });
    const holidayDates = new Set(holidays.map((h) => formatDate(h.date)));
    const workingDays = classRecord.school.workingDays ?? [1, 2, 3, 4, 5];

    let totalDays = 0;
    const current = new Date(start);
    while (current <= end) {
      if (isWorkingDay(current, workingDays) && !holidayDates.has(formatDate(current))) totalDays++;
      current.setDate(current.getDate() + 1);
    }

    // Build student summaries
    const studentMap = new Map(classRecord.students.map((s) => [s.id, { ...s, attendances: [] as typeof records }]));
    records.forEach((r) => {
      const s = studentMap.get(r.studentId);
      if (s) s.attendances.push(r);
    });

    const studentSummaries = Array.from(studentMap.values()).map((s) => {
      const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, HALF_DAY: 0 };
      s.attendances.forEach((a) => { counts[a.status]++; });
      const attending = counts.PRESENT + counts.LATE + counts.HALF_DAY;
      return {
        studentId: s.studentId,
        name: `${s.firstName} ${s.lastName}`,
        ...counts,
        attendingDays: attending,
        attendanceRate: totalDays > 0 ? Math.round((attending / totalDays) * 1000) / 10 : 0,
      };
    });

    return {
      class: { id: classRecord.id, name: classRecord.name, grade: classRecord.grade, section: classRecord.section },
      school: classRecord.school.name,
      period: { year, month, start: formatDate(start), end: formatDate(end) },
      totalDays,
      totalStudents: classRecord.students.length,
      students: studentSummaries,
      holidays: holidays.map((h) => ({ name: h.name, date: formatDate(h.date), type: h.type })),
    };
  }

  async exportClassReportToExcel(classId: string, year: number, month: number, res: Response) {
    const report = await this.getClassAttendanceReport(classId, year, month);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'School Timesheet System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Attendance Report');

    // Title
    sheet.mergeCells('A1:H1');
    sheet.getCell('A1').value = `Attendance Report - ${report.class.name} (${report.class.grade}${report.class.section})`;
    sheet.getCell('A1').font = { bold: true, size: 14 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    // Period info
    sheet.getCell('A2').value = `School: ${report.school}`;
    sheet.getCell('A3').value = `Period: ${report.period.start} to ${report.period.end}`;
    sheet.getCell('A4').value = `Working Days: ${report.totalDays}`;

    // Headers
    sheet.addRow([]);
    const headerRow = sheet.addRow([
      'Student ID', 'Name', 'Present', 'Absent', 'Late', 'Excused', 'Half Day', 'Attendance %',
    ]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    // Data rows
    report.students.forEach((s) => {
      sheet.addRow([
        s.studentId, s.name, s.PRESENT, s.ABSENT, s.LATE, s.EXCUSED, s.HALF_DAY, `${s.attendanceRate}%`,
      ]);
    });

    // Auto column widths
    sheet.columns.forEach((col) => { col.width = 15; });
    sheet.getColumn(2).width = 25;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${classId}_${year}_${month}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  async exportStudentReportToPDF(studentId: string, year: number, month: number, res: Response) {
    const report = await this.getStudentAttendanceReport(studentId, year, month);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="attendance_${report.student.studentId}_${year}_${month}.pdf"`
    );
    doc.pipe(res);

    // Header
    doc.fontSize(18).text('Student Attendance Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`School: ${report.student.school}`, { align: 'center' });
    doc.moveDown();

    // Student info
    doc.fontSize(11).text(`Student: ${report.student.name}`);
    doc.text(`Student ID: ${report.student.studentId}`);
    doc.text(`Class: ${report.student.class.name} - ${report.student.class.grade}${report.student.class.section}`);
    doc.text(`Period: ${report.period.start} to ${report.period.end}`);
    doc.moveDown();

    // Summary box
    doc.rect(50, doc.y, 495, 90).stroke();
    const boxY = doc.y + 10;
    doc.fontSize(12).text('Summary', 60, boxY, { underline: true });
    doc.fontSize(10)
      .text(`Total Working Days: ${report.summary.totalDays}`, 60, boxY + 20)
      .text(`Present: ${report.summary.PRESENT}`, 60, boxY + 35)
      .text(`Absent: ${report.summary.ABSENT}`, 200, boxY + 35)
      .text(`Late: ${report.summary.LATE}`, 340, boxY + 35)
      .text(`Attendance Rate: ${report.summary.attendanceRate}%`, 60, boxY + 55);
    doc.moveDown(5);

    // Records table
    doc.fontSize(12).text('Daily Attendance Records', { underline: true });
    doc.moveDown(0.5);

    report.records.forEach((r) => {
      const statusColors: Record<string, string> = {
        PRESENT: 'green', ABSENT: 'red', LATE: 'orange', EXCUSED: 'blue', HALF_DAY: 'purple',
      };
      doc.fontSize(9).fillColor(statusColors[r.status] ?? 'black')
        .text(`${r.date}  |  ${r.status}${r.lateMinutes ? ` (${r.lateMinutes} min late)` : ''}${r.note ? `  - ${r.note}` : ''}`);
    });

    doc.end();
  }
}
