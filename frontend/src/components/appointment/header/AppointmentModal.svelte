<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition';
  import {
    CalendarCheck,
    CalendarX,
    X,
    Smartphone,
    User,
    Scissors,
    ChevronDown,
    Loader2,
    Check,
    Save,
  } from 'lucide-svelte';

  // Importamos las instancias de los stores (Singletons)
  import { appointmentForm } from '@/lib/state/appointment-form.svelte';
  import { appointmentStore } from '@/lib/stores/appointment-state.svelte';
  import { serviceStore } from '@/lib/state/service-state.svelte';
  
  // Importamos el nuevo modal de confirmación
  import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.svelte';

  let showServices = $state(false);
  let isInitialized = $state(false);
  let isConfirmDeleteOpen = $state(false); // Control local del modal de confirmación

  // Derivamos si estamos en modo edición (si hay ID, existe en DB)
  const isEditing = $derived(!!appointmentForm.formData.id);

  // Svelte 5 Effect: Asegura que los servicios se carguen al abrir el modal
  $effect(() => {
    if (appointmentStore.isModalOpen) {
      serviceStore.refresh();
    }
  });

  const selectedService = $derived(
    serviceStore.items.find((s) => s.id === appointmentForm.formData.service_id),
  );

  const close = () => {
    appointmentStore.closeModal();
    appointmentForm.resetForm();
    showServices = false;
    isInitialized = false;
    isConfirmDeleteOpen = false;
  };

  async function handleSave() {
    await appointmentForm.save();
    if (appointmentForm.saveSuccess) {
      setTimeout(close, 2000);
    }
  }

  // --- LÓGICA DE ELIMINACIÓN REFINADA ---
  async function handleConfirmDelete() {
    if (!appointmentForm.formData.id) return;
    
    // Usamos el método deleteAppointment del manager que ya gestiona el toast y el refresh
    const success = await appointmentForm.deleteAppointment(Number(appointmentForm.formData.id));
    
    if (success) {
      isConfirmDeleteOpen = false;
      close(); // Cerramos el modal principal
    }
  }

  const handleDateChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    appointmentForm.formData.date = target.value;
    appointmentForm.formData.time = '';
    
    if (appointmentForm.formData.service_id) {
      appointmentForm.fetchAvailableSlots();
    }
  };

  $effect(() => {
    if (appointmentStore.isModalOpen && !isInitialized) {
      appointmentForm.formData.date = appointmentStore.dateForNewAppointment;
      if (appointmentForm.formData.service_id) {
        appointmentForm.fetchAvailableSlots();
      }
      isInitialized = true;
    }
  });
</script>

