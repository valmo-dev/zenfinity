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

// Couleurs cohérentes
const chartColors = [
  "rgba(101, 163, 13, 0.8)",   // lime
  "rgba(14, 165, 233, 0.8)",   // sky
  "rgba(244, 63, 94, 0.8)",    // rose
  "rgba(168, 85, 247, 0.8)",   // purple
  "rgba(251, 146, 60, 0.8)",   // orange
  "rgba(45, 212, 191, 0.8)",   // teal
  "rgba(250, 204, 21, 0.8)",   // yellow
  "rgba(99, 102, 241, 0.8)",   // indigo
  "rgba(236, 72, 153, 0.8)",   // pink
  "rgba(34, 197, 94, 0.8)",    // green
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
        borderColor: "rgba(0, 0, 0, 0.3)",
        borderWidth: 1,
      },
    ],
  };
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "rgba(255, 255, 255, 0.7)",
        font: { size: 11 },
        padding: 12,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const pct = ((ctx.parsed / total) * 100).toFixed(1);
          return `${ctx.label}: ${ctx.parsed.toFixed(2)} EUR (${pct}%)`;
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
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderRadius: 4,
      },
      {
        label: "Charges",
        data: evolution.map((e) => e.charges),
        backgroundColor: "rgba(244, 63, 94, 0.7)",
        borderRadius: 4,
      },
      {
        label: "Net",
        data: evolution.map((e) => e.net),
        backgroundColor: "rgba(14, 165, 233, 0.7)",
        borderRadius: 4,
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
        font: { size: 11 },
        padding: 12,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} EUR`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "rgba(255, 255, 255, 0.5)", font: { size: 11 } },
      grid: { display: false },
    },
    y: {
      ticks: {
        color: "rgba(255, 255, 255, 0.5)",
        font: { size: 11 },
        callback: (val) => `${val} EUR`,
      },
      grid: { color: "rgba(255, 255, 255, 0.05)" },
    },
  },
};
</script>

<template>
  <div class="space-y-4">
    <!-- Répartition des charges (Doughnut) -->
    <div v-if="hasCharges" class="card bg-base-100 shadow-lg">
      <div class="card-body p-5">
        <h3 class="card-title text-base flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          Répartition des charges
        </h3>
        <div class="h-64 mt-2">
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
        </div>
      </div>
    </div>

    <!-- Évolution mensuelle (Bar) -->
    <div v-if="hasMultipleMonths" class="card bg-base-100 shadow-lg">
      <div class="card-body p-5">
        <h3 class="card-title text-base flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Évolution mensuelle
        </h3>
        <div class="h-64 mt-2">
          <Bar :data="barData" :options="barOptions" />
        </div>
      </div>
    </div>

    <div
      v-if="!hasCharges && !hasMultipleMonths"
      class="card bg-base-100 shadow-lg"
    >
      <div class="card-body p-5 text-center text-base-content/40 text-sm">
        Les graphiques apparaitront une fois des données ajoutées
      </div>
    </div>
  </div>
</template>
