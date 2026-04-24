export interface CreateHolidayDto {
  schoolId: string;
  name: string;
  date: string;
  endDate?: string;
  type: 'PUBLIC' | 'SCHOOL' | 'SUMMER_BREAK' | 'WINTER_BREAK' | 'SPRING_BREAK' | 'EXAM_PERIOD' | 'CUSTOM';
  isRecurring?: boolean;
  description?: string;
}

export interface UpdateHolidayDto extends Partial<Omit<CreateHolidayDto, 'schoolId'>> {}

export interface HolidayFilters {
  schoolId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  year?: string;
  page?: string;
  limit?: string;
}
