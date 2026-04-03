/**
 * service-form.svelte.ts
 * Responsabilidad: Gestionar el estado del formulario de creación/edición de servicios.
 */
import { confirmationStore } from '@/components/shared/state/confirmation-state.svelte';
import { servicesApi } from '@/lib/api/services';
import { toastStore } from './toast-state.svelte';

export class ServiceFormManager {
  showForm = $state(false);
  isSaving = $state(false);
  
  formData = $state({
    id: null as number | null,
    name: '',
    duration_minutes: 30,
    price: 0,
    department_id: null as number | null
  });

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.reset();
  }

  startEdit(service: any) {
    this.formData = { ...service };
    this.showForm = true;
  }

  reset() {
    this.formData = { 
      id: null, 
      name: '', 
      duration_minutes: 30, 
      price: 0, 
      department_id: null 
    };
    this.showForm = false;
    this.isSaving = false;
  }

  /**
   * Guarda o actualiza un servicio y notifica al usuario.
   */
  async save(onSuccess: () => void) {
    // Validación básica antes de intentar guardar
    if (!this.formData.name.trim()) {
      toastStore.show("El nombre del servicio es obligatorio", "info");
      return;
    }
    
    if (!this.formData.department_id) {
      toastStore.show("Debes asignar el servicio a un área", "info");
      return;
    }

    this.isSaving = true;
    try {
      if (this.formData.id) {
        // Modo Edición
        await servicesApi.updateService(this.formData.id, this.formData);
        toastStore.show("Servicio actualizado correctamente", "success");
      } else {
        // Modo Creación
        await servicesApi.createService(this.formData);
        toastStore.show("Nuevo servicio añadido al catálogo", "success");
      }
      
      onSuccess(); // Refresca el listado global
      this.reset();
    } catch (error) {
      console.error("Error al guardar:", error);
      toastStore.show("Hubo un error al procesar el servicio", "error");
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Ejecuta el borrado con confirmación premium.
   */
  async delete(id: number, onSuccess: () => void) {
    confirmationStore.show({
      title: '¿Eliminar Servicio?',
      message: 'Esta acción quitará el servicio del catálogo. Las citas existentes no se borrarán, pero no se podrán agendar nuevas.',
      onConfirm: async () => {
        try {
          await servicesApi.deleteService(id);
          toastStore.show("Servicio eliminado del catálogo", "success");
          onSuccess();
        } catch (error) {
          console.error("Error al eliminar:", error);
          toastStore.show("No se pudo completar la eliminación", "error");
        }
      }
    });
  }
}