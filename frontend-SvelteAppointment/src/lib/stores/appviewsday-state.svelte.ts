// @/lib/stores/appviewsday-state.svelte.ts
import { getDay, startOfDay, addDays, subDays, format } from 'date-fns';
import { DAYS_LABELS, mapJsDayToCustomDay } from '@/lib/constants/days';
import { appointmentStore } from './appointment-state.svelte';
import { appConfigState } from '@/lib/state/dayschedule-state.svelte';

/**
 * 🏢 VIEW STATE: Gestión de Navegación Diaria
 * Responsabilidad: Manejar la lógica visual del carrusel y sincronizar 
 * la fecha seleccionada con la carga de datos.
 */
class AppViewsDayState {
    // 🚩 Índice visual para el carrusel (0-6 para los 7 días visibles)
    selectedIndex = $state(0);

    /**
     * 🧠 ID de la Base de Datos (Derivado)
     * Resiliencia: Si el store aún no carga la fecha, devuelve Lunes (1) por defecto.
     */
    currentDbDayId = $derived.by(() => {
        const date = appointmentStore.selectedDate;
        if (!date) return 1; 
        const jsDay = getDay(date);
        return mapJsDayToCustomDay(jsDay);
    });

    /**
     * 🏷️ Nombre del día (Derivado)
     * Ejemplo: "Lunes", "Martes". Usado en el encabezado de la vista.
     */
    currentDayLabel = $derived.by(() => {
        const dayId = this.currentDbDayId;
        return DAYS_LABELS.find(d => d.id === dayId)?.name || 'Cargando...';
    });

    /**
     * 📅 ACCIÓN: Cambia la fecha y sincroniza los estados.
     * Es el corazón de la navegación.
     */
    async handleDateClick(day: Date, index: number) {
        // 1. Actualizamos índices y fecha base
        this.selectedIndex = index;
        const normalizedDate = startOfDay(day);
        appointmentStore.selectedDate = normalizedDate;

        // 2. Obtenemos el ID de día para configuración (horas de apertura)
        const dbDayId = mapJsDayToCustomDay(getDay(normalizedDate));

        try {
            // 3. 🚀 Excelencia Técnica: Carga paralela de Citas + Rango Horario
            // Esto evita que la UI "salte" cargando una cosa tras otra.
            await Promise.all([
                appointmentStore.fetchAppointments(),
                appConfigState.fetchGlobalRange(dbDayId)
            ]);
        } catch (error) {
            console.error("❌ Error en la navegación de día:", error);
        }
    }

    /**
     * 📊 ACCIÓN: Sincroniza los contadores del carrusel.
     * Se llama en el onMount del carrusel para ver "X citas" bajo cada día.
     */
    async syncCarouselCounts(displayDays: Date[]) {
        const dateStrings = displayDays.map(d => format(d, 'yyyy-MM-dd'));
        await appointmentStore.fetchWeeklyCounts(dateStrings);
    }

    /**
     * ⏭️ Avanza un día (Botón derecho)
     */
    async nextDay() {
        const newDate = addDays(appointmentStore.selectedDate, 1);
        await this.handleDateClick(newDate, this.selectedIndex + 1);
    }

    /**
     * ⏮️ Retrocede un día (Botón izquierdo)
     */
    async prevDay() {
        const newDate = subDays(appointmentStore.selectedDate, 1);
        // Protegemos que el índice no sea negativo para la lógica visual
        await this.handleDateClick(newDate, Math.max(0, this.selectedIndex - 1));
    }

    /**
     * 🏠 Vuelve al día actual
     */
    async resetToToday() {
        const today = new Date();
        await this.handleDateClick(today, 0);
    }
}

// 🎯 EXPORTACIÓN DE INSTANCIA ÚNICA
export const viewsDayState = new AppViewsDayState();