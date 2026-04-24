import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS } from '../../config/constants';
import { getPaginationParams } from '../../utils/pagination.util';
import { buildPagination } from '../../utils/response.util';
import type { CreateClassDTO, UpdateClassDTO } from './classes.types';
import { Request } from 'express';

export async function listClasses(req: Request, schoolId: string) {
  const { page, limit, skip } = getPaginationParams(req);

  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where: { schoolId },
      skip,
      take: limit,
      include: {
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        students: { where: { isActive: true }, select: { id: true } },
      },
      orderBy: [{ grade: 'asc' }, { section: 'asc' }],
    }),
    prisma.class.count({ where: { schoolId } }),
  ]);

  return {
    data: classes.map((c) => ({ ...c, studentCount: c.students.length })),
    pagination: buildPagination(page, limit, total),
  };
}

export async function getClassById(id: string, schoolId: string) {
  const cls = await prisma.class.findFirst({
    where: { id, schoolId },
    include: {
      teacher: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      students: {
        where: { isActive: true },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      },
    },
  });

  if (!cls) throw new AppError('Class not found', HTTP_STATUS.NOT_FOUND);
  return cls;
}

export async function createClass(dto: CreateClassDTO) {
  return prisma.class.create({
    data: dto,
    include: {
      teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });
}

export async function updateClass(id: string, schoolId: string, dto: UpdateClassDTO) {
  await getClassById(id, schoolId);
  return prisma.class.update({ where: { id }, data: dto });
}

export async function deleteClass(id: string, schoolId: string) {
  const cls = await getClassById(id, schoolId);
  const studentCount = await prisma.student.count({ where: { classId: id, isActive: true } });
  if (studentCount > 0) {
    throw new AppError('Cannot delete class with active students', HTTP_STATUS.CONFLICT);
  }
  await prisma.class.delete({ where: { id } });
}

export async function getClassStudents(classId: string, schoolId: string) {
  await getClassById(classId, schoolId);
  return prisma.student.findMany({
    where: { classId, isActive: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });
}

export async function getClassAttendanceByDate(classId: string, schoolId: string, date: string) {
  await getClassById(classId, schoolId);
  return prisma.attendance.findMany({
    where: { classId, date: new Date(date) },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
      markedBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { student: { lastName: 'asc' } },
  });
}
