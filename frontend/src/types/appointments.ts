/**
 * src/types/appointments.ts
 * Responsabilidad: Definiciones de tipos para el dominio de citas.
 * [cite: 2026-02-23]
 */

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/**
 * 🏷️ INTERFAZ: ServiceSimple
 */
export interface ServiceSimple {
    id: number;
    name: string;
    price?: number;
    duration_minutes?: number;
    // Añadimos color por si el joinedload trae info del departamento
    color?: string; 
}

/**
 * 🏢 INTERFAZ PRINCIPAL: Appointment
 * Refleja el modelo de SQLAlchemy / Neon PostgreSQL.
 */
export interface Appointment {
    id?: number;
    service_id: number;
    collaborator_id: number;
    
    // Relaciones anidadas (Joinedload)
    service?: ServiceSimple;
    
    client_id: number | null;
    client_name: string;
    client_phone: string | null;
    client_email: string | null;
    client_notes: string | null;
    
    start_time: string; // ISO String desde el Backend
    end_time: string;   // ISO String desde el Backend
    
    status: AppointmentStatus;
    source: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * 🕒 INTERFAZ: AvailableSlot
 * Esencial para el AppointmentFormManager y la lógica de disponibilidad.
 */
export interface AvailableSlot {
    start_time: string;
    end_time: string;
    collaborator_id: number;
    available_minutes: number;
    // 🌟 Propiedad calculada en el frontend para la UI
    is_favorite?: boolean; 
}

/**
 * 📦 DTO: CreateAppointmentDTO
 * Lo que enviamos al endpoint POST /appointments/
 */
export interface CreateAppointmentDTO {
    service_id: number;
    collaborator_id: number;
    client_id: number | null;
    client_name: string;
    client_phone: string;
    client_email?: string | null; // Añadido para ser consistente
    client_notes: string;
    start_time: string; 
    end_time: string;   
    status: AppointmentStatus;
    // El source es opcional si el backend lo gestiona o lo recibimos de la IA
    source?: string; 
}

/**
 * 📊 INTERFAZ: DayCountResponse
 * Para las respuestas de estadísticas del carrusel.
 */
export interface DayCountResponse {
    date: string;
    count: number;
}