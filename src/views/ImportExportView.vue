<script setup>
import ExportImport from "../components/ExportImport.vue";
</script>

<template>
  <div class="space-y-8">
    <!-- Titre de page -->
    <div>
      <p class="text-[11px] font-mono uppercase tracking-[0.2em] text-primary/60 mb-1 flex items-center gap-2">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
        Données Système
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-base-content">
        Import / Export
      </h1>
      <p class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/40 mt-2">
        Sauvegardez et restaurez vos données
      </p>
    </div>

    <!-- Export/Import -->
    <ExportImport />
  </div>
</template>
