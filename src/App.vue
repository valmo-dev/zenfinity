<script setup>
import { ref } from "vue";
import { useBudgetStore } from "./stores/budget";
import MonthSelector from "./components/MonthSelector.vue";
import AddEntryModal from "./components/AddEntryModal.vue";
import RevenueSection from "./components/RevenueSection.vue";
import BudgetSummaryCard from "./components/BudgetSummaryCard.vue";
import ChargesSection from "./components/ChargesSection.vue";
import DistributionControl from "./components/DistributionControl.vue";
import ChartSection from "./components/ChartSection.vue";
import ExportImport from "./components/ExportImport.vue";
import exptrackLogo from "./assets/exptrack.svg";

const store = useBudgetStore();
const showAddModal = ref(false);
</script>

<template>
  <div class="min-h-screen bg-base-300">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-base-100/80 backdrop-blur-lg border-b border-base-content/5">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img :src="exptrackLogo" alt="ExpTrack" class="w-8 h-8" />
          <h1 class="text-xl font-bold tracking-tight">ExpTrack</h1>
        </div>
        <button
          class="btn btn-primary btn-sm gap-1"
          @click="showAddModal = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">Ajouter</span>
        </button>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      <!-- Sélecteur de mois -->
      <MonthSelector />

      <!-- Résumés par personne -->
      <section>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BudgetSummaryCard
            v-for="owner in store.owners"
            :key="owner"
            :owner="owner"
          />
        </div>
      </section>

      <!-- Revenus -->
      <section>
        <RevenueSection />
      </section>

      <!-- Répartition des charges communes -->
      <section>
        <DistributionControl />
      </section>

      <!-- Charges -->
      <section>
        <ChargesSection />
      </section>

      <!-- Graphiques -->
      <section>
        <ChartSection />
      </section>

      <!-- Export/Import -->
      <section>
        <ExportImport />
      </section>

      <!-- Footer -->
      <footer class="text-center text-xs text-base-content/30 py-4">
        ExpTrack &mdash; Suivi budgétaire
      </footer>
    </main>

    <!-- Modal d'ajout -->
    <AddEntryModal
      :isOpen="showAddModal"
      @close="showAddModal = false"
    />
  </div>
</template>
