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
  <div class="glass-card rounded-2xl overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-transparent">
      <h3 class="text-lg font-bold flex items-center gap-3 text-white">
        <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        Répartition charges communes
      </h3>
    </div>

    <div class="p-6 space-y-5">
      <!-- Labels -->
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
          <span class="font-medium text-white">{{ store.owners[0] }}</span>
          <span class="px-3 py-1 rounded-full text-sm font-bold bg-primary/20 text-primary">
            {{ marinePct }}%
          </span>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 rounded-full text-sm font-bold bg-secondary/20 text-secondary">
            {{ valentinPct }}%
          </span>
          <span class="font-medium text-white">{{ store.owners[1] }}</span>
          <div class="w-3 h-3 rounded-full bg-secondary shadow-lg shadow-secondary/50"></div>
        </div>
      </div>

      <!-- Slider -->
      <div class="py-2">
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          v-model.number="marinePct"
          class="range range-sm w-full"
          style="--range-shdw: none;"
        />
      </div>

      <!-- Barre visuelle de la répartition -->
      <div class="relative">
        <div class="flex rounded-full overflow-hidden h-3 bg-white/5">
          <div
            class="bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
            :style="{ width: `${marinePct}%` }"
          ></div>
          <div
            class="bg-gradient-to-l from-secondary to-secondary/70 transition-all duration-500 ease-out"
            :style="{ width: `${valentinPct}%` }"
          ></div>
        </div>
        <!-- Indicateur central -->
        <div 
          class="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white/30 rounded-full transition-all duration-500"
          :style="{ left: `${marinePct}%`, transform: 'translateX(-50%) translateY(-50%)' }"
        ></div>
      </div>

      <!-- Échelle -->
      <div class="flex justify-between text-xs text-white/30 px-1">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  </div>
</template>
