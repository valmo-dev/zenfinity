<script setup>
import { ref, computed, inject } from "vue";
import { useBudgetStore } from "../stores/budget";
import { Wallet, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-vue-next";
import BudgetProgressBar from "./BudgetProgressBar.vue";

const store = useBudgetStore();
const showToast = inject("showToast", () => {});

const isSeparateMode = computed(() => store.householdMode === "separate");

// Catégories disponibles (celles utilisées ou celles avec un budget)
const allCategories = computed(() => {
  const cats = new Set([
    ...store.usedCategories,
    ...store.categoriesWithBudget,
  ]);
  return [...cats].sort((a, b) =>
    a.localeCompare(b, "fr", { sensitivity: "base" }),
  );
});

// Charger les charges uniquement
const chargeCategories = computed(() => {
  const chargeCats = new Set();
  store.currentMonthItems
    .filter((i) => i.type === "Charge")
    .forEach((i) => chargeCats.add(i.category));
  store.categoriesWithBudget.forEach((c) => chargeCats.add(c));
  return [...chargeCats].sort((a, b) =>
    a.localeCompare(b, "fr", { sensitivity: "base" }),
  );
});

// Ajouter un budget
const showAddForm = ref(false);
const newCategory = ref("");
const newBudgetAmount = ref("");

function addBudget() {
  if (!newCategory.value.trim() || !newBudgetAmount.value || Number(newBudgetAmount.value) <= 0) return;
  store.setCategoryBudget(newCategory.value.trim(), {
    global: Number(newBudgetAmount.value),
  });
  showToast("success", `Budget défini pour "${newCategory.value.trim()}"`);
  newCategory.value = "";
  newBudgetAmount.value = "";
  showAddForm.value = false;
}

// Édition inline du montant global
function updateGlobalBudget(category, value) {
  const amount = Number(value);
  if (amount > 0) {
    store.setCategoryBudget(category, { global: amount });
  }
}

// Budget par personne (section dépliable)
const expandedCategory = ref(null);

function toggleExpand(category) {
  expandedCategory.value = expandedCategory.value === category ? null : category;
}

function updatePersonBudget(category, owner, value) {
  const amount = Number(value);
  const current = store.categoryBudgets[category];
  const perPerson = { ...(current?.perPerson || {}) };
  if (amount > 0) {
    perPerson[owner] = amount;
  } else {
    delete perPerson[owner];
  }
  store.setCategoryBudget(category, { perPerson });
}

function deleteBudget(category) {
  store.deleteCategoryBudget(category);
  showToast("success", `Budget "${category}" supprimé`);
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
        <span class="inline-block w-2 h-2 rounded-full bg-[#88C0D0]"></span>
        <span class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/50">Budget par catégorie</span>
      </div>
      <button
          class="brutal-btn brutal-btn-sm bg-[#88C0D0]/10 hover:bg-[#88C0D0]/20 text-[#88C0D0]"
          @click="showAddForm = !showAddForm"
        >
          <Plus :size="14" />
          Définir
        </button>
    </div>

    <div class="p-6 space-y-4">
      <!-- Formulaire d'ajout -->
      <Transition name="slide">
        <div v-if="showAddForm" class="p-4 bg-base-content/3 border border-base-content/[0.06] space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/50">Catégorie</label>
              <select
                v-model="newCategory"
                class="w-full px-3 py-2 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content focus:border-[#88C0D0]/50 focus:outline-none"
              >
                <option value="" disabled class="bg-base-100">Choisir...</option>
                <option
                  v-for="cat in chargeCategories.filter((c) => !store.categoriesWithBudget.includes(c))"
                  :key="cat"
                  :value="cat"
                  class="bg-base-100"
                >
                  {{ cat }}
                </option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/50">Plafond mensuel (EUR)</label>
              <input
                v-model.number="newBudgetAmount"
                type="number"
                step="1"
                min="1"
                placeholder="0"
                class="w-full px-3 py-2 bg-base-content/5 border border-base-content/[0.06] text-sm text-base-content placeholder-base-content/30 focus:border-[#88C0D0]/50 focus:outline-none"
              />
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button
              class="brutal-btn brutal-btn-sm brutal-btn-ghost"
              @click="showAddForm = false"
            >
              Annuler
            </button>
            <button
              class="brutal-btn brutal-btn-sm bg-[#88C0D0] hover:bg-[#88C0D0]/80 text-[#2E3440]"
              @click="addBudget"
            >
              Définir le budget
            </button>
          </div>
        </div>
      </Transition>

      <!-- Liste des budgets définis -->
      <div v-if="store.categoriesWithBudget.length > 0" class="space-y-3">
        <div
          v-for="category in store.categoriesWithBudget"
          :key="category"
          class="p-4 bg-base-content/3 space-y-3"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="font-medium text-base-content/90">{{ category }}</span>
              <!-- Édition inline du montant -->
              <div class="flex items-center gap-1">
                <input
                  type="number"
                  :value="store.categoryBudgets[category].global"
                  @change="updateGlobalBudget(category, $event.target.value)"
                  step="1"
                  min="1"
                    class="w-20 px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-xs text-base-content text-right tabular-nums focus:outline-none focus:border-[#88C0D0]/50"
                />
                <span class="text-xs text-base-content/40">€/mois</span>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button
                v-if="isSeparateMode"
                class="brutal-icon-btn"
                @click="toggleExpand(category)"
                title="Budget par personne"
              >
                <ChevronDown v-if="expandedCategory !== category" :size="14" class="text-base-content/60" />
                <ChevronUp v-else :size="14" class="text-base-content/60" />
              </button>
              <button
                class="brutal-icon-btn brutal-icon-btn-danger"
                @click="deleteBudget(category)"
                title="Supprimer le budget"
              >
                <Trash2 :size="14" class="text-[#BF616A]" />
              </button>
            </div>
          </div>

          <!-- Barre de progression globale -->
          <BudgetProgressBar
            :spent="store.categorySpending(category)"
            :budget="store.categoryBudgets[category].global"
          />

          <!-- Budget par personne (mode separate) -->
          <Transition name="slide">
            <div v-if="isSeparateMode && expandedCategory === category" class="pt-3 border-t border-base-content/[0.06] space-y-3">
              <div
                v-for="owner in store.owners"
                :key="owner"
                class="flex items-center justify-between"
              >
                <span class="text-sm text-base-content/70">{{ owner }}</span>
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    :value="store.categoryBudgets[category]?.perPerson?.[owner] || ''"
                    @change="updatePersonBudget(category, owner, $event.target.value)"
                    placeholder="—"
                    step="1"
                    min="0"
                    class="w-20 px-2 py-1 bg-base-content/5 border border-base-content/[0.06] text-xs text-base-content text-right tabular-nums placeholder-base-content/30 focus:outline-none focus:border-[#88C0D0]/50"
                  />
                  <span class="text-xs text-base-content/40">€</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="text-center py-8">
         <div class="w-12 h-12 rounded-lg bg-base-content/5 flex items-center justify-center mx-auto mb-3">
          <Wallet :size="24" class="text-base-content/40" stroke-width="1.5" />
        </div>
        <p class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/40">Aucun budget défini</p>
        <p class="text-base-content/50 text-xs mt-1">Définissez des plafonds mensuels par catégorie de charges</p>
      </div>
    </div>
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
