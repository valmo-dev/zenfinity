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
    <div class="relative h-2 bg-base-content/10 rounded-full overflow-hidden">
      <div
        class="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
        :class="{
          'bg-gradient-to-r from-[#A3BE8C] to-[#A3BE8C]/70': status === 'ok',
          'bg-gradient-to-r from-[#EBCB8B] to-[#EBCB8B]/70': status === 'warning',
          'bg-gradient-to-r from-[#BF616A] to-[#BF616A]/70': status === 'over',
        }"
        :style="{ width: `${barWidth}%` }"
      ></div>
    </div>
    <!-- Texte -->
    <div class="flex justify-between items-center text-xs">
      <span
        class="tabular-nums font-mono"
        :class="{
          'text-[#A3BE8C]/80': status === 'ok',
          'text-[#EBCB8B]/80': status === 'warning',
          'text-[#BF616A]/80': status === 'over',
        }"
      >
        {{ formatCurrency(spent) }} € / {{ formatCurrency(budget) }} €
      </span>
      <span
        class="font-medium"
        :class="{
          'text-[#A3BE8C]/60': status === 'ok',
          'text-[#EBCB8B]/60': status === 'warning',
          'text-[#BF616A]/60': status === 'over',
        }"
      >
        {{ percentage }}%
      </span>
    </div>
  </div>
</template>
