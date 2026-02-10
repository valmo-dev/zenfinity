<script setup>
import { TriangleAlert, Trash2 } from "lucide-vue-next";

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
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @keydown="handleKeydown"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/70"
          @click="handleCancel"
        ></div>

        <!-- Modal -->
        <div class="relative w-full max-w-sm bg-base-100 border-3 border-brutal rounded-none overflow-hidden" style="box-shadow: 6px 6px 0px var(--brutal-shadow)" @click.stop>
          <div class="p-6">
            <!-- Icon -->
            <div class="flex justify-center mb-4">
              <div class="w-16 h-16 rounded-none bg-red-500/20 flex items-center justify-center">
                <TriangleAlert :size="32" class="text-red-400" stroke-width="1.5" />
              </div>
            </div>

            <!-- Title -->
            <h3 class="font-bold text-xl text-base-content text-center mb-2">{{ title }}</h3>
            
            <!-- Message -->
            <p class="text-base-content/60 text-center text-sm mb-2">{{ message }}</p>
            
            <!-- Item name -->
            <p v-if="itemName" class="text-center mb-6">
              <span class="inline-block px-3 py-1.5 rounded-none bg-base-content/5 border border-brutal text-base-content font-medium">
                {{ itemName }}
              </span>
            </p>
            <div v-else class="mb-4"></div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button 
                class="flex-1 brutal-btn brutal-btn-ghost"
                @click="handleCancel"
              >
                Annuler
              </button>
              <button 
                class="flex-1 brutal-btn brutal-btn-danger"
                @click="handleConfirm"
              >
                <Trash2 :size="16" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
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
