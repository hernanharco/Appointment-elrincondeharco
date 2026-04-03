<script lang="ts">
  import { serviceStore } from '@/lib/state/service-state.svelte';
  import { departmentStore } from '@/lib/state/department-state.svelte';
  import { ServiceFormManager } from '@/lib/state/service-form.svelte';
  import { X, Plus, Scissors, Clock, DollarSign, Loader2, Edit2, Trash2, CheckCircle2 } from 'lucide-svelte';
  import { fade, scale, slide } from 'svelte/transition';

  // Instanciamos el manager que controla la lógica del formulario
  const manager = new ServiceFormManager();

  // Helper para encontrar el nombre del departamento
  // Usamos uiStore.departments que ya tienes en tu arquitectura
  const getDeptName = (id: number | null) => 
    departmentStore.departments.find(d => d.id === id)?.name || 'Sin área';

  // Función para cerrar y limpiar
  const handleClose = () => {
    serviceStore.close();
    manager.reset();
  };
</script>

{#if serviceStore.isOpen}
  <div transition:fade={{ duration: 200 }} class="fixed inset-0 z-100 flex items-center justify-center p-4">
    <button 
      class="fixed inset-0 bg-indigo-950/20 backdrop-blur-xl border-none w-full h-full cursor-default" 
      onclick={handleClose}
      aria-label="Cerrar modal"
    ></button>

    <div transition:scale={{ start: 0.95, duration: 200 }} 
         class="bg-white w-full max-w-xl rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.1)] overflow-hidden relative z-10 border border-white flex flex-col">
      
      <header class="p-8 pb-4 flex justify-between items-start">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Scissors size={24} />
          </div>
          <div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">Servicios</h2>
            <p class="text-sm text-slate-500 font-medium">Catálogo de experiencias</p>
          </div>
        </div>
        <button onclick={handleClose} class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <X size={20} />
        </button>
      </header>

      <div class="px-8 pb-8 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
        {#if manager.showForm}
          <div transition:slide class="bg-slate-50 rounded-4xl p-6 border border-slate-100 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2 space-y-1.5">                
                <label 
                for="service-name"
                class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest ml-2">Nombre del Servicio</label>
                <input id="service-name" bind:value={manager.formData.name} type="text" placeholder="Ej. Corte de Cabello Pro"
                       class="w-full px-5 py-3.5 bg-white border-0 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold transition-all" />
              </div>

              <div class="space-y-1.5">
                <label for="service-duration" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Duración (min)</label>
                <div class="relative">
                  <Clock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input id="service-duration" bind:value={manager.formData.duration_minutes} type="number"
                         class="w-full pl-11 pr-4 py-3.5 bg-white border-0 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" />
                </div>
              </div>

              <div class="space-y-1.5">
                <label for="service-price" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Precio ($)</label>
                <div class="relative">
                  <DollarSign class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input id="service-price" bind:value={manager.formData.price} type="number"
                         class="w-full pl-11 pr-4 py-3.5 bg-white border-0 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" />
                </div>
              </div>

              <div class="col-span-2 space-y-1.5">
                <label for="service-department" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Asignar a Área</label>
                <div class="flex flex-wrap gap-2">
                  {#each departmentStore.departments as dept}
                    <button 
                      onclick={() => manager.formData.department_id = dept.id}
                      class="px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 
                      {manager.formData.department_id === dept.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}">
                      {dept.name}
                    </button>
                  {/each}
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button onclick={() => manager.reset()} class="flex-1 py-4 text-sm font-bold text-slate-400">Cancelar</button>
              <button 
                onclick={() => manager.save(() => serviceStore.refresh(true))} 
                disabled={manager.isSaving}
                class="flex-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {#if manager.isSaving} <Loader2 class="animate-spin" size={18} /> {/if}
                {manager.formData.id ? 'Actualizar Servicio' : 'Guardar Servicio'}
              </button>
            </div>
          </div>
        {:else}
          <button onclick={() => manager.toggleForm()} 
                  class="w-full py-5 rounded-4xl border-2 border-dashed border-slate-200 text-slate-400 font-bold flex items-center justify-center gap-3 hover:bg-indigo-50/50 hover:border-indigo-300 hover:text-indigo-600 transition-all group">
            <div class="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-100 transition-colors"><Plus size={20} /></div>
            Agregar nuevo servicio al catálogo
          </button>
        {/if}

        <div class="space-y-3">
          <div class="flex justify-between items-center px-2">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Servicios Activos</h3>
            <span class="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
              {serviceStore.items.length} Total
            </span>
          </div>

          <div class="space-y-3">
            {#each serviceStore.items as service (service.id)}
              <div class="group bg-white border border-slate-100 p-5 rounded-[1.75rem] flex items-center justify-between hover:shadow-xl hover:shadow-indigo-50 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-slate-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-800 text-sm">{service.name}</h4>
                    <div class="flex items-center gap-3 mt-1">
                      <span class="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                        <Clock size={12}/> {service.duration_minutes} min
                      </span>
                      <span class="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span class="text-[11px] font-black text-indigo-600">${service.price}</span>
                      <span class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-lg uppercase tracking-tighter">
                        {getDeptName(service.department_id)}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onclick={() => manager.startEdit(service)} 
                    class="p-2.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onclick={() => manager.delete(service.id, () => serviceStore.refresh(true))} 
                    class="p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            {:else}
              <div class="py-10 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                No hay servicios en el catálogo
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>