import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analyzeMatch, fetchMatchResult } from '../api/matchApi';

export const useMatchResult = (id) =>
  useQuery({
    queryKey: ['match', String(id)],
    queryFn: () => fetchMatchResult(id),
    enabled: Boolean(id),
  });

export function useAnalyzeMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyzeMatch,
    onSuccess: (data, vars) => {
      queryClient.setQueryData(['match', String(vars.id)], data); // show the new result instantly
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // top missing keywords changed
    },
  });
}