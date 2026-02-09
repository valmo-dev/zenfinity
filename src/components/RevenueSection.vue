<script setup>
import { useBudgetStore } from "../stores/budget";

const store = useBudgetStore();

function formatCurrency(value) {
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>

<template>
  <div class="card bg-base-100 shadow-lg">
    <div class="card-body p-5">
      <h3 class="card-title text-base flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Revenus
      </h3>

      <div class="overflow-x-auto mt-2">
        <table class="table table-sm table-zebra">
          <thead>
            <tr>
              <th>Personne</th>
              <th class="text-right">Montant</th>
              <th class="text-right">Part</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="owner in store.owners" :key="owner">
              <td class="font-medium">{{ owner }}</td>
              <td class="text-right tabular-nums">
                {{ formatCurrency(store.revenueByOwner(owner)) }} EUR
              </td>
              <td class="text-right">
                <span class="badge badge-ghost badge-sm">
                  {{ store.contributionPercentage(owner) }}%
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="font-bold">
              <td>Total</td>
              <td class="text-right tabular-nums">
                {{ formatCurrency(store.totalRevenue) }} EUR
              </td>
              <td class="text-right">
                <span class="badge badge-ghost badge-sm">100%</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Détail des entrées revenus -->
      <div v-if="store.revenueItems.length > 0" class="mt-3">
        <div class="divider text-xs my-1">Détail</div>
        <div class="space-y-1">
          <div
            v-for="item in store.revenueItems"
            :key="item.id"
            class="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-base-200 transition-colors group"
          >
            <div class="flex items-center gap-2">
              <span class="badge badge-xs"
                :class="{
                  'badge-primary': item.owner === store.owners[0],
                  'badge-secondary': item.owner === store.owners[1],
                }"
              ></span>
              <span>{{ item.category }}</span>
              <span class="text-base-content/50 text-xs">({{ item.owner }})</span>
            </div>
            <span class="tabular-nums font-medium">{{ formatCurrency(item.amount) }} EUR</span>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-base-content/40 py-4 text-sm">
        Aucun revenu enregistré
      </div>
    </div>
  </div>
</template>
