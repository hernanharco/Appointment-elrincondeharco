/**
 * collaborator-state.svelte.ts
 * Responsabilidad: Gestionar el estado global del equipo y la navegación interna del modal.
 * Stack: Svelte 5 (Runes) + Astro. [cite: 2026-02-21]
 */
import { collaboratorsApi, type Collaborator } from '@/lib/api/collaborators';
import { departmentStore } from '@/lib/state/department-state.svelte';

export class CollaboratorStore {
  // --- Estados Reactivos ---
  isOpen = $state(false);
  isLoading = $state(false);
  list = $state<Collaborator[]>([]);
  
  // 🎯 Control de Navegación Premium: 'list' (equipo) o 'schedule' (horarios)
  view = $state<'list' | 'schedule'>('list');
  
  // 🎯 Referencia al colaborador seleccionado para configuración
  selectedId = $state<number | null>(null);

  // --- Propiedades Derivadas ($derived) ---
  // Se actualiza automáticamente cuando cambia selectedId o la lista [cite: 2026-02-21]
  selectedCollaborator = $derived(
    this.list.find(c => Number(c.id) === Number(this.selectedId)) || null
  );

  /**
   * Abre el modal y sincroniza datos de Colaboradores y Departamentos. [cite: 2026-02-21]
   */
  async open() {
    this.isOpen = true;
    this.view = 'list'; 
    this.selectedId = null;
    
    try {
      // Sincronización paralela para optimizar la carga inicial [cite: 2026-02-21]
      await Promise.all([
        this.refresh(),
        departmentStore.refresh() // Asegúrate de que departmentStore tenga el método refresh
      ]);
    } catch (error) {
      console.error("❌ Error de sincronización de equipo:", error);
    }
  }

  /**
   * Navega a la configuración de horarios de un miembro específico.
   */
  openSchedule(id: number) {
    this.selectedId = id;
    this.view = 'schedule';
  }

  /**
   * Regresa a la vista de lista manteniendo el modal abierto.
   */
  goBack() {
    this.view = 'list';
    // No reseteamos selectedId de inmediato para evitar parpadeos en transiciones
  }

  /**
   * Cierra el modal y limpia el estado de navegación.
   */
  close() {
    this.isOpen = false;
    setTimeout(() => {
        this.view = 'list';
        this.selectedId = null;
    }, 300); // Espera a que termine la animación de cierre
  }

  /**
   * Refresca la lista de colaboradores desde la API (Neon PostgreSQL). [cite: 2026-02-21]
   */
  async refresh() {
    this.isLoading = true;
    try {
      this.list = await collaboratorsApi.getCollaborators();
    } catch (error) {
      console.error("❌ Error al cargar colaboradores:", error);
    } finally {
      this.isLoading = false;
    }
  }
}

// Exportamos la instancia única (Singleton) para mantener la reactividad en toda la app [cite: 2026-02-16]
export const collaboratorStore = new CollaboratorStore();