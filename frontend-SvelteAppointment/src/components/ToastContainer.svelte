<script lang="ts">
  // Corregimos el import: 
  // Si lo pusiste en src/lib/stores/toast.ts usa:
  import { toasts } from '@/lib/stores/toast'; 
  
  import { CheckCircle, AlertCircle } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
</script>

<div class="fixed bottom-5 right-5 z-100 flex flex-col gap-2 w-full max-w-xs pointer-events-none">
  {#each $toasts as toast (toast.id)}
    <div
      in:fly={{ y: 20, duration: 300 }}
      out:fade
      class="pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border text-white font-medium 
        {toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : ''}
        {toast.type === 'error' ? 'bg-red-600 border-red-500' : ''}"
    >
      {#if toast.type === 'success'}<CheckCircle class="h-5 w-5" />{/if}
      {#if toast.type === 'error'}<AlertCircle class="h-5 w-5" />{/if}
      
      <span class="flex-1 text-sm">{toast.message}</span>
    </div>
  {/each}
</div>