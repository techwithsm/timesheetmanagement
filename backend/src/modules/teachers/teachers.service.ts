import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS } from '../../config/constants';
import { getPaginationParams } from '../../utils/pagination.util';
import { buildPagination } from '../../utils/response.util';
import type { CreateTeacherDTO, UpdateTeacherDTO } from './teachers.types';
import { Request } from 'express';

export async function listTeachers(req: Request, schoolId: string) {
  const { page, limit, skip } = getPaginationParams(req);
  const search = req.query.search as string | undefined;

  const where = {
    schoolId,
    ...(search && {
      user: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      },
    }),
  };

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true, isActive: true } },
        classes: { select: { id: true, name: true, grade: true, section: true } },
      },
      orderBy: { user: { lastName: 'asc' } },
    }),
    prisma.teacher.count({ where }),
  ]);

  return { data: teachers, pagination: buildPagination(page, limit, total) };
}

export async function getTeacherById(id: string, schoolId: string) {
  const teacher = await prisma.teacher.findFirst({
    where: { id, schoolId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
      classes: { include: { students: { select: { id: true } } } },
    },
  });

  if (!teacher) throw new AppError('Teacher not found', HTTP_STATUS.NOT_FOUND);
  return teacher;
}

export async function createTeacher(dto: CreateTeacherDTO) {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new AppError('Email already registered', HTTP_STATUS.CONFLICT);

  const tempPassword = 'Welcome@123';
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: 'TEACHER',
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        schoolId: dto.schoolId,
        mustChangePassword: true,
      },
    });

    const teacher = await tx.teacher.create({
      data: {
        userId: user.id,
        employeeId: dto.employeeId,
        department: dto.department,
        qualification: dto.qualification,
        joiningDate: new Date(dto.joiningDate),
        schoolId: dto.schoolId,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return teacher;
  });
}

export async function updateTeacher(id: string, schoolId: string, dto: UpdateTeacherDTO) {
  await getTeacherById(id, schoolId);

  return prisma.teacher.update({
    where: { id },
    data: {
      ...(dto.department && { department: dto.department }),
      ...(dto.qualification && { qualification: dto.qualification }),
      ...(dto.joiningDate && { joiningDate: new Date(dto.joiningDate) }),
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
}

export async function deleteTeacher(id: string, schoolId: string) {
  const teacher = await getTeacherById(id, schoolId);
  await prisma.user.update({
    where: { id: teacher.userId },
    data: { isActive: false },
  });
}

export async function getTeacherClasses(teacherId: string, schoolId: string) {
  const teacher = await getTeacherById(teacherId, schoolId);
  return prisma.class.findMany({
    where: { teacherId: teacher.id, schoolId },
    include: {
      students: { where: { isActive: true }, select: { id: true } },
    },
  });
}
