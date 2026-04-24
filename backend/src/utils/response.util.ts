import { Response } from 'express';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function successResponse<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function paginatedResponse<T>(
  res: Response,
  result: PaginatedResponse<T>,
  message = 'Success'
): Response {
  return res.status(200).json({
    success: true,
    message,
    data: result.data,
    pagination: result.pagination,
  });
}

export function buildPagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
