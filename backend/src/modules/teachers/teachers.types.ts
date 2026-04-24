export interface CreateTeacherDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId: string;
  department?: string;
  qualification?: string;
  joiningDate: string;
  schoolId: string;
}

export interface UpdateTeacherDTO extends Partial<Omit<CreateTeacherDTO, 'email' | 'schoolId'>> {}
