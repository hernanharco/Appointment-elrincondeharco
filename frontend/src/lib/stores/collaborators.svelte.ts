// src/lib/stores/collaborators.svelte.ts
import { collaboratorsApi } from '@/lib/api/collaborators';
import { addToast } from './toast';

class CollaboratorsStore {
  // 📊 Estados Privados (Encapsulamiento)
  #list = $state<any[]>([]);
  #isLoading = $state(false);
  
  // 🚩 Estados de UI y Navegación (SRP aplicado) [cite: 2026-02-18]
  #isOpen = $state(false);
  #currentView = $state<'list' | 'schedule'>('list');
  #selectedId = $state<number | string | null>(null);

  // 🔓 Getters Públicos
  get list() { return this.#list; }
  get isLoading() { return this.#isLoading; }
  get isOpen() { return this.#isOpen; }
  get currentView() { return this.#currentView; }
  get selectedId() { return this.#selectedId; }

  // 🛠️ ACCIONES DE NAVEGACIÓN [cite: 2026-02-18]
  
  open() {
    this.#isOpen = true;
    this.#currentView = 'list';
  }

  close() {
    this.#isOpen = false;
    // Timeout para limpiar la vista solo cuando la animación de cierre termine
    setTimeout(() => {
      this.#currentView = 'list';
      this.#selectedId = null;
    }, 300);
  }

  openSchedule(id: string | number) {
    this.#selectedId = id;
    this.#currentView = 'schedule';
  }

  backToList() {
    this.#currentView = 'list';
    this.#selectedId = null;
  }

  // 📡 ACCIONES DE API (Las que ya tenías)
  
  async load() {
    this.#isLoading = true;
    try {
      this.#list = await collaboratorsApi.getCollaborators();
    } catch (e) {
      addToast('Error al cargar colaboradores', 'error');
    } finally {
      this.#isLoading = false;
    }
  }

  async create(newColab: any) {
    try {
      await collaboratorsApi.createCollaborator(newColab);
      await this.load();
      addToast('Colaborador añadido con éxito', 'success');
      return true;
    } catch (e) {
      addToast('Error al guardar el colaborador', 'error');
      return false;
    }
  }

  async update(id: string | number, updatedColab: any) {
    try {
      await collaboratorsApi.updateCollaborator(id, updatedColab);
      await this.load();
      addToast('Información actualizada', 'success');
      return true;
    } catch (e) {
      addToast('Error al actualizar colaborador', 'error');
      return false;
    }
  }

  async delete(id: string | number) {
    if (!confirm('¿Estás seguro de eliminar a este colaborador?')) return;
    try {
      await collaboratorsApi.deleteCollaborator(id);
      await this.load();
      addToast('Colaborador eliminado', 'success');
    } catch (e) {
      addToast('No se pudo eliminar el colaborador', 'error');
    }
  }
}

export const collaboratorsStore = new CollaboratorsStore();