<script setup>
import { ref, inject, computed } from "vue";
import { useBudgetStore } from "../stores/budget";
import { formatCurrency } from "../utils/format";
import { CircleDollarSign, Pencil, Trash2, Plus, Repeat, EyeOff, CircleStop } from "lucide-vue-next";
import EditModal from "./EditModal.vue";
import ConfirmModal from "./ConfirmModal.vue";

const store = useBudgetStore();
const showToast = inject("showToast", () => {});

const showEditModal = ref(false);
const selectedItem = ref(null);

// Confirmation de suppression
const showDeleteConfirm = ref(false);
const itemToDelete = ref(null);

// Confirmation action récurrence
const showRecurringConfirm = ref(false);
const recurringAction = ref(null);
const recurringConfirmTitle = ref("");
const recurringConfirmMessage = ref("");

const isSinglePerson = computed(() => store.owners.length === 1);

function openEdit(item) {
  if (item.isRecurring) return;
  selectedItem.value = item;
  showEditModal.value = true;
}

function handleEditClose() {
  showEditModal.value = false;
}

function handleEditSaved() {
  showToast("success", "Revenu modifié avec succès");
}

function requestDelete(item) {
  if (item.isRecurring) return;
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

// === Actions récurrences ===

function requestDisableRecurring(item) {
  recurringAction.value = { type: "disable", recurringId: item.recurringId, itemCategory: item.category };
  recurringConfirmTitle.value = "Désactiver pour ce mois ?";
  recurringConfirmMessage.value = `"${item.category}" sera masqué pour ce mois uniquement. La récurrence continue pour les autres mois.`;
  showRecurringConfirm.value = true;
}

function requestEndRecurring(item) {
  recurringAction.value = { type: "end", recurringId: item.recurringId, itemCategory: item.category };
  recurringConfirmTitle.value = "Supprimer la récurrence ?";
  recurringConfirmMessage.value = `"${item.category}" sera supprimé de ce mois et de tous les mois suivants. L'historique passé est conservé.`;
  showRecurringConfirm.value = true;
}

function confirmRecurringAction() {
  if (!recurringAction.value) return;
  const { type, recurringId, itemCategory } = recurringAction.value;
  if (type === "disable") {
    store.disableRecurringForMonth(recurringId, store.selectedMonth);
    showToast("success", `"${itemCategory}" désactivé pour ce mois`);
  } else if (type === "end") {
    store.endRecurringItem(recurringId, store.selectedMonth);
    showToast("success", `Récurrence "${itemCategory}" supprimée`);
  }
  showRecurringConfirm.value = false;
  recurringAction.value = null;
}

function cancelRecurringAction() {
  showRecurringConfirm.value = false;
  recurringAction.value = null;
}
</script>

<template>
  <div class="terminal-card overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 flex items-center justify-between border-b border-base-content/[0.06]">
      <div class="flex items-center gap-3">
        <span class="inline-block w-2 h-2 rounded-full bg-success"></span>
        <span class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/60">Revenus</span>
      </div>
      <CircleDollarSign :size="14" class="text-base-content/30" />
    </div>

    <div class="p-6">
      <!-- Table des revenus -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-base-content/60 text-sm">
              <th class="text-left py-3 font-medium">{{ isSinglePerson ? 'Source' : 'Personne' }}</th>
              <th class="text-right py-3 font-medium">Montant</th>
              <th v-if="!isSinglePerson" class="text-right py-3 font-medium tooltip-wrapper" data-tooltip="Pourcentage du revenu total du ménage">Part</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-base-content/5">
            <tr 
              v-for="(owner, index) in store.owners" 
              :key="owner"
              class="hover:bg-base-content/3 transition-colors"
            >
              <td class="py-3">
                <div class="flex items-center gap-2">
                  <div 
class="w-2 h-2 rounded-full"
                    :class="index === 0 ? 'bg-primary' : 'bg-secondary'"
                  ></div>
                  <span class="font-medium text-base-content">{{ owner }}</span>
                </div>
              </td>
              <td class="text-right py-3 tabular-nums font-mono text-base-content/80">
                {{ formatCurrency(store.revenueByOwner(owner)) }} €
              </td>
              <td v-if="!isSinglePerson" class="text-right py-3">
                <span class="px-2.5 py-1 text-xs font-medium bg-base-content/5 text-base-content/60">
                  {{ store.contributionPercentage(owner) }}%
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-base-content/[0.06]">
              <td class="py-3 font-bold text-base-content">Total</td>
              <td class="text-right py-3 tabular-nums font-mono font-bold text-base-content">
                {{ formatCurrency(store.totalRevenue) }} €
              </td>
              <td v-if="!isSinglePerson" class="text-right py-3">
                <span class="px-2.5 py-1 text-xs font-bold bg-success/15 text-success">
                  100%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Détail des entrées revenus -->
      <div v-if="store.revenueItems.length > 0" class="mt-6 pt-4 border-t border-base-content/[0.06]">
        <div class="flex items-center gap-3 mb-4">
          <div class="h-px flex-1 bg-gradient-to-r from-base-content/10 to-transparent"></div>
          <span class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/40">Détail</span>
          <div class="h-px flex-1 bg-gradient-to-l from-base-content/10 to-transparent"></div>
        </div>
                <div class="space-y-2">
          <div
            v-for="item in store.revenueItems"
            :key="item.id"
            class="flex items-center justify-between text-sm py-2.5 px-4 bg-base-content/3 hover:bg-base-content/5 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div 
class="w-1.5 h-1.5 rounded-full"
                :class="item.owner === store.owners[0] ? 'bg-primary' : 'bg-secondary'"
              ></div>
              <span class="text-base-content/80">{{ item.category }}</span>
              <Repeat v-if="item.isRecurring" :size="12" class="text-accent/50" title="Récurrence automatique" />
              <span class="text-base-content/40 text-xs">({{ item.owner }})</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="tabular-nums font-mono font-medium text-success">
                +{{ formatCurrency(item.amount) }} €
              </span>
              <!-- Actions pour items réguliers -->
              <div v-if="!item.isRecurring" class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  class="brutal-icon-btn"
                  @click="openEdit(item)"
                  aria-label="Modifier ce revenu"
                >
                  <Pencil :size="14" class="text-base-content/60" />
                </button>
                <button
                  class="brutal-icon-btn brutal-icon-btn-danger"
                  @click="requestDelete(item)"
                  aria-label="Supprimer ce revenu"
                >
                    <Trash2 :size="14" class="text-error" />
                </button>
              </div>
              <!-- Actions pour récurrences -->
              <div v-else class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  class="brutal-icon-btn"
                  @click="requestDisableRecurring(item)"
                  aria-label="Désactiver pour ce mois"
                  title="Désactiver pour ce mois"
                >
                  <EyeOff :size="14" class="text-warning/70" />
                </button>
                <button
                  class="brutal-icon-btn brutal-icon-btn-danger"
                  @click="requestEndRecurring(item)"
                  aria-label="Supprimer la récurrence"
                  title="Supprimer la récurrence"
                >
                  <CircleStop :size="14" class="text-error" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="text-center py-8">
        <div class="w-12 h-12 rounded-lg bg-base-content/5 flex items-center justify-center mx-auto mb-3">
          <Plus :size="24" class="text-base-content/30" stroke-width="1.5" />
        </div>
        <p class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/40">Aucun revenu enregistré</p>
      </div>
    </div>

    <!-- Modales -->
    <EditModal
      :isOpen="showEditModal"
      :item="selectedItem"
      @close="handleEditClose"
      @saved="handleEditSaved"
    />

    <ConfirmModal
      :isOpen="showDeleteConfirm"
      title="Supprimer ce revenu ?"
      message="Ce revenu sera définitivement supprimé de votre budget."
      :itemName="itemToDelete?.category"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <ConfirmModal
      :isOpen="showRecurringConfirm"
      :title="recurringConfirmTitle"
      :message="recurringConfirmMessage"
      :itemName="recurringAction?.itemCategory"
      @confirm="confirmRecurringAction"
      @cancel="cancelRecurringAction"
    />
  </div>
</template>
