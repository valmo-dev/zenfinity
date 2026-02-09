<script setup>
import { computed } from "vue";
import { useBudgetStore } from "../stores/budget";

const store = useBudgetStore();

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const displayMonth = computed(() => {
  const [year, month] = store.selectedMonth.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
});

function navigateMonth(direction) {
  const [year, month] = store.selectedMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + direction, 1);
  const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  store.setSelectedMonth(newMonth);
}

const previousMonth = computed(() => store.getPreviousMonth(store.selectedMonth));

const canDuplicate = computed(() => {
  if (store.currentMonthHasItems) return false;
  const prevItems = store.items.filter((item) => item.month === previousMonth.value);
  return prevItems.length > 0;
});

function duplicatePrevious() {
  store.duplicateMonth(previousMonth.value, store.selectedMonth);
}

const previousMonthDisplay = computed(() => {
  const [year, month] = previousMonth.value.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
});
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <!-- Navigation du mois -->
    <div class="flex items-center gap-6">
      <!-- Bouton précédent -->
      <button
        class="group w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-300"
        @click="navigateMonth(-1)"
        aria-label="Mois précédent"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/70 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Affichage du mois -->
      <div class="text-center min-w-56">
        <h2 class="text-3xl font-bold tracking-tight text-white">
          {{ displayMonth }}
        </h2>
        <div class="flex items-center justify-center gap-2 mt-1">
          <div class="w-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
          <div class="w-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        </div>
      </div>

      <!-- Bouton suivant -->
      <button
        class="group w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-300"
        @click="navigateMonth(1)"
        aria-label="Mois suivant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/70 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Bouton de duplication -->
    <button
      v-if="canDuplicate"
      class="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 transition-all duration-300"
      @click="duplicatePrevious"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <span class="text-sm font-medium text-white/80 group-hover:text-white">
        Dupliquer depuis {{ previousMonthDisplay }}
      </span>
    </button>
  </div>
</template>
