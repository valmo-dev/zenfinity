<script setup>
import { computed } from "vue";
import { useBudgetStore } from "../stores/budget";
import { Settings } from "lucide-vue-next";

const store = useBudgetStore();

const isSinglePerson = computed(() => store.owners.length === 1);

const firstOwnerPct = computed({
  get: () => store.communalChargesDistribution[store.owners[0]] || 50,
  set: (value) => {
    if (isSinglePerson.value) return;
    const val = Number(value);
    store.setCommunalChargesDistribution({
      [store.owners[0]]: val,
      [store.owners[1]]: 100 - val,
    });
  },
});

const secondOwnerPct = computed(() => isSinglePerson.value ? 0 : 100 - firstOwnerPct.value);
</script>

<template>
  <div class="terminal-card overflow-hidden" v-if="!isSinglePerson">
    <!-- Header -->
    <div class="px-6 py-4 flex items-center justify-between border-b border-base-content/[0.06]">
      <div class="flex items-center gap-3">
        <span class="inline-block w-2 h-2 rounded-full bg-[#81A1C1]"></span>
        <span class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/50">Répartition charges communes</span>
      </div>
      <Settings :size="16" class="text-base-content/30" />
    </div>

    <div class="p-6 space-y-5">
      <!-- Labels -->
      <div class="flex flex-wrap justify-between items-center gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-3 h-3 rounded-full bg-primary shrink-0"></div>
          <span class="font-medium text-base-content truncate">{{ store.owners[0] }}</span>
          <span class="px-3 py-1 text-sm font-semibold bg-primary/20 text-primary shrink-0">
            {{ firstOwnerPct }}%
          </span>
        </div>
        <div class="flex items-center gap-2 min-w-0">
          <span class="px-3 py-1 text-sm font-semibold bg-secondary/20 text-secondary shrink-0">
            {{ secondOwnerPct }}%
          </span>
          <span class="font-medium text-base-content truncate">{{ store.owners[1] }}</span>
          <div class="w-3 h-3 rounded-full bg-secondary shrink-0"></div>
        </div>
      </div>

      <!-- Slider -->
      <div class="py-2">
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          v-model.number="firstOwnerPct"
          class="range range-sm range-primary w-full"
        />
      </div>

      <!-- Barre visuelle de la répartition -->
      <div class="relative">
        <div class="flex overflow-hidden h-3 bg-base-content/5">
          <div
            class="bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
            :style="{ width: `${firstOwnerPct}%` }"
          ></div>
          <div
            class="bg-gradient-to-l from-secondary to-secondary/70 transition-all duration-500 ease-out"
            :style="{ width: `${secondOwnerPct}%` }"
          ></div>
        </div>
        <!-- Indicateur central -->
        <div 
          class="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-base-content/30 transition-all duration-500"
          :style="{ left: `${firstOwnerPct}%`, transform: 'translateX(-50%) translateY(-50%)' }"
        ></div>
      </div>

      <!-- Échelle -->
      <div class="flex justify-between text-xs text-base-content/50 px-1">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  </div>
</template>
