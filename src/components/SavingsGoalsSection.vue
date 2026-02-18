<script setup>
import { ref, computed, inject } from "vue";
import { useBudgetStore } from "../stores/budget";
import { formatCurrency } from "../utils/format";
import { Target, Plus, Pencil, Trash2, ChevronDown, ChevronUp, X, Check, Users } from "lucide-vue-next";
import ConfirmModal from "./ConfirmModal.vue";

const store = useBudgetStore();
const showToast = inject("showToast", () => {});

// Formulaire d'ajout
const showAddForm = ref(false);
const newName = ref("");
const newTarget = ref("");
const newOwner = ref(null); // null = commun
const addFormError = ref("");

// Afficher le sélecteur de propriétaire (2+ personnes)
const showOwnerSelector = computed(() => store.owners.length > 1);

function addGoal() {
  if (!newName.value.trim()) {
    addFormError.value = "Le nom de l'objectif est requis";
    return;
  }
  if (!newTarget.value || Number(newTarget.value) <= 0) {
    addFormError.value = "Le montant cible doit être supérieur à 0";
    return;
  }
  addFormError.value = "";
  store.addGoal({
    name: newName.value.trim(),
    targetAmount: Number(newTarget.value),
    owner: newOwner.value,
  });
  showToast("success", `Objectif "${newName.value.trim()}" créé`);
  newName.value = "";
  newTarget.value = "";
  newOwner.value = null;
  addFormError.value = "";
  showAddForm.value = false;
}

// Édition
const editingId = ref(null);
const editName = ref("");
const editTarget = ref(0);
const editOwner = ref(null);
const editFormError = ref("");

function startEdit(goal) {
  editingId.value = goal.id;
  editName.value = goal.name;
  editTarget.value = goal.targetAmount;
  editOwner.value = goal.owner ?? null;
  editFormError.value = "";
}

function saveEdit(id) {
  if (!editName.value.trim()) {
    editFormError.value = "Le nom de l'objectif est requis";
    return;
  }
  if (Number(editTarget.value) <= 0) {
    editFormError.value = "Le montant cible doit être supérieur à 0";
    return;
  }
  editFormError.value = "";
  store.editGoal(id, {
    name: editName.value.trim(),
    targetAmount: Number(editTarget.value),
    owner: editOwner.value,
  });
  editingId.value = null;
  showToast("success", "Objectif modifié");
}

function cancelEdit() {
  editingId.value = null;
  editFormError.value = "";
}

// Suppression
const showDeleteConfirm = ref(false);
const goalToDelete = ref(null);

function requestDelete(goal) {
  goalToDelete.value = goal;
  showDeleteConfirm.value = true;
}

function confirmDelete() {
  if (goalToDelete.value) {
    store.deleteGoal(goalToDelete.value.id);
    showToast("success", `Objectif "${goalToDelete.value.name}" supprimé`);
    goalToDelete.value = null;
  }
  showDeleteConfirm.value = false;
}

function cancelDelete() {
  goalToDelete.value = null;
  showDeleteConfirm.value = false;
}

// Détail (historique des allocations)
const expandedGoalId = ref(null);

function toggleDetail(goalId) {
  expandedGoalId.value = expandedGoalId.value === goalId ? null : goalId;
}

// Allocation du mois en cours
function getAllocation(goalId, allocOwner = undefined) {
  return store.goalAllocationForMonth(goalId, store.selectedMonth, allocOwner);
}

function setAllocation(goalId, value, allocOwner = null) {
  const amount = Number(value);
  if (amount >= 0) {
    store.allocateToGoal(goalId, store.selectedMonth, amount, allocOwner);
  }
}

// Un objectif commun nécessite des inputs par personne quand il y a 2+ owners
function isCommonWithMultipleOwners(goal) {
  return goal.owner === null && store.owners.length > 1;
}

// Indicateurs par objectif (contextuels selon l'owner)

// Épargne potentielle selon le propriétaire de l'objectif
function goalSavingPotential(goal) {
  if (store.isJointMode) {
    // En mode joint, toute l'épargne est mutualisée
    return store.foyerSavingPotential;
  }
  if (goal.owner) {
    // Objectif personnel : épargne de cette personne uniquement
    return store.savingPotential(goal.owner);
  }
  // Objectif commun : somme de toutes les épargnes
  if (store.owners.length === 1) {
    return store.savingPotential(store.owners[0]);
  }
  return store.owners.reduce(
    (sum, owner) => sum + store.savingPotential(owner),
    0,
  );
}

