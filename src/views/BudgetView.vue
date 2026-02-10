<script setup>
import MonthSelector from "../components/MonthSelector.vue";
import CategoryBudgetManager from "../components/CategoryBudgetManager.vue";
import BudgetProgressBar from "../components/BudgetProgressBar.vue";
</script>

<template>
  <div class="space-y-8">
    <!-- Titre de page -->
    <div>
      <h1 class="text-3xl font-black uppercase tracking-tight">Budget</h1>
      <p class="text-base-content/50 font-medium mt-1">
        Gérez vos budgets par catégorie
      </p>
    </div>

    <!-- Sélecteur de mois -->
    <MonthSelector />

    <!-- Gestionnaire de budgets -->
    <CategoryBudgetManager />
  </div>
</template>
