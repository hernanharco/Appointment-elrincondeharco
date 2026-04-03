import { collaboratorStore } from './collaborator-state.svelte';
import { collaboratorsApi, type Collaborator } from '@/lib/api/collaborators';
import { toastStore } from './toast-state.svelte';
import { confirmationStore } from '@/components/shared/state/confirmation-state.svelte';

export class CollaboratorFormManager {
  showForm = $state(false);
  isSaving = $state(false);

  formData = $state<Collaborator>({
    id: null,
    name: '',
    email: '',
    is_active: true,
    department_ids: []
  });

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.reset();
  }

  reset() {
    this.formData = { id: null, name: '', email: '', is_active: true, department_ids: [] };
    this.showForm = false;
  }

  toggleDepartment(deptId: number) {
    const idToToggle = Number(deptId);
    const current = this.formData.department_ids;

    if (current.includes(idToToggle)) {
      this.formData.department_ids = current.filter(id => id !== idToToggle);
    } else {
      this.formData.department_ids = [...current, idToToggle];
    }
  }

  // Con esta funcion podemos encontrar el problema de los IDs de los departamentos
  // ya que el backend devuelve los departamentos como un array de objetos con id y name
  // pero el frontend espera un array de números

  startEdit(collaborator: any) {
    //console.log("LOG 1 - Datos brutos:", collaborator);

    // Intentamos sacar los IDs de 'department_ids' o de 'departments'
    // Si viene de 'departments', extraemos el ID de cada objeto
    const rawData = collaborator.department_ids || collaborator.departments || [];

    const cleanIds = rawData.map((item: any) => {
      if (typeof item === 'object' && item !== null) {
        return Number(item.id); // Si es un objeto {id: 1, name: '...'}
      }
      return Number(item); // Si ya es un número o string '1'
    });

    //console.log("LOG 2 - IDs detectados y limpiados:", cleanIds);

    this.formData = {
      ...collaborator,
      department_ids: cleanIds
    };

    this.showForm = true;
  }

  async save() {
    if (!this.formData.name || !this.formData.email) {
      toastStore.show("Nombre y email son obligatorios", "error");
      return;
    }

    this.isSaving = true;
    try {
      if (this.formData.id) {
        await collaboratorsApi.updateCollaborator(this.formData.id, this.formData);
        toastStore.show("Colaborador actualizado con éxito");
      } else {
        await collaboratorsApi.createCollaborator(this.formData);
        toastStore.show("Nuevo miembro añadido al equipo");
      }

      await collaboratorStore.refresh();
      this.reset();
    } catch (error) {
      console.error("Error al guardar:", error);
      toastStore.show("Hubo un error al guardar los datos", "error");
    } finally {
      this.isSaving = false;
    }
  }

  async delete(id: number | null) {
    if (!id) return;

    // Usamos la confirmación Premium
    confirmationStore.show({
      title: '¿Eliminar del Equipo?',
      message: 'Este colaborador perderá el acceso al sistema. Las citas agendadas con él permanecerán, pero no podrá recibir nuevas.',
      onConfirm: async () => {
        try {
          await collaboratorsApi.deleteCollaborator(id);
          toastStore.show("Colaborador eliminado del equipo", "info");
          await collaboratorStore.refresh();
        } catch (error) {
          console.error("Error al eliminar:", error);
          toastStore.show("No se pudo eliminar el colaborador", "error");
        }
      }
    });
  }
}