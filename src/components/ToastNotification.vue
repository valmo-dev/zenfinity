<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Check, X, Info } from "lucide-vue-next";

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
          class="w-8 h-8 flex items-center justify-center flex-shrink-0"
          :class="{
            'bg-[#A3BE8C]/15': toast.type === 'success',
            'bg-[#BF616A]/15': toast.type === 'error',
            'bg-[#81A1C1]/15': toast.type === 'info',
          }"
        >
          <Check v-if="toast.type === 'success'" :size="16" class="text-[#A3BE8C]" />
          <X v-else-if="toast.type === 'error'" :size="16" class="text-[#BF616A]" />
          <Info v-else :size="16" class="text-[#81A1C1]" />
        </div>
        
        <!-- Message -->
        <p class="text-sm text-base-content/90 font-medium">{{ toast.message }}</p>
        
        <!-- Close button -->
        <button class="ml-auto w-6 h-6 hover:bg-base-content/10 flex items-center justify-center transition-colors">
          <X :size="14" class="text-base-content/50" />
        </button>
      </div>
    </div>
  </Teleport>
</template>
