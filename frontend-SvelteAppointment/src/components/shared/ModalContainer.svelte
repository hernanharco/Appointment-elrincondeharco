<script lang="ts">
  import DepartmentModal from '@/components/appointment/header/DepartmentModal.svelte';
  // En el futuro importarás otros aquí:
  import CollaboratorModal from '@/components/appointment/header/CollaboratorModal.svelte';  
  import ServiceModal from '@/components/appointment/header/ServiceModal.svelte';
  import ClientModal from '@/components/appointment/header/ClientModal.svelte';
  import AppointmentModal from '@/components/appointment/header/AppointmentModal.svelte';
  import ConfirmationModal from '@/components/shared/ConfirmationModal.svelte';
</script>

<DepartmentModal />
<CollaboratorModal />
<ServiceModal />
<ClientModal />
<AppointmentModal />
<ConfirmationModal />
