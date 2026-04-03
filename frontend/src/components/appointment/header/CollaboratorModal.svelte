<script lang="ts">
  import { collaboratorStore } from '@/lib/state/collaborator-state.svelte';
  import { departmentStore } from '@/lib/state/department-state.svelte'; 
  import { CollaboratorFormManager } from '@/lib/state/collaborator-form.svelte';
  import ScheduleConfig from '@/components/appointment/header/ScheduleConfigModal.svelte'
  
  import { 
    X, UserPlus, Mail, Loader2, Edit2, Trash2, 
    Plus, UserCheck, Building2, CalendarClock, ChevronLeft 
  } from 'lucide-svelte';
  import { fade, scale, slide, fly } from 'svelte/transition';

  const manager = new CollaboratorFormManager();

  // Función para cerrar y resetear
  const handleClose = () => {
    collaboratorStore.close();
    manager.reset();
  };
</script>

{#if collaboratorStore.isOpen}
  <div class="fixed inset-0 z-100 flex items-center justify-center p-4">
    <div 
      transition:fade={{ duration: 200 }}
      class="fixed inset-0 bg-indigo-950/40 backdrop-blur-md"
      onclick={handleClose}
      aria-hidden="true"
    ></div>

    <div 
      transition:scale={{ start: 0.95, duration: 200 }} 
      class="bg-white w-full max-w-md rounded-4xl shadow-[0_20px_50px_rgba(79,70,229,0.2)] overflow-hidden relative z-10 border border-indigo-50"
    >
      <div class="p-8 pb-6 flex justify-between items-start">
        <div class="flex items-center gap-3">
          {#if collaboratorStore.view === 'schedule'}
            <button 
              transition:fade
              onclick={() => collaboratorStore.goBack()}
              class="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          {/if}
          <div>
            <div class="flex items-center gap-2 mb-1">
              <div class="p-1.5 bg-indigo-600 rounded-lg text-white">
                <UserCheck size={18} />
              </div>
              <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">
                {collaboratorStore.view === 'list' ? 'Equipo' : 'Horarios'}
              </h2>
            </div>
            <p class="text-sm text-slate-500 font-medium">
              {collaboratorStore.view === 'list' ? 'Gestiona accesos y áreas' : collaboratorStore.selectedCollaborator?.name}
            </p>
          </div>
        </div>
        <button 
          onclick={handleClose} 
          class="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <div class="px-8 pb-8 min-h-[400px] relative overflow-hidden">
        {#if collaboratorStore.view === 'list'}
          <div in:fly={{ x: -20, duration: 300, delay: 200 }} out:fly={{ x: -20, duration: 200 }}>
            {#if manager.showForm}
              <div transition:slide class="mb-6 space-y-4 bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50">
                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold text-indigo-400 uppercase tracking-wider ml-1" for="colab-name">Nombre</label>
                  <div class="relative">
                    <UserPlus class="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={16} />
                    <input id="colab-name" bind:value={manager.formData.name} type="text" class="w-full pl-10 pr-4 py-3 bg-white border border-indigo-100 rounded-xl outline-none text-sm font-semibold focus:border-indigo-500 transition-all" />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold text-indigo-400 uppercase tracking-wider ml-1" for="colab-email">Email</label>
                  <div class="relative">
                    <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={16} />
                    <input id="colab-email" bind:value={manager.formData.email} type="email" class="w-full pl-10 pr-4 py-3 bg-white border border-indigo-100 rounded-xl outline-none text-sm font-semibold focus:border-indigo-500 transition-all" />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 ml-1">
                    <Building2 size={14} /> Asignar Áreas
                  </label>
                  <div class="flex flex-wrap gap-2">
                    {#each departmentStore.departments as dept}
                      <button
                        type="button"
                        onclick={() => manager.toggleDepartment(Number(dept.id))}
                        class="px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all
                        {manager.formData.department_ids.includes(Number(dept.id)) 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-400 border-indigo-100 hover:text-indigo-500'}"
                      >
                        {dept.name}
                      </button>
                    {/each}
                  </div>
                </div>

                <div class="flex gap-3 pt-2">
                  <button onclick={() => manager.toggleForm()} class="flex-1 py-3 text-sm font-bold text-slate-500">Cancelar</button>
                  <button onclick={() => manager.save()} disabled={manager.isSaving} class="flex-2 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                    {#if manager.isSaving} <Loader2 class="h-4 w-4 animate-spin" /> {/if}
                    {manager.formData.id ? 'Actualizar' : 'Confirmar'}
                  </button>
                </div>
              </div>
            {:else}
              <button 
                onclick={() => manager.toggleForm()}
                class="group w-full mb-6 py-4 bg-white border-2 border-dashed border-indigo-200 rounded-3xl text-indigo-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-600 transition-all"
              >
                <Plus size={18} /> Agregar nuevo integrante
              </button>
            {/if}

            <div class="space-y-4">
              <div class="flex items-center justify-between px-1">
                <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Miembros activos</h3>
                <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">{collaboratorStore.list.length} total</span>
              </div>

              <div class="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {#each collaboratorStore.list as member (member.id)}
                  <div class="group flex items-center justify-between p-4 bg-slate-50/50 border border-transparent rounded-[1.25rem] hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all">
                    <div class="flex items-center gap-4">
                      <div class="relative">
                        <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                          {member.name?.substring(0,2).toUpperCase()}
                        </div>
                        <button 
                          onclick={() => collaboratorStore.openSchedule(Number(member.id))}
                          class="absolute -bottom-1 -right-1 p-1 bg-white shadow-md border border-slate-100 rounded-lg text-indigo-600 hover:scale-110 transition-transform"
                        >
                          <CalendarClock size={12} />
                        </button>
                      </div>
                      
                      <div>
                        <h4 class="text-sm font-bold text-slate-800 leading-tight">{member.name}</h4>
                        <p class="text-[11px] text-slate-400">{member.email}</p>
                        <div class="flex flex-wrap gap-1 mt-1">
                          {#each member.department_ids || [] as depId}
                            <span class="text-[8px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-md font-bold uppercase">
                              {departmentStore.departments.find(d => d.id === depId)?.name || '...'}
                            </span>
                          {/each}
                        </div>
                      </div>
                    </div>

                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onclick={() => manager.startEdit(member)} class="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Edit2 size={14} /></button>
                      <button onclick={() => manager.delete(member.id)} class="p-2 text-rose-300 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {:else if collaboratorStore.view === 'schedule'}
          <div in:fly={{ x: 20, duration: 300, delay: 200 }} out:fly={{ x: 20, duration: 200 }}>
            <ScheduleConfig />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e0e7ff; border-radius: 20px; }
</style>