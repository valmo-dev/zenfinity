<script setup>
import { ref, computed, inject } from "vue";
import { useBudgetStore } from "../stores/budget";
import { formatCurrency } from "../utils/format";
import { Repeat, Pencil, Trash2, Plus, ToggleLeft, ToggleRight, X, Check, Calendar } from "lucide-vue-next";
import ConfirmModal from "./ConfirmModal.vue";
import CategoryAutocomplete from "./CategoryAutocomplete.vue";

const store = useBudgetStore();
const showToast = inject("showToast", () => {});

const MONTH_NAMES = [
  "Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin",
  "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc.",
];

function formatMonth(month) {
  if (!month) return "";
  const [year, m] = month.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${year}`;
}

const isJointMode = computed(() => store.householdMode === "joint");
const isSinglePerson = computed(() => store.owners.length === 1);

// Filtrer : ne montrer que les récurrences actives (pas terminées)
const activeRecurring = computed(() =>
  store.recurringItems.filter((i) => !i.endMonth),
);
const endedRecurring = computed(() =>
  store.recurringItems.filter((i) => i.endMonth),
);

// Grouper par type
const recurringRevenues = computed(() =>
  activeRecurring.value.filter((i) => i.type === "Revenu"),
);
const recurringCharges = computed(() =>
  activeRecurring.value.filter((i) => i.type === "Charge"),
);
const endedRevenues = computed(() =>
  endedRecurring.value.filter((i) => i.type === "Revenu"),
);
const endedCharges = computed(() =>
  endedRecurring.value.filter((i) => i.type === "Charge"),
);

const showEnded = ref(false);

// Formulaire inline d'ajout
const showAddForm = ref(false);
const newType = ref("Charge");
const newOwner = ref(store.owners[0] || "");
const newCategory = ref("");
const newAmount = ref("");
const addFormError = ref("");

const showOwnerSelector = computed(() => {
  if (isSinglePerson.value) return false;
  if (isJointMode.value && newType.value === "Charge") return false;
  return true;
});

const effectiveNewOwner = computed(() => {
  if (isSinglePerson.value) return store.owners[0];
  if (isJointMode.value && newType.value === "Charge") return "Commun";
  return newOwner.value;
});

function resetForm() {
  newType.value = "Charge";
  newOwner.value = store.owners[0] || "";
  newCategory.value = "";
  newAmount.value = "";
  addFormError.value = "";
  showAddForm.value = false;
}

function addRecurring() {
  if (!newCategory.value.trim()) {
    addFormError.value = "La catégorie est requise";
    return;
  }
  if (!newAmount.value || Number(newAmount.value) <= 0) {
    addFormError.value = "Le montant doit être supérieur à 0";
    return;
  }
  addFormError.value = "";
  store.addRecurringItem({
    type: newType.value,
    owner: effectiveNewOwner.value,
    category: newCategory.value.trim(),
    amount: Number(newAmount.value),
  });
  showToast("success", "Récurrence ajoutée");
  resetForm();
}

// Édition inline
const editingId = ref(null);
const editCategory = ref("");
const editAmount = ref(0);
const editFormError = ref("");

function startEdit(item) {
  editingId.value = item.id;
  editCategory.value = item.category;
  editAmount.value = item.amount;
  editFormError.value = "";
}

function saveEdit(id) {
  if (!editCategory.value.trim()) {
    editFormError.value = "La catégorie est requise";
    return;
  }
  if (Number(editAmount.value) <= 0) {
    editFormError.value = "Le montant doit être supérieur à 0";
    return;
  }
  editFormError.value = "";
  store.editRecurringItem(id, {
    category: editCategory.value.trim(),
    amount: Number(editAmount.value),
  });
  editingId.value = null;
  showToast("success", "Récurrence modifiée");
}

function cancelEdit() {
  editingId.value = null;
  editFormError.value = "";
}

// Suppression
const showDeleteConfirm = ref(false);
const itemToDelete = ref(null);

function requestDelete(item) {
  itemToDelete.value = item;
  showDeleteConfirm.value = true;
}

function confirmDelete() {
  if (itemToDelete.value) {
    store.deleteRecurringItem(itemToDelete.value.id);
    showToast("success", `Récurrence "${itemToDelete.value.category}" supprimée`);
    itemToDelete.value = null;
  }
  showDeleteConfirm.value = false;
}

function cancelDelete() {
  itemToDelete.value = null;
  showDeleteConfirm.value = false;
}
</script>

<template>
  <div class="terminal-card overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 flex items-center justify-between border-b border-base-content/[0.06]">
      <div class="flex items-center gap-3">
        <span class="inline-block w-2 h-2 rounded-full bg-accent"></span>
        <span class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/60">Entrées récurrentes</span>
        <span
          v-if="activeRecurring.length > 0"
          class="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/8 text-accent/60"
        >
          {{ activeRecurring.length }} active{{ activeRecurring.length > 1 ? 's' : '' }}
        </span>
      </div>
      <button
        class="brutal-btn brutal-btn-sm bg-accent/10 hover:bg-accent/20 text-accent"
        @click="showAddForm = !showAddForm"
      >
        <Plus :size="14" />
        Ajouter
      </button>
    </div>

    <div class="p-6 space-y-6">
      <!-- Info automatique -->
      <div class="flex items-start gap-3 p-3 bg-accent/5 border border-accent/10 text-xs text-base-content/60">
        <Repeat :size="14" class="text-accent/50 mt-0.5 shrink-0" />
        <span>Les récurrences s'appliquent automatiquement à chaque mois. Vous pouvez les désactiver ou les supprimer depuis les listes de revenus et charges.</span>
      </div>

      <!-- Formulaire d'ajout inline -->
      <Transition name="slide">
        <div v-if="showAddForm" class="p-4 bg-base-content/3 border border-base-content/[0.06] rounded space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label for="recurring-type" class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/60">Type</label>
              <select
                id="recurring-type"
                v-model="newType"
                class="w-full px-3 py-2 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content focus:border-accent/50 focus:outline-none"
              >
                <option value="Revenu" class="bg-base-100">Revenu</option>
                <option value="Charge" class="bg-base-100">Charge</option>
              </select>
            </div>
            <div v-if="showOwnerSelector" class="space-y-1">
              <label for="recurring-owner" class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/60">Assigné à</label>
              <select
                id="recurring-owner"
                v-model="newOwner"
                class="w-full px-3 py-2 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content focus:border-accent/50 focus:outline-none"
              >
                <option v-for="o in store.owners" :key="o" :value="o" class="bg-base-100">{{ o }}</option>
                <option v-if="newType === 'Charge' && !isJointMode" value="Commun" class="bg-base-100">Commun</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label for="recurring-category" class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/60">Catégorie</label>
              <CategoryAutocomplete
                v-model="newCategory"
                :type="newType"
                focus-color="accent"
                input-id="recurring-category"
              />
            </div>
            <div class="space-y-1">
              <label for="recurring-amount" class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/60">Montant (EUR)</label>
              <input
                id="recurring-amount"
                v-model.number="newAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                class="w-full px-3 py-2 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content placeholder-base-content/30 focus:border-accent/50 focus:outline-none"
              />
            </div>
          </div>
          <p v-if="addFormError" class="text-xs font-mono text-error" role="alert">{{ addFormError }}</p>
          <div class="flex justify-end gap-2">
            <button
              class="brutal-btn brutal-btn-sm brutal-btn-ghost"
              @click="resetForm"
            >
              Annuler
            </button>
            <button
              class="brutal-btn brutal-btn-sm bg-accent hover:bg-accent/80 text-accent-content"
              @click="addRecurring"
            >
              Ajouter la récurrence
            </button>
          </div>
        </div>
      </Transition>

      <!-- Revenus récurrents -->
      <div v-if="recurringRevenues.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <div class="h-px flex-1 bg-gradient-to-r from-success/15 to-transparent"></div>
          <span class="text-[10px] font-mono uppercase tracking-[0.15em] text-success/60">Revenus</span>
          <div class="h-px flex-1 bg-gradient-to-l from-success/15 to-transparent"></div>
        </div>
        <div class="space-y-2">
          <div
            v-for="item in recurringRevenues"
            :key="item.id"
            class="flex items-center justify-between py-3 px-4 bg-base-content/3 hover:bg-base-content/5 transition-all duration-200 group flex-wrap"
            :class="{ 'opacity-40': !item.isActive }"
          >
            <template v-if="editingId === item.id">
              <div class="flex items-center gap-2 flex-1">
                <input
                  v-model="editCategory"
                  aria-label="Modifier la catégorie"
                  class="px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content w-32 focus:outline-none focus:border-accent/50"
                />
                <input
                  v-model.number="editAmount"
                  type="number"
                  step="0.01"
                  aria-label="Modifier le montant"
                  class="px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content w-24 focus:outline-none focus:border-accent/50"
                />
              </div>
              <div class="flex gap-1">
                <button class="brutal-icon-btn bg-success/15 hover:bg-success/25" @click="saveEdit(item.id)" aria-label="Enregistrer les modifications">
                  <Check :size="14" class="text-success" />
                </button>
                <button class="brutal-icon-btn" @click="cancelEdit" aria-label="Annuler les modifications">
                  <X :size="14" class="text-base-content/60" />
                </button>
              </div>
              <p v-if="editFormError" class="w-full text-xs font-mono text-error mt-1" role="alert">{{ editFormError }}</p>
            </template>
            <template v-else>
              <div class="flex items-center gap-3">
                <span class="font-medium text-base-content/90">{{ item.category }}</span>
                <span v-if="!isSinglePerson" class="text-xs text-base-content/40">{{ item.owner }}</span>
                <span class="text-[10px] text-base-content/30 flex items-center gap-1" :title="`Depuis ${formatMonth(item.startMonth)}`">
                  <Calendar :size="10" />
                  {{ formatMonth(item.startMonth) }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <span class="tabular-nums font-mono text-success/90">
                  +{{ formatCurrency(item.amount) }} €
                </span>
                <div class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    class="brutal-icon-btn"
                    @click="store.toggleRecurringItem(item.id)"
                    :aria-label="item.isActive ? 'Désactiver' : 'Activer'"
                  >
                    <ToggleRight v-if="item.isActive" :size="14" class="text-success" />
                    <ToggleLeft v-else :size="14" class="text-base-content/40" />
                  </button>
                  <button
                    class="brutal-icon-btn"
                    @click="startEdit(item)"
                    aria-label="Modifier"
                  >
                    <Pencil :size="14" class="text-base-content/60" />
                  </button>
                  <button
                    class="brutal-icon-btn brutal-icon-btn-danger"
                    @click="requestDelete(item)"
                    aria-label="Supprimer"
                  >
                    <Trash2 :size="14" class="text-error" />
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Charges récurrentes -->
      <div v-if="recurringCharges.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <div class="h-px flex-1 bg-gradient-to-r from-error/20 to-transparent"></div>
          <span class="text-[10px] font-mono uppercase tracking-[0.15em] text-error/60">Charges</span>
          <div class="h-px flex-1 bg-gradient-to-l from-error/20 to-transparent"></div>
        </div>
        <div class="space-y-2">
          <div
            v-for="item in recurringCharges"
            :key="item.id"
            class="flex items-center justify-between py-3 px-4 bg-base-content/3 hover:bg-base-content/5 transition-all duration-200 group flex-wrap"
            :class="{ 'opacity-40': !item.isActive }"
          >
            <template v-if="editingId === item.id">
              <div class="flex items-center gap-2 flex-1">
                <input
                  v-model="editCategory"
                  aria-label="Modifier la catégorie"
                  class="px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content w-32 focus:outline-none focus:border-accent/50"
                />
                <input
                  v-model.number="editAmount"
                  type="number"
                  step="0.01"
                  aria-label="Modifier le montant"
                  class="px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content w-24 focus:outline-none focus:border-accent/50"
                />
              </div>
              <div class="flex gap-1">
                <button class="brutal-icon-btn bg-success/15 hover:bg-success/25" @click="saveEdit(item.id)" aria-label="Enregistrer les modifications">
                  <Check :size="14" class="text-success" />
                </button>
                <button class="brutal-icon-btn" @click="cancelEdit" aria-label="Annuler les modifications">
                  <X :size="14" class="text-base-content/60" />
                </button>
              </div>
              <p v-if="editFormError" class="w-full text-xs font-mono text-error mt-1" role="alert">{{ editFormError }}</p>
            </template>
            <template v-else>
              <div class="flex items-center gap-3">
                <span class="font-medium text-base-content/90">{{ item.category }}</span>
                <span v-if="!isSinglePerson" class="text-xs text-base-content/40">{{ item.owner }}</span>
                <span class="text-[10px] text-base-content/30 flex items-center gap-1" :title="`Depuis ${formatMonth(item.startMonth)}`">
                  <Calendar :size="10" />
                  {{ formatMonth(item.startMonth) }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <span class="tabular-nums font-mono text-error/90">
                  −{{ formatCurrency(item.amount) }} €
                </span>
                <div class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    class="brutal-icon-btn"
                    @click="store.toggleRecurringItem(item.id)"
                    :aria-label="item.isActive ? 'Désactiver' : 'Activer'"
                  >
                    <ToggleRight v-if="item.isActive" :size="14" class="text-success" />
                    <ToggleLeft v-else :size="14" class="text-base-content/40" />
                  </button>
                  <button
                    class="brutal-icon-btn"
                    @click="startEdit(item)"
                    aria-label="Modifier"
                  >
                    <Pencil :size="14" class="text-base-content/60" />
                  </button>
                  <button
                    class="brutal-icon-btn brutal-icon-btn-danger"
                    @click="requestDelete(item)"
                    aria-label="Supprimer"
                  >
                    <Trash2 :size="14" class="text-error" />
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Récurrences terminées (historique) -->
      <div v-if="endedRecurring.length > 0">
        <button
          class="w-full flex items-center gap-2 text-xs text-base-content/40 hover:text-base-content/60 transition-colors py-2"
          @click="showEnded = !showEnded"
        >
          <div class="h-px flex-1 bg-base-content/10"></div>
          <span class="font-mono uppercase tracking-[0.15em]">
            {{ showEnded ? 'Masquer' : 'Afficher' }} l'historique ({{ endedRecurring.length }})
          </span>
          <div class="h-px flex-1 bg-base-content/10"></div>
        </button>
        <Transition name="slide">
          <div v-if="showEnded" class="space-y-4 mt-3">
            <!-- Revenus terminés -->
            <div v-if="endedRevenues.length > 0" class="space-y-2">
              <div
                v-for="item in endedRevenues"
                :key="item.id"
                class="flex items-center justify-between py-2 px-4 bg-base-content/2 opacity-50"
              >
                <div class="flex items-center gap-3">
                  <span class="text-sm text-base-content/60">{{ item.category }}</span>
                  <span v-if="!isSinglePerson" class="text-xs text-base-content/30">{{ item.owner }}</span>
                  <span class="text-[10px] text-base-content/30">
                    {{ formatMonth(item.startMonth) }} → {{ formatMonth(item.endMonth) }}
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="tabular-nums font-mono text-sm text-success/40">
                    +{{ formatCurrency(item.amount) }} €
                  </span>
                  <button
                    class="brutal-icon-btn brutal-icon-btn-danger"
                    @click="requestDelete(item)"
                    aria-label="Supprimer définitivement"
                    title="Supprimer définitivement"
                  >
                    <Trash2 :size="12" class="text-error/50" />
                  </button>
                </div>
              </div>
            </div>
            <!-- Charges terminées -->
            <div v-if="endedCharges.length > 0" class="space-y-2">
              <div
                v-for="item in endedCharges"
                :key="item.id"
                class="flex items-center justify-between py-2 px-4 bg-base-content/2 opacity-50"
              >
                <div class="flex items-center gap-3">
                  <span class="text-sm text-base-content/60">{{ item.category }}</span>
                  <span v-if="!isSinglePerson" class="text-xs text-base-content/30">{{ item.owner }}</span>
                  <span class="text-[10px] text-base-content/30">
                    {{ formatMonth(item.startMonth) }} → {{ formatMonth(item.endMonth) }}
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="tabular-nums font-mono text-sm text-error/40">
                    −{{ formatCurrency(item.amount) }} €
                  </span>
                  <button
                    class="brutal-icon-btn brutal-icon-btn-danger"
                    @click="requestDelete(item)"
                    aria-label="Supprimer définitivement"
                    title="Supprimer définitivement"
                  >
                    <Trash2 :size="12" class="text-error/50" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- État vide -->
      <div v-if="activeRecurring.length === 0 && endedRecurring.length === 0" class="text-center py-8">
        <div class="w-12 h-12 rounded-lg bg-base-content/5 flex items-center justify-center mx-auto mb-3">
          <Repeat :size="24" class="text-base-content/40" stroke-width="1.5" />
        </div>
        <p class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/40">Aucune entrée récurrente</p>
        <p class="text-base-content/60 text-xs mt-1">Ajoutez vos revenus et charges fixes pour qu'ils apparaissent automatiquement chaque mois</p>
      </div>
    </div>

    <!-- Confirm delete -->
    <ConfirmModal
      :isOpen="showDeleteConfirm"
      title="Supprimer cette récurrence ?"
      message="Ce template sera définitivement supprimé."
      :itemName="itemToDelete?.category"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
