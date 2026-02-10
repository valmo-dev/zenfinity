<script setup>
import { ref, inject, computed } from "vue";
import { useBudgetStore } from "../stores/budget";
import { Users, Pencil, Trash2, Plus } from "lucide-vue-next";
import EditModal from "./EditModal.vue";
import ConfirmModal from "./ConfirmModal.vue";
import BudgetProgressBar from "./BudgetProgressBar.vue";

const store = useBudgetStore();
const showToast = inject("showToast", () => {});

const showEditModal = ref(false);
const selectedItem = ref(null);

// Confirmation de suppression
const showDeleteConfirm = ref(false);
const itemToDelete = ref(null);

const isSinglePerson = computed(() => store.owners.length === 1);
const isJointMode = computed(() => store.householdMode === "joint");

// En mode 1 personne, fusionner charges communes + personnelles
function allChargeItems(owner) {
  const personal = store.personalChargeItems(owner);
  if (isSinglePerson.value) {
    return [...personal, ...store.communalChargeItems];
  }
  return personal;
}

// Total charges personnelles (inclut communes en mode 1 personne)
function allChargesTotal(owner) {
  const personal = store.personalChargesByOwner(owner);
  if (isSinglePerson.value) {
    return personal + store.totalCommunalCharges;
  }
  return personal;
}

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

// Feature 3 : Catégories avec budget - tracking des catégories déjà affichées
// pour montrer la barre une seule fois par catégorie
function getCategoryBudgetStatus(category, owner) {
  return store.categoryBudgetStatus(category, owner);
}

// Extraire les catégories uniques d'une liste d'items pour afficher les barres budget
function uniqueCategories(items) {
  const seen = new Set();
  return items
    .map((i) => i.category)
    .filter((cat) => {
      if (seen.has(cat)) return false;
      seen.add(cat);
      return store.categoryBudgets[cat] != null;
    });
}
</script>

