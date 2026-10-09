import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createApplication, deleteApplication, fetchApplication, fetchApplications,
  updateApplication, updateApplicationStatus,
} from '../api/applicationsApi';

// key includes page, size, status and sort, so each combination is cached separately
export function useApplications(params) {
  return useQuery({
    queryKey: ['applications', 'list', params],
    queryFn: () => fetchApplications(params),
    placeholderData: keepPreviousData, // keep showing the old page while the next one loads
  });
}

export function useApplication(id) {
  return useQuery({
    queryKey: ['applications', 'detail', id],
    queryFn: () => fetchApplication(id),
    enabled: Boolean(id),
  });
}

function useRefreshAfterChange() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['applications'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export const useCreateApplication = () =>
  useMutation({ mutationFn: createApplication, onSuccess: useRefreshAfterChange() });

export const useUpdateApplication = () =>
  useMutation({ mutationFn: updateApplication, onSuccess: useRefreshAfterChange() });

export const useUpdateStatus = () =>
  useMutation({ mutationFn: updateApplicationStatus, onSuccess: useRefreshAfterChange() });

export const useDeleteApplication = () =>
  useMutation({ mutationFn: deleteApplication, onSuccess: useRefreshAfterChange() });