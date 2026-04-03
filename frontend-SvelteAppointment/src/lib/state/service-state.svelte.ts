/**
 * service-state.svelte.ts
 * Responsabilidad: Estado de la lista de servicios y visibilidad del modal.
 */
import { servicesApi } from '@/lib/api/services';

class ServiceStore {
  // Estado de UI
  #isOpen = $state(false);
  
  // Estado de Datos
  #items = $state<any[]>([]);
  #isLoading = $state(false);
  #isLoaded = false;

  // Getters para que los componentes lean el estado
  get isOpen() { return this.#isOpen; }
  get items() { return this.#items; }
  get isLoading() { return this.#isLoading; }

  // --- MÉTODOS DE ACCIÓN ---

  /**
   * Abre el modal y dispara la carga de datos
   */
  async open() {
    this.#isOpen = true;
    await this.refresh();
  }

  /**
   * Cierra el modal
   */
  close() {
    this.#isOpen = false;
  }

  /**
   * Refresca los datos desde el backend
   */
  async refresh(force = false) {
    if (this.#isLoading) return;
    if (this.#isLoaded && !force) return;

    this.#isLoading = true;
    try {
      const data = await servicesApi.getServices();
      this.#items = data;
      this.#isLoaded = true;
    } catch (error) {
      console.error("❌ Error ServiceStore:", error);
    } finally {
      this.#isLoading = false;
    }
  }
}

// Exportamos la instancia única
export const serviceStore = new ServiceStore();