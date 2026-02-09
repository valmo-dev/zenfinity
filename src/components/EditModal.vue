<script setup>
import { ref, watch } from "vue";
import { useBudgetStore } from "../stores/budget";

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
  <dialog :class="['modal', { 'modal-open': isOpen }]">
    <div class="modal-box glass-card border border-white/10 max-w-md rounded-2xl" @click.stop>
      <!-- Close button -->
      <button
        class="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        @click="emit('close')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <h3 class="font-bold text-xl text-white">Modifier l'entrée</h3>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Type et Owner -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-white/70">Type</label>
            <select 
              v-model="editType" 
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
            >
              <option value="Revenu" class="bg-neutral">Revenu</option>
              <option value="Charge" class="bg-neutral">Charge</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-white/70">Assigné à</label>
            <select 
              v-model="editOwner" 
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
            >
              <option v-for="o in store.owners" :key="o" :value="o" class="bg-neutral">{{ o }}</option>
              <option value="Commun" class="bg-neutral">Commun</option>
            </select>
          </div>
        </div>

        <!-- Catégorie -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-white/70">Catégorie</label>
          <input
            v-model="editCategory"
            type="text"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all"
            :class="errors.category ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-secondary/50 focus:ring-secondary/20'"
          />
          <p v-if="errors.category" class="text-xs text-red-400 mt-1">{{ errors.category }}</p>
        </div>

        <!-- Montant -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-white/70">Montant (EUR)</label>
          <input
            v-model.number="editAmount"
            type="number"
            step="0.01"
            min="0.01"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all"
            :class="errors.amount ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-secondary/50 focus:ring-secondary/20'"
          />
          <p v-if="errors.amount" class="text-xs text-red-400 mt-1">{{ errors.amount }}</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            class="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-medium transition-all"
            @click="emit('close')"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            class="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 font-medium shadow-xl transition-all"
          >
            Sauvegarder
            <div class="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop bg-black/80 backdrop-blur-sm" @click="emit('close')"></div>
  </dialog>
</template>
