<script setup>
import { computed } from "vue";

const props = defineProps({
  spent: {
    type: Number,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
});

const percentage = computed(() => {
  if (props.budget <= 0) return 0;
  return Math.min(Number(((props.spent / props.budget) * 100).toFixed(1)), 150);
});

const status = computed(() => {
  if (percentage.value > 100) return "over";
  if (percentage.value >= 80) return "warning";
  return "ok";
});

const barWidth = computed(() => Math.min(percentage.value, 100));

function formatCurrency(value) {
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>

<template>
  <div class="space-y-1">
    <!-- Barre de progression -->
    <div class="relative h-2 rounded-full bg-base-content/5 overflow-hidden">
      <div
        class="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
        :class="{
          'bg-gradient-to-r from-emerald-500 to-emerald-400': status === 'ok',
          'bg-gradient-to-r from-amber-500 to-amber-400': status === 'warning',
          'bg-gradient-to-r from-red-500 to-red-400': status === 'over',
        }"
        :style="{ width: `${barWidth}%` }"
      ></div>
    </div>
    <!-- Texte -->
    <div class="flex justify-between items-center text-xs">
      <span
        class="tabular-nums font-mono"
        :class="{
          'text-emerald-400/80': status === 'ok',
          'text-amber-400/80': status === 'warning',
          'text-red-400/80': status === 'over',
        }"
      >
        {{ formatCurrency(spent) }} € / {{ formatCurrency(budget) }} €
      </span>
      <span
        class="font-medium"
        :class="{
          'text-emerald-400/60': status === 'ok',
          'text-amber-400/60': status === 'warning',
          'text-red-400/60': status === 'over',
        }"
      >
        {{ percentage }}%
      </span>
    </div>
  </div>
</template>
