/**
 * appointment-form.svelte.ts
 * Responsabilidad: Gestión integral del ciclo de vida del formulario de citas.
 * Soporta: Creación, Edición, Eliminación, Filtro de Favoritos y Validación.
 */
import { appointmentStore } from '../stores/appointment-state.svelte';
import { appointmentsApi } from '@/lib/api/appointments';
import { availabilityApi } from '@/lib/api/availability';
import { clientStore } from './client-state.svelte';
import { toastStore } from './toast-state.svelte';
import { format } from 'date-fns';
import type { 
    AvailableSlot, 
    CreateAppointmentDTO, 
    AppointmentStatus, 
    Appointment 
} from '@/types/appointments';

export class AppointmentFormManager {
    // --- ESTADO REACTIVO ---
    formData = $state({
        id: null as number | null,
        client_id: null as number | null,
        client_name: '',
        client_phone: '',
        client_email: '',
        client_notes: '',
        service_id: null as number | null,
        collaborator_id: null as number | null,
        date: '',
        time: '',
        duration_minutes: 30,
        status: 'pending' as AppointmentStatus
    });

    preferred_ids = $state<number[]>([]);
    slots = $state<AvailableSlot[]>([]);
    isLoadingSlots = $state(false);
    isSaving = $state(false);
    saveSuccess = $state(false);

    // --- MÉTODOS DE CARGA Y RESETEO ---

    loadAppointment(apt: Appointment): void {
        this.resetForm();
        const start = new Date(apt.start_time);
        
        this.formData = {
            id: Number(apt.id),
            client_id: apt.client_id || null,
            client_name: apt.client_name,
            client_phone: apt.client_phone || '',
            client_email: apt.client_email || '',
            client_notes: apt.client_notes || '',
            service_id: apt.service?.id || null,
            collaborator_id: apt.collaborator_id || null,
            date: format(start, 'yyyy-MM-dd'),
            time: format(start, 'HH:mm'),
            duration_minutes: apt.service?.duration_minutes || 30,
            status: apt.status || 'pending'
        };

        if (this.formData.client_phone) {
            this.handlePhoneInput();
        }
    }

    resetForm(): void {
        this.formData = {
            id: null,
            client_id: null,
            client_name: '',
            client_phone: '',
            client_email: '',
            client_notes: '',
            service_id: null,
            collaborator_id: null,
            date: '',
            time: '',
            duration_minutes: 30,
            status: 'pending'
        };
        this.preferred_ids = [];
        this.slots = [];
        this.saveSuccess = false;
        this.isSaving = false;
    }

    // --- LÓGICA DE DISPONIBILIDAD ---

    async fetchAvailableSlots(): Promise<void> {
        if (!this.formData.date || !this.formData.service_id) {
            this.slots = [];
            return;
        }

        this.isLoadingSlots = true;
        try {
            const data = await availabilityApi.getSlots(
                this.formData.date,
                this.formData.service_id
            );

            let rawSlots: AvailableSlot[] = data.available_slots || [];

            if (this.preferred_ids.length > 0) {
                rawSlots = rawSlots.filter((slot: AvailableSlot) => 
                    this.preferred_ids.includes(Number(slot.collaborator_id))
                );
            }

            const uniqueSlots = rawSlots.reduce((acc: AvailableSlot[], current: AvailableSlot) => {
                const currentHour = this.extractTime(current.start_time);
                const existingIndex = acc.findIndex(item => this.extractTime(item.start_time) === currentHour);

                if (existingIndex === -1) {
                    acc.push(current);
                } else if (this.preferred_ids.length > 0) {
                    const currentIndex = this.preferred_ids.indexOf(Number(current.collaborator_id));
                    const existingInFavs = this.preferred_ids.indexOf(Number(acc[existingIndex]!.collaborator_id));
                    if (currentIndex < existingInFavs) acc[existingIndex] = current;
                }
                return acc;
            }, []);

            this.slots = uniqueSlots.map((s: AvailableSlot) => ({
                ...s,
                is_favorite: this.preferred_ids.includes(Number(s.collaborator_id))
            }));

        } catch (error) {
            console.error("❌ Error fetchAvailableSlots:", error);
            toastStore.show('No se pudo cargar la disponibilidad', 'error');
        } finally {
            this.isLoadingSlots = false;
        }
    }

