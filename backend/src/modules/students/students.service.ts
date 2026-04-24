import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS } from '../../config/constants';
import { getPaginationParams, buildWhereClause } from '../../utils/pagination.util';
import { buildPagination } from '../../utils/response.util';
import type { CreateStudentDTO, UpdateStudentDTO, StudentFilters } from './students.types';
import { Request } from 'express';

function generateStudentId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(10000 + Math.random() * 90000);
  return `STU${year}${random}`;
}

export async function listStudents(req: Request, schoolId: string) {
  const { page, limit, skip } = getPaginationParams(req);
  const filters = req.query as StudentFilters;

  const where = {
    schoolId,
    ...(filters.classId && { classId: filters.classId }),
    ...(filters.isActive !== undefined && { isActive: filters.isActive === 'true' }),
    ...(filters.gender && { gender: filters.gender }),
    ...(filters.search && {
      OR: [
        { firstName: { contains: filters.search, mode: 'insensitive' as const } },
        { lastName: { contains: filters.search, mode: 'insensitive' as const } },
        { studentId: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      include: {
        class: { select: { id: true, name: true, grade: true, section: true } },
        parent: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
    prisma.student.count({ where }),
  ]);

  return { data: students, pagination: buildPagination(page, limit, total) };
}

export async function getStudentById(id: string, schoolId: string) {
  const student = await prisma.student.findFirst({
    where: { id, schoolId },
    include: {
      class: { include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } } },
      parent: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    },
  });

  if (!student) throw new AppError('Student not found', HTTP_STATUS.NOT_FOUND);
  return student;
}

export async function createStudent(dto: CreateStudentDTO) {
  const classExists = await prisma.class.findUnique({ where: { id: dto.classId } });
  if (!classExists) throw new AppError('Class not found', HTTP_STATUS.NOT_FOUND);

  return prisma.student.create({
    data: {
      ...dto,
      studentId: generateStudentId(),
      dateOfBirth: new Date(dto.dateOfBirth),
      enrollmentDate: dto.enrollmentDate ? new Date(dto.enrollmentDate) : new Date(),
      emergencyContact: dto.emergencyContact as object | undefined,
    },
    include: {
      class: { select: { id: true, name: true, grade: true, section: true } },
    },
  });
}

export async function updateStudent(id: string, schoolId: string, dto: UpdateStudentDTO) {
  await getStudentById(id, schoolId);

  return prisma.student.update({
    where: { id },
    data: {
      ...dto,
      ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
      ...(dto.enrollmentDate && { enrollmentDate: new Date(dto.enrollmentDate) }),
      emergencyContact: dto.emergencyContact as object | undefined,
    },
    include: {
      class: { select: { id: true, name: true, grade: true, section: true } },
    },
  });
}

export async function deleteStudent(id: string, schoolId: string) {
  await getStudentById(id, schoolId);
  await prisma.student.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function getStudentAttendanceHistory(
  studentId: string,
  schoolId: string,
  req: Request
) {
  await getStudentById(studentId, schoolId);
  const { page, limit, skip } = getPaginationParams(req);

  const [attendances, total] = await Promise.all([
    prisma.attendance.findMany({
      where: { studentId },
      skip,
      take: limit,
      include: {
        markedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    }),
    prisma.attendance.count({ where: { studentId } }),
  ]);

  return { data: attendances, pagination: buildPagination(page, limit, total) };
}
