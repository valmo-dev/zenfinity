<script setup>
import ExportImport from "../components/ExportImport.vue";
</script>

<template>
  <div class="space-y-8">
    <!-- Titre de page -->
    <div>
      <h1 class="text-3xl font-black uppercase tracking-tight">
        Import / Export
      </h1>
      <p class="text-base-content/50 font-medium mt-1">
        Sauvegardez et restaurez vos données
      </p>
    </div>

    <!-- Export/Import -->
    <ExportImport />
  </div>
</template>
