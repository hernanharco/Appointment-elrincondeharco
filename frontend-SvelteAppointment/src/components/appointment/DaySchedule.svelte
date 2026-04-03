<script lang="ts">
  import { appConfigState } from '@/lib/state/dayschedule-state.svelte.ts';
  import {
    Clock,
    Plus,
    BotMessageSquareIcon,
    Loader2,
    CheckCircle2,
  } from 'lucide-svelte';
  import { appointmentStore } from '@/lib/stores/appointment-state.svelte.ts';
  import { format } from 'date-fns';
  
  import MariaNotification from '../notifications/NewNotification.svelte';
  import type { Appointment } from '@/types/appointments';

  interface AppointmentPosition extends Appointment {
    computedStyle: string;
    startMinutes: number;
    endMinutes: number;
    duration: number;
    colIndex: number;
  }

  const SLOT_HEIGHT = 80; 
  const PX_PER_MIN = SLOT_HEIGHT / 15;
  let scrollContainer: HTMLDivElement | undefined = $state();

  const getStartHour = () =>
    appConfigState.hoursList.length > 0 ? Math.min(...appConfigState.hoursList) : 8;

  const formatTimeUTC = (dateValue: string | Date) => {
    const d = new Date(dateValue);
    return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
  };

  const getEndTimeUTC = (dateValue: string | Date, duration: number) => {
    const start = new Date(dateValue);
    const end = new Date(start.getTime() + duration * 60000);
    return `${end.getUTCHours().toString().padStart(2, '0')}:${end.getUTCMinutes().toString().padStart(2, '0')}`;
  };

  /**
   * 🧠 LÓGICA DE POSICIONAMIENTO REFINADA
   * Filtramos citas canceladas para mantener el principio de "Menos infraestructura, más valor".
   */
  const positionedAppointments = $derived.by(() => {
    // 1. FILTRADO: Solo procesamos citas que NO estén canceladas
    const activeApts = (appointmentStore.items || []).filter(
      (apt) => apt.status !== 'cancelled'
    );
    
    const startHour = getStartHour();
    
    // 2. ENRIQUECIMIENTO: Calculamos minutos y duración para el algoritmo
    const enrichedApts = activeApts.map((apt) => {
      const start = new Date(apt.start_time);
      const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
      const duration = apt.service?.duration_minutes || 30;
      return { ...apt, startMinutes, endMinutes: startMinutes + duration, duration };
    });

    // 3. CLUSTERING: Agrupamos citas que se solapan en el tiempo
    const clusters: any[][] = [];
    enrichedApts.forEach((apt) => {
      let cluster = clusters.find((c) =>
        c.some((other) => apt.startMinutes < other.endMinutes && apt.endMinutes > other.startMinutes)
      );
      if (cluster) cluster.push(apt);
      else clusters.push([apt]);
    });

    const finalPositions: AppointmentPosition[] = [];
    for (const cluster of clusters) {
      cluster.sort((a, b) => a.startMinutes - b.startMinutes);
      const columns: any[][] = [];
      cluster.forEach((apt) => {
        let colIndex = columns.findIndex((col) => {
          const lastInCol = col[col.length - 1];
          return lastInCol && apt.startMinutes >= lastInCol.endMinutes;
        });
        if (colIndex === -1) {
          columns.push([apt]);
          colIndex = columns.length - 1;
        } else {
          columns[colIndex]!.push(apt);
        }
        apt.colIndex = colIndex;
      });

      cluster.forEach((apt) => {
        const top = (apt.startMinutes - startHour * 60) * PX_PER_MIN;
        const height = apt.duration * PX_PER_MIN;
        const width = 100 / columns.length;
        const left = apt.colIndex * width;
        const realDeptColor = apt.service?.department?.color;
        const isIA = apt.source === 'ia';
        const baseColor = realDeptColor || (isIA ? '#4f46e5' : '#cbd5e1');

        finalPositions.push({
          ...apt,
          computedStyle: `
            top: ${top}px; 
            height: ${height - 4}px; 
            width: calc(${width}% - 10px); 
            left: calc(${left}% + 5px);
            z-index: ${10 + apt.colIndex};
            --dept-color: ${baseColor}; 
          `,
        } as AppointmentPosition);
      });
    }
    return finalPositions;
  });

  const scrollToCurrentTime = () => {
    if (!scrollContainer) return;
    const now = new Date();
    const currentHour = now.getHours(); 
    const target = scrollContainer.querySelector(`[data-hour="${currentHour}"]`) as HTMLElement;
    if (target) {
      scrollContainer.scrollTo({ top: target.offsetTop - 40, behavior: 'smooth' });
    }
  };

  $effect(() => {
    if (!appConfigState.isLoading && appConfigState.isOpen && scrollContainer) {
      setTimeout(scrollToCurrentTime, 500);
    }
  });
</script>

