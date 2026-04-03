import { api, API_ROUTES } from '@/config/api';

export interface Collaborator {
  id: number | null;
  name: string;
  email: string;
  is_active: boolean;
  department_ids: number[];
  created_at?: string;
}

export const collaboratorsApi = {
  getCollaborators: (): Promise<Collaborator[]> =>
    api.request(`${API_ROUTES.COLLABORATORS.BASE}/`),

  createCollaborator: (data: Partial<Collaborator>): Promise<Collaborator> =>
    api.request(`${API_ROUTES.COLLABORATORS.BASE}/`, 'POST', data),

  updateCollaborator: (id: number | string, data: Partial<Collaborator>): Promise<Collaborator> =>
    api.request(`${API_ROUTES.COLLABORATORS.BASE}/${id}`, 'PUT', data),

  deleteCollaborator: (id: number | string): Promise<void> =>
    api.request(`${API_ROUTES.COLLABORATORS.BASE}/${id}`, 'DELETE'),
};