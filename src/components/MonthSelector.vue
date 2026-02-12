<script setup>
import { computed, ref, inject } from "vue";
import { useBudgetStore } from "../stores/budget";
import { ChevronLeft, ChevronRight, Copy, RotateCcw, ChevronDown, Trash2, UserMinus, Users } from "lucide-vue-next";
import ConfirmModal from "./ConfirmModal.vue";

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

// === Duplication ===

const previousMonth = computed(() => store.getPreviousMonth(store.selectedMonth));

const canDuplicate = computed(() => {
  if (store.hasMonthBeenDuplicated(store.selectedMonth)) return false;
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

// === Menu de réinitialisation ===

const showResetMenu = ref(false);
const showResetConfirm = ref(false);
const resetAction = ref(null);
const resetConfirmTitle = ref("");
const resetConfirmMessage = ref("");

const isSeparateMode = computed(() => store.householdMode === "separate");
const hasRegularItems = computed(() => store.regularMonthItems.length > 0);

function toggleResetMenu() {
  showResetMenu.value = !showResetMenu.value;
}

function closeResetMenu() {
  showResetMenu.value = false;
}

function requestReset(action) {
  resetAction.value = action;
  showResetMenu.value = false;

  switch (action) {
    case "all":
      resetConfirmTitle.value = "Réinitialiser le mois ?";
      resetConfirmMessage.value = `Tous les revenus et charges manuels de ${displayMonth.value} seront supprimés. Les récurrences ne sont pas affectées.`;
      break;
    case "personal":
      resetConfirmTitle.value = "Vider les charges personnelles ?";
      resetConfirmMessage.value = `Toutes les charges personnelles manuelles de ${displayMonth.value} seront supprimées.`;
      break;
    case "communal":
      resetConfirmTitle.value = "Vider les charges communes ?";
      resetConfirmMessage.value = `Toutes les charges communes manuelles de ${displayMonth.value} seront supprimées.`;
      break;
    case "charges":
      resetConfirmTitle.value = "Vider toutes les charges ?";
      resetConfirmMessage.value = `Toutes les charges manuelles de ${displayMonth.value} seront supprimées.`;
      break;
  }
  showResetConfirm.value = true;
}

function confirmReset() {
  const month = store.selectedMonth;
  switch (resetAction.value) {
    case "all":
      store.clearMonth(month);
      showToast("success", `${displayMonth.value} réinitialisé`);
      break;
    case "personal":
      store.clearPersonalCharges(month);
      showToast("success", "Charges personnelles supprimées");
      break;
    case "communal":
      store.clearCommunalCharges(month);
      showToast("success", "Charges communes supprimées");
      break;
    case "charges":
      store.clearAllCharges(month);
      showToast("success", "Toutes les charges supprimées");
      break;
  }
  showResetConfirm.value = false;
  resetAction.value = null;
}

function cancelReset() {
  showResetConfirm.value = false;
  resetAction.value = null;
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
      <div class="text-center min-w-0 sm:min-w-56">
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
      <!-- Bouton de duplication -->
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

      <!-- Menu de réinitialisation -->
      <div v-if="hasRegularItems" class="relative">
        <button
          class="brutal-btn bg-error/10 hover:bg-error/20"
          @click="toggleResetMenu"
          @blur="() => setTimeout(closeResetMenu, 150)"
          aria-label="Options de réinitialisation"
          aria-haspopup="true"
          :aria-expanded="showResetMenu"
        >
          <RotateCcw :size="16" class="text-error/70" />
          <span class="text-sm font-medium text-error/80">Réinitialiser</span>
          <ChevronDown :size="14" class="text-error/50 transition-transform" :class="{ 'rotate-180': showResetMenu }" />
        </button>

        <!-- Dropdown menu -->
        <Transition name="dropdown">
          <div
            v-if="showResetMenu"
            class="absolute top-full mt-2 right-0 min-w-56 bg-base-100 border border-base-content/[0.08] shadow-lg z-50"
          >
            <div class="py-1">
              <!-- Réinitialiser le mois -->
              <button
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-base-content/5 transition-colors"
                @mousedown.prevent="requestReset('all')"
              >
                <Trash2 :size="14" class="text-error/60" />
                <span class="text-base-content/80">Réinitialiser le mois</span>
              </button>

              <div class="h-px bg-base-content/[0.06] mx-3 my-1"></div>

              <!-- Mode separate : options granulaires -->
              <template v-if="isSeparateMode">
                <button
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-base-content/5 transition-colors"
                  @mousedown.prevent="requestReset('personal')"
                >
                  <UserMinus :size="14" class="text-base-content/40" />
                  <span class="text-base-content/80">Vider les charges perso.</span>
                </button>
                <button
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-base-content/5 transition-colors"
                  @mousedown.prevent="requestReset('communal')"
                >
                  <Users :size="14" class="text-base-content/40" />
                  <span class="text-base-content/80">Vider les charges communes</span>
                </button>
              </template>

              <!-- Mode single / joint : option unique -->
              <template v-else>
                <button
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-base-content/5 transition-colors"
                  @mousedown.prevent="requestReset('charges')"
                >
                  <Trash2 :size="14" class="text-base-content/40" />
                  <span class="text-base-content/80">Vider toutes les charges</span>
                </button>
              </template>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Modale de confirmation -->
    <ConfirmModal
      :isOpen="showResetConfirm"
      :title="resetConfirmTitle"
      :message="resetConfirmMessage"
      variant="warning"
      confirmLabel="Réinitialiser"
      @confirm="confirmReset"
      @cancel="cancelReset"
    />
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
