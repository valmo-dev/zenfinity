<script setup>
import { computed } from "vue";
import { useBudgetStore } from "../stores/budget";
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
        borderColor: "rgba(0, 0, 0, 0.5)",
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: "rgba(255, 255, 255, 0.3)",
      },
    ],
  };
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "rgba(255, 255, 255, 0.7)",
        font: { size: 12, family: "inherit" },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const pct = ((ctx.parsed / total) * 100).toFixed(1);
          return `${ctx.label}: ${ctx.parsed.toFixed(2)} € (${pct}%)`;
        },
      },
    },
  },
};

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

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "rgba(255, 255, 255, 0.7)",
        font: { size: 12, family: "inherit" },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} €`,
      },
    },
  },
  scales: {
    x: {
      ticks: { 
        color: "rgba(255, 255, 255, 0.5)", 
        font: { size: 11 } 
      },
      grid: { display: false },
    },
    y: {
      ticks: {
        color: "rgba(255, 255, 255, 0.5)",
        font: { size: 11 },
        callback: (val) => `${val} €`,
      },
      grid: { 
        color: "rgba(255, 255, 255, 0.05)",
        drawBorder: false,
      },
    },
  },
};
</script>

<template>
  <div class="space-y-6">
    <!-- Répartition des charges (Doughnut) -->
    <div v-if="hasCharges" class="glass-card rounded-2xl overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
        <h3 class="text-lg font-bold flex items-center gap-3 text-white">
          <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
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
    <div v-if="hasMultipleMonths" class="glass-card rounded-2xl overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-transparent">
        <h3 class="text-lg font-bold flex items-center gap-3 text-white">
          <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
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
      class="glass-card rounded-2xl overflow-hidden"
    >
      <div class="p-8 text-center">
        <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p class="text-white/40">Les graphiques apparaitront une fois des données ajoutées</p>
      </div>
    </div>
  </div>
</template>