<div class="relative h-full w-full p-4 bg-slate-50">
  <MariaNotification />

  <div class="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-full backdrop-blur-xl relative">
    <div bind:this={scrollContainer} class="flex-1 overflow-y-auto custom-scrollbar relative z-0">
      
      {#if appConfigState.isLoading}
        <div class="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
          <Loader2 class="h-10 w-10 animate-spin text-indigo-500" />
          <p class="font-black text-sm uppercase tracking-widest text-indigo-400">Sincronizando Agenda...</p>
        </div>
      {:else}
        <div class="relative z-0">
          {#each appConfigState.hoursList as h, i}
            {@const isLastHour = i === appConfigState.hoursList.length - 1}
            {#each (isLastHour ? [0] : [0, 15, 30, 45]) as m}
              <div data-hour={h} class="flex border-b border-slate-100 h-[80px] group transition-all">
                <div class="w-24 flex items-center justify-center border-r border-slate-50 bg-slate-50/20 shrink-0 sticky left-0 z-30">
                  <span class="text-[13px] font-black {m === 0 ? 'text-slate-900' : 'text-slate-300'}">
                    {h}:{m === 0 ? '00' : m}
                  </span>
                </div>
                <div class="flex-1 relative transition-colors group-hover:bg-indigo-50/10">
                  {#if !isLastHour}
                    <button 
                      onclick={() => appointmentStore.openModal(format(appointmentStore.selectedDate, 'yyyy-MM-dd'))} 
                      class="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center text-indigo-400/50">
                      <Plus class="h-6 w-6 stroke-2" />
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          {/each}
        </div>

        <div class="absolute top-0 left-24 right-0 z-10 pointer-events-none pr-4">
          {#each positionedAppointments as apt (apt.id)}
            {@const isIA = apt.source === 'ia'}
            {@const isManual = apt.source === 'manual'}
            
            <div 
              style={apt.computedStyle} 
              role="button"
              tabindex={0}
              onkeydown={(e) => { if (e.key === 'Enter') appointmentStore.openEditModal(apt); }}
              onclick={() => appointmentStore.openEditModal(apt)}
              class="absolute pointer-events-auto group/item cursor-pointer transition-all duration-300"
            >
              <div class="h-full w-full rounded-4xl p-5 flex flex-col justify-between relative overflow-hidden transition-all
                {isIA ? 'shadow-2xl' : 'bg-white border border-slate-200 shadow-xl shadow-slate-200/40'}
                group-hover/item:scale-[1.01] group-hover/item:z-50"
                style:background={isIA ? `linear-gradient(135deg, var(--dept-color), color-mix(in srgb, var(--dept-color), black 25%))` : 'white'}>
                
                {#if isManual}
                  <div class="absolute top-0 left-0 w-2 h-full" style:background-color={'var(--dept-color)'}></div>
                {/if}

                {#if isIA}
                  <div class="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/item:animate-shimmer pointer-events-none"></div>
                {/if}

                <div class="flex justify-between items-start relative z-10 {isManual ? 'pl-3' : ''}">
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-3">
                      <div class="px-3 py-1 rounded-full text-[11px] font-black tracking-tighter flex items-center gap-1.5
                        {isIA ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}">
                        <Clock size={12} />
                        {formatTimeUTC(apt.start_time)} — {getEndTimeUTC(apt.start_time, apt.service?.duration_minutes || 30)}
                      </div>
                      {#if isIA}
                        <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20">
                          <BotMessageSquareIcon size={12} class="animate-pulse" />
                          <span class="text-[9px] font-black uppercase tracking-tighter">IA Agent</span>
                        </div>
                      {/if}
                    </div>
                    <h3 class="text-xl font-black mt-2 tracking-tight leading-none {isIA ? 'text-white' : 'text-slate-900'}">
                      {apt.client_name}
                    </h3>
                  </div>
                </div>

                <div class="mt-auto flex items-end justify-between relative z-10 {isManual ? 'pl-3' : ''}">
                  <div class="flex flex-col gap-1">
                    <span class="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 {isIA ? 'text-white' : 'text-slate-400'}">Servicio</span>
                    <span class="text-sm font-bold {isIA ? 'text-white' : 'text-slate-800'}">{apt.service?.name}</span>
                  </div>

                  <div class="flex items-center gap-3">
                    {#if apt.status === 'confirmed'}
                      <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest
                        {isIA ? 'bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-400/20' : 'bg-emerald-100 text-emerald-700'}">
                        <CheckCircle2 size={12} />
                        Confirmado
                      </div>
                    {/if}
                    <div class="text-[10px] font-black uppercase {isIA ? 'text-white/60' : 'text-slate-400'}">
                      {apt.service?.duration_minutes || 30} MIN
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 5px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
  @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  :global(.group\/item:hover .animate-shimmer) { animation: shimmer 2s infinite; }
</style>