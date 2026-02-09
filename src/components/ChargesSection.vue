<script setup>
import { ref, inject } from "vue";
import { useBudgetStore } from "../stores/budget";
import EditModal from "./EditModal.vue";
import ConfirmModal from "./ConfirmModal.vue";

const store = useBudgetStore();
const showToast = inject("showToast", () => {});

const showEditModal = ref(false);
const selectedItem = ref(null);

// Confirmation de suppression
const showDeleteConfirm = ref(false);
const itemToDelete = ref(null);

function openEdit(item) {
  selectedItem.value = item;
  showEditModal.value = true;
}

function handleEditClose() {
  showEditModal.value = false;
  showToast("success", "Entrée modifiée avec succès");
}

function requestDelete(item) {
  itemToDelete.value = item;
  showDeleteConfirm.value = true;
}

function confirmDelete() {
  if (itemToDelete.value) {
    const categoryName = itemToDelete.value.category;
    store.deleteItem(itemToDelete.value.id);
    showToast("success", `"${categoryName}" supprimé`);
    itemToDelete.value = null;
  }
  showDeleteConfirm.value = false;
}

function cancelDelete() {
  itemToDelete.value = null;
  showDeleteConfirm.value = false;
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
    <div class="glass-card rounded-2xl overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold flex items-center gap-3 text-white">
            <div class="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            Charges communes
          </h3>
          <span 
            class="px-4 py-1.5 rounded-full text-sm font-bold bg-amber-500/20 text-amber-400"
            title="Total des charges communes"
          >
            {{ formatCurrency(store.totalCommunalCharges) }} €
          </span>
        </div>
      </div>

      <div class="p-6">
        <div v-if="store.communalChargeItems.length > 0">
          <!-- Liste des charges -->
          <div class="space-y-2">
            <div
              v-for="item in store.communalChargeItems"
              :key="item.id"
              class="flex items-center justify-between py-3 px-4 rounded-xl bg-white/3 hover:bg-white/5 transition-all duration-200 group"
            >
              <span class="font-medium text-white/90">{{ item.category }}</span>
              <div class="flex items-center gap-3">
                <span class="tabular-nums font-mono text-amber-400">
                  −{{ formatCurrency(item.amount) }} €
                </span>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    @click="openEdit(item)"
                    title="Modifier cette entrée"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    class="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                    @click="requestDelete(item)"
                    title="Supprimer cette entrée"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Répartition -->
          <div class="mt-6 pt-4 border-t border-white/5">
            <div class="flex items-center gap-3 mb-4">
              <div class="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
              <span class="text-xs font-medium text-white/50 uppercase tracking-wider">Répartition</span>
              <div class="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="(owner, index) in store.owners"
                :key="owner"
                class="flex justify-between items-center py-3 px-4 rounded-xl bg-white/3"
                :title="`Part de ${owner} basée sur ${store.communalChargesDistribution[owner]}% du total`"
              >
                <div class="flex items-center gap-2">
                  <div 
                    class="w-2 h-2 rounded-full"
                    :class="index === 0 ? 'bg-primary' : 'bg-secondary'"
                  ></div>
                  <span class="text-white/80">{{ owner }}</span>
                  <span class="text-white/50 text-xs">({{ store.communalChargesDistribution[owner] }}%)</span>
                </div>
                <span class="tabular-nums font-mono font-medium text-white">
                  {{ formatCurrency(store.communalChargesShare(owner)) }} €
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div v-else class="text-center py-8">
          <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p class="text-white/50 text-sm">Aucune charge commune</p>
          <p class="text-white/30 text-xs mt-1">Ajoutez une charge commune via le bouton "Ajouter"</p>
        </div>
      </div>
    </div>

    <!-- Charges personnelles -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="(owner, index) in store.owners"
        :key="owner"
        class="glass-card rounded-2xl overflow-hidden"
      >
        <!-- Header -->
        <div 
          class="px-6 py-4 border-b border-white/5"
          :class="index === 0 ? 'bg-gradient-to-r from-primary/15 to-transparent' : 'bg-gradient-to-r from-secondary/15 to-transparent'"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold flex items-center gap-3 text-white">
              <div 
                class="w-3 h-3 rounded-full"
                :class="index === 0 ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-secondary shadow-lg shadow-secondary/50'"
              ></div>
              Charges {{ owner }}
            </h3>
            <span 
              class="px-3 py-1 rounded-full text-sm font-bold"
              :class="index === 0 ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'"
              :title="`Total des charges personnelles de ${owner}`"
            >
              {{ formatCurrency(store.personalChargesByOwner(owner)) }} €
            </span>
          </div>
        </div>

        <div class="p-6">
          <div v-if="store.personalChargeItems(owner).length > 0" class="space-y-2">
            <div
              v-for="item in store.personalChargeItems(owner)"
              :key="item.id"
              class="flex items-center justify-between py-3 px-4 rounded-xl bg-white/3 hover:bg-white/5 transition-all duration-200 group"
            >
              <span class="text-white/90">{{ item.category }}</span>
              <div class="flex items-center gap-3">
                <span class="tabular-nums font-mono text-red-400/90">
                  −{{ formatCurrency(item.amount) }} €
                </span>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    @click="openEdit(item)"
                    title="Modifier cette entrée"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    class="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                    @click="requestDelete(item)"
                    title="Supprimer cette entrée"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- État vide -->
          <div v-else class="text-center py-8">
            <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p class="text-white/50 text-sm">Aucune charge personnelle</p>
            <p class="text-white/30 text-xs mt-1">Ajoutez une charge via le bouton "Ajouter"</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <EditModal
      :isOpen="showEditModal"
      :item="selectedItem"
      @close="handleEditClose"
    />

    <ConfirmModal
      :isOpen="showDeleteConfirm"
      title="Supprimer cette entrée ?"
      message="Cette charge sera définitivement supprimée de votre budget."
      :itemName="itemToDelete?.category"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>
