<script setup>
import { ref } from "vue";
import { useBudgetStore } from "../stores/budget";

const store = useBudgetStore();
const importMessage = ref(null);
const fileInput = ref(null);

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON() {
  const json = store.exportJSON();
  downloadFile(json, `exptrack-export-${store.selectedMonth}.json`, "application/json");
}

function exportCSV() {
  const csv = store.exportCSV();
  downloadFile(csv, `exptrack-${store.selectedMonth}.csv`, "text/csv;charset=utf-8");
}

function triggerImport() {
  fileInput.value?.click();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = store.importJSON(e.target.result);
    if (result.success) {
      importMessage.value = {
        type: "success",
        text: `${result.count} entrées importées avec succès`,
      };
    } else {
      importMessage.value = {
        type: "error",
        text: result.error,
      };
    }
    setTimeout(() => {
      importMessage.value = null;
    }, 4000);
    // Reset file input
    event.target.value = "";
  };
  reader.readAsText(file);
}
</script>

<template>
  <div class="glass-card rounded-2xl overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-transparent">
      <h3 class="text-lg font-bold flex items-center gap-3 text-white">
        <div class="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        Import / Export
      </h3>
    </div>

    <div class="p-6">
      <!-- Boutons -->
      <div class="flex flex-wrap gap-3">
        <!-- Export JSON -->
        <button 
          class="group flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 transition-all duration-300"
          @click="exportJSON"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="text-sm font-medium text-white/80 group-hover:text-white">Export JSON</span>
        </button>

        <!-- Export CSV -->
        <button 
          class="group flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 hover:bg-secondary/20 border border-white/10 hover:border-secondary/30 transition-all duration-300"
          @click="exportCSV"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="text-sm font-medium text-white/80 group-hover:text-white">Export CSV</span>
        </button>

        <!-- Import JSON -->
        <button 
          class="group flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
          @click="triggerImport"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span class="text-sm font-medium text-white/80 group-hover:text-white">Import JSON</span>
        </button>

        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleImport"
        />
      </div>

      <!-- Message d'import -->
      <div
        v-if="importMessage"
        class="mt-4 px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300"
        :class="{
          'bg-green-500/20 border border-green-500/30': importMessage.type === 'success',
          'bg-red-500/20 border border-red-500/30': importMessage.type === 'error',
        }"
      >
        <div 
          class="w-6 h-6 rounded-full flex items-center justify-center"
          :class="{
            'bg-green-500/30': importMessage.type === 'success',
            'bg-red-500/30': importMessage.type === 'error',
          }"
        >
          <svg v-if="importMessage.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <span 
          class="text-sm font-medium"
          :class="{
            'text-green-400': importMessage.type === 'success',
            'text-red-400': importMessage.type === 'error',
          }"
        >
          {{ importMessage.text }}
        </span>
      </div>
    </div>
  </div>
</template>
