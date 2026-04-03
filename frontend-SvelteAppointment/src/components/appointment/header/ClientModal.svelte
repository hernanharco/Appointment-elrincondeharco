<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition';
  import { 
    UserPlus, X, Search, Users, ArrowLeft, Save, 
    Loader2, Notebook, Bot, Smartphone, Mail, Check, Heart
  } from 'lucide-svelte';
  
  import { ClientFormManager } from '@/lib/state/client-form.svelte';  
  import { clientStore } from '@/lib/state/client-state.svelte';
  import { collaboratorStore } from '@/lib/state/collaborator-state.svelte'; 
  import type { Client } from '@/types/clients';

  const form = new ClientFormManager();
  let currentView = $state<'list' | 'form'>('list');
  let searchQuery = $state("");

  $effect(() => {
    if (clientStore.isModalOpen) {
      clientStore.fetchClients();
      collaboratorStore.refresh(); 
    }
  });

  const filteredClients = $derived(
    (clientStore.items || []).filter(c => {
      if (!searchQuery.trim()) return true;
      const search = searchQuery.toLowerCase();
      return c.full_name?.toLowerCase().includes(search) || 
             c.phone?.includes(search);
    })
  );

  function openEdit(client: Client) {
    if (!client) return;
    form.formData.id = client.id;
    form.formData.full_name = client.full_name || '';
    form.formData.phone = client.phone || '';
    form.formData.email = client.email || '';
    form.formData.notes = client.notes || ''; 
    // ✅ Leemos del nuevo "cajón" profile
    form.formData.preferred_collaborator_ids = client.metadata_json?.profile?.preferred_collaborator_ids || [];
    currentView = 'form';
  }

  function goBack() {
    currentView = 'list';
    form.resetForm();
  }

  const close = () => {
    currentView = 'list';
    searchQuery = "";
    form.closeAndReset(() => clientStore.closeModal());
  };
</script>

