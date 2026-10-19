import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createApplication, deleteApplication, fetchApplication, fetchApplications,
  updateApplication, updateApplicationStatus,
} from '../api/applicationsApi';

export function useApplications(params) {
  return useQuery({
    queryKey: ['applications', 'list', params],
    queryFn: () => fetchApplications(params),
    placeholderData: keepPreviousData,
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
    queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Ensures dashboard stats/missing keywords refresh instantly
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