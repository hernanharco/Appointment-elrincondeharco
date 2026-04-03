<script lang="ts">
  import { Save, CalendarClock, Clock, Loader2, ArrowLeft, Coffee } from 'lucide-svelte';
  import { collaboratorStore } from '@/lib/state/collaborator-state.svelte';
  import { scheduleConfigStore } from '@/lib/state/scheduleconfig-state.svelte';
  import { DAYS_LABELS } from '@/lib/constants/days';
  import { slide, fade } from 'svelte/transition';

  // Al montar, cargamos los datos del colaborador seleccionado
  $effect(() => {
    if (collaboratorStore.selectedId) {
      scheduleConfigStore.load(collaboratorStore.selectedId);
    }
  });
</script>

<div class="space-y-4">
  <div class="bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100/50 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
        <Clock size={20} />
      </div>
      <div>
        <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Configurando Horario</p>
        <h3 class="font-bold text-slate-900 text-sm">
          {collaboratorStore.selectedCollaborator?.name || 'Cargando...'}
        </h3>
      </div>
    </div>
    
    <button 
      onclick={() => collaboratorStore.goBack()}
      class="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
    >
      <ArrowLeft size={18} />
    </button>
  </div>

  <div class="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
    {#if scheduleConfigStore.isLoading}
      {#each Array(5) as _}
        <div class="h-20 w-full bg-slate-100 animate-pulse rounded-3xl"></div>
      {/each}
    {:else}
      {#if scheduleConfigStore.isConfigEmpty}
        <div class="py-12 flex flex-col items-center text-center px-6" in:fade>
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-200 text-slate-300">
            <CalendarClock size={32} />
          </div>
          <p class="text-sm font-bold text-slate-500">Sin horario definido</p>
          <p class="text-[11px] text-slate-400 mt-1">Activa los días para definir la disponibilidad.</p>
        </div>
      {/if}

      {#each DAYS_LABELS as day (day.id)}
        {@const dayConfig = scheduleConfigStore.config[day.id]}
        {#if dayConfig}
          <div class="p-4 rounded-3xl border transition-all {dayConfig.is_enabled ? 'bg-white border-indigo-100 shadow-sm' : 'bg-slate-50/50 border-transparent opacity-60'}">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold {dayConfig.is_enabled ? 'text-slate-800' : 'text-slate-400'}">{day.name}</span>
              
              <button
                type="button"
                onclick={() => scheduleConfigStore.toggleDay(day.id)}
                aria-label="Toggle day"
                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors {dayConfig.is_enabled ? 'bg-indigo-600' : 'bg-slate-300'}"
              >
                <span class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform {dayConfig.is_enabled ? 'translate-x-5' : 'translate-x-1'}"></span>
              </button>
            </div>

            {#if dayConfig.is_enabled}
              <div transition:slide={{ duration: 200 }} class="mt-4 space-y-3 pt-3 border-t border-indigo-50">
                {#each dayConfig.time_slots as slot}
                  <div class="flex items-center gap-2">
                    <input type="time" bind:value={slot.start_time} class="flex-1 px-3 py-2 bg-slate-50 border border-transparent rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                    <span class="text-slate-300">-</span>
                    <input type="time" bind:value={slot.end_time} class="flex-1 px-3 py-2 bg-slate-50 border border-transparent rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                  </div>
                {/each}

                <label class="flex items-center gap-2 cursor-pointer pt-1 group">
                  <input
                    type="checkbox"
                    checked={dayConfig.is_split_shift}
                    onchange={() => scheduleConfigStore.toggleSplitTurn(day.id)}
                    aria-label="Toggle split shift"
                  class="w-4 h-4 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <div class="flex items-center gap-1">
                    <Coffee size={12} class="text-slate-400 group-hover:text-indigo-500" />
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-indigo-500 transition-colors">Jornada partida / Siesta</span>
                  </div>
                </label>
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    {/if}
  </div>

  <div class="pt-2">
    <button
      onclick={() => scheduleConfigStore.save(collaboratorStore.selectedId!, () => collaboratorStore.goBack())}
      disabled={scheduleConfigStore.isSaving || scheduleConfigStore.isLoading}
      class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-950 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
    >
      {#if scheduleConfigStore.isSaving}
        <Loader2 class="h-4 w-4 animate-spin" />
      {:else}
        <Save size={18} />
      {/if}
      Confirmar Horario Semanal
    </button>
  </div>
</div>