<script setup>
import { ref, provide, computed } from "vue";
import { useBudgetStore } from "./stores/budget";
import { Sun, Moon, Settings, Plus } from "lucide-vue-next";
import MonthSelector from "./components/MonthSelector.vue";
import AddEntryModal from "./components/AddEntryModal.vue";
import RevenueSection from "./components/RevenueSection.vue";
import BudgetSummaryCard from "./components/BudgetSummaryCard.vue";
import ChargesSection from "./components/ChargesSection.vue";
import DistributionControl from "./components/DistributionControl.vue";
import ChartSection from "./components/ChartSection.vue";
import ExportImport from "./components/ExportImport.vue";
import RecurringSection from "./components/RecurringSection.vue";
import SavingsGoalsSection from "./components/SavingsGoalsSection.vue";
import CategoryBudgetManager from "./components/CategoryBudgetManager.vue";
import ToastNotification from "./components/ToastNotification.vue";
import SettingsModal from "./components/SettingsModal.vue";
import zenfinityLogo from "./assets/zenfinity.webp";

const store = useBudgetStore();
const showAddModal = ref(false);
const showSettingsModal = ref(false);
const toastRef = ref(null);

// Theme toggle
const isDarkTheme = computed({
  get: () => store.theme === "zenfinity-dark",
  set: (value) => store.setTheme(value ? "zenfinity-dark" : "zenfinity-light"),
});

function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value;
}

// Fonction utilitaire pour afficher des toasts
function showToast(type, message, duration = 4000) {
  if (toastRef.value) {
    toastRef.value.addToast(type, message, duration);
  } else {
    // Fallback via événement custom
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type, message, duration },
      }),
    );
  }
}

// Provide la fonction showToast pour les composants enfants
provide("showToast", showToast);

function handleEntryAdded() {
  showAddModal.value = false;
  showToast("success", "Entrée ajoutée avec succès");
}

function handleSettingsSaved() {
  showSettingsModal.value = false;
  showToast("success", "Paramètres enregistrés");
}

function handleSettingsClosed() {
  showSettingsModal.value = false;
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header moderne avec glass effect -->
    <header class="fixed top-0 left-0 right-0 z-50 header-glass">
      <div
        class="container mx-auto px-6 py-4 flex items-center justify-between max-w-6xl"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 bg-base-content/5 hover:bg-base-content/10 rounded-full p-1 flex items-center justify-center tooltip-wrapper tooltip-bottom"
            data-tooltip="ZenFinity - Suivi budgétaire"
          >
            <img :src="zenfinityLogo" alt="ZenFinity" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-base-content">
              ZenFinity
            </h1>
            <p class="text-xs text-base-content/50">Suivi budgétaire</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <!-- Theme toggle -->
          <button
            class="w-10 h-10 rounded-full bg-base-content/5 hover:bg-base-content/10 flex items-center justify-center transition-colors"
            @click="toggleTheme"
            :title="
              isDarkTheme ? 'Passer au thème clair' : 'Passer au thème sombre'
            "
          >
            <Sun v-if="isDarkTheme" :size="20" class="text-base-content/60" />
            <Moon v-else :size="20" class="text-base-content/60" />
          </button>
          <!-- Settings button -->
          <button
            class="w-10 h-10 rounded-full bg-base-content/5 hover:bg-base-content/10 flex items-center justify-center transition-colors"
            @click="showSettingsModal = true"
            title="Paramètres du foyer"
          >
            <Settings :size="20" class="text-base-content/60" />
          </button>
          <!-- Add button -->
          <button
            class="group flex items-center gap-3 bg-base-content text-base-100 hover:bg-base-content/90 rounded-full px-5 py-2.5 font-medium shadow-xl hover:shadow-2xl transition-all duration-300"
            @click="showAddModal = true"
            title="Ajouter un revenu ou une charge"
          >
            <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span class="hidden sm:inline">Ajouter</span>
            <div
              class="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
            >
              <Plus
                :size="14"
                class="text-primary-content"
                stroke-width="2.5"
              />
            </div>
          </button>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main
      class="container mx-auto px-4 sm:px-6 pt-28 pb-12 space-y-8 max-w-6xl"
    >
      <!-- Sélecteur de mois -->
      <section class="animate-fade-in-up">
        <MonthSelector />
      </section>

      <!-- Résumés par personne -->
      <section class="animate-fade-in-up" style="animation-delay: 0.1s">
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
      <section class="animate-fade-in-up" style="animation-delay: 0.15s">
        <SavingsGoalsSection />
      </section>

      <!-- Revenus -->
      <section class="animate-fade-in-up" style="animation-delay: 0.2s">
        <RevenueSection />
      </section>

      <!-- Répartition des charges communes (masqué en mode joint et single) -->
      <section
        v-if="store.householdMode === 'separate'"
        class="animate-fade-in-up"
        style="animation-delay: 0.3s"
      >
        <DistributionControl />
      </section>

      <!-- Charges -->
      <section class="animate-fade-in-up" style="animation-delay: 0.4s">
        <ChargesSection />
      </section>

      <!-- Budgets par catégorie -->
      <section class="animate-fade-in-up" style="animation-delay: 0.45s">
        <CategoryBudgetManager />
      </section>

      <!-- Entrées récurrentes -->
      <section class="animate-fade-in-up" style="animation-delay: 0.65s">
        <RecurringSection />
      </section>

      <!-- Graphiques -->
      <section class="animate-fade-in-up" style="animation-delay: 0.5s">
        <ChartSection />
      </section>

      <!-- Export/Import -->
      <section class="animate-fade-in-up" style="animation-delay: 0.6s">
        <ExportImport />
      </section>

      <!-- Footer moderne -->
      <footer class="text-center py-8 border-t border-base-content/5">
        <div
          class="flex items-center justify-center gap-3 text-base-content/40"
        >
          <div class="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
          <span class="text-sm font-medium tracking-wide">ZenFinity</span>
          <div class="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
        </div>
        <p class="text-xs text-base-content/30 mt-2">
          Gestion budgétaire simplifiée
        </p>
      </footer>
    </main>

    <!-- Modal d'ajout -->
    <AddEntryModal
      :isOpen="showAddModal"
      @close="showAddModal = false"
      @added="handleEntryAdded"
    />

    <!-- Modal des paramètres -->
    <SettingsModal
      :isOpen="showSettingsModal"
      @save="handleSettingsSaved"
      @close="handleSettingsClosed"
    />

    <!-- Système de notifications Toast -->
    <ToastNotification ref="toastRef" />
  </div>
</template>
