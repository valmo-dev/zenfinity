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
      <h1 class="text-3xl font-black uppercase tracking-tight">
        Répartition
      </h1>
      <p class="text-base-content/50 font-medium mt-1">
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
