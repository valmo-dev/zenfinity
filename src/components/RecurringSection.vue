<script setup>
import { ref, computed, inject } from "vue";
import { useBudgetStore } from "../stores/budget";
import { Repeat, Pencil, Trash2, Plus, ToggleLeft, ToggleRight, X, Check } from "lucide-vue-next";
import ConfirmModal from "./ConfirmModal.vue";
import CategoryAutocomplete from "./CategoryAutocomplete.vue";

const store = useBudgetStore();
const showToast = inject("showToast", () => {});

const isJointMode = computed(() => store.householdMode === "joint");
const isSinglePerson = computed(() => store.owners.length === 1);

// Grouper par type
const recurringRevenues = computed(() =>
  store.recurringItems.filter((i) => i.type === "Revenu"),
);
const recurringCharges = computed(() =>
  store.recurringItems.filter((i) => i.type === "Charge"),
);

// Formulaire inline d'ajout
const showAddForm = ref(false);
const newType = ref("Charge");
const newOwner = ref(store.owners[0] || "");
const newCategory = ref("");
const newAmount = ref("");

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
  showAddForm.value = false;
}

function addRecurring() {
  if (!newCategory.value.trim() || !newAmount.value || Number(newAmount.value) <= 0) return;
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

function startEdit(item) {
  editingId.value = item.id;
  editCategory.value = item.category;
  editAmount.value = item.amount;
}

function saveEdit(id) {
  if (!editCategory.value.trim() || Number(editAmount.value) <= 0) return;
  store.editRecurringItem(id, {
    category: editCategory.value.trim(),
    amount: Number(editAmount.value),
  });
  editingId.value = null;
  showToast("success", "Récurrence modifiée");
}

function cancelEdit() {
  editingId.value = null;
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

function formatCurrency(value) {
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>

<template>
  <div class="terminal-card overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 flex items-center justify-between border-b border-base-content/[0.06]">
      <div class="flex items-center gap-3">
        <span class="inline-block w-2 h-2 rounded-full bg-[#B48EAD]"></span>
        <span class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/50">Entrées récurrentes</span>
        <span
          v-if="store.activeRecurringItems.length > 0"
          class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B48EAD]/8 text-[#B48EAD]/60"
        >
          {{ store.activeRecurringItems.length }} active{{ store.activeRecurringItems.length > 1 ? 's' : '' }}
        </span>
      </div>
      <button
        class="brutal-btn brutal-btn-sm bg-[#B48EAD]/10 hover:bg-[#B48EAD]/20 text-[#B48EAD]"
        @click="showAddForm = !showAddForm"
      >
        <Plus :size="14" />
        Ajouter
      </button>
    </div>

    <div class="p-6 space-y-6">
      <!-- Formulaire d'ajout inline -->
      <Transition name="slide">
        <div v-if="showAddForm" class="p-4 bg-base-content/3 border border-base-content/[0.06] rounded space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/50">Type</label>
              <select
                v-model="newType"
                class="w-full px-3 py-2 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content focus:border-[#B48EAD]/50 focus:outline-none"
              >
                <option value="Revenu" class="bg-base-100">Revenu</option>
                <option value="Charge" class="bg-base-100">Charge</option>
              </select>
            </div>
            <div v-if="showOwnerSelector" class="space-y-1">
              <label class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/50">Assigné à</label>
              <select
                v-model="newOwner"
                class="w-full px-3 py-2 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content focus:border-[#B48EAD]/50 focus:outline-none"
              >
                <option v-for="o in store.owners" :key="o" :value="o" class="bg-base-100">{{ o }}</option>
                <option v-if="newType === 'Charge' && !isJointMode" value="Commun" class="bg-base-100">Commun</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/50">Catégorie</label>
              <CategoryAutocomplete
                v-model="newCategory"
                :type="newType"
                focus-color="[#B48EAD]"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/50">Montant (EUR)</label>
              <input
                v-model.number="newAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                class="w-full px-3 py-2 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content placeholder-base-content/30 focus:border-[#B48EAD]/50 focus:outline-none"
              />
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button
              class="brutal-btn brutal-btn-sm brutal-btn-ghost"
              @click="resetForm"
            >
              Annuler
            </button>
            <button
              class="brutal-btn brutal-btn-sm bg-[#B48EAD] hover:bg-[#B48EAD]/80 text-[#2E3440]"
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
          <div class="h-px flex-1 bg-gradient-to-r from-[#A3BE8C]/15 to-transparent"></div>
          <span class="text-[10px] font-mono uppercase tracking-[0.15em] text-[#A3BE8C]/60">Revenus</span>
          <div class="h-px flex-1 bg-gradient-to-l from-[#A3BE8C]/15 to-transparent"></div>
        </div>
        <div class="space-y-2">
          <div
            v-for="item in recurringRevenues"
            :key="item.id"
            class="flex items-center justify-between py-3 px-4 bg-base-content/3 hover:bg-base-content/5 transition-all duration-200 group"
            :class="{ 'opacity-40': !item.isActive }"
          >
            <template v-if="editingId === item.id">
              <div class="flex items-center gap-2 flex-1">
                <input
                  v-model="editCategory"
                  class="px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content w-32 focus:outline-none focus:border-[#B48EAD]/50"
                />
                <input
                  v-model.number="editAmount"
                  type="number"
                  step="0.01"
                  class="px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content w-24 focus:outline-none focus:border-[#B48EAD]/50"
                />
              </div>
              <div class="flex gap-1">
                <button class="brutal-icon-btn bg-[#A3BE8C]/15 hover:bg-[#A3BE8C]/25" @click="saveEdit(item.id)">
                  <Check :size="14" class="text-[#A3BE8C]" />
                </button>
                <button class="brutal-icon-btn" @click="cancelEdit">
                  <X :size="14" class="text-base-content/60" />
                </button>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center gap-3">
                <span class="font-medium text-base-content/90">{{ item.category }}</span>
                <span v-if="!isSinglePerson" class="text-xs text-base-content/40">{{ item.owner }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="tabular-nums font-mono text-[#A3BE8C]/90">
                  +{{ formatCurrency(item.amount) }} €
                </span>
                <div class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    class="brutal-icon-btn"
                    @click="store.toggleRecurringItem(item.id)"
                    :title="item.isActive ? 'Désactiver' : 'Activer'"
                  >
                    <ToggleRight v-if="item.isActive" :size="14" class="text-[#A3BE8C]" />
                    <ToggleLeft v-else :size="14" class="text-base-content/40" />
                  </button>
                  <button
                    class="brutal-icon-btn"
                    @click="startEdit(item)"
                    title="Modifier"
                  >
                    <Pencil :size="14" class="text-base-content/60" />
                  </button>
                  <button
                    class="brutal-icon-btn brutal-icon-btn-danger"
                    @click="requestDelete(item)"
                    title="Supprimer"
                  >
                    <Trash2 :size="14" class="text-[#BF616A]" />
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
          <div class="h-px flex-1 bg-gradient-to-r from-[#BF616A]/20 to-transparent"></div>
          <span class="text-[10px] font-mono uppercase tracking-[0.15em] text-[#BF616A]/60">Charges</span>
          <div class="h-px flex-1 bg-gradient-to-l from-[#BF616A]/20 to-transparent"></div>
        </div>
        <div class="space-y-2">
          <div
            v-for="item in recurringCharges"
            :key="item.id"
            class="flex items-center justify-between py-3 px-4 bg-base-content/3 hover:bg-base-content/5 transition-all duration-200 group"
            :class="{ 'opacity-40': !item.isActive }"
          >
            <template v-if="editingId === item.id">
              <div class="flex items-center gap-2 flex-1">
                <input
                  v-model="editCategory"
                  class="px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content w-32 focus:outline-none focus:border-[#B48EAD]/50"
                />
                <input
                  v-model.number="editAmount"
                  type="number"
                  step="0.01"
                  class="px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content w-24 focus:outline-none focus:border-[#B48EAD]/50"
                />
              </div>
              <div class="flex gap-1">
                <button class="brutal-icon-btn bg-[#A3BE8C]/15 hover:bg-[#A3BE8C]/25" @click="saveEdit(item.id)">
                  <Check :size="14" class="text-[#A3BE8C]" />
                </button>
                <button class="brutal-icon-btn" @click="cancelEdit">
                  <X :size="14" class="text-base-content/60" />
                </button>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center gap-3">
                <span class="font-medium text-base-content/90">{{ item.category }}</span>
                <span v-if="!isSinglePerson" class="text-xs text-base-content/40">{{ item.owner }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="tabular-nums font-mono text-[#BF616A]/90">
                  −{{ formatCurrency(item.amount) }} €
                </span>
                <div class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    class="brutal-icon-btn"
                    @click="store.toggleRecurringItem(item.id)"
                    :title="item.isActive ? 'Désactiver' : 'Activer'"
                  >
                    <ToggleRight v-if="item.isActive" :size="14" class="text-[#A3BE8C]" />
                    <ToggleLeft v-else :size="14" class="text-base-content/40" />
                  </button>
                  <button
                    class="brutal-icon-btn"
                    @click="startEdit(item)"
                    title="Modifier"
                  >
                    <Pencil :size="14" class="text-base-content/60" />
                  </button>
                  <button
                    class="brutal-icon-btn brutal-icon-btn-danger"
                    @click="requestDelete(item)"
                    title="Supprimer"
                  >
                    <Trash2 :size="14" class="text-[#BF616A]" />
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-if="store.recurringItems.length === 0" class="text-center py-8">
        <div class="w-12 h-12 rounded-lg bg-base-content/5 flex items-center justify-center mx-auto mb-3">
          <Repeat :size="24" class="text-base-content/40" stroke-width="1.5" />
        </div>
        <p class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/40">Aucune entrée récurrente</p>
        <p class="text-base-content/50 text-xs mt-1">Ajoutez vos revenus et charges fixes pour les réutiliser chaque mois</p>
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
