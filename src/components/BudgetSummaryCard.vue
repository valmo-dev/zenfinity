<script setup>
import { computed } from "vue";
import { useBudgetStore } from "../stores/budget";

const props = defineProps({
  owner: {
    type: String,
    required: true,
  },
});

const store = useBudgetStore();

const savingRate = computed({
  get: () => store.savingRates[props.owner] || 0,
  set: (value) => store.setSavingRate(props.owner, value),
});

function formatCurrency(value) {
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const steps = computed(() => [
  {
    label: "Salaire",
    value: store.revenueByOwner(props.owner),
    type: "neutral",
  },
  {
    label: "Charges personnelles",
    value: -store.personalChargesByOwner(props.owner),
    type: "subtract",
  },
  {
    label: "Restant avant charges communes",
    value: store.remainingBeforeCommunal(props.owner),
    type: "subtotal",
  },
  {
    label: `Part charges communes (${store.communalChargesDistribution[props.owner]}%)`,
    value: -store.communalChargesShare(props.owner),
    type: "subtract",
  },
  {
    label: "Restant après charges communes",
    value: store.remainingAfterCommunal(props.owner),
    type: "subtotal",
  },
  {
    label: `Épargne (${savingRate.value}%)`,
    value: -store.savingPotential(props.owner),
    type: "subtract",
  },
  {
    label: "Reste final",
    value: store.remainingAfterSaving(props.owner),
    type: "total",
  },
]);

const ownerIndex = computed(() => store.owners.indexOf(props.owner));
</script>

<template>
  <div class="card bg-base-100 shadow-lg h-full">
    <div class="card-body p-5">
      <h3 class="card-title text-base flex items-center gap-2">
        <div
          class="w-3 h-3 rounded-full"
          :class="{
            'bg-primary': ownerIndex === 0,
            'bg-secondary': ownerIndex === 1,
          }"
        ></div>
        {{ owner }}
      </h3>

      <div class="space-y-2 mt-3">
        <template v-for="(step, index) in steps" :key="index">
          <!-- Ligne de calcul -->
          <div
            class="flex justify-between items-center py-1.5 px-3 rounded text-sm"
            :class="{
              'bg-base-200/50': step.type === 'subtotal',
              'bg-primary/10 font-bold text-primary': step.type === 'total',
              '': step.type === 'neutral' || step.type === 'subtract',
            }"
          >
            <span
              class="flex items-center gap-1.5"
              :class="{
                'text-error/70': step.type === 'subtract',
                'font-semibold': step.type === 'subtotal',
              }"
            >
              <span v-if="step.type === 'subtract'" class="text-error">-</span>
              <span v-else-if="step.type === 'subtotal'">=</span>
              {{ step.label }}
            </span>
            <span
              class="tabular-nums font-mono text-sm"
              :class="{
                'text-error/70': step.type === 'subtract',
                'font-semibold': step.type === 'subtotal',
                'text-lg': step.type === 'total',
              }"
            >
              {{ step.type === 'subtract'
                ? formatCurrency(Math.abs(step.value))
                : formatCurrency(step.value)
              }} EUR
            </span>
          </div>

          <!-- Séparateur avant les sous-totaux -->
          <div
            v-if="step.type === 'subtract' && steps[index + 1]?.type === 'subtotal'"
            class="divider my-0 h-0"
          ></div>
        </template>
      </div>

      <!-- Slider épargne -->
      <div class="mt-4 px-3">
        <div class="flex justify-between items-center mb-1">
          <label class="text-sm font-medium">Taux d'épargne</label>
          <span class="badge badge-sm font-mono"
            :class="{
              'badge-primary': ownerIndex === 0,
              'badge-secondary': ownerIndex === 1,
            }"
          >
            {{ savingRate }}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          v-model.number="savingRate"
          class="range range-sm"
          :class="{
            'range-primary': ownerIndex === 0,
            'range-secondary': ownerIndex === 1,
          }"
        />
        <div class="flex justify-between text-xs text-base-content/40 mt-0.5">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  </div>
</template>
