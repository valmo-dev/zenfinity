<script setup>
import { computed } from "vue";
import { useBudgetStore } from "../stores/budget";
import { PieChart, BarChart3 } from "lucide-vue-next";
import { Doughnut, Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const store = useBudgetStore();

const MONTH_NAMES_SHORT = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

function formatMonthLabel(monthStr) {
  const [year, month] = monthStr.split("-").map(Number);
  return `${MONTH_NAMES_SHORT[month - 1]} ${year}`;
}

// Couleurs modernes avec le rouge accent
const chartColors = [
  "rgba(218, 0, 55, 0.85)",    // primary red
  "rgba(255, 107, 107, 0.85)", // coral
  "rgba(255, 159, 64, 0.85)",  // orange
  "rgba(255, 205, 86, 0.85)",  // yellow
  "rgba(75, 192, 192, 0.85)",  // teal
  "rgba(54, 162, 235, 0.85)",  // blue
  "rgba(153, 102, 255, 0.85)", // purple
  "rgba(255, 99, 132, 0.85)",  // pink
  "rgba(201, 203, 207, 0.85)", // grey
  "rgba(100, 181, 246, 0.85)", // light blue
];

const isDark = computed(() => store.theme === "zenfinity-dark");

const hasCharges = computed(() => Object.keys(store.chargesBreakdown).length > 0);
const hasMultipleMonths = computed(() => store.monthlyEvolution.length > 1);

const doughnutData = computed(() => {
  const breakdown = store.chargesBreakdown;
  const labels = Object.keys(breakdown);
  const values = Object.values(breakdown);
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => chartColors[i % chartColors.length]),
        borderColor: isDark.value ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)",
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: isDark.value ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
      },
    ],
  };
});

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: isDark.value ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        font: { size: 12, family: "inherit" },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: isDark.value ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.95)",
      titleColor: isDark.value ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
      bodyColor: isDark.value ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
      borderColor: isDark.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      borderWidth: 1,
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const pct = ((ctx.parsed / total) * 100).toFixed(1);
          return `${ctx.label}: ${ctx.parsed.toFixed(2)} € (${pct}%)`;
        },
      },
    },
  },
}));

const barData = computed(() => {
  const evolution = store.monthlyEvolution;
  return {
    labels: evolution.map((e) => formatMonthLabel(e.month)),
    datasets: [
      {
        label: "Revenus",
        data: evolution.map((e) => e.revenus),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        hoverBackgroundColor: "rgba(34, 197, 94, 1)",
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Charges",
        data: evolution.map((e) => e.charges),
        backgroundColor: "rgba(218, 0, 55, 0.8)",
        hoverBackgroundColor: "rgba(218, 0, 55, 1)",
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Net",
        data: evolution.map((e) => e.net),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        hoverBackgroundColor: "rgba(59, 130, 246, 1)",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };
});

const barOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: isDark.value ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        font: { size: 12, family: "inherit" },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: isDark.value ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.95)",
      titleColor: isDark.value ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
      bodyColor: isDark.value ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
      borderColor: isDark.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      borderWidth: 1,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} €`,
      },
    },
  },
  scales: {
    x: {
      ticks: { 
        color: isDark.value ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)", 
        font: { size: 11 } 
      },
      grid: { display: false },
    },
    y: {
      ticks: {
        color: isDark.value ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
        font: { size: 11 },
        callback: (val) => `${val} €`,
      },
      grid: { 
        color: isDark.value ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        drawBorder: false,
      },
    },
  },
}));
</script>

<template>
  <div class="space-y-6">
    <!-- Répartition des charges (Doughnut) -->
    <div v-if="hasCharges" class="glass-card rounded-none overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b-3 border-brutal bg-primary/20">
        <h3 class="text-lg font-bold flex items-center gap-3 text-base-content">
          <div class="w-8 h-8 rounded-none bg-primary/20 flex items-center justify-center">
            <PieChart :size="16" class="text-primary" />
          </div>
          Répartition des charges
        </h3>
      </div>
      <div class="p-6">
        <div class="h-72">
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
        </div>
      </div>
    </div>

    <!-- Évolution mensuelle (Bar) -->
    <div v-if="hasMultipleMonths" class="glass-card rounded-none overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b-3 border-brutal bg-blue-500/20">
        <h3 class="text-lg font-bold flex items-center gap-3 text-base-content">
          <div class="w-8 h-8 rounded-none bg-blue-500/20 flex items-center justify-center">
            <BarChart3 :size="16" class="text-blue-400" />
          </div>
          Évolution mensuelle
        </h3>
      </div>
      <div class="p-6">
        <div class="h-72">
          <Bar :data="barData" :options="barOptions" />
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div
      v-if="!hasCharges && !hasMultipleMonths"
      class="glass-card rounded-none overflow-hidden"
    >
      <div class="p-8 text-center">
        <div class="w-16 h-16 rounded-none bg-base-content/5 flex items-center justify-center mx-auto mb-4">
          <BarChart3 :size="32" class="text-base-content/30" stroke-width="1.5" />
        </div>
        <p class="text-base-content/40">Les graphiques apparaitront une fois des données ajoutées</p>
      </div>
    </div>
  </div>
</template>
