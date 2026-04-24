import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function main() {
  console.log('🌱 Seeding database...');

  // School
  const school = await prisma.school.create({
    data: {
      name: 'Greenfield Academy',
      address: '123 School Lane, Springfield, IL 62701',
      phone: '+1-555-0100',
      email: 'contact@greenfield.edu',
      academicYearStart: new Date('2025-08-15'),
      academicYearEnd: new Date('2026-06-15'),
      timezone: 'America/Chicago',
      country: 'US',
      workingDays: [1, 2, 3, 4, 5],
      lateThresholdMin: 15,
      absenceThreshold: 75,
    },
  });

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@greenfield.edu',
      passwordHash: await bcrypt.hash('Admin@1234', BCRYPT_ROUNDS),
      role: 'ADMIN',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-0101',
      isActive: true,
      schoolId: school.id,
    },
  });

  // Parent
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@example.com',
      passwordHash: await bcrypt.hash('Parent@1234', BCRYPT_ROUNDS),
      role: 'PARENT',
      firstName: 'David',
      lastName: 'Smith',
      phone: '+1-555-0200',
      isActive: true,
      schoolId: school.id,
    },
  });

  // 5 Teachers
  const departments = ['Mathematics', 'Science', 'English', 'Social Studies', 'Arts'];
  const teachers: Array<{ id: string; userId: string; employeeId: string; schoolId: string }> = [];

  for (let i = 0; i < 5; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        passwordHash: await bcrypt.hash('Teacher@1234', BCRYPT_ROUNDS),
        role: 'TEACHER',
        firstName,
        lastName,
        phone: faker.phone.number(),
        isActive: true,
        schoolId: school.id,
        mustChangePassword: false,
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
        department: departments[i],
        qualification: 'M.Ed.',
        joiningDate: faker.date.between({ from: '2018-01-01', to: '2023-12-31' }),
        schoolId: school.id,
      },
    });

    teachers.push(teacher);
  }

  // 4 Classes
  const classConfigs = [
    { name: 'Grade 1A', grade: '1', section: 'A' },
    { name: 'Grade 2A', grade: '2', section: 'A' },
    { name: 'Grade 3A', grade: '3', section: 'A' },
    { name: 'Grade 4A', grade: '4', section: 'A' },
  ];

  const classes = await Promise.all(
    classConfigs.map((cfg, i) =>
      prisma.class.create({
        data: {
          ...cfg,
          academicYear: '2025-2026',
          capacity: 25,
          schoolId: school.id,
          teacherId: teachers[i].id,
        },
      })
    )
  );

  // 20 Students per class
  const allStudents: Array<{ id: string; classId: string }> = [];
  let counter = 1;

  for (const cls of classes) {
    for (let i = 0; i < 20; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      const student = await prisma.student.create({
        data: {
          studentId: `STU25${String(counter).padStart(5, '0')}`,
          firstName,
          lastName,
          dateOfBirth: faker.date.between({ from: '2013-01-01', to: '2018-12-31' }),
          gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
          enrollmentDate: new Date('2025-08-15'),
          isActive: true,
          classId: cls.id,
          schoolId: school.id,
          parentId: parentUser.id,
          address: faker.location.streetAddress(),
          emergencyContact: {
            name: `${faker.person.firstName()} ${lastName}`,
            phone: faker.phone.number(),
            relation: 'Parent',
          },
        },
      });

      allStudents.push({ id: student.id, classId: cls.id });
      counter++;
    }
  }

  // Holidays
  const holidays = [
    { name: 'Labor Day', date: '2025-09-01', type: 'PUBLIC' },
    { name: 'Thanksgiving', date: '2025-11-27', endDate: '2025-11-28', type: 'PUBLIC' },
    { name: 'Winter Break', date: '2025-12-22', endDate: '2026-01-05', type: 'WINTER_BREAK' },
    { name: "Martin Luther King Jr. Day", date: '2026-01-19', type: 'PUBLIC' },
    { name: "Presidents' Day", date: '2026-02-16', type: 'PUBLIC' },
    { name: 'Spring Break', date: '2026-03-23', endDate: '2026-03-27', type: 'SPRING_BREAK' },
    { name: 'Memorial Day', date: '2026-05-25', type: 'PUBLIC' },
  ];

  for (const h of holidays) {
    await prisma.holiday.create({
      data: {
        schoolId: school.id,
        name: h.name,
        date: new Date(h.date),
        endDate: (h as { endDate?: string }).endDate ? new Date((h as { endDate: string }).endDate) : null,
        type: h.type as never,
        isRecurring: false,
      },
    });
  }

  // Academic Term
  await prisma.academicTerm.create({
    data: {
      schoolId: school.id,
      name: 'Fall 2025',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2026-01-15'),
      isActive: true,
    },
  });

  // Attendance for last 3 months (Mon–Fri only)
  console.log('📅 Generating attendance records...');
  const today = new Date();
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const statusPool = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

  const dates: Date[] = [];
  let cur = new Date(threeMonthsAgo);
  while (cur <= today) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) dates.push(new Date(cur));
    cur = addDays(cur, 1);
  }

  for (const { id: studentId, classId } of allStudents) {
    for (const date of dates) {
      const status = faker.helpers.arrayElement(statusPool) as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
      const lateMinutes = status === 'LATE' ? faker.number.int({ min: 5, max: 60 }) : 0;

      await prisma.attendance.upsert({
        where: { studentId_date: { studentId, date } },
        create: { studentId, classId, date, status, markedById: adminUser.id, lateMinutes },
        update: {},
      }).catch(() => {});
    }
  }

  console.log('✅ Seed complete!');
  console.log('  Admin:   admin@greenfield.edu / Admin@1234');
  console.log('  Parent:  parent@example.com  / Parent@1234');
  console.log('  Teacher: (5 created)          / Teacher@1234');
  console.log(`  Students: ${allStudents.length} total across 4 classes`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
