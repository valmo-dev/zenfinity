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
          class="relative w-full max-w-md bg-base-100 border-3 border-brutal rounded-none overflow-hidden"
          style="box-shadow: 6px 6px 0px var(--brutal-shadow)"
          @click.stop
        >
          <!-- Close button -->
          <button
            class="absolute right-4 top-4 brutal-icon-btn z-10"
            @click="emit('close')"
          >
            <X :size="16" class="text-base-content/60" />
          </button>

          <!-- Header -->
          <div class="px-6 py-4 bg-secondary/20 border-b-3 border-brutal">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-none bg-secondary/20 flex items-center justify-center">
                <Pencil :size="20" class="text-secondary" />
              </div>
              <h3 class="font-bold text-xl text-base-content">Modifier l'entrée</h3>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6">
            <form @submit.prevent="handleSubmit" class="space-y-5">
              <!-- Type et Owner -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-base-content/70">Type</label>
                  <select 
                    v-model="editType" 
                    class="w-full px-4 py-3 rounded-none bg-base-content/5 border border-brutal text-base-content focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                  >
                    <option value="Revenu" class="bg-base-100">Revenu</option>
                    <option value="Charge" class="bg-base-100">Charge</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-base-content/70">Assigné à</label>
                  <select 
                    v-model="editOwner" 
                    class="w-full px-4 py-3 rounded-none bg-base-content/5 border border-brutal text-base-content focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                  >
                    <option v-for="o in store.owners" :key="o" :value="o" class="bg-base-100">{{ o }}</option>
                    <option value="Commun" class="bg-base-100">Commun</option>
                  </select>
                </div>
              </div>

              <!-- Catégorie -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-base-content/70">Catégorie</label>
                <CategoryAutocomplete
                  v-model="editCategory"
                  :type="editType"
                  :has-error="!!errors.category"
                  focus-color="secondary"
                />
                <p v-if="errors.category" class="text-xs text-red-400 mt-1">{{ errors.category }}</p>
              </div>

              <!-- Montant -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-base-content/70">Montant (EUR)</label>
                <input
                  v-model.number="editAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="w-full px-4 py-3 rounded-none bg-base-content/5 border text-base-content placeholder-base-content/30 focus:outline-none focus:ring-2 transition-all"
                  :class="errors.amount ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-brutal focus:border-secondary/50 focus:ring-secondary/20'"
                />
                <p v-if="errors.amount" class="text-xs text-red-400 mt-1">{{ errors.amount }}</p>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  class="brutal-btn brutal-btn-ghost"
                  @click="emit('close')"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  class="brutal-btn brutal-btn-primary"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
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
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