<template>
  <div class="space-y-6">
    <!-- Mode joint : une seule liste de charges du foyer -->
    <div v-if="isJointMode" class="glass-card rounded-none overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b-3 border-brutal bg-blue-500/20">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold flex items-center gap-3 text-base-content">
            <div class="w-8 h-8 rounded-none bg-blue-500/20 flex items-center justify-center">
              <Users :size="16" class="text-blue-400" />
            </div>
            Charges du foyer
          </h3>
          <span 
            class="px-4 py-1.5 rounded-none text-sm font-bold bg-blue-500/20 text-blue-400"
            title="Total des charges du foyer"
          >
            {{ formatCurrency(store.totalCharges) }} €
          </span>
        </div>
      </div>

      <div class="p-6">
        <div v-if="store.allChargeItems.length > 0" class="space-y-2">
          <div
            v-for="item in store.allChargeItems"
            :key="item.id"
            class="flex items-center justify-between py-3 px-4 rounded-none bg-base-content/3 hover:bg-base-content/5 transition-all duration-200 group"
          >
            <span class="font-medium text-base-content/90">{{ item.category }}</span>
            <div class="flex items-center gap-3">
              <span class="tabular-nums font-mono text-red-400/90">
                −{{ formatCurrency(item.amount) }} €
              </span>
                <div class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    class="brutal-icon-btn"
                    @click="openEdit(item)"
                    title="Modifier cette entrée"
                  >
                    <Pencil :size="14" class="text-base-content/60" />
                  </button>
                  <button
                    class="brutal-icon-btn brutal-icon-btn-danger"
                    @click="requestDelete(item)"
                    title="Supprimer cette entrée"
                  >
                    <Trash2 :size="14" class="text-red-400" />
                  </button>
                </div>
            </div>
          </div>

          <!-- Budget bars par catégorie (mode joint) -->
          <div v-if="uniqueCategories(store.allChargeItems).length > 0" class="mt-4 pt-3 border-t border-brutal space-y-3">
            <div v-for="cat in uniqueCategories(store.allChargeItems)" :key="cat" class="px-4">
              <p class="text-xs text-base-content/50 mb-1">{{ cat }}</p>
              <BudgetProgressBar
                :spent="store.categorySpending(cat)"
                :budget="store.categoryBudgets[cat].global"
              />
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div v-else class="text-center py-8">
          <div class="w-12 h-12 rounded-none bg-base-content/5 flex items-center justify-center mx-auto mb-3">
            <Users :size="24" class="text-base-content/40" stroke-width="1.5" />
          </div>
          <p class="text-base-content/50 text-sm">Aucune charge</p>
          <p class="text-base-content/30 text-xs mt-1">Ajoutez une charge via le bouton "Ajouter"</p>
        </div>
      </div>
    </div>

    <!-- Mode separate : charges communes (masqué en mode 1 personne et joint) -->
    <div v-if="!isSinglePerson && !isJointMode" class="glass-card rounded-none overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b-3 border-brutal bg-amber-500/20">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold flex items-center gap-3 text-base-content">
            <div class="w-8 h-8 rounded-none bg-amber-500/20 flex items-center justify-center">
              <Users :size="16" class="text-amber-400" />
            </div>
            Charges communes
          </h3>
          <span 
            class="px-4 py-1.5 rounded-none text-sm font-bold bg-amber-500/20 text-amber-400"
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
              class="flex items-center justify-between py-3 px-4 rounded-none bg-base-content/3 hover:bg-base-content/5 transition-all duration-200 group"
            >
              <span class="font-medium text-base-content/90">{{ item.category }}</span>
              <div class="flex items-center gap-3">
                <span class="tabular-nums font-mono text-amber-400">
                  −{{ formatCurrency(item.amount) }} €
                </span>
                <div class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    class="w-8 h-8 rounded-none bg-base-content/5 hover:bg-base-content/10 flex items-center justify-center transition-colors"
                    @click="openEdit(item)"
                    title="Modifier cette entrée"
                  >
                    <Pencil :size="14" class="text-base-content/60" />
                  </button>
                  <button
                    class="w-8 h-8 rounded-none bg-base-content/5 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                    @click="requestDelete(item)"
                    title="Supprimer cette entrée"
                  >
                    <Trash2 :size="14" class="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Budget bars par catégorie (charges communes) -->
          <div v-if="uniqueCategories(store.communalChargeItems).length > 0" class="mt-4 pt-3 border-t border-brutal space-y-3">
            <div v-for="cat in uniqueCategories(store.communalChargeItems)" :key="cat" class="px-4">
              <p class="text-xs text-base-content/50 mb-1">{{ cat }}</p>
              <BudgetProgressBar
                :spent="store.categorySpending(cat)"
                :budget="store.categoryBudgets[cat].global"
              />
            </div>
          </div>

          <!-- Répartition (seulement pour 2 personnes) -->
          <div v-if="!isSinglePerson" class="mt-6 pt-4 border-t border-brutal">
            <div class="flex items-center gap-3 mb-4">
              <div class="h-px flex-1 bg-gradient-to-r from-base-content/10 to-transparent"></div>
              <span class="text-xs font-medium text-base-content/50 uppercase tracking-wider">Répartition</span>
              <div class="h-px flex-1 bg-gradient-to-l from-base-content/10 to-transparent"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="(owner, index) in store.owners"
                :key="owner"
                class="flex justify-between items-center py-3 px-4 rounded-none bg-base-content/3"
                :title="`Part de ${owner} basée sur ${store.communalChargesDistribution[owner]}% du total`"
              >
                <div class="flex items-center gap-2">
                  <div 
