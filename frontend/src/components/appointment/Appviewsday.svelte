<script lang="ts">
  import { format } from 'date-fns';
  import { es } from 'date-fns/locale';
  import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-svelte';

  // 🧠 Importamos la lógica centralizada (SRP)
  import { viewsDayState } from '@/lib/stores/appviewsday-state.svelte';
  import { appointmentStore } from '@/lib/stores/appointment-state.svelte';
  import { onMount } from 'svelte';

  /**
   * Generamos los próximos 7 días a partir de hoy para el carrusel.
   * Esto se mantiene simple, pero los botones ahora activan la carga real.
   */
  const displayDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  onMount(() => {
    const dates = displayDays.map((day) => format(day, 'yyyy-MM-dd'));
    
    // 1. Inicializamos el diccionario en el store con ceros 
    // para que el store "sepa" que estas fechas le interesan.
    dates.forEach(d => {
        if (appointmentStore.weekCounts[d] === undefined) {
            appointmentStore.weekCounts[d] = 0;
        }
    });

    // 2. Cargamos los datos reales
    appointmentStore.fetchWeeklyCounts(dates);

    const today = new Date();
    viewsDayState.handleDateClick(today, 0); 
  });
</script>

<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
        <CalendarIcon class="h-5 w-5" />
      </div>
      <div>
        <h2 class="text-lg font-bold text-slate-800 capitalize leading-tight">
          {format(appointmentStore.selectedDate, 'EEEE, d MMMM', { locale: es })}
        </h2>
        <p class="text-xs text-slate-500">
          {viewsDayState.currentDayLabel} • Gestión de disponibilidad
        </p>
      </div>
    </div>

    <div class="flex gap-1">
      <button
        onclick={() => viewsDayState.prevDay()}
        class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
      >
        <ChevronLeft class="h-5 w-5" />
      </button>
      <button
        onclick={() => viewsDayState.nextDay()}
        class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
      >
        <ChevronRight class="h-5 w-5" />
      </button>
    </div>
  </div>

  <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    {#each displayDays as day, i}
      {@const dateKey = format(day, 'yyyy-MM-dd')}
      {@const isActive = dateKey === format(appointmentStore.selectedDate, 'yyyy-MM-dd')}
      {@const count = appointmentStore.weekCounts[dateKey] ?? 0}

      <button
        onclick={() => viewsDayState.handleDateClick(day, i)}
        class="flex-1 min-w-[100px] p-3 rounded-xl border transition-all duration-200 text-center
      {isActive
          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 ring-2 ring-blue-600 ring-offset-2'
          : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:bg-blue-50/50'}"
      >
        <span class="block text-[10px] uppercase font-black tracking-widest opacity-70 mb-1">
          {format(day, 'EEE', { locale: es })}
        </span>
        <span class="block text-xl font-black">{day.getDate()}</span>

        <span
          class="block text-[10px] font-bold mt-1 {isActive ? 'text-blue-100' : 'text-blue-500'}"
        >
          {#if isActive && appointmentStore.isLoading}
            ...
          {:else}
            {count} {count === 1 ? 'cita' : 'citas'}
          {/if}
        </span>

        <div class="mt-1 flex justify-center gap-0.5">
          <div
            class="h-1 {count > 0 ? 'w-6' : 'w-4'} rounded-full {isActive
              ? 'bg-blue-300'
              : 'bg-slate-200'} transition-all"
          ></div>
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