{#if clientStore.isModalOpen}
  <div transition:fade={{ duration: 100 }} class="fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-sm">    
    <div class="fixed inset-0 bg-slate-900/60" 
      onclick={close} 
      onkeydown={(e) => e.key === 'Escape' && close()} 
      role="button" 
      tabindex="0"
      aria-label="Cerrar modal">
    </div>

    <div 
      transition:fly={{ y: 20, duration: 300 }} 
      class="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh] border border-slate-200"
    >
      
      <header class="px-8 py-6 flex justify-between items-center border-b border-slate-100">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
            {#if currentView === 'list'} <Users size={24} /> {:else} <UserPlus size={24} /> {/if}
          </div>
          <div>
            <h2 class="text-xl font-extrabold text-slate-800 leading-none">
              {currentView === 'list' ? 'Directorio' : (form.formData.id ? 'Ficha Cliente' : 'Nuevo Cliente')}
            </h2>
            <p class="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1.5">SaaS Local</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          {#if currentView === 'list'}
            <button onclick={() => { form.resetForm(); currentView = 'form'; }} class="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md active:scale-95">
              <UserPlus size={16} /> NUEVO
            </button>
          {:else}
            <button onclick={goBack} class="text-slate-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-2">
              <ArrowLeft size={16} /> VOLVER
            </button>
          {/if}
          <button onclick={close} class="p-2 text-slate-300 hover:text-rose-500 transition-colors"> <X size={24} /> </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
        {#if currentView === 'list'}
          <div class="p-8 space-y-5" in:fade={{ duration: 150 }}>
            <div class="relative group">
              <Search size={18} class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input bind:value={searchQuery} placeholder="Buscar por nombre o teléfono..." class="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm" />
            </div>

            <div class="grid gap-3">
              {#if clientStore.isLoading}
                <div class="py-12 flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 class="animate-spin" size={32} />
                  <span class="text-xs font-bold">Cargando clientes...</span>
                </div>
              {:else}
                {#each filteredClients as client (client.id!)}
                  <button onclick={() => openEdit(client)} class="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:border-blue-400 group transition-all shadow-sm active:scale-[0.99]">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors text-lg">
                        {client.full_name ? client.full_name[0]?.toUpperCase() : '?'}
                      </div>
                      <div class="text-left">
                        <div class="flex items-center gap-2">
                          <p class="text-sm font-extrabold text-slate-800">{client.full_name || 'Sin Nombre'}</p>
                          {#if client.source === 'ia'}
                             <div class="flex items-center gap-1 bg-indigo-50 px-1.5 py-0.5 rounded-lg border border-indigo-100 text-indigo-600" title="Creado por IA">
                               <Bot size={12} />
                               <span class="text-[8px] font-black">AI</span>
                             </div>
                          {/if}
                        </div>
                        <p class="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                          <Smartphone size={10} /> +34 {client.phone}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      {#if client.metadata_json?.profile?.preferred_collaborator_ids?.length > 0}
                        <div class="flex -space-x-2">
                          {#each client.metadata_json.profile.preferred_collaborator_ids.slice(0, 3) as favId}
                            {@const col = (collaboratorStore.list || []).find(c => Number(c.id) === Number(favId))}
                            <div class="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-blue-600" title={col?.name || '...'}>
                              {col?.name ? col.name[0]!.toUpperCase() : '?'}
                            </div>
                          {/each}
                        </div>
                      {/if}
                      {#if client.notes}
                        <div class="bg-slate-50 p-2 rounded-lg text-slate-300 group-hover:text-blue-400 transition-colors">
                          <Notebook size={16} />
                        </div>
                      {/if}
                    </div>
                  </button>
                {:else}
                  <div class="py-12 text-center text-slate-400 font-medium text-sm">No se encontraron clientes</div>
                {/each}
              {/if}
            </div>
          </div>
        {:else}
          <div class="p-8 space-y-7" in:slide={{ duration: 250 }}>
            <div class="grid gap-6">
              
              <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1" for="phone">Teléfono Móvil</label>
                <div class="relative">
                  <span class="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">+34</span>
                  <input id="phone" bind:value={form.formData.phone} oninput={(e) => form.handlePhoneInput(e.currentTarget.value)} class="w-full pl-16 pr-5 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-700 outline-none" />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1" for="name">Nombre Completo</label>
                <input id="name" bind:value={form.formData.full_name} class="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none" />
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between ml-1">
                   <span class="text-[11px] font-black text-slate-500 uppercase tracking-widest">Favoritos</span>
                   <Heart size={14} class={form.formData.preferred_collaborator_ids.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-300'} />
                </div>
                <div class="flex flex-wrap gap-2">
                  {#each (collaboratorStore.list || []) as staff}
                    <button
                      type="button"
                      onclick={() => staff.id && form.toggleCollaborator(staff.id)}
                      class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border-2 flex items-center gap-2
                      {form.formData.preferred_collaborator_ids.includes(Number(staff.id)) 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-slate-600'}"
                    >
                      <div class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-black">
                         {staff?.name ? staff.name[0]!.toUpperCase() : '?'}
                      </div>
                      {staff?.name || '...'}
                    </button>
                  {/each}
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1" for="email">Email</label>
                <div class="relative">
                  <Mail size={16} class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="email" type="email" bind:value={form.formData.email} class="w-full pl-12 pr-5 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none" />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1" for="notes">Notas</label>
                <textarea id="notes" bind:value={form.formData.notes} rows="3" class="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium text-slate-600 outline-none resize-none"></textarea>
              </div>
            </div>

            <button onclick={() => form.save()} disabled={form.isSaving || !form.formData.full_name} class="w-full py-5 text-white rounded-3xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 {form.saveSuccess ? 'bg-green-600 shadow-green-200' : 'bg-slate-900 hover:bg-blue-600'}">
              {#if form.isSaving} <Loader2 class="animate-spin" size={20} /> {:else if form.saveSuccess} <Check size={20} /> ¡LISTO! {:else} <Save size={20} /> {form.formData.id ? 'ACTUALIZAR' : 'REGISTRAR'} {/if}
            </button>
          </div>
        {/if}
      </main>
    </div>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 5px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
</style>