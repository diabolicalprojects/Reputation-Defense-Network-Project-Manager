import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface CreateProjectPayload {
  title: string;
  clientId: string;
  notes?: string;
  assets?: {
    driveLink?: string;
    figmaLink?: string;
  };
  designerSop?: { task: string; isCompleted: boolean }[];
  developerSop?: { task: string; isCompleted: boolean }[];
}

export interface UpdateProjectPayload {
  designerId?: string | null;
  developerId?: string | null;
  notes?: string;
  assets?: {
    driveLink?: string;
    figmaLink?: string;
  };
  developmentData?: {
    domainUrl?: string;
    wpAdminUser?: string;
    wpAdminPassword?: string;
  };
  designerSop?: { task: string; isCompleted: boolean; _id?: string }[];
  developerSop?: { task: string; isCompleted: boolean; _id?: string }[];
}

export const useProjectMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectPayload) => api.post(`/clients/${data.clientId}/projects`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectPayload }) => api.put(`/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/projects/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
    },
  });

  const sopMutation = useMutation({
    mutationFn: ({ projectId, taskId, isCompleted }: { projectId: string; taskId: string; isCompleted: boolean }) =>
      api.patch(`/projects/${projectId}/sop/${taskId}`, { isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
    },
  });

  return {
    createMutation,
    updateMutation,
    statusMutation,
    sopMutation,
  };
};
