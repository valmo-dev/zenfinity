<script setup>
import { useBudgetStore } from "../stores/budget";
import MonthSelector from "../components/MonthSelector.vue";
import BudgetSummaryCard from "../components/BudgetSummaryCard.vue";
import SavingsGoalsSection from "../components/SavingsGoalsSection.vue";
import ChartSection from "../components/ChartSection.vue";
import ChargesSection from "../components/ChargesSection.vue";

const store = useBudgetStore();
</script>

<template>
  <div class="space-y-8">
    <!-- Titre de page -->
    <div>
      <h1 class="text-3xl font-black uppercase tracking-tight">
        Tableau de bord
      </h1>
      <p class="text-base-content/50 font-medium mt-1">
        Vue d'ensemble de vos finances
      </p>
    </div>

    <!-- Sélecteur de mois -->
    <MonthSelector />

    <!-- Résumés par personne -->
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

    <!-- Objectifs d'épargne -->
    <SavingsGoalsSection />

    <!-- Dernières charges (aperçu compact) -->
    <ChargesSection />

    <!-- Graphiques -->
    <ChartSection />
  </div>
</template>
