<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const toasts = ref([]);
let toastId = 0;

// Expose la méthode pour ajouter des toasts via provide/inject ou event bus
function addToast(type, message, duration = 4000) {
  const id = toastId++;
  toasts.value.push({ id, type, message, exiting: false });
  
  setTimeout(() => {
    removeToast(id);
  }, duration);
  
  return id;
}

function removeToast(id) {
  const toast = toasts.value.find(t => t.id === id);
  if (toast) {
    toast.exiting = true;
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    }, 300);
  }
}

// Event listener pour les toasts globaux
function handleToastEvent(event) {
  addToast(event.detail.type, event.detail.message, event.detail.duration);
}

onMounted(() => {
  window.addEventListener("show-toast", handleToastEvent);
});

onUnmounted(() => {
  window.removeEventListener("show-toast", handleToastEvent);
});

// Expose pour usage direct
defineExpose({ addToast, removeToast });
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-notification"
        :class="[
          `toast-${toast.type}`,
          { 'toast-exiting': toast.exiting }
        ]"
        @click="removeToast(toast.id)"
      >
        <!-- Icon -->
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          :class="{
            'bg-green-500/20': toast.type === 'success',
            'bg-red-500/20': toast.type === 'error',
            'bg-blue-500/20': toast.type === 'info',
          }"
        >
          <!-- Success -->
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <!-- Error -->
          <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <!-- Info -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <!-- Message -->
        <p class="text-sm text-white/90 font-medium">{{ toast.message }}</p>
        
        <!-- Close button -->
        <button class="ml-auto w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>
