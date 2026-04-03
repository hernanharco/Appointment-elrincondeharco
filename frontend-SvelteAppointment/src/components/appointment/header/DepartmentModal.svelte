<script lang="ts">
  import { DepartmentFormManager } from '@/lib/state/department-form.svelte';
  import { departmentStore } from '@/lib/state/department-state.svelte';  
  import { 
    X, Edit3, Trash2, Loader2, Building2, 
    Plus, LayoutGrid, Info, Check 
  } from 'lucide-svelte';
  import { fade, slide, fly } from 'svelte/transition';

  const manager = new DepartmentFormManager();

  const close = () => {
    departmentStore.closeDepartmentModal();
    manager.resetForm();
  };

  const handleBackdropClick = () => {
    if (manager.showColorPicker) {
      manager.showColorPicker = false;
    } else {
      close();
    }
  };
</script>

{#if departmentStore.isDepartmentModalOpen}
  <div transition:fade={{ duration: 300 }} class="fixed inset-0 z-100 flex items-center justify-center p-4">    
    <div 
      class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
      role="button"
      tabindex="0"
      onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleBackdropClick()}  
      onclick={handleBackdropClick}
    ></div>

    <div 
      transition:fly={{ y: 20, duration: 400 }} 
      class="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-white"
    >
      <div class="p-8 pb-4 relative">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
              <div class="relative p-3 bg-linear-to-br from-indigo-600 to-violet-700 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <LayoutGrid size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h2 class="text-2xl font-black text-slate-900 tracking-tight leading-none">Departamentos</h2>
              <div class="flex items-center gap-2 mt-2">
                 <span class="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                 <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">Gestión de Estructura</p>
              </div>
            </div>
          </div>
          <button onclick={close} class="group p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-all active:scale-90">
            <X size={20} />
          </button>
        </div>
      </div>

      <div class="px-8 pb-10">
        {#if manager.showForm}
          <div transition:slide={{ duration: 400 }} class="mb-8 space-y-5 bg-indigo-50/50 p-6 rounded-4xl border border-indigo-100/50 backdrop-blur-sm">
            <div class="flex gap-4 items-end">
              <div class="relative">
                <label class="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1 mb-1.5 block" for="color-trigger">Color</label>
                <button 
                  id="color-trigger"
                  type="button"
                  onclick={() => (manager.showColorPicker = !manager.showColorPicker)}
                  style="background-color: {manager.formData.color}"
                  class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-90 hover:brightness-110 relative"
                >
                  <Building2 size={24} />
                  <div class="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm text-slate-400">
                    <Plus size={10} strokeWidth={4} />
                  </div>
                </button>

                {#if manager.showColorPicker}
                  <div 
                    transition:fly={{ y: 10, duration: 200 }}
                    class="absolute top-full left-0 mt-3 p-3 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 grid grid-cols-5 gap-2 w-48"
                  >
                    {#each manager.availableColors as hex}
                      <button
                        type="button"
                        onclick={() => manager.selectColor(hex)}
                        style="background-color: {hex}"
                        class="w-7 h-7 rounded-lg transition-all hover:scale-125 flex items-center justify-center text-white"
                      >
                        {#if manager.formData.color === hex}
                           <span in:fade={{ duration: 150 }}>
                             <Check size={14} strokeWidth={4} />
                           </span>
                        {/if}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>

              <div class="flex-1 group space-y-1.5">
                <label class="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1" for="department-name">Nombre Comercial</label>
                <input id="department-name" bind:value={manager.formData.name} type="text" placeholder="Ej. Estética Premium" class="w-full px-5 py-3.5 bg-white border-0 ring-1 ring-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" />
              </div>
            </div>

            <div class="group space-y-1.5">
              <label class="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1" for="department-description">Descripción</label>
              <textarea id="department-description" bind:value={manager.formData.description} rows="2" placeholder="Detalles del área..." class="w-full px-5 py-3.5 bg-white border-0 ring-1 ring-slate-200 rounded-2xl text-sm font-medium text-slate-600 resize-none outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"></textarea>
            </div>

            <div class="flex gap-3 pt-2">
              <button onclick={() => manager.resetForm()} class="flex-1 py-3.5 text-xs font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Cancelar</button>
              <button onclick={() => manager.save()} disabled={manager.isSaving || !manager.formData.name} class="flex-2 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-slate-200 disabled:bg-slate-300 transition-all">
                {#if manager.isSaving} <Loader2 class="h-4 w-4 animate-spin" /> {/if}
                {manager.formData.id ? 'Guardar Cambios' : 'Registrar Área'}
              </button>
            </div>
          </div>
        {:else}
          <button onclick={() => manager.toggleForm()} class="group w-full mb-8 py-5 bg-white border-2 border-dashed border-slate-200 rounded-4xl text-slate-400 font-bold text-sm flex items-center justify-center gap-3 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all duration-300">
            <div class="p-1.5 bg-slate-100 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <Plus size={20} strokeWidth={3} />
            </div> 
            <span class="tracking-tight text-base font-extrabold">Agregar nueva unidad de negocio</span>
          </button>
        {/if}

        <div class="space-y-4">
          <div class="flex justify-between items-center px-1">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estructura Actual</h3>
            <span class="text-[10px] font-bold py-1 px-3 bg-slate-100 text-slate-500 rounded-full">{departmentStore.departments.length} Áreas</span>
          </div>
          
          <div class="max-h-[320px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {#each departmentStore.departments as dept (dept.id)}
              <div class="group flex items-center justify-between p-4 bg-white ring-1 ring-slate-100 rounded-3xl hover:ring-2 hover:ring-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300" in:fly={{ y: 10, duration: 300 }}>
                <div class="flex items-center gap-4">
                  <div style="background-color: {dept.color}" class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 {dept.color ? 'text-white shadow-lg' : 'text-slate-400 bg-slate-50'} group-hover:rotate-6">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h4 class="text-sm font-black text-slate-800 tracking-tight">{dept.name}</h4>
                    <div class="flex items-center gap-1.5">
                        <Info size={10} class="text-slate-300" />
                        <p class="text-[11px] text-slate-400 font-bold line-clamp-1">{dept.description || 'Sin detalles configurados'}</p>
                    </div>
                  </div>
                </div>
                <div class="flex gap-1">
                  <button onclick={() => manager.startEdit(dept)} class="p-2.5 text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"><Edit3 size={16} /></button>
                  
                  <button 
                    onclick={() => manager.delete(dept.id)} 
                    class="p-2.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
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
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  
  :global(body:has(.fixed)) {
    overflow: hidden;
  }
</style>