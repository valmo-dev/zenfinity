<script setup>
import { computed } from "vue";
import { useBudgetStore } from "../stores/budget";
import { formatCurrency } from "../utils/format";

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
      label: "Revenus",
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
  <div class="terminal-card overflow-hidden h-full">
    <!-- Header — minimal terminal style with left accent -->
    <div
      class="px-6 py-4 flex items-center justify-between border-b border-base-content/[0.06]"
    >
      <div class="flex items-center gap-3">
        <span
          class="inline-block w-2 h-2 rounded-full"
          :class="
            isJoint
              ? 'bg-info'
              : isPrimary
                ? 'bg-primary'
                : 'bg-secondary'
          "
        ></span>
        <span class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/60">{{ cardLabel }}</span>
      </div>
      <span
        class="text-[10px] font-mono uppercase tracking-[0.1em] px-2 py-0.5 rounded"
        :class="
          isJoint
            ? 'text-info/60 bg-info/8'
            : isPrimary
              ? 'text-primary/60 bg-primary/8'
              : 'text-secondary/60 bg-secondary/8'
        "
      >Live</span>
    </div>

    <div class="p-6">
      <!-- Étapes du calcul -->
      <div class="flex flex-col gap-1">
        <template v-for="(step, index) in steps" :key="index">
          <!-- Ligne de calcul -->
          <div
            class="tooltip-wrapper w-full flex flex-col sm:flex-row justify-between sm:items-center py-2.5 px-4 text-sm transition-all duration-200 gap-1 sm:gap-0 rounded"
            :class="{
              'bg-base-content/[0.03]': step.type === 'subtotal',
              'terminal-total-row': step.type === 'total',
              'terminal-total-primary': step.type === 'total' && isPrimary && !isJoint,
              'terminal-total-secondary': step.type === 'total' && !isPrimary && !isJoint,
              'terminal-total-joint': step.type === 'total' && isJoint,
              'ml-6 opacity-80': step.type === 'detail',
            }"
            :data-tooltip="step.tooltip"
          >
            <span
              class="flex items-center gap-2 flex-shrink min-w-0 truncate"
              :class="{
                'text-error/80': step.type === 'subtract',
                'font-medium text-base-content/70 text-xs uppercase tracking-wider font-mono': step.type === 'subtotal',
                'font-semibold text-base-content uppercase tracking-wider text-xs font-mono': step.type === 'total',
                'text-base-content/60 text-xs uppercase tracking-wider font-mono': step.type === 'neutral',
                'text-base-content/40 text-[11px] font-mono': step.type === 'detail',
              }"
            >
              <span v-if="step.type === 'subtract'" class="text-error/60 text-[10px] font-mono">&#x2212;</span>
              <span v-else-if="step.type === 'subtotal'" class="text-base-content/30 text-[10px] font-mono">=</span>
              <span v-else-if="step.type === 'detail'" class="text-base-content/20 text-[10px] font-mono">&#x21B3;</span>
              <span
                v-else-if="step.type === 'total'"
                class="text-[10px]"
                :class="isJoint ? 'text-info/60' : isPrimary ? 'text-primary/60' : 'text-secondary/60'"
              >&#x25C6;</span>
              <span v-if="step.type === 'neutral' && step.ownerIndex != null">
                <span
                  class="inline-block w-1.5 h-1.5 rounded-full mr-1"
                  :class="step.ownerIndex === 0 ? 'bg-primary' : 'bg-secondary'"
                ></span>
              </span>
              {{ step.label }}
            </span>
            <span
              class="tabular-nums font-mono flex-shrink-0 sm:ml-4 self-end sm:self-auto"
              :class="{
                'text-error/70 text-sm': step.type === 'subtract',
                'font-medium text-base-content/80 text-sm': step.type === 'subtotal',
                'font-semibold text-xl tracking-tight': step.type === 'total',
                'text-primary': step.type === 'total' && isPrimary && !isJoint,
                'text-secondary': step.type === 'total' && !isPrimary && !isJoint,
                'text-info': step.type === 'total' && isJoint,
                'text-base-content/60 text-sm': step.type === 'neutral',
                'text-base-content/30 text-[11px]': step.type === 'detail',
              }"
            >
              {{ step.type === "subtract" || step.type === "detail" ? formatCurrency(Math.abs(step.value)) : formatCurrency(step.value) }} €
            </span>
          </div>

          <!-- Séparateur avant les sous-totaux -->
          <div
            v-if="step.type === 'subtract' && steps[index + 1]?.type === 'subtotal'"
            class="border-t border-base-content/[0.06] my-1"
          ></div>
          <!-- Séparateur avant le détail d'épargne -->
          <div
            v-if="step.type === 'subtract' && steps[index + 1]?.type === 'detail'"
            class="border-t border-base-content/[0.06] my-1 ml-6"
          ></div>
        </template>
      </div>

      <!-- Slider épargne -->
      <div class="mt-6 pt-6 border-t border-base-content/[0.06] space-y-4">
        <div class="flex justify-between items-center">
          <label
            for="saving-rate"
            class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/60 tooltip-wrapper tooltip-bottom"
            :data-tooltip="isJoint ? 'Pourcentage du restant épargné par le foyer (réparti 50/50)' : 'Pourcentage du restant à mettre de côté chaque mois'"
            >Taux d'épargne{{ isJoint ? ' du foyer' : '' }}</label
          >
          <span
            class="px-2.5 py-0.5 text-sm font-mono font-semibold rounded"
            :class="isJoint ? 'bg-info/10 text-info' : 'bg-primary/10 text-primary'"
          >
            {{ savingRate }}%
          </span>
        </div>

        <!-- Slider -->
        <div class="py-2">
          <input
            id="saving-rate"
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
            <div class="flex overflow-hidden h-2 rounded-full bg-base-content/[0.04]">
            <div
              class="transition-all duration-300 ease-out rounded-full"
              :class="isJoint ? 'bg-gradient-to-r from-info to-info/50' : isPrimary ? 'bg-gradient-to-r from-primary to-primary/50' : 'bg-gradient-to-r from-secondary to-secondary/50'"
              :style="{ width: `${savingRate}%` }"
            ></div>
          </div>
        </div>

        <!-- Échelle -->
        <div class="flex justify-between text-[10px] font-mono text-base-content/60 px-1">
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
