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
      <p class="text-[11px] font-mono uppercase tracking-[0.2em] text-primary/60 mb-1 flex items-center gap-2">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
        Flux Financiers
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-base-content">
        Revenus & Charges
      </h1>
      <p class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/40 mt-2">
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