class="w-2 h-2 rounded-full"
                    :class="index === 0 ? 'bg-primary' : 'bg-secondary'"
                  ></div>
                  <span class="text-base-content/80">{{ owner }}</span>
                  <span class="text-base-content/50 text-xs">({{ store.communalChargesDistribution[owner] }}%)</span>
                </div>
                <span class="tabular-nums font-mono font-medium text-base-content">
                  {{ formatCurrency(store.communalChargesShare(owner)) }} €
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div v-else class="text-center py-8">
          <div class="w-12 h-12 rounded-none bg-base-content/5 flex items-center justify-center mx-auto mb-3">
            <Users :size="24" class="text-base-content/40" stroke-width="1.5" />
          </div>
          <p class="text-base-content/50 text-sm">Aucune charge commune</p>
          <p class="text-base-content/30 text-xs mt-1">Ajoutez une charge commune via le bouton "Ajouter"</p>
        </div>
      </div>
    </div>

    <!-- Charges personnelles (masqué en mode joint) -->
    <div
      v-if="!isJointMode"
      class="grid grid-cols-1 gap-6"
      :class="{ 'lg:grid-cols-2': !isSinglePerson }"
    >
      <div
        v-for="(owner, index) in store.owners"
        :key="owner"
        class="glass-card rounded-none overflow-hidden"
      >
        <!-- Header -->
        <div 
          class="px-6 py-4 border-b-3 border-brutal"
          :class="index === 0 ? 'bg-primary/20' : 'bg-secondary/20'"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold flex items-center gap-3 text-base-content">
              <div 
class="w-3 h-3 rounded-full"
                :class="index === 0 ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-secondary shadow-lg shadow-secondary/50'"
              ></div>
              Charges {{ owner }}
            </h3>
            <span 
              class="px-3 py-1 rounded-none text-sm font-bold"
              :class="index === 0 ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'"
              :title="`Total des charges personnelles de ${owner}`"
            >
              {{ formatCurrency(allChargesTotal(owner)) }} €
            </span>
          </div>
        </div>

        <div class="p-6">
          <div v-if="allChargeItems(owner).length > 0" class="space-y-2">
            <div
              v-for="item in allChargeItems(owner)"
              :key="item.id"
              class="flex items-center justify-between py-3 px-4 rounded-none bg-base-content/3 hover:bg-base-content/5 transition-all duration-200 group"
            >
              <span class="text-base-content/90">{{ item.category }}</span>
              <div class="flex items-center gap-3">
                <span class="tabular-nums font-mono text-red-400/90">
                  −{{ formatCurrency(item.amount) }} €
                </span>
                <div class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    class="brutal-icon-btn"
                    @click="openEdit(item)"
                    title="Modifier cette entrée"
                  >
                    <Pencil :size="14" class="text-base-content/60" />
                  </button>
                  <button
                    class="brutal-icon-btn brutal-icon-btn-danger"
                    @click="requestDelete(item)"
                    title="Supprimer cette entrée"
                  >
                    <Trash2 :size="14" class="text-red-400" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Budget bars par catégorie (charges personnelles) -->
            <div v-if="uniqueCategories(allChargeItems(owner)).length > 0" class="mt-4 pt-3 border-t border-brutal space-y-3">
              <div v-for="cat in uniqueCategories(allChargeItems(owner))" :key="cat" class="px-4">
                <p class="text-xs text-base-content/50 mb-1">{{ cat }}</p>
                <BudgetProgressBar
                  :spent="store.categorySpending(cat, owner)"
                  :budget="(store.categoryBudgets[cat]?.perPerson?.[owner] ?? store.categoryBudgets[cat]?.global) || 0"
                />
              </div>
            </div>
          </div>

          <!-- État vide -->
          <div v-else class="text-center py-8">
            <div class="w-12 h-12 rounded-none bg-base-content/5 flex items-center justify-center mx-auto mb-3">
              <Plus :size="24" class="text-base-content/40" stroke-width="1.5" />
            </div>
            <p class="text-base-content/50 text-sm">Aucune charge personnelle</p>
            <p class="text-base-content/30 text-xs mt-1">Ajoutez une charge via le bouton "Ajouter"</p>
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
