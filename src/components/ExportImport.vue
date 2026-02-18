<script setup>
import { ref } from "vue";
import { useBudgetStore } from "../stores/budget";
import { Upload, Download, Check, X } from "lucide-vue-next";

const store = useBudgetStore();
const importMessage = ref(null);
const fileInput = ref(null);
const importFullRestore = ref(false);

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
    const result = store.importJSON(e.target.result, importFullRestore.value ? "full" : "month");
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
  <div class="terminal-card overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 flex items-center justify-between border-b border-base-content/[0.06]">
      <div class="flex items-center gap-3">
        <span class="inline-block w-2 h-2 rounded-full bg-accent"></span>
        <span class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/60">Import / Export</span>
      </div>
      <Upload :size="16" class="text-base-content/30" />
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
          class="brutal-btn bg-base-content/5 hover:bg-accent/20"
          @click="triggerImport"
        >
          <Upload :size="16" class="text-accent" />
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

      <!-- Import mode toggle -->
      <label class="flex items-center gap-2 mt-3 cursor-pointer select-none">
        <input type="checkbox" v-model="importFullRestore" class="checkbox checkbox-xs checkbox-primary" />
        <span class="text-xs text-base-content/60">Restauration complète</span>
        <span class="text-[10px] font-mono text-base-content/30">(remplace toutes les données)</span>
      </label>

      <p class="text-[10px] font-mono text-base-content/40 mt-3">JSON : toutes les données · CSV : mois sélectionné uniquement</p>

      <!-- Message d'import -->
      <div
        v-if="importMessage"
        class="mt-4 px-4 py-3 flex items-center gap-3 transition-all duration-300"
        :class="{
          'bg-success/15 border border-success/30 rounded': importMessage.type === 'success',
          'bg-error/15 border border-error/30 rounded': importMessage.type === 'error',
        }"
      >
        <div 
          class="w-6 h-6 flex items-center justify-center"
          :class="{
            'bg-success/30': importMessage.type === 'success',
            'bg-error/30': importMessage.type === 'error',
          }"
        >
          <Check v-if="importMessage.type === 'success'" :size="16" class="text-success" />
          <X v-else :size="16" class="text-error" />
        </div>
        <span 
          class="text-sm font-medium"
          :class="{
            'text-success': importMessage.type === 'success',
            'text-error': importMessage.type === 'error',
          }"
        >
          {{ importMessage.text }}
        </span>
      </div>
    </div>
  </div>
</template>
