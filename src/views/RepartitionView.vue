<script setup>
import { useBudgetStore } from "../stores/budget";
import MonthSelector from "../components/MonthSelector.vue";
import BudgetSummaryCard from "../components/BudgetSummaryCard.vue";
import DistributionControl from "../components/DistributionControl.vue";

const store = useBudgetStore();
</script>

<template>
  <div class="space-y-8">
    <!-- Titre de page -->
    <div>
      <p class="text-[11px] font-mono uppercase tracking-[0.2em] text-primary/60 mb-1 flex items-center gap-2">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
        Répartition Active
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-base-content">
        Répartition
      </h1>
      <p class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/40 mt-2">
        Calcul détaillé par personne
      </p>
    </div>

    <!-- Sélecteur de mois -->
    <MonthSelector />

    <!-- Contrôle de répartition (masqué en mode joint et single) -->
    <DistributionControl v-if="store.householdMode === 'separate'" />

    <!-- Waterfall par personne -->
    <section>
      <!-- Mode joint : une seule carte foyer -->
      <div v-if="store.householdMode === 'joint'">
        <BudgetSummaryCard />
      </div>
      <!-- Mode single/separate : une carte par personne -->
      <div
        v-else
        class="grid grid-cols-1 gap-6"
        :class="{ 'lg:grid-cols-2': store.owners.length > 1 }"
      >
        <BudgetSummaryCard
          v-for="owner in store.owners"
          :key="owner"
          :owner="owner"
        />
      </div>
    </section>
  </div>
</template>
