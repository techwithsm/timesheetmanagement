export interface CreateClassDTO {
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  roomNumber?: string;
  capacity?: number;
  schoolId: string;
  teacherId?: string;
}

export interface UpdateClassDTO extends Partial<CreateClassDTO> {}
