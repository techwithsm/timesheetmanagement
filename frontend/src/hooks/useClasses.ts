import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as classesService from '../services/classes.service';

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: classesService.getClasses,
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: classesService.createClass,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & Record<string, unknown>) =>
      classesService.updateClass(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: classesService.deleteClass,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });
}
