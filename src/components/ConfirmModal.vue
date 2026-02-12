<script setup>
import { ref, toRef, computed } from "vue";
import { TriangleAlert, Trash2, Check } from "lucide-vue-next";
import { useFocusTrap } from "../composables/useFocusTrap";

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
  },
  confirmLabel: {
    type: String,
    default: ""
  },
  variant: {
    type: String,
    default: "danger",
    validator: (v) => ["danger", "warning"].includes(v)
  }
});

const effectiveConfirmLabel = computed(() => props.confirmLabel || (props.variant === "danger" ? "Supprimer" : "Confirmer"));
const showTrashIcon = computed(() => props.variant === "danger" && !props.confirmLabel);

const emit = defineEmits(["confirm", "cancel"]);

const modalRef = ref(null);

useFocusTrap(modalRef, toRef(props, "isOpen"), {
  onEscape: () => handleCancel(),
});

function handleConfirm() {
  emit("confirm");
}

function handleCancel() {
  emit("cancel");
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/70"
          @click="handleCancel"
        ></div>

        <!-- Modal -->
        <div
          ref="modalRef"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          class="terminal-card relative w-full max-w-sm overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-base-content/[0.06]">
            <div class="flex items-center gap-3">
              <span class="inline-block w-2 h-2 rounded-full bg-error"></span>
              <span id="confirm-modal-title" class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/60">{{ title }}</span>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6">
            <!-- Icon -->
            <div class="flex justify-center mb-4">
              <div class="w-14 h-14 rounded-lg bg-error/10 flex items-center justify-center">
                <TriangleAlert :size="28" class="text-error" stroke-width="1.5" />
              </div>
            </div>
            
            <!-- Message -->
            <p class="text-base-content/60 text-center text-sm font-mono mb-2">{{ message }}</p>
            
            <!-- Item name -->
            <p v-if="itemName" class="text-center mb-2">
              <span class="inline-block px-3 py-1.5 bg-base-content/5 border border-base-content/[0.06] rounded text-base-content font-mono tabular-nums text-sm">
                {{ itemName }}
              </span>
            </p>
            <div v-else class="mb-2"></div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-base-content/[0.06] flex gap-3">
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
              <Trash2 v-if="showTrashIcon" :size="16" />
              <Check v-else :size="16" />
              {{ effectiveConfirmLabel }}
            </button>
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

.modal-enter-active .terminal-card,
.modal-leave-active .terminal-card {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .terminal-card,
.modal-leave-to .terminal-card {
  transform: scale(0.95);
  opacity: 0;
}
</style>
