<script setup>
import { ref, provide } from "vue";
import { useBudgetStore } from "./stores/budget";
import MonthSelector from "./components/MonthSelector.vue";
import AddEntryModal from "./components/AddEntryModal.vue";
import RevenueSection from "./components/RevenueSection.vue";
import BudgetSummaryCard from "./components/BudgetSummaryCard.vue";
import ChargesSection from "./components/ChargesSection.vue";
import DistributionControl from "./components/DistributionControl.vue";
import ChartSection from "./components/ChartSection.vue";
import ExportImport from "./components/ExportImport.vue";
import ToastNotification from "./components/ToastNotification.vue";
import exptrackLogo from "./assets/exptrack.svg";

const store = useBudgetStore();
const showAddModal = ref(false);
const toastRef = ref(null);

// Fonction utilitaire pour afficher des toasts
function showToast(type, message, duration = 4000) {
  if (toastRef.value) {
    toastRef.value.addToast(type, message, duration);
  } else {
    // Fallback via événement custom
    window.dispatchEvent(new CustomEvent("show-toast", {
      detail: { type, message, duration }
    }));
  }
}

// Provide la fonction showToast pour les composants enfants
provide("showToast", showToast);

function handleEntryAdded() {
  showAddModal.value = false;
  showToast("success", "Entrée ajoutée avec succès");
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header moderne avec glass effect -->
    <header class="fixed top-0 left-0 right-0 z-50 header-glass">
      <div class="container mx-auto px-6 py-4 flex items-center justify-between max-w-6xl">
        <div class="flex items-center gap-4">
          <div 
            class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center tooltip-wrapper tooltip-bottom" 
            data-tooltip="ExpTrack - Suivi budgétaire"
          >
            <img :src="exptrackLogo" alt="ExpTrack" class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-white">ExpTrack</h1>
            <p class="text-xs text-white/50">Suivi budgétaire</p>
          </div>
        </div>
        <button
          class="group flex items-center gap-3 bg-white text-black hover:bg-white/90 rounded-full px-5 py-2.5 font-medium shadow-xl hover:shadow-2xl transition-all duration-300"
          @click="showAddModal = true"
          title="Ajouter un revenu ou une charge"
        >
          <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          <span class="hidden sm:inline">Ajouter</span>
          <div class="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </button>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="container mx-auto px-4 sm:px-6 pt-28 pb-12 space-y-8 max-w-6xl">
      <!-- Sélecteur de mois -->
      <section class="animate-fade-in-up">
        <MonthSelector />
      </section>

      <!-- Résumés par personne -->
      <section class="animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetSummaryCard
            v-for="owner in store.owners"
            :key="owner"
            :owner="owner"
          />
        </div>
      </section>

      <!-- Revenus -->
      <section class="animate-fade-in-up" style="animation-delay: 0.2s">
        <RevenueSection />
      </section>

      <!-- Répartition des charges communes -->
      <section class="animate-fade-in-up" style="animation-delay: 0.3s">
        <DistributionControl />
      </section>

      <!-- Charges -->
      <section class="animate-fade-in-up" style="animation-delay: 0.4s">
        <ChargesSection />
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
      <footer class="text-center py-8 border-t border-white/5">
        <div class="flex items-center justify-center gap-3 text-white/40">
          <div class="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
          <span class="text-sm font-medium tracking-wide">ExpTrack</span>
          <div class="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
        </div>
        <p class="text-xs text-white/30 mt-2">Gestion budgétaire simplifiée</p>
      </footer>
    </main>

    <!-- Modal d'ajout -->
    <AddEntryModal
      :isOpen="showAddModal"
      @close="showAddModal = false"
      @added="handleEntryAdded"
    />

    <!-- Système de notifications Toast -->
    <ToastNotification ref="toastRef" />
  </div>
</template>
