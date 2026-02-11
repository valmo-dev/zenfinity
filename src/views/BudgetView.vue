<script setup>
import MonthSelector from "../components/MonthSelector.vue";
import CategoryBudgetManager from "../components/CategoryBudgetManager.vue";
import BudgetProgressBar from "../components/BudgetProgressBar.vue";
</script>

<template>
  <div class="space-y-8">
    <!-- Titre de page -->
    <div>
      <p class="text-[11px] font-mono uppercase tracking-[0.2em] text-primary/60 mb-1 flex items-center gap-2">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
        Gestion Budgets
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-base-content">Budget</h1>
      <p class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/40 mt-2">
        Gérez vos budgets par catégorie
      </p>
    </div>

    <!-- Sélecteur de mois -->
    <MonthSelector />

    <!-- Gestionnaire de budgets -->
    <CategoryBudgetManager />
  </div>
</template>
