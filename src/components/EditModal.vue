<script setup>
import { ref, watch } from "vue";
import { useBudgetStore } from "../stores/budget";
import { X, Pencil } from "lucide-vue-next";
import CategoryAutocomplete from "./CategoryAutocomplete.vue";

const store = useBudgetStore();

const props = defineProps({
  isOpen: Boolean,
  item: Object,
});

const emit = defineEmits(["close"]);

const editType = ref("");
const editOwner = ref("");
const editCategory = ref("");
const editAmount = ref(0);
const errors = ref({});

watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      editType.value = newItem.type;
      editOwner.value = newItem.owner;
      editCategory.value = newItem.category;
      editAmount.value = newItem.amount;
      errors.value = {};
    }
  }
);

function validate() {
  const errs = {};
  if (!editCategory.value.trim()) {
    errs.category = "La catégorie est requise";
  }
  if (!editAmount.value || Number(editAmount.value) <= 0) {
    errs.amount = "Le montant doit être supérieur à 0";
  }
  errors.value = errs;
  return Object.keys(errs).length === 0;
}

function handleSubmit() {
  if (!validate()) return;
  store.editItem(props.item.id, {
    type: editType.value,
    owner: editOwner.value,
    category: editCategory.value.trim(),
    amount: Number(editAmount.value),
  });
  emit("close");
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
          @click="emit('close')"
        ></div>

        <!-- Modal -->
        <div
          class="terminal-card relative w-full max-w-md overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-base-content/[0.06]">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                <span class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/50">Modifier l'entrée</span>
              </div>
              <button
                class="brutal-icon-btn"
                @click="emit('close')"
              >
                <X :size="16" class="text-base-content/60" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6">
            <form @submit.prevent="handleSubmit" class="space-y-5">
              <!-- Type et Owner -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/50">Type</label>
                  <select 
                    v-model="editType" 
                    class="w-full px-4 py-3 bg-base-content/5 border border-base-content/[0.06] rounded text-base-content focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                  >
                    <option value="Revenu" class="bg-base-100">Revenu</option>
                    <option value="Charge" class="bg-base-100">Charge</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/50">Assigné à</label>
                  <select 
                    v-model="editOwner" 
                    class="w-full px-4 py-3 bg-base-content/5 border border-base-content/[0.06] rounded text-base-content focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                  >
                    <option v-for="o in store.owners" :key="o" :value="o" class="bg-base-100">{{ o }}</option>
                    <option value="Commun" class="bg-base-100">Commun</option>
                  </select>
                </div>
              </div>

              <!-- Catégorie -->
              <div class="space-y-2">
                <label class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/50">Catégorie</label>
                <CategoryAutocomplete
                  v-model="editCategory"
                  :type="editType"
                  :has-error="!!errors.category"
                  focus-color="secondary"
                />
                <p v-if="errors.category" class="text-xs font-mono text-[#BF616A] mt-1">{{ errors.category }}</p>
              </div>

              <!-- Montant -->
              <div class="space-y-2">
                <label class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/50">Montant (EUR)</label>
                <input
                  v-model.number="editAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="w-full px-4 py-3 bg-base-content/5 border rounded font-mono tabular-nums text-base-content placeholder-base-content/30 focus:outline-none focus:ring-2 transition-all"
                  :class="errors.amount ? 'border-[#BF616A]/50 focus:border-[#BF616A] focus:ring-[#BF616A]/20' : 'border-base-content/[0.06] focus:border-secondary/50 focus:ring-secondary/20'"
                />
                <p v-if="errors.amount" class="text-xs font-mono text-[#BF616A] mt-1">{{ errors.amount }}</p>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-base-content/[0.06] flex justify-end gap-3">
            <button 
              type="button" 
              class="brutal-btn brutal-btn-ghost"
              @click="emit('close')"
            >
              Annuler
            </button>
            <button 
              type="button" 
              class="brutal-btn brutal-btn-primary"
              @click="handleSubmit"
            >
              Sauvegarder
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
