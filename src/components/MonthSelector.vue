<script setup>
import { computed, inject } from "vue";
import { useBudgetStore } from "../stores/budget";
import { ChevronLeft, ChevronRight, Copy, Repeat } from "lucide-vue-next";

const store = useBudgetStore();
const showToast = inject("showToast", () => {});

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
  showToast("success", `Entrées dupliquées depuis ${previousMonthDisplay.value}`);
}

const previousMonthDisplay = computed(() => {
  const [year, month] = previousMonth.value.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
});

// Feature 1 : Récurrences
const canApplyRecurring = computed(() => {
  return (
    store.activeRecurringItems.length > 0 &&
    !store.hasRecurringBeenApplied(store.selectedMonth)
  );
});

function applyRecurring() {
  const count = store.applyRecurringItems(store.selectedMonth);
  showToast("success", `${count} entrée${count > 1 ? 's' : ''} récurrente${count > 1 ? 's' : ''} appliquée${count > 1 ? 's' : ''}`);
}
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <!-- Navigation du mois -->
    <div class="flex items-center gap-6">
      <!-- Bouton précédent -->
      <button
        class="group w-12 h-12 rounded-full bg-base-content/5 hover:bg-base-content/10 border border-base-content/10 hover:border-base-content/20 flex items-center justify-center transition-all duration-300"
        @click="navigateMonth(-1)"
        aria-label="Mois précédent"
      >
        <ChevronLeft :size="20" class="text-base-content/70 group-hover:text-base-content transition-colors" />
      </button>

      <!-- Affichage du mois -->
      <div class="text-center min-w-56">
        <h2 class="text-3xl font-bold tracking-tight text-base-content">
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
        class="group w-12 h-12 rounded-full bg-base-content/5 hover:bg-base-content/10 border border-base-content/10 hover:border-base-content/20 flex items-center justify-center transition-all duration-300"
        @click="navigateMonth(1)"
        aria-label="Mois suivant"
      >
        <ChevronRight :size="20" class="text-base-content/70 group-hover:text-base-content transition-colors" />
      </button>
    </div>

    <!-- Boutons d'action -->
    <div class="flex flex-wrap items-center justify-center gap-3">
      <!-- Appliquer les récurrences -->
      <button
        v-if="canApplyRecurring"
        class="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/30 transition-all duration-300"
        @click="applyRecurring"
      >
        <Repeat :size="16" class="text-violet-400" />
        <span class="text-sm font-medium text-base-content/80 group-hover:text-base-content">
          Appliquer les récurrences
        </span>
        <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-500/20 text-violet-400">
          {{ store.activeRecurringItems.length }}
        </span>
      </button>

      <!-- Bouton de duplication (fallback) -->
      <button
        v-if="canDuplicate"
        class="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-base-content/5 hover:bg-primary/20 border border-base-content/10 hover:border-primary/30 transition-all duration-300"
        @click="duplicatePrevious"
      >
        <Copy :size="16" class="text-primary" />
        <span class="text-sm font-medium text-base-content/80 group-hover:text-base-content">
          Dupliquer depuis {{ previousMonthDisplay }}
        </span>
      </button>
    </div>
  </div>
</template>
