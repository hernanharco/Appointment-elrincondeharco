import { api, API_ROUTES } from '@/config/api';

/**
 * API para la gestión de servicios (catálogo del negocio).
 * Sigue el principio de "Menos infraestructura, más valor".
 */
export const servicesApi = {
  // 1. Obtener todos los servicios (GET /api/v1/services/)
  getServices: () =>
    api.request(`${API_ROUTES.SERVICES.BASE}/`),

  // 2. Crear un nuevo servicio (POST /api/v1/services/)
  createService: (data: any) =>
    api.request(`${API_ROUTES.SERVICES.BASE}/`, 'POST', data),

  // 3. Obtener un servicio específico (GET /api/v1/services/{id})
  getServiceById: (id: number | string) =>
    api.request(`${API_ROUTES.SERVICES.BASE}/${id}`),

  // 4. Actualizar un servicio (PUT /api/v1/services/{id})
  updateService: (id: number | string, data: any) =>
    api.request(`${API_ROUTES.SERVICES.BASE}/${id}`, 'PUT', data),

  // 5. Eliminar un servicio (DELETE /api/v1/services/{id})
  deleteService: (id: number | string) =>
    api.request(`${API_ROUTES.SERVICES.BASE}/${id}`, 'DELETE'),

  // 6. Resumen de estadísticas de servicios (GET /api/v1/services/stats/summary)
  getServicesSummary: () =>
    api.request(`${API_ROUTES.SERVICES.STATS}/summary`),
};