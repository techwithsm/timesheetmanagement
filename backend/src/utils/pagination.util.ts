import { Request } from 'express';
import { PAGINATION } from '../config/constants';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPaginationParams(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildWhereClause(
  filters: Record<string, string | undefined>,
  searchFields?: string[]
): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  const search = filters.search;

  if (search && searchFields?.length) {
    where.OR = searchFields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' },
    }));
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (key !== 'search' && value !== undefined && value !== '') {
      where[key] = value;
    }
  });

  return where;
}
