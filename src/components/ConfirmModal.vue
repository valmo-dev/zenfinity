<script setup>
const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: "Confirmer la suppression"
  },
  message: {
    type: String,
    default: "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
  },
  itemName: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["confirm", "cancel"]);

function handleConfirm() {
  emit("confirm");
}

function handleCancel() {
  emit("cancel");
}

// Fermer avec Escape
function handleKeydown(e) {
  if (e.key === "Escape") {
    handleCancel();
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <dialog 
        v-if="isOpen"
        class="modal modal-open"
        @keydown="handleKeydown"
      >
        <div class="modal-box glass-card border border-white/10 max-w-sm rounded-2xl" @click.stop>
          <!-- Icon -->
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <!-- Title -->
          <h3 class="font-bold text-xl text-white text-center mb-2">{{ title }}</h3>
          
          <!-- Message -->
          <p class="text-white/60 text-center text-sm mb-2">{{ message }}</p>
          
          <!-- Item name -->
          <p v-if="itemName" class="text-center mb-6">
            <span class="inline-block px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium">
              {{ itemName }}
            </span>
          </p>
          <div v-else class="mb-4"></div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button 
              class="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-medium transition-all"
              @click="handleCancel"
            >
              Annuler
            </button>
            <button 
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg shadow-red-500/25 transition-all"
              @click="handleConfirm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </button>
          </div>
        </div>
        <div class="modal-backdrop bg-black/80 backdrop-blur-sm" @click="handleCancel"></div>
      </dialog>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.95);
  opacity: 0;
}
</style>
