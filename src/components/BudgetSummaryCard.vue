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
    tooltip: "Total des revenus déclarés ce mois-ci",
  },
  {
    label: "Charges personnelles",
    value: -store.personalChargesByOwner(props.owner),
    type: "subtract",
    tooltip: "Dépenses personnelles (non partagées)",
  },
  {
    label: "Restant avant charges communes",
    value: store.remainingBeforeCommunal(props.owner),
    type: "subtotal",
    tooltip: "Salaire moins charges personnelles",
  },
  {
    label: `Part charges communes (${store.communalChargesDistribution[props.owner]}%)`,
    value: -store.communalChargesShare(props.owner),
    type: "subtract",
    tooltip: `Part des charges partagées selon la répartition définie (${store.communalChargesDistribution[props.owner]}%)`,
  },
  {
    label: "Restant après charges communes",
    value: store.remainingAfterCommunal(props.owner),
    type: "subtotal",
    tooltip: "Montant disponible après toutes les charges",
  },
  {
    label: `Épargne (${savingRate.value}%)`,
    value: -store.savingPotential(props.owner),
    type: "subtract",
    tooltip: `Montant mis de côté (${savingRate.value}% du restant)`,
  },
  {
    label: "Reste final",
    value: store.remainingAfterSaving(props.owner),
    type: "total",
    tooltip: "Budget disponible pour les dépenses du quotidien",
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
      :class="
        isPrimary
          ? 'bg-gradient-to-r from-primary/20 to-transparent'
          : 'bg-gradient-to-r from-secondary/20 to-transparent'
      "
    >
      <h3 class="text-lg font-bold flex items-center gap-3">
        <div
          class="w-3 h-3 rounded-full"
          :class="
            isPrimary
              ? 'bg-primary shadow-lg shadow-primary/50'
              : 'bg-secondary shadow-lg shadow-secondary/50'
          "
        ></div>
        <span class="text-white">{{ owner }}</span>
      </h3>
    </div>

    <div class="p-6">
      <!-- Étapes du calcul -->
      <div class="flex flex-col gap-2">
        <template v-for="(step, index) in steps" :key="index">
          <!-- Ligne de calcul -->
          <div
            class="tooltip-wrapper w-full flex justify-between items-center py-2.5 px-4 rounded-xl text-sm transition-all duration-200"
            :class="{
              'bg-white/5': step.type === 'subtotal',
              'bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20':
                step.type === 'total' && isPrimary,
              'bg-gradient-to-r from-secondary/20 to-secondary/5 border border-secondary/20':
                step.type === 'total' && !isPrimary,
            }"
            :data-tooltip="step.tooltip"
          >
            <span
              class="flex items-center gap-2 flex-shrink-0"
              :class="{
                'text-red-400/80': step.type === 'subtract',
                'font-medium text-white/90': step.type === 'subtotal',
                'font-bold text-white': step.type === 'total',
                'text-white/70': step.type === 'neutral',
              }"
            >
              <span v-if="step.type === 'subtract'" class="text-red-400 text-xs">−</span>
              <span v-else-if="step.type === 'subtotal'" class="text-white/50">=</span>
              <span
                v-else-if="step.type === 'total'"
                :class="isPrimary ? 'text-primary' : 'text-secondary'"
              >★</span>
              {{ step.label }}
            </span>
            <span
              class="tabular-nums font-mono flex-shrink-0 ml-4"
              :class="{
                'text-red-400/80': step.type === 'subtract',
                'font-medium text-white/90': step.type === 'subtotal',
                'font-bold text-lg': step.type === 'total',
                'text-primary': step.type === 'total' && isPrimary,
                'text-secondary': step.type === 'total' && !isPrimary,
                'text-white/70': step.type === 'neutral',
              }"
            >
              {{ step.type === "subtract" ? formatCurrency(Math.abs(step.value)) : formatCurrency(step.value) }} €
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
      <div class="mt-6 pt-6 border-t border-white/5 space-y-4">
        <div class="flex justify-between items-center">
          <label
            class="text-sm font-medium text-white/70 tooltip-wrapper tooltip-bottom"
            data-tooltip="Pourcentage du restant à mettre de côté chaque mois"
            >Taux d'épargne</label
          >
          <span class="px-3 py-1 rounded-full text-sm font-bold bg-primary/20 text-primary">
            {{ savingRate }}%
          </span>
        </div>

        <!-- Slider -->
        <div class="py-2">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            v-model.number="savingRate"
            class="range range-sm range-primary w-full"
            style="--range-shdw: none"
          />
        </div>

        <!-- Barre visuelle de progression -->
        <div class="relative">
          <div class="flex rounded-full overflow-hidden h-3 bg-white/5">
            <div
              class="bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 ease-out"
              :style="{ width: `${savingRate}%` }"
            ></div>
            <div
              class="bg-white/5 transition-all duration-300 ease-out"
              :style="{ width: `${100 - savingRate}%` }"
            ></div>
          </div>
          <!-- Indicateur -->
          <div
            class="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white/30 rounded-full transition-all duration-300"
            :style="{
              left: `${savingRate}%`,
              transform: 'translateX(-50%) translateY(-50%)',
            }"
          ></div>
        </div>

        <!-- Échelle -->
        <div class="flex justify-between text-xs text-white/30 px-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  </div>
</template>
