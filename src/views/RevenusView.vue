<script setup>
import { useBudgetStore } from "../stores/budget";
import MonthSelector from "../components/MonthSelector.vue";
import RevenueSection from "../components/RevenueSection.vue";
import ChargesSection from "../components/ChargesSection.vue";
import RecurringSection from "../components/RecurringSection.vue";

const store = useBudgetStore();
</script>

<template>
  <div class="space-y-8">
    <!-- Titre de page -->
    <div>
      <h1 class="text-3xl font-black uppercase tracking-tight">
        Revenus & Charges
      </h1>
      <p class="text-base-content/50 font-medium mt-1">
        Vos revenus, charges fixes et récurrences
      </p>
    </div>

    <!-- Sélecteur de mois -->
    <MonthSelector />

    <!-- Revenus -->
    <RevenueSection />

    <!-- Charges -->
    <ChargesSection />

    <!-- Entrées récurrentes -->
    <RecurringSection />
  </div>
</template>
