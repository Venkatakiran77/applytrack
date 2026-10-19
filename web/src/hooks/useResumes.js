import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteResume, listResumes, uploadResume } from '../api/resumesApi';

export const useResumes = () => useQuery({ queryKey: ['resumes'], queryFn: listResumes });

export const useUploadResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadResume,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  });
};

export const useDeleteResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteResume,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  });
};