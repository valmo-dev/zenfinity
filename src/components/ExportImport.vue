<script setup>
import { ref } from "vue";
import { useBudgetStore } from "../stores/budget";
import { Upload, Download, Check, X } from "lucide-vue-next";

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
  downloadFile(json, `zenfinity-export-${store.selectedMonth}.json`, "application/json");
}

function exportCSV() {
  const csv = store.exportCSV();
  downloadFile(csv, `zenfinity-${store.selectedMonth}.csv`, "text/csv;charset=utf-8");
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
  <div class="glass-card rounded-none overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 bg-purple-500/20 border-b-3 border-brutal">
      <h3 class="text-lg font-bold flex items-center gap-3 text-base-content">
        <div class="w-8 h-8 rounded-none bg-purple-500/20 flex items-center justify-center">
          <Upload :size="16" class="text-purple-400" />
        </div>
        Import / Export
      </h3>
    </div>

    <div class="p-6">
      <!-- Boutons -->
      <div class="flex flex-wrap gap-3">
        <!-- Export JSON -->
        <button 
          class="brutal-btn bg-base-content/5 hover:bg-primary/20"
          @click="exportJSON"
        >
          <Download :size="16" class="text-primary" />
          <span class="text-sm font-medium">Export JSON</span>
        </button>

        <!-- Export CSV -->
        <button 
          class="brutal-btn bg-base-content/5 hover:bg-secondary/20"
          @click="exportCSV"
        >
          <Download :size="16" class="text-secondary" />
          <span class="text-sm font-medium">Export CSV</span>
        </button>

        <!-- Import JSON -->
        <button 
          class="brutal-btn bg-base-content/5 hover:bg-purple-500/20"
          @click="triggerImport"
        >
          <Upload :size="16" class="text-purple-400" />
          <span class="text-sm font-medium">Import JSON</span>
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
        class="mt-4 px-4 py-3 rounded-none flex items-center gap-3 transition-all duration-300"
        :class="{
          'bg-green-500/20 border border-green-500/30': importMessage.type === 'success',
          'bg-red-500/20 border border-red-500/30': importMessage.type === 'error',
        }"
      >
        <div 
          class="w-6 h-6 rounded-none flex items-center justify-center"
          :class="{
            'bg-green-500/30': importMessage.type === 'success',
            'bg-red-500/30': importMessage.type === 'error',
          }"
        >
          <Check v-if="importMessage.type === 'success'" :size="16" class="text-green-400" />
          <X v-else :size="16" class="text-red-400" />
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
