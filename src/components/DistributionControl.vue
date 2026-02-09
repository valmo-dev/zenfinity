<script setup>
import { computed } from "vue";
import { useBudgetStore } from "../stores/budget";

const store = useBudgetStore();

const marinePct = computed({
  get: () => store.communalChargesDistribution[store.owners[0]] || 50,
  set: (value) => {
    const val = Number(value);
    store.setCommunalChargesDistribution({
      [store.owners[0]]: val,
      [store.owners[1]]: 100 - val,
    });
  },
});

const valentinPct = computed(() => 100 - marinePct.value);
</script>

<template>
  <div class="card bg-base-100 shadow-lg">
    <div class="card-body p-5">
      <h3 class="card-title text-base flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Répartition charges communes
      </h3>

      <div class="mt-4 space-y-3">
        <div class="flex justify-between text-sm font-medium">
          <span class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-primary"></div>
            {{ store.owners[0] }}
            <span class="badge badge-primary badge-sm font-mono">{{ marinePct }}%</span>
          </span>
          <span class="flex items-center gap-2">
            <span class="badge badge-secondary badge-sm font-mono">{{ valentinPct }}%</span>
            {{ store.owners[1] }}
            <div class="w-2.5 h-2.5 rounded-full bg-secondary"></div>
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          v-model.number="marinePct"
          class="range range-info range-sm"
        />

        <!-- Barre visuelle de la répartition -->
        <div class="flex rounded-full overflow-hidden h-2.5">
          <div
            class="bg-primary transition-all duration-300"
            :style="{ width: `${marinePct}%` }"
          ></div>
          <div
            class="bg-secondary transition-all duration-300"
            :style="{ width: `${valentinPct}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
