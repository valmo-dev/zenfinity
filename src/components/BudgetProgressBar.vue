<script setup>
import { computed } from "vue";
import { formatCurrency } from "../utils/format";

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


</script>

<template>
  <div class="space-y-1">
    <!-- Barre de progression -->
    <div class="relative h-2 bg-base-content/10 rounded-full overflow-hidden">
      <div
        class="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
        :class="{
          'bg-gradient-to-r from-success to-success/70': status === 'ok',
          'bg-gradient-to-r from-warning to-warning/70': status === 'warning',
          'bg-gradient-to-r from-error to-error/70': status === 'over',
        }"
        :style="{ width: `${barWidth}%` }"
      ></div>
    </div>
    <!-- Texte -->
    <div class="flex justify-between items-center text-xs">
      <span
        class="tabular-nums font-mono"
        :class="{
          'text-success/80': status === 'ok',
          'text-warning/80': status === 'warning',
          'text-error/80': status === 'over',
        }"
      >
        {{ formatCurrency(spent) }} € / {{ formatCurrency(budget) }} €
      </span>
      <span
        class="font-medium"
        :class="{
          'text-success/60': status === 'ok',
          'text-warning/60': status === 'warning',
          'text-error/60': status === 'over',
        }"
      >
        {{ percentage }}%
      </span>
    </div>
  </div>
</template>
