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
const isPrimary = computed(() => ownerIndex.value === 0);
</script>

<template>
  <div class="glass-card rounded-2xl overflow-hidden h-full">
    <!-- Header avec gradient -->
    <div 
      class="px-6 py-4 border-b border-white/5"
      :class="isPrimary ? 'bg-gradient-to-r from-primary/20 to-transparent' : 'bg-gradient-to-r from-secondary/20 to-transparent'"
    >
      <h3 class="text-lg font-bold flex items-center gap-3">
        <div
          class="w-3 h-3 rounded-full"
          :class="isPrimary ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-secondary shadow-lg shadow-secondary/50'"
        ></div>
        <span class="text-white">{{ owner }}</span>
      </h3>
    </div>

    <div class="p-6 space-y-4">
      <!-- Étapes du calcul -->
      <div class="space-y-2">
        <template v-for="(step, index) in steps" :key="index">
          <!-- Ligne de calcul -->
          <div
            class="flex justify-between items-center py-2.5 px-4 rounded-xl text-sm transition-all duration-200"
            :class="{
              'bg-white/5': step.type === 'subtotal',
              'bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20': step.type === 'total',
            }"
          >
            <span
              class="flex items-center gap-2"
              :class="{
                'text-red-400/80': step.type === 'subtract',
                'font-medium text-white/90': step.type === 'subtotal',
                'font-bold text-white': step.type === 'total',
                'text-white/70': step.type === 'neutral',
              }"
            >
              <span v-if="step.type === 'subtract'" class="text-red-400 text-xs">−</span>
              <span v-else-if="step.type === 'subtotal'" class="text-white/50">=</span>
              <span v-else-if="step.type === 'total'" class="text-primary">★</span>
              {{ step.label }}
            </span>
            <span
              class="tabular-nums font-mono"
              :class="{
                'text-red-400/80': step.type === 'subtract',
                'font-medium text-white/90': step.type === 'subtotal',
                'font-bold text-lg text-primary': step.type === 'total',
                'text-white/70': step.type === 'neutral',
              }"
            >
              {{ step.type === 'subtract'
                ? formatCurrency(Math.abs(step.value))
                : formatCurrency(step.value)
              }} €
            </span>
          </div>

          <!-- Séparateur avant les sous-totaux -->
          <div
            v-if="step.type === 'subtract' && steps[index + 1]?.type === 'subtotal'"
            class="border-t border-white/5 my-1"
          ></div>
        </template>
      </div>

      <!-- Slider épargne -->
      <div class="mt-6 pt-4 border-t border-white/5">
        <div class="flex justify-between items-center mb-3">
          <label class="text-sm font-medium text-white/70">Taux d'épargne</label>
          <span 
            class="px-3 py-1 rounded-full text-sm font-bold"
            :class="isPrimary ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'"
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
          class="range range-sm w-full"
          :class="isPrimary ? 'range-primary' : 'range-secondary'"
        />
        <div class="flex justify-between text-xs text-white/30 mt-2 px-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  </div>
</template>
