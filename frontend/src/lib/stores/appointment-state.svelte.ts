// app/lib/stores/appointment-state.svelte.ts
import { appointmentsApi } from '@/lib/api/appointments';
import { realtimeService } from '@/lib/api/realtime'; 
import { appointmentForm } from '@/lib/state/appointment-form.svelte'; // 👈 Importante para cargar datos
import type { Appointment } from '@/types/appointments';
import type { MariaNotification } from '@/types/notifications';
import { startOfDay, format } from 'date-fns';

class AppointmentStore {
    selectedDate = $state<Date>(startOfDay(new Date()));
    items = $state<Appointment[]>([]);
    isLoading = $state(false);
    isModalOpen = $state(false);
    dateForNewAppointment = $state<string>('');

    currentNotification = $state<MariaNotification | null>(null);
    weekCounts = $state<Record<string, number>>({});

    constructor() {
        if (typeof window !== 'undefined') {
            this.initRealtime();
        }
    }

    private initRealtime() {
        realtimeService.connect((data: MariaNotification) => {
            if (data.type === 'NEW_APPOINTMENT') {
                this.currentNotification = data; 
                this.refreshVisibleCounts();
                const viewingDate = format(this.selectedDate, 'yyyy-MM-dd');
                const todayStr = format(new Date(), 'yyyy-MM-dd');
                const appointmentDate = data.time?.includes(' ') ? data.time.split(' ')[0] : todayStr;

                if (viewingDate === appointmentDate) {
                    this.fetchAppointments();
                }
            } else if (data.type === 'REFRESH') {
                this.refreshAll();
            }
        });
    }

    async refreshAll() {
        await Promise.all([
            this.fetchAppointments(),
            this.refreshVisibleCounts()
        ]);
    }

    clearNotification() {
        this.currentNotification = null;
    }

    async refreshVisibleCounts() {
        const activeDates = Object.keys(this.weekCounts).sort();
        if (activeDates.length === 0) return;
        const start = activeDates[0]!;
        const end = activeDates[activeDates.length - 1]!;
        try {
            const newCounts = await appointmentsApi.getCountsRange(start, end);
            const updatedCounts = { ...this.weekCounts };
            activeDates.forEach(date => {
                updatedCounts[date] = newCounts[date] || 0;
            });
            this.weekCounts = updatedCounts;
        } catch (error) {
            console.error("❌ Error al sincronizar contadores:", error);
        }
    }

    /**
     * 📊 Sincroniza los contadores usando la API getCountByDay.
     */
    async fetchWeeklyCounts(dates: string[]) {
        try {
            const promises = dates.map(date => appointmentsApi.getCountByDay(date));
            const results = await Promise.all(promises);

            const newCounts = { ...this.weekCounts };
            results.forEach((res: any) => {
                newCounts[res.date] = res.count;
            });

            this.weekCounts = newCounts;
            console.log("📊 Contadores actualizados:", this.weekCounts);
        } catch (error) {
            console.error("❌ Error al cargar contadores:", error);
        }
    }

    // 🔥 MEJORA UTC: Mantenemos la consistencia con el diseño de la agenda
    appointmentsByHour = $derived.by(() => {
        const map = new Map<number, Appointment[]>();
        this.items.forEach(apt => {
            const dateObj = new Date(apt.start_time);
            const hour = dateObj.getUTCHours();
            if (!map.has(hour)) map.set(hour, []);
            map.get(hour)?.push(apt);
        });
        return map;
    });

    async fetchAppointments(filters?: any) {
        this.isLoading = true;
        try {
            const dateStr = format(this.selectedDate, 'yyyy-MM-dd');
            const params = filters || { date: dateStr };
            const data = await appointmentsApi.getAppointments(params);
            this.items = data;
        } catch (error) {
            console.error("❌ Error al obtener citas:", error);
            this.items = [];
        } finally { this.isLoading = false; }
    }

    /**
     * 📝 NUEVA ACCIÓN: Actualizar cita existente
     */
    async updateAppointment(id: number, payload: any) {
        try {
            const result = await appointmentsApi.updateAppointment(id, payload);
            await this.refreshAll();
            return result;
        } catch (error) {
            console.error("❌ Error al actualizar:", error);
            throw error;
        }
    }

    async deleteAppointment(id: number) {
        try {
            await appointmentsApi.deleteAppointment(id);
            await this.refreshAll();
            return true;
        } catch (error) {
            console.error("❌ Error al eliminar:", error);
            return false;
        }
    }

    /**
     * 🔲 UI: Control del modal
     */
    openModal(date?: string) {
        appointmentForm.resetForm(); // Limpiamos cualquier dato previo
        this.dateForNewAppointment = date || format(this.selectedDate, 'yyyy-MM-dd');
        this.isModalOpen = true;
    }

    /**
     * ✏️ NUEVA UI: Abrir para editar
     * Carga los datos de la cita en el formulario antes de abrir el modal.
     */
    openEditModal(appointment: Appointment) {
        console.log("✏️ Cargando cita para editar:", appointment);
        
        // 1. Cargamos los datos en el form state
        appointmentForm.loadAppointment(appointment);
        
        // 2. Sincronizamos la fecha del store con la de la cita
        this.dateForNewAppointment = format(new Date(appointment.start_time), 'yyyy-MM-dd');
        
        // 3. Abrimos el modal
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        appointmentForm.resetForm();
    }
}

export const appointmentStore = new AppointmentStore();