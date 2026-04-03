import { api, API_ROUTES } from '../../config/api';

/**
 * Interfaz para los filtros de búsqueda.
 * Esto ayuda a que cuando escribas appointmentsApi.getAppointments({ ... })
 * el editor te sugiera 'date', 'collaborator_id', etc.
 */
export interface AppointmentFilters {
  date?: string;          // Formato YYYY-MM-DD
  collaborator_id?: number;
  status?: string;
  skip?: number;
  limit?: number;
}

export const appointmentsApi = {
  /**
   * 📊 Obtiene el conteo de citas para una lista de fechas (Carrusel).
   * Envía un POST con el array de strings ["YYYY-MM-DD", ...]
   */
  getWeeklySummary: (dates: string[]) => {
    return api.request(API_ROUTES.APPOINTMENTS.SUMMARY, 'POST', dates);
  },
  /**
   * Obtiene las citas filtradas.
   * Si pasas { date: '2026-02-18' }, generará: /api/v1/appointments/?date=2026-02-18
   */
  getAppointments: (filters?: AppointmentFilters) => {
    // Limpiamos los filtros para no enviar valores undefined o null a la URL
    const cleanFilters = filters
      ? Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null))
      : {};

    const query = new URLSearchParams(cleanFilters as any).toString();
    const url = query ? `${API_ROUTES.APPOINTMENTS.BASE}/?${query}` : API_ROUTES.APPOINTMENTS.BASE;

    return api.request(url);
  },

  /**
   * Crea una nueva cita.
   * El payload debe coincidir con el esquema 'AppointmentCreate' de tu FastAPI.
   */
  createAppointment: (payload: any) => {
    return api.request(`${API_ROUTES.APPOINTMENTS.BASE}/`, 'POST', payload);
  },

  /**
   * Actualiza una cita existente (o su estado).
   */
  updateAppointment: (id: number | string, payload: any) => {
    return api.request(`${API_ROUTES.APPOINTMENTS.BASE}/${id}`, 'PUT', payload);
  },

  /**
   * Elimina una cita (Borrado físico en Backend).
   * Ajustado para coincidir exactamente con la ruta de FastAPI.
   */
  deleteAppointment: (id: string | number) => {
    // Eliminamos la "/" final para que coincida con: /api/v1/appointments/{id}
    return api.request(`${API_ROUTES.APPOINTMENTS.BASE}/${id}`, 'DELETE');
  },

  /**
   * Consulta disponibilidad de slots.
   * Muy útil para el formulario de agendar.
   */
  getAvailability: (date: string, serviceId: number, collaboratorId?: number) => {
    const params = new URLSearchParams({
      date,
      service_id: serviceId.toString()
    });
    if (collaboratorId) params.append('collaborator_id', collaboratorId.toString());

    return api.request(`${API_ROUTES.APPOINTMENTS.BASE}/availability/slots/?${params.toString()}`);
  },

  /**
   * 🔢 Obtiene el conteo total de citas para un día específico.
   * Útil para mostrar en el calendario: "5 citas hoy".
   * @param date Formato "YYYY-MM-DD"
   */
  getCountByDay: (date: string) => {
    const params = new URLSearchParams({ target_date: date });
    return api.request(`${API_ROUTES.APPOINTMENTS.COUNT_BY_DAY}?${params.toString()}`);
  },

  /**
   * Obtiene el conteo total de citas para un rango de fechas.
   * Útil para mostrar en el calendario: "7 citas este mes".
   * @param start Formato "YYYY-MM-DD"
   * @param end Formato "YYYY-MM-DD"
   * @returns 
   */
  getCountsRange: async (start: string, end: string): Promise<Record<string, number>> => {
    return await api.request(`${API_ROUTES.APPOINTMENTS.BASE}/counts-range?start=${start}&end=${end}`);
  }
};