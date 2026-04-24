export interface CreateStudentDTO {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  address?: string;
  classId: string;
  schoolId: string;
  parentId?: string;
  enrollmentDate?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  medicalNotes?: string;
}

export interface UpdateStudentDTO extends Partial<CreateStudentDTO> {}

export interface StudentFilters {
  search?: string;
  classId?: string;
  isActive?: string;
  gender?: string;
}

export interface BulkImportRow {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  className: string;
  parentEmail?: string;
  enrollmentDate?: string;
}
