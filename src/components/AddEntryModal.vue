<script setup>
import { ref, watch } from "vue";
import { useBudgetStore } from "../stores/budget";

const store = useBudgetStore();

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close"]);

const type = ref("Revenu");
const owner = ref("Marine");
const category = ref("");
const amount = ref("");
const errors = ref({});

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      type.value = "Revenu";
      owner.value = "Marine";
      category.value = "";
      amount.value = "";
      errors.value = {};
    }
  }
);

function validate() {
  const errs = {};
  if (!category.value.trim()) {
    errs.category = "La catégorie est requise";
  }
  if (!amount.value || Number(amount.value) <= 0) {
    errs.amount = "Le montant doit être supérieur à 0";
  }
  errors.value = errs;
  return Object.keys(errs).length === 0;
}

function handleSubmit() {
  if (!validate()) return;
  store.addItem({
    type: type.value,
    owner: owner.value,
    category: category.value.trim(),
    amount: Number(amount.value),
  });
  emit("close");
}
</script>

<template>
  <dialog :class="['modal', { 'modal-open': isOpen }]">
    <div class="modal-box bg-base-200 max-w-md" @click.stop>
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
        @click="emit('close')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h3 class="font-bold text-lg mb-6">Ajouter une entrée</h3>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text text-sm font-medium">Type</span>
            </label>
            <select v-model="type" class="select select-bordered select-sm w-full">
              <option value="Revenu">Revenu</option>
              <option value="Charge">Charge</option>
            </select>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text text-sm font-medium">Assigné à</span>
            </label>
            <select v-model="owner" class="select select-bordered select-sm w-full">
              <option v-for="o in store.owners" :key="o" :value="o">{{ o }}</option>
              <option value="Commun">Commun</option>
            </select>
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text text-sm font-medium">Catégorie</span>
          </label>
          <input
            v-model="category"
            type="text"
            placeholder="Ex: Salaire, Loyer, Courses..."
            class="input input-bordered input-sm w-full"
            :class="{ 'input-error': errors.category }"
          />
          <label v-if="errors.category" class="label">
            <span class="label-text-alt text-error">{{ errors.category }}</span>
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text text-sm font-medium">Montant (EUR)</span>
          </label>
          <input
            v-model.number="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            class="input input-bordered input-sm w-full"
            :class="{ 'input-error': errors.amount }"
          />
          <label v-if="errors.amount" class="label">
            <span class="label-text-alt text-error">{{ errors.amount }}</span>
          </label>
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost btn-sm" @click="emit('close')">
            Annuler
          </button>
          <button type="submit" class="btn btn-primary btn-sm">
            Ajouter
          </button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop" @click="emit('close')"></div>
  </dialog>
</template>
