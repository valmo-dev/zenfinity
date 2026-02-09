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
  <div class="flex flex-col items-center gap-3">
    <div class="flex items-center gap-4">
      <button
        class="btn btn-ghost btn-sm btn-circle"
        @click="navigateMonth(-1)"
        aria-label="Mois précédent"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="text-xl font-semibold min-w-48 text-center">
        {{ displayMonth }}
      </h2>
      <button
        class="btn btn-ghost btn-sm btn-circle"
        @click="navigateMonth(1)"
        aria-label="Mois suivant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
    <button
      v-if="canDuplicate"
      class="btn btn-outline btn-sm btn-accent"
      @click="duplicatePrevious"
    >
      Dupliquer depuis {{ previousMonthDisplay }}
    </button>
  </div>
</template>