// Total alloué ce mois à tous les objectifs du même contexte owner
function goalContextAllocated(goal) {
  const month = store.selectedMonth;
  // En mode joint, tous les objectifs partagent le même pool
  if (store.isJointMode) {
    return store.savingsGoals.reduce((sum, g) => {
      return sum + g.allocations
        .filter((a) => a.month === month)
        .reduce((s, a) => s + Number(a.amount), 0);
    }, 0);
  }
  // Objectif personnel : somme des allocations de tous les objectifs du même owner
  if (goal.owner) {
    return store.savingsGoals
      .filter((g) => g.owner === goal.owner)
      .reduce((sum, g) => {
        return sum + g.allocations
          .filter((a) => a.month === month)
          .reduce((s, a) => s + Number(a.amount), 0);
      }, 0);
  }
  // Objectif commun : somme de toutes les allocations des objectifs communs
  return store.savingsGoals
    .filter((g) => g.owner === null)
    .reduce((sum, g) => {
      return sum + g.allocations
        .filter((a) => a.month === month)
        .reduce((s, a) => s + Number(a.amount), 0);
    }, 0);
}

// Reste disponible pour le contexte de cet objectif
function goalContextRemaining(goal) {
  return Math.max(0, Number((goalSavingPotential(goal) - goalContextAllocated(goal)).toFixed(2)));
}



const MONTH_NAMES = [
  "Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin",
  "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc.",
];

