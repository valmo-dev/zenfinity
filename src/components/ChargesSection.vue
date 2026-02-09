<script setup>
import { ref } from "vue";
import { useBudgetStore } from "../stores/budget";
import EditModal from "./EditModal.vue";

const store = useBudgetStore();

const showEditModal = ref(false);
const selectedItem = ref(null);

function openEdit(item) {
  selectedItem.value = item;
  showEditModal.value = true;
}

function confirmDelete(item) {
  store.deleteItem(item.id);
}

function formatCurrency(value) {
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>

<template>
  <div class="space-y-6">
    <!-- Charges communes -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-5">
        <h3 class="card-title text-base flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Charges communes
          <span class="badge badge-warning badge-sm ml-auto">
            {{ formatCurrency(store.totalCommunalCharges) }} EUR
          </span>
        </h3>

        <div v-if="store.communalChargeItems.length > 0" class="mt-3">
          <div class="space-y-1">
            <div
              v-for="item in store.communalChargeItems"
              :key="item.id"
              class="flex items-center justify-between text-sm py-2 px-3 rounded-lg hover:bg-base-200 transition-colors group"
            >
              <span class="font-medium">{{ item.category }}</span>
              <div class="flex items-center gap-2">
                <span class="tabular-nums">{{ formatCurrency(item.amount) }} EUR</span>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    class="btn btn-ghost btn-xs btn-circle"
                    @click="openEdit(item)"
                    title="Modifier"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    class="btn btn-ghost btn-xs btn-circle text-error"
                    @click="confirmDelete(item)"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Répartition -->
          <div class="divider text-xs my-2">Répartition</div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div
              v-for="owner in store.owners"
              :key="owner"
              class="flex justify-between py-1.5 px-3 bg-base-200/50 rounded"
            >
              <span>{{ owner }} ({{ store.communalChargesDistribution[owner] }}%)</span>
              <span class="tabular-nums font-medium">
                {{ formatCurrency(store.communalChargesShare(owner)) }} EUR
              </span>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-base-content/40 py-4 text-sm">
          Aucune charge commune
        </div>
      </div>
    </div>

    <!-- Charges personnelles -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="(owner, index) in store.owners"
        :key="owner"
        class="card bg-base-100 shadow-lg"
      >
        <div class="card-body p-5">
          <h3 class="card-title text-base flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full"
              :class="{
                'bg-primary': index === 0,
                'bg-secondary': index === 1,
              }"
            ></div>
            Charges {{ owner }}
            <span
              class="badge badge-sm ml-auto"
              :class="{
                'badge-primary': index === 0,
                'badge-secondary': index === 1,
              }"
            >
              {{ formatCurrency(store.personalChargesByOwner(owner)) }} EUR
            </span>
          </h3>

          <div v-if="store.personalChargeItems(owner).length > 0" class="mt-3 space-y-1">
            <div
              v-for="item in store.personalChargeItems(owner)"
              :key="item.id"
              class="flex items-center justify-between text-sm py-2 px-3 rounded-lg hover:bg-base-200 transition-colors group"
            >
              <span>{{ item.category }}</span>
              <div class="flex items-center gap-2">
                <span class="tabular-nums">{{ formatCurrency(item.amount) }} EUR</span>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    class="btn btn-ghost btn-xs btn-circle"
                    @click="openEdit(item)"
                    title="Modifier"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    class="btn btn-ghost btn-xs btn-circle text-error"
                    @click="confirmDelete(item)"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center text-base-content/40 py-4 text-sm">
            Aucune charge personnelle
          </div>
        </div>
      </div>
    </div>

    <EditModal
      :isOpen="showEditModal"
      :item="selectedItem"
      @close="showEditModal = false"
    />
  </div>
</template>
