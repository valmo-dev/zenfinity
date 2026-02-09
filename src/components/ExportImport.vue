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
  <div class="card bg-base-100 shadow-lg">
    <div class="card-body p-5">
      <h3 class="card-title text-base flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import / Export
      </h3>

      <div class="flex flex-wrap gap-2 mt-3">
        <button class="btn btn-sm btn-outline btn-primary" @click="exportJSON">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export JSON
        </button>
        <button class="btn btn-sm btn-outline btn-secondary" @click="exportCSV">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
        <button class="btn btn-sm btn-outline btn-accent" @click="triggerImport">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import JSON
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleImport"
        />
      </div>

      <div
        v-if="importMessage"
        class="alert mt-3"
        :class="{
          'alert-success': importMessage.type === 'success',
          'alert-error': importMessage.type === 'error',
        }"
      >
        <span class="text-sm">{{ importMessage.text }}</span>
      </div>
    </div>
  </div>
</template>