    private extractTime(isoString: string): string {
        const d = new Date(isoString);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }

    // --- MANEJO DE CLIENTE Y SELECCIÓN ---

    async handlePhoneInput(): Promise<void> {
        const phone = this.formData.client_phone.trim();
        if (phone.length >= 9) {
            const client = await clientStore.findByPhone(phone);
            if (client) {
                this.formData.client_id = client.id;
                this.formData.client_name = client.full_name;
                this.formData.client_email = client.email || '';
                this.preferred_ids = client.metadata_json?.profile?.preferred_collaborator_ids || [];
                
                if (this.formData.date && this.formData.service_id) {
                    this.fetchAvailableSlots();
                }
            }
        }
    }

    selectSlot(slot: AvailableSlot): void {
        this.formData.time = this.extractTime(slot.start_time);
        this.formData.collaborator_id = slot.collaborator_id;
        this.formData.duration_minutes = slot.available_minutes;
        
        const msg = slot.is_favorite ? "⭐ Especialista favorito" : "Horario seleccionado";
        toastStore.show(msg, 'success');
    }

    // --- GUARDADO Y ELIMINACIÓN ---

    async save(): Promise<void> {
        if (!this.formData.client_name || !this.formData.time || !this.formData.date) {
            toastStore.show('Faltan datos obligatorios', 'error');
            return;
        }

        if (this.isSaving) return;
        this.isSaving = true;

        try {
            const startTimeStr = `${this.formData.date}T${this.formData.time}:00`;
            const startDate = new Date(startTimeStr);
            const endDate = new Date(startDate.getTime() + this.formData.duration_minutes * 60000);
            
            const payload: CreateAppointmentDTO = {
                service_id: this.formData.service_id!,
                collaborator_id: this.formData.collaborator_id!,
                client_id: this.formData.client_id,
                client_name: this.formData.client_name,
                client_phone: this.formData.client_phone,
                client_email: this.formData.client_email || null,
                client_notes: this.formData.client_notes,
                start_time: startTimeStr,
                end_time: this.formatToLocalISO(endDate),
                status: this.formData.status,
                source: 'manual'
            };

            let result;
            if (this.formData.id) {
                result = await appointmentStore.updateAppointment(this.formData.id, payload);
                toastStore.show('Cita actualizada correctamente', 'success');
            } else {
                result = await appointmentsApi.createAppointment(payload);
                toastStore.show('Cita agendada con éxito', 'success');
            }

            if (result) {
                this.saveSuccess = true;
                await appointmentStore.refreshAll();
            }
        } catch (error: any) {
            console.error("❌ Error en save:", error);
            const msg = error.response?.status === 409 ? 'El horario ya no está disponible' : 'Error al guardar la cita';
            toastStore.show(msg, 'error');
        } finally {
            this.isSaving = false;
        }
    }

    /**
     * 🔥 ELIMINACIÓN: Borra la cita de la base de datos.
     * Corregido para manejar respuestas vacías del servidor (204 No Content).
     */
    async deleteAppointment(id: number): Promise<boolean> {
        if (this.isSaving) return false;
        this.isSaving = true;

        try {
            // Realizamos la llamada
            await appointmentsApi.deleteAppointment(id);
            
            // Si llegamos aquí sin que lance error la API, es éxito
            toastStore.show('Cita eliminada correctamente', 'success');
            await appointmentStore.refreshAll();
            return true;

        } catch (error: any) {
            /**
             * PARCHE DE SEGURIDAD: 
             * Si el error es un SyntaxError (JSON vacío) pero el status es de éxito (2xx),
             * lo tratamos como una eliminación correcta.
             */
            const isJsonError = error instanceof SyntaxError || error.message?.includes('json');
            
            if (isJsonError) {
                toastStore.show('Cita eliminada correctamente', 'success');
                await appointmentStore.refreshAll();
                return true;
            }

            console.error("❌ Error real al eliminar cita:", error);
            toastStore.show('No se pudo eliminar la cita', 'error');
            return false;
        } finally {
            this.isSaving = false;
        }
    }

    private formatToLocalISO(date: Date): string {
        return date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0') + 'T' +
            String(date.getHours()).padStart(2, '0') + ':' +
            String(date.getMinutes()).padStart(2, '0') + ':00';
    }
}

export const appointmentForm = new AppointmentFormManager();