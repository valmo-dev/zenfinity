<script setup>
import { computed } from "vue";
import { useBudgetStore } from "../stores/budget";

const props = defineProps({
  owner: {
    type: String,
    required: false,
    default: "",
  },
});

const store = useBudgetStore();

const isJoint = computed(() => store.isJointMode);

// Feature 4 : Total alloué aux objectifs ce mois
const totalAllocatedToGoals = computed(() => {
  // En mode separate, filtrer par owner (inclut les objectifs communs + personnels)
  if (!isJoint.value && props.owner) {
    return store.totalAllocatedForMonth(store.selectedMonth, props.owner);
  }
  return store.totalAllocatedForMonth(store.selectedMonth);
});
const hasGoals = computed(() => store.savingsGoals.length > 0);

// Taux d'épargne : foyer en mode joint, individuel sinon
const savingRate = computed({
  get: () => isJoint.value ? store.foyerSavingRate : (store.savingRates[props.owner] || 0),
  set: (value) => {
    if (isJoint.value) {
      store.setFoyerSavingRate(value);
    } else {
      store.setSavingRate(props.owner, value);
    }
  },
});

function formatCurrency(value) {
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const isSinglePerson = computed(() => store.owners.length === 1);

const steps = computed(() => {
  // === Mode compte commun (joint) ===
  if (isJoint.value) {
    const totalRevenue = store.totalFoyerRevenue;
    const totalCharges = store.totalFoyerCharges;
    const netIncome = store.foyerNetIncome;
    const savingTotal = store.foyerSavingPotential;
    const savingPerPerson = store.foyerSavingPerPerson;
    const remaining = store.foyerRemainingAfterSaving;

    const jointSteps = [];

    // Revenus par personne
    store.owners.forEach((owner, index) => {
      jointSteps.push({
        label: `Revenu ${owner}`,
        value: store.revenueByOwner(owner),
        type: "neutral",
        tooltip: `Revenus de ${owner} (${store.contributionPercentage(owner)}% du foyer)`,
        ownerIndex: index,
      });
    });

    jointSteps.push(
      {
        label: "Total revenus du foyer",
        value: totalRevenue,
        type: "subtotal",
        tooltip: "Somme de tous les revenus du foyer",
      },
      {
        label: "Charges du foyer",
        value: -totalCharges,
        type: "subtract",
        tooltip: "Total de toutes les charges du foyer",
      },
      {
        label: "Reste après charges",
        value: netIncome,
        type: "subtotal",
        tooltip: "Revenus moins toutes les charges",
      },
      {
        label: `Épargne foyer (${savingRate.value}%)`,
        value: -savingTotal,
        type: "subtract",
        tooltip: `Montant total épargné (${savingRate.value}% du restant)`,
      },
    );

    // Détail épargne par personne
    store.owners.forEach((owner, index) => {
      jointSteps.push({
        label: `dont ${owner}`,
        value: -savingPerPerson,
        type: "detail",
        tooltip: `Part d'épargne de ${owner} (50%)`,
        ownerIndex: index,
      });
    });

    // Ligne objectifs d'épargne (conditionnelle)
    if (hasGoals.value && totalAllocatedToGoals.value > 0) {
      jointSteps.push({
        label: `dont ${formatCurrency(totalAllocatedToGoals.value)} € alloués aux objectifs`,
        value: -totalAllocatedToGoals.value,
        type: "detail",
        tooltip: "Montant de l'épargne alloué aux objectifs d'épargne",
      });
    }

    jointSteps.push({
      label: "Budget disponible du foyer",
      value: remaining,
      type: "total",
      tooltip: "Budget restant pour les dépenses du quotidien",
    });

    return jointSteps;
  }

  // === Mode classique (single ou separate) ===
  const allPersonalCharges = isSinglePerson.value
    ? store.personalChargesByOwner(props.owner) + store.totalCommunalCharges
    : store.personalChargesByOwner(props.owner);

  const baseSteps = [
    {
      label: "Salaire",
      value: store.revenueByOwner(props.owner),
      type: "neutral",
      tooltip: "Total des revenus déclarés ce mois-ci",
    },
    {
      label: "Charges personnelles",
      value: -allPersonalCharges,
      type: "subtract",
      tooltip: isSinglePerson.value
        ? "Total de toutes les charges"
        : "Dépenses personnelles (non partagées)",
    },
  ];

  if (isSinglePerson.value) {
    const remaining = store.revenueByOwner(props.owner) - allPersonalCharges;
    baseSteps.push(
      {
        label: "Restant après charges",
        value: remaining,
        type: "subtotal",
        tooltip: "Salaire moins toutes les charges",
      },
      {
        label: `Épargne (${savingRate.value}%)`,
        value: -(remaining * (savingRate.value / 100)),
        type: "subtract",
        tooltip: `Montant mis de côté (${savingRate.value}% du restant)`,
      },
    );

    // Ligne objectifs d'épargne (conditionnelle)
    if (hasGoals.value && totalAllocatedToGoals.value > 0) {
      baseSteps.push({
        label: `dont ${formatCurrency(totalAllocatedToGoals.value)} € alloués aux objectifs`,
        value: -totalAllocatedToGoals.value,
        type: "detail",
        tooltip: "Montant de l'épargne alloué aux objectifs d'épargne",
      });
    }

    baseSteps.push(
      {
        label: "Reste final",
        value: remaining - remaining * (savingRate.value / 100),
        type: "total",
        tooltip: "Budget disponible pour les dépenses du quotidien",
      }
    );
  } else {
    baseSteps.push(
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
    );

    // Ligne objectifs d'épargne (conditionnelle)
    if (hasGoals.value && totalAllocatedToGoals.value > 0) {
      baseSteps.push({
        label: `dont ${formatCurrency(totalAllocatedToGoals.value)} € alloués aux objectifs`,
        value: -totalAllocatedToGoals.value,
        type: "detail",
        tooltip: "Montant de l'épargne alloué aux objectifs d'épargne",
      });
    }

    baseSteps.push(
      {
        label: "Reste final",
        value: store.remainingAfterSaving(props.owner),
        type: "total",
        tooltip: "Budget disponible pour les dépenses du quotidien",
      }
    );
  }

  return baseSteps;
});

const ownerIndex = computed(() => store.owners.indexOf(props.owner));
const isPrimary = computed(() => isJoint.value || ownerIndex.value === 0);
const cardLabel = computed(() => isJoint.value ? "Budget du foyer" : props.owner);
</script>

<template>
  <div class="glass-card rounded-none overflow-hidden h-full">
    <!-- Header -->
    <div
      class="px-6 py-4 border-b-3 border-brutal"
      :class="
        isJoint
          ? 'bg-blue-500/20'
          : isPrimary
            ? 'bg-primary/20'
            : 'bg-secondary/20'
      "
    >
      <h3 class="text-lg font-bold flex items-center gap-3">
        <div
class="w-3 h-3 rounded-full"
          :class="
            isJoint
              ? 'bg-blue-500 shadow-lg shadow-blue-500/50'
              : isPrimary
                ? 'bg-primary shadow-lg shadow-primary/50'
                : 'bg-secondary shadow-lg shadow-secondary/50'
          "
        ></div>
        <span class="text-base-content">{{ cardLabel }}</span>
      </h3>
    </div>

    <div class="p-6">
      <!-- Étapes du calcul -->
      <div class="flex flex-col gap-2">
        <template v-for="(step, index) in steps" :key="index">
          <!-- Ligne de calcul -->
          <div
            class="tooltip-wrapper w-full flex flex-col sm:flex-row justify-between sm:items-center py-2.5 px-4 rounded-none text-sm transition-all duration-200 gap-1 sm:gap-0"
            :class="{
              'bg-base-content/5': step.type === 'subtotal',
              'bg-primary/15 border-3 border-primary/30':
                step.type === 'total' && isPrimary && !isJoint,
              'bg-secondary/15 border-3 border-secondary/30':
                step.type === 'total' && !isPrimary && !isJoint,
              'bg-blue-500/15 border-3 border-blue-500/30':
                step.type === 'total' && isJoint,
              'ml-6 opacity-80': step.type === 'detail',
            }"
            :data-tooltip="step.tooltip"
          >
            <span
              class="flex items-center gap-2 flex-shrink min-w-0"
              :class="{
                'text-red-400/80': step.type === 'subtract',
                'font-medium text-base-content/90': step.type === 'subtotal',
                'font-bold text-base-content': step.type === 'total',
                'text-base-content/70': step.type === 'neutral',
                'text-base-content/50 text-xs': step.type === 'detail',
              }"
            >
              <span v-if="step.type === 'subtract'" class="text-red-400 text-xs">−</span>
              <span v-else-if="step.type === 'subtotal'" class="text-base-content/50">=</span>
              <span v-else-if="step.type === 'detail'" class="text-base-content/30">↳</span>
              <span
                v-else-if="step.type === 'total'"
                :class="isJoint ? 'text-blue-500' : isPrimary ? 'text-primary' : 'text-secondary'"
              >★</span>
              <span v-if="step.type === 'neutral' && step.ownerIndex != null">
                <span 
