<script setup>
import { computed } from "vue";
import { useBudgetStore } from "../stores/budget";
import { Settings } from "lucide-vue-next";

const store = useBudgetStore();

const isSinglePerson = computed(() => store.owners.length === 1);

const marinePct = computed({
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

const valentinPct = computed(() => isSinglePerson.value ? 0 : 100 - marinePct.value);
</script>

<template>
  <div class="glass-card rounded-2xl overflow-hidden" v-if="!isSinglePerson">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-base-content/5 bg-gradient-to-r from-blue-500/10 to-transparent">
       <h3 
        class="text-lg font-bold flex items-center gap-3 text-base-content tooltip-wrapper tooltip-bottom"
        data-tooltip="Définit comment les charges partagées sont réparties entre les deux personnes"
      >
        <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Settings :size="16" class="text-blue-400" />
        </div>
        Répartition charges communes
      </h3>
    </div>

    <div class="p-6 space-y-5">
      <!-- Labels -->
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
          <span class="font-medium text-base-content">{{ store.owners[0] }}</span>
          <span class="px-3 py-1 rounded-full text-sm font-bold bg-primary/20 text-primary">
            {{ marinePct }}%
          </span>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 rounded-full text-sm font-bold bg-secondary/20 text-secondary">
            {{ valentinPct }}%
          </span>
          <span class="font-medium text-base-content">{{ store.owners[1] }}</span>
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
          class="range range-sm range-primary w-full"
        />
      </div>

      <!-- Barre visuelle de la répartition -->
      <div class="relative">
        <div class="flex rounded-full overflow-hidden h-3 bg-base-content/5">
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
          class="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-base-content/30 rounded-full transition-all duration-500"
          :style="{ left: `${marinePct}%`, transform: 'translateX(-50%) translateY(-50%)' }"
        ></div>
      </div>

      <!-- Échelle -->
      <div class="flex justify-between text-xs text-base-content/30 px-1">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  </div>
</template>
