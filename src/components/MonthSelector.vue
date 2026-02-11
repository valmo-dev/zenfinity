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
        class="brutal-btn w-12 h-12 !p-0 flex items-center justify-center"
        @click="navigateMonth(-1)"
        aria-label="Mois précédent"
      >
        <ChevronLeft :size="24" :stroke-width="2" />
      </button>

      <!-- Affichage du mois -->
      <div class="text-center min-w-56">
        <h2 class="text-3xl font-semibold tracking-tight text-base-content font-mono tabular-nums">
          {{ displayMonth }}
        </h2>
        <div class="flex items-center justify-center mt-2">
          <div class="w-16 bg-base-content/20 h-px"></div>
        </div>
      </div>

      <!-- Bouton suivant -->
      <button
        class="brutal-btn w-12 h-12 !p-0 flex items-center justify-center"
        @click="navigateMonth(1)"
        aria-label="Mois suivant"
      >
        <ChevronRight :size="24" :stroke-width="2" />
      </button>
    </div>

    <!-- Boutons d'action -->
    <div class="flex flex-wrap items-center justify-center gap-3">
      <!-- Appliquer les récurrences -->
      <button
        v-if="canApplyRecurring"
        class="brutal-btn bg-[#B48EAD]/15 hover:bg-[#B48EAD]/30"
        @click="applyRecurring"
      >
        <Repeat :size="16" class="text-[#B48EAD]" />
        <span class="text-sm font-medium">
          Appliquer les récurrences
        </span>
        <span class="px-2 py-0.5 text-xs font-bold bg-[#B48EAD]/15 text-[#B48EAD]">
          {{ store.activeRecurringItems.length }}
        </span>
      </button>

      <!-- Bouton de duplication (fallback) -->
      <button
        v-if="canDuplicate"
        class="brutal-btn bg-primary/20 hover:bg-primary/30"
        @click="duplicatePrevious"
      >
        <Copy :size="16" class="text-primary" />
        <span class="text-sm font-medium">
          Dupliquer depuis {{ previousMonthDisplay }}
        </span>
      </button>
    </div>
  </div>
</template>