function formatMonth(monthStr) {
  const [year, month] = monthStr.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function ownerLabel(goal) {
  return goal.owner ?? "Commun";
}

function ownerColorClass(goal) {
  if (!goal.owner) return "bg-info/15 text-info";
  const idx = store.owners.indexOf(goal.owner);
  return idx === 0 ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary";
}
</script>

<template>
  <div class="terminal-card overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 flex items-center justify-between border-b border-base-content/[0.06]">
      <div class="flex items-center gap-3">
        <span class="inline-block w-2 h-2 rounded-full bg-warning"></span>
        <span class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/60">Objectifs d'épargne</span>
        <span
          v-if="store.savingsGoals.length > 0"
          class="text-[10px] font-mono px-2 py-0.5 rounded bg-warning/8 text-warning/60"
        >
          {{ store.savingsGoals.length }}
        </span>
      </div>
      <button
        class="brutal-btn brutal-btn-sm bg-warning/10 hover:bg-warning/15 text-warning"
        @click="showAddForm = !showAddForm"
      >
        <Plus :size="14" />
        Nouvel objectif
      </button>
    </div>

    <div class="p-6 space-y-4">

      <!-- Formulaire d'ajout -->
      <Transition name="slide">
        <div v-if="showAddForm" class="p-4 bg-base-content/5 border border-base-content/[0.06] rounded space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" :class="{ 'sm:grid-cols-3': showOwnerSelector }">
            <div class="space-y-1">
              <label for="goal-name" class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/60">Nom de l'objectif</label>
              <input
                id="goal-name"
                v-model="newName"
                type="text"
                placeholder="Ex: Vacances, Fonds d'urgence..."
                class="w-full px-3 py-2 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content placeholder-base-content/30 focus:border-warning/50 focus:outline-none"
              />
            </div>
            <div class="space-y-1">
              <label for="goal-target" class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/60">Montant cible (EUR)</label>
              <input
                id="goal-target"
                v-model.number="newTarget"
                type="number"
                step="1"
                min="1"
                placeholder="0"
                class="w-full px-3 py-2 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content placeholder-base-content/30 focus:border-warning/50 focus:outline-none"
              />
            </div>
            <div v-if="showOwnerSelector" class="space-y-1">
              <label for="goal-owner" class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/60">Propriétaire</label>
              <select
                id="goal-owner"
                v-model="newOwner"
                class="w-full px-3 py-2 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content focus:border-warning/50 focus:outline-none"
              >
                <option :value="null">Commun</option>
                <option v-for="owner in store.owners" :key="owner" :value="owner">{{ owner }}</option>
              </select>
            </div>
          </div>
          <p v-if="addFormError" class="text-xs font-mono text-error" role="alert">{{ addFormError }}</p>
          <div class="flex justify-end gap-2">
            <button
              class="brutal-btn brutal-btn-sm brutal-btn-ghost"
              @click="showAddForm = false; addFormError = ''"
            >
              Annuler
            </button>
            <button
              class="brutal-btn brutal-btn-sm bg-warning hover:bg-warning/80 text-warning-content"
              @click="addGoal"
            >
              Créer l'objectif
            </button>
          </div>
        </div>
      </Transition>

      <!-- Liste des objectifs -->
      <div v-if="store.savingsGoals.length > 0" class="space-y-4">
        <div
          v-for="goal in store.savingsGoals"
          :key="goal.id"
            class="p-4 border border-base-content/[0.06] rounded bg-base-content/5 space-y-3"
        >
          <!-- Header de l'objectif -->
          <div class="flex items-center justify-between">
            <template v-if="editingId === goal.id">
              <div class="flex items-center gap-2 flex-1 flex-wrap">
                <input
                  v-model="editName"
                  aria-label="Modifier le nom de l'objectif"
                  class="px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content w-36 focus:outline-none focus:border-warning/50"
                />
                <input
                  v-model.number="editTarget"
                  type="number"
                  step="1"
                  aria-label="Modifier le montant cible"
                  class="px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content w-24 focus:outline-none focus:border-warning/50"
                />
                <span class="text-xs text-base-content/40">€</span>
                <select
                  v-if="showOwnerSelector"
                  v-model="editOwner"
                  aria-label="Modifier le propriétaire"
                  class="px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content w-28 focus:outline-none focus:border-warning/50"
                >
                  <option :value="null">Commun</option>
                  <option v-for="o in store.owners" :key="o" :value="o">{{ o }}</option>
                </select>
              </div>
              <div class="flex gap-1">
                <button class="brutal-icon-btn bg-success/15 hover:bg-success/25" @click="saveEdit(goal.id)" aria-label="Enregistrer les modifications">
                  <Check :size="14" class="text-success" />
                </button>
                <button class="brutal-icon-btn" @click="cancelEdit" aria-label="Annuler les modifications">
                  <X :size="14" class="text-base-content/60" />
                </button>
              </div>
              <p v-if="editFormError" class="w-full text-xs font-mono text-error mt-1" role="alert">{{ editFormError }}</p>
            </template>
            <template v-else>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-medium text-base-content/90">{{ goal.name }}</h4>
                  <span
                    v-if="showOwnerSelector"
                    class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium"
                    :class="ownerColorClass(goal)"
                  >
                    <Users v-if="!goal.owner" :size="10" />
                    {{ ownerLabel(goal) }}
                  </span>
                </div>
                <p class="text-xs text-base-content/60">
                  {{ formatCurrency(store.goalProgress(goal.id).totalSaved) }} € / {{ formatCurrency(goal.targetAmount) }} €
                </p>
              </div>
              <div class="flex items-center gap-1">
                <button
                  class="brutal-icon-btn"
                  @click="toggleDetail(goal.id)"
                  aria-label="Historique des versements"
                >
                  <ChevronDown v-if="expandedGoalId !== goal.id" :size="14" class="text-base-content/60" />
                  <ChevronUp v-else :size="14" class="text-base-content/60" />
                </button>
                <button
                  class="brutal-icon-btn"
                  @click="startEdit(goal)"
                  aria-label="Modifier l'objectif"
                >
                  <Pencil :size="14" class="text-base-content/60" />
                </button>
                <button
                  class="brutal-icon-btn brutal-icon-btn-danger"
                  @click="requestDelete(goal)"
                  aria-label="Supprimer l'objectif"
                >
                  <Trash2 :size="14" class="text-error" />
                </button>
              </div>
            </template>
          </div>

          <!-- Barre de progression -->
          <div class="space-y-1">
            <div class="relative h-2 bg-base-content/5 rounded-full overflow-hidden">
              <div
                class="absolute inset-y-0 left-0 transition-all duration-500 ease-out bg-gradient-to-r from-warning to-warning/70"
                :style="{ width: `${store.goalProgress(goal.id).percentage}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-warning/70 font-medium">{{ store.goalProgress(goal.id).percentage }}%</span>
              <span class="text-base-content/40">
                Reste {{ formatCurrency(store.goalProgress(goal.id).remaining) }} €
              </span>
            </div>
          </div>

          <!-- Indicateur d'épargne contextuel (par owner) -->
          <div
            v-if="goalSavingPotential(goal) > 0"
            class="flex flex-wrap items-center gap-4 p-2.5 bg-base-content/3 text-xs"
          >
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full bg-success"></div>
               <span class="text-base-content/60">Épargne{{ goal.owner ? ` ${goal.owner}` : store.isJointMode ? ' foyer' : '' }} :</span>
              <span class="font-mono font-medium text-base-content/70">{{ formatCurrency(goalSavingPotential(goal)) }} €</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full bg-warning"></div>
               <span class="text-base-content/60">Alloué :</span>
              <span class="font-mono font-medium text-warning/80">{{ formatCurrency(goalContextAllocated(goal)) }} €</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full bg-base-content/20"></div>
               <span class="text-base-content/60">Disponible :</span>
              <span class="font-mono font-medium text-base-content/70">{{ formatCurrency(goalContextRemaining(goal)) }} €</span>
            </div>
          </div>

          <!-- Allocation du mois en cours -->
          <!-- Objectif commun avec plusieurs personnes : un input par personne -->
          <div v-if="isCommonWithMultipleOwners(goal)" class="space-y-2">
            <span class="text-sm text-base-content/70">Allocation ce mois</span>
            <div
              v-for="(o, idx) in store.owners"
              :key="o"
              class="flex items-center justify-between p-3 bg-base-content/3"
            >
              <div class="flex items-center gap-2">
                <span
class="inline-block w-2 h-2 rounded-full"
                  :class="idx === 0 ? 'bg-primary' : 'bg-secondary'"
                ></span>
                <span class="text-sm text-base-content/70">{{ o }}</span>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  :value="getAllocation(goal.id, o)"
                  @change="setAllocation(goal.id, $event.target.value, o)"
                  step="1"
                  min="0"
                  placeholder="0"
                  :aria-label="`Allocation de ${o} pour ${goal.name}`"
                  class="w-24 px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content text-right tabular-nums placeholder-base-content/30 focus:outline-none focus:border-warning/50"
                />
                <span class="text-xs text-base-content/40">€</span>
              </div>
            </div>
            <!-- Total commun -->
            <div class="flex items-center justify-between px-3 py-1.5 text-xs text-base-content/60">
              <span>Total ce mois</span>
              <span class="font-mono font-medium text-warning/80">{{ formatCurrency(getAllocation(goal.id)) }} €</span>
            </div>
          </div>
          <!-- Objectif personnel ou mode single : un seul input -->
          <div v-else class="flex items-center justify-between p-3 bg-base-content/3">
            <span class="text-sm text-base-content/70">Allocation ce mois</span>
            <div class="flex items-center gap-2">
              <input
                type="number"
                :value="getAllocation(goal.id)"
                @change="setAllocation(goal.id, $event.target.value)"
                step="1"
                min="0"
                placeholder="0"
                :aria-label="`Allocation ce mois pour ${goal.name}`"
                class="w-24 px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content text-right tabular-nums placeholder-base-content/30 focus:outline-none focus:border-warning/50"
              />
              <span class="text-xs text-base-content/40">€</span>
            </div>
          </div>

          <!-- Historique (dépliable) -->
          <Transition name="slide">
            <div v-if="expandedGoalId === goal.id" class="pt-3 border-t border-base-content/[0.06]">
              <h5 class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/40 mb-2">Historique des versements</h5>
              <div v-if="goal.allocations.length > 0" class="space-y-1">
                <div
                  v-for="(alloc, ai) in [...goal.allocations].sort((a, b) => b.month.localeCompare(a.month) || (a.owner || '').localeCompare(b.owner || ''))"
                  :key="`${alloc.month}-${alloc.owner || ai}`"
                  class="flex justify-between py-1.5 px-3 text-sm"
                >
                  <span class="text-base-content/60 flex items-center gap-2">
                    {{ formatMonth(alloc.month) }}
                    <span
                      v-if="alloc.owner"
                      class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium"
                      :class="store.owners.indexOf(alloc.owner) === 0 ? 'bg-primary/15 text-primary' : 'bg-secondary/15 text-secondary'"
                    >
                      {{ alloc.owner }}
                    </span>
                  </span>
                  <span class="tabular-nums font-mono text-base-content/80">
                    {{ formatCurrency(alloc.amount) }} €
                  </span>
                </div>
              </div>
              <p v-else class="text-xs text-base-content/60 text-center py-2">Aucun versement encore</p>
            </div>
          </Transition>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="text-center py-8">
        <div class="w-12 h-12 rounded-lg bg-base-content/5 flex items-center justify-center mx-auto mb-3">
          <Target :size="24" class="text-base-content/40" stroke-width="1.5" />
        </div>
        <p class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/40">Aucun objectif d'épargne</p>
        <p class="text-base-content/60 text-xs mt-1">Définissez des objectifs pour suivre votre progression d'épargne</p>
      </div>
    </div>

    <!-- Confirm delete -->
    <ConfirmModal
      :isOpen="showDeleteConfirm"
      title="Supprimer cet objectif ?"
      message="L'objectif et tout son historique de versements seront définitivement supprimés."
      :itemName="goalToDelete?.name"
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
