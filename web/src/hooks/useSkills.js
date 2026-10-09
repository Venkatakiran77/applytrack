import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addSkill, deleteSkill, fetchSkills } from '../api/skillsApi';

export const useSkills = () => useQuery({ queryKey: ['skills'], queryFn: fetchSkills });

export function useAddSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSkill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });
}