{#if appointmentStore.isModalOpen}
  <div class="fixed inset-0 z-100 flex items-center justify-center p-4">
    <div
      transition:fade={{ duration: 200 }}
      class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      onclick={close}
      onkeydown={(e) => e.key === 'Escape' && close()}
      role="button"
      tabindex="0"
    ></div>

    <div
      transition:fly={{ y: 30, duration: 400 }}
      class="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col border border-slate-100"
    >
      <header class="px-8 py-6 flex justify-between items-center border-b border-slate-50">
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white"
          >
            <CalendarCheck size={20} />
          </div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">
            {isEditing ? 'Editar Cita' : 'Agendar Cita'}
          </h2>
        </div>

        <div class="flex items-center gap-2">
          {#if isEditing}
            <button
              onclick={() => (isConfirmDeleteOpen = true)}
              class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
              title="Eliminar cita"
            >
              <CalendarX size={20} />
            </button>
          {/if}

          <button
            onclick={close}
            class="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      <main class="p-8 space-y-6">
        <div class="space-y-4">
          <div class="flex flex-col gap-1">
            <label
              for="client_phone"
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
              >Móvil</label
            >
            <div class="relative group">
              <Smartphone
                size={18}
                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              />
              <input
                type="tel"
                bind:value={appointmentForm.formData.client_phone}
                oninput={() => appointmentForm.handlePhoneInput()}
                placeholder="Ej: 600000000"
                class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl font-semibold text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="client_name"
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
              >Nombre del Cliente</label
            >
            <div class="relative group">
              <User
                size={18}
                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              />
              <input
                type="text"
                bind:value={appointmentForm.formData.client_name}
                disabled={!!appointmentForm.formData.client_id}
                placeholder="Nombre completo"
                class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-semibold text-slate-900 outline-none transition-all
                {!!appointmentForm.formData.client_id
                  ? 'opacity-60 bg-slate-100 cursor-not-allowed'
                  : 'focus:border-indigo-500/20 focus:bg-white'}"
              />
            </div>

            {#if appointmentForm.formData.client_id}
              <div transition:slide={{ duration: 300 }} class="flex items-center gap-2 mt-1 ml-1">
                <span class="flex h-2 w-2 relative">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"
                  ></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span
                  class="text-[9px] text-indigo-500 font-black uppercase tracking-tighter animate-pulse"
                >
                  ✨ Cliente reconocido
                </span>
              </div>
            {/if}
          </div>
        </div>

        <div class="space-y-2 relative">
          <label
            for="service_id"
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
            >Servicio</label
          >
          <button
            type="button"
            onclick={() => (showServices = !showServices)}
            class="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border-2 {showServices
              ? 'border-indigo-500/20 bg-white'
              : 'border-transparent'}"
          >
            <div class="flex items-center gap-3">
              <Scissors size={18} class="text-slate-400" />
              <span class="font-bold {selectedService ? 'text-slate-900' : 'text-slate-400'}">
                {selectedService ? selectedService.name : 'Selecciona un servicio'}
              </span>
            </div>
            <ChevronDown
              size={18}
              class="text-slate-400 transition-transform {showServices ? 'rotate-180' : ''}"
            />
          </button>

          {#if showServices}
            <div
              transition:slide={{ duration: 200 }}
              class="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-1 max-h-60 overflow-y-auto custom-scrollbar"
            >
              {#if serviceStore.isLoading}
                <div class="p-6 flex flex-col items-center gap-2">
                  <Loader2 class="animate-spin text-indigo-500" size={24} />
                </div>
              {:else}
                {#each serviceStore.items as s}
                  <button
                    onclick={() => {
                      appointmentForm.formData.service_id = s.id;
                      appointmentForm.formData.duration_minutes = s.duration_minutes || 30;
                      showServices = false;
                      appointmentForm.fetchAvailableSlots();
                    }}
                    class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 transition-colors {appointmentForm
                      .formData.service_id === s.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600'}"
                  >
                    <div class="flex flex-col text-left">
                      <span class="font-bold text-sm">{s.name}</span>
                      <span class="text-[10px] font-medium opacity-60">{s.price}€</span>
                    </div>
                  </button>
                {/each}
              {/if}
            </div>
          {/if}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1">
            <label
              for="date"
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
              >Fecha</label
            >
            <input
              type="date"
              value={appointmentForm.formData.date}
              onchange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              class="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl font-bold text-slate-900 outline-none transition-all"
            />
          </div>

          <div class="space-y-1">
            <label
              for="time"
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
              >Horas Libres</label
            >
            <div class="h-[120px]">
              {#if !appointmentForm.formData.date || !appointmentForm.formData.service_id}
                <div class="h-full flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center p-4">
                  <p class="text-[9px] text-slate-400 font-bold uppercase leading-tight">
                    Selecciona fecha <br /> y servicio
                  </p>
                </div>
              {:else if appointmentForm.isLoadingSlots}
                <div class="h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl">
                  <Loader2 class="animate-spin text-indigo-500" size={24} />
                </div>
              {:else if appointmentForm.slots.length > 0}
                <div class="grid grid-cols-2 gap-2 max-h-full overflow-y-auto pr-2 custom-scrollbar">
                  {#each appointmentForm.slots as slot}
                    {@const st = new Date(slot.start_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                    <button
                      type="button"
                      onclick={() => appointmentForm.selectSlot(slot)}
                      class="py-2.5 rounded-xl text-xs font-bold transition-all border-2 {appointmentForm
                        .formData.time === st
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-500/30 hover:bg-indigo-50'}"
                    >
                      {st}
                    </button>
                  {/each}
                </div>
              {:else}
                <div class="h-full flex items-center justify-center bg-red-50 border-2 border-red-100 rounded-2xl p-4">
                  <span class="text-red-500 text-[10px] font-black uppercase tracking-widest">Sin huecos</span>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <button
          onclick={handleSave}
          disabled={appointmentForm.isSaving ||
            !appointmentForm.formData.service_id ||
            !appointmentForm.formData.client_name ||
            !appointmentForm.formData.time}
          class="w-full py-5 text-white rounded-3xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-lg {appointmentForm.saveSuccess
            ? 'bg-emerald-500 shadow-emerald-100'
            : 'bg-slate-900 hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'}"
        >
          {#if appointmentForm.isSaving}
            <Loader2 class="animate-spin" size={18} />
          {:else if appointmentForm.saveSuccess}
            <Check size={18} /> ¡CITA ACTUALIZADA!
          {:else}
            <Save size={18} /> {isEditing ? 'GUARDAR CAMBIOS' : 'CONFIRMAR TURNO'}
          {/if}
        </button>
      </main>
    </div>
  </div>
{/if}

<ConfirmDeleteModal
  isOpen={isConfirmDeleteOpen}
  title="¿Eliminar esta cita?"
  message="¿Estás seguro de que deseas eliminar la cita de {appointmentForm.formData.client_name}? Esta acción no se puede deshacer."
  isLoading={appointmentForm.isSaving}
  onConfirm={handleConfirmDelete}
  onClose={() => (isConfirmDeleteOpen = false)}
/>

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>