class="inline-block w-2 h-2 rounded-full mr-1"
                  :class="step.ownerIndex === 0 ? 'bg-primary' : 'bg-secondary'"
                ></span>
              </span>
              {{ step.label }}
            </span>
            <span
              class="tabular-nums font-mono flex-shrink-0 sm:ml-4 self-end sm:self-auto"
              :class="{
                'text-red-400/80': step.type === 'subtract',
                'font-medium text-base-content/90': step.type === 'subtotal',
                'font-bold text-lg': step.type === 'total',
                'text-primary': step.type === 'total' && isPrimary && !isJoint,
                'text-secondary': step.type === 'total' && !isPrimary && !isJoint,
                'text-blue-500': step.type === 'total' && isJoint,
                'text-base-content/70': step.type === 'neutral',
                'text-base-content/40 text-xs': step.type === 'detail',
              }"
            >
              {{ step.type === "subtract" || step.type === "detail" ? formatCurrency(Math.abs(step.value)) : formatCurrency(step.value) }} €
            </span>
          </div>

          <!-- Séparateur avant les sous-totaux -->
          <div
            v-if="step.type === 'subtract' && steps[index + 1]?.type === 'subtotal'"
            class="border-t border-brutal my-1"
          ></div>
          <!-- Séparateur avant le détail d'épargne -->
          <div
            v-if="step.type === 'subtract' && steps[index + 1]?.type === 'detail'"
            class="border-t border-brutal my-1 ml-6"
          ></div>
        </template>
      </div>

      <!-- Slider épargne -->
      <div class="mt-6 pt-6 border-t border-brutal space-y-4">
        <div class="flex justify-between items-center">
          <label
            class="text-sm font-medium text-base-content/70 tooltip-wrapper tooltip-bottom"
            :data-tooltip="isJoint ? 'Pourcentage du restant épargné par le foyer (réparti 50/50)' : 'Pourcentage du restant à mettre de côté chaque mois'"
            >Taux d'épargne{{ isJoint ? ' du foyer' : '' }}</label
          >
          <span class="px-3 py-1 rounded-none text-sm font-bold" :class="isJoint ? 'bg-blue-500/20 text-blue-500' : 'bg-primary/20 text-primary'">
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
            class="range range-sm w-full"
            :class="isJoint ? 'range-info' : isPrimary ? 'range-primary' : 'range-secondary'"
          />
        </div>

        <!-- Barre visuelle de progression -->
        <div class="relative">
          <div class="flex rounded-none overflow-hidden h-3 bg-base-content/5">
            <div
              class="transition-all duration-300 ease-out"
              :class="isJoint ? 'bg-gradient-to-r from-blue-500 to-blue-500/70' : isPrimary ? 'bg-gradient-to-r from-primary to-primary/70' : 'bg-gradient-to-r from-secondary to-secondary/70'"
              :style="{ width: `${savingRate}%` }"
            ></div>
            <div
              class="bg-base-content/5 transition-all duration-300 ease-out"
              :style="{ width: `${100 - savingRate}%` }"
            ></div>
          </div>
          <!-- Indicateur -->
          <div 
            class="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-base-content/30 rounded-none transition-all duration-300"
            :style="{ left: `${savingRate}%`, transform: 'translateX(-50%) translateY(-50%)' }"
          ></div>
        </div>

        <!-- Échelle -->
        <div class="flex justify-between text-xs text-base-content/30 px-1">
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
