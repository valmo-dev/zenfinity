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
  <div class="glass-card rounded-2xl overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-green-500/10 to-transparent">
      <h3 class="text-lg font-bold flex items-center gap-3 text-white">
        <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        Revenus
      </h3>
    </div>

    <div class="p-6">
      <!-- Table des revenus -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-white/50 text-sm">
              <th class="text-left py-3 font-medium">Personne</th>
              <th class="text-right py-3 font-medium">Montant</th>
              <th class="text-right py-3 font-medium tooltip-wrapper" data-tooltip="Pourcentage du revenu total du ménage">Part</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr 
              v-for="(owner, index) in store.owners" 
              :key="owner"
              class="hover:bg-white/3 transition-colors"
            >
              <td class="py-3">
                <div class="flex items-center gap-2">
                  <div 
                    class="w-2 h-2 rounded-full"
                    :class="index === 0 ? 'bg-primary' : 'bg-secondary'"
                  ></div>
                  <span class="font-medium text-white">{{ owner }}</span>
                </div>
              </td>
              <td class="text-right py-3 tabular-nums font-mono text-white/80">
                {{ formatCurrency(store.revenueByOwner(owner)) }} €
              </td>
              <td class="text-right py-3">
                <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60">
                  {{ store.contributionPercentage(owner) }}%
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-white/10">
              <td class="py-3 font-bold text-white">Total</td>
              <td class="text-right py-3 tabular-nums font-mono font-bold text-white">
                {{ formatCurrency(store.totalRevenue) }} €
              </td>
              <td class="text-right py-3">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                  100%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Détail des entrées revenus -->
      <div v-if="store.revenueItems.length > 0" class="mt-6 pt-4 border-t border-white/5">
        <div class="flex items-center gap-3 mb-4">
          <div class="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          <span class="text-xs font-medium text-white/40 uppercase tracking-wider">Détail</span>
          <div class="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent"></div>
        </div>
        <div class="space-y-2">
          <div
            v-for="item in store.revenueItems"
            :key="item.id"
            class="flex items-center justify-between text-sm py-2.5 px-4 rounded-xl bg-white/3 hover:bg-white/5 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-1.5 h-1.5 rounded-full"
                :class="item.owner === store.owners[0] ? 'bg-primary' : 'bg-secondary'"
              ></div>
              <span class="text-white/80">{{ item.category }}</span>
              <span class="text-white/40 text-xs">({{ item.owner }})</span>
            </div>
            <span class="tabular-nums font-mono font-medium text-green-400">
              +{{ formatCurrency(item.amount) }} €
            </span>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="text-center py-8">
        <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p class="text-white/40 text-sm">Aucun revenu enregistré</p>
      </div>
    </div>
  </div>
</template>
