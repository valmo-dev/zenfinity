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

// Nord Frost + Aurora palette
const chartColors = [
  "rgba(136, 192, 208, 0.85)", // Frost #88C0D0
  "rgba(191, 97, 106, 0.85)",  // Aurora red #BF616A
  "rgba(163, 190, 140, 0.85)", // Aurora green #A3BE8C
  "rgba(208, 135, 112, 0.85)", // Aurora orange #D08770
  "rgba(235, 203, 139, 0.85)", // Aurora yellow #EBCB8B
  "rgba(180, 142, 173, 0.85)", // Aurora purple #B48EAD
  "rgba(129, 161, 193, 0.85)", // Frost #81A1C1
  "rgba(143, 188, 187, 0.85)", // Frost #8FBCBB
  "rgba(94, 129, 172, 0.85)",  // Frost #5E81AC
  "rgba(76, 86, 106, 0.85)",   // Polar Night #4C566A
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
        borderColor: isDark.value ? "rgba(59, 66, 82, 0.8)" : "rgba(236, 239, 244, 0.8)",
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: isDark.value ? "rgba(216, 222, 233, 0.3)" : "rgba(46, 52, 64, 0.3)",
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
        color: isDark.value ? "rgba(216, 222, 233, 0.7)" : "rgba(46, 52, 64, 0.7)",
        font: { size: 12, family: "'Geist', sans-serif" },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: isDark.value ? "rgba(46, 52, 64, 0.95)" : "rgba(236, 239, 244, 0.95)",
      titleColor: isDark.value ? "rgba(216, 222, 233, 0.9)" : "rgba(46, 52, 64, 0.9)",
      bodyColor: isDark.value ? "rgba(216, 222, 233, 0.8)" : "rgba(46, 52, 64, 0.8)",
      titleFont: { size: 13, family: "'Geist', sans-serif" },
      bodyFont: { size: 12, family: "'Geist', sans-serif" },
      padding: 12,
      cornerRadius: 8,
      borderColor: isDark.value ? "rgba(216, 222, 233, 0.1)" : "rgba(46, 52, 64, 0.1)",
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
        backgroundColor: "rgba(163, 190, 140, 0.8)",
        hoverBackgroundColor: "rgba(163, 190, 140, 1)",
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Charges",
        data: evolution.map((e) => e.charges),
        backgroundColor: "rgba(191, 97, 106, 0.8)",
        hoverBackgroundColor: "rgba(191, 97, 106, 1)",
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Net",
        data: evolution.map((e) => e.net),
        backgroundColor: "rgba(129, 161, 193, 0.8)",
        hoverBackgroundColor: "rgba(129, 161, 193, 1)",
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
        color: isDark.value ? "rgba(216, 222, 233, 0.7)" : "rgba(46, 52, 64, 0.7)",
        font: { size: 12, family: "'Geist', sans-serif" },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: isDark.value ? "rgba(46, 52, 64, 0.95)" : "rgba(236, 239, 244, 0.95)",
      titleColor: isDark.value ? "rgba(216, 222, 233, 0.9)" : "rgba(46, 52, 64, 0.9)",
      bodyColor: isDark.value ? "rgba(216, 222, 233, 0.8)" : "rgba(46, 52, 64, 0.8)",
      titleFont: { size: 13, family: "'Geist', sans-serif" },
      bodyFont: { size: 12, family: "'Geist', sans-serif" },
      padding: 12,
      cornerRadius: 8,
      borderColor: isDark.value ? "rgba(216, 222, 233, 0.1)" : "rgba(46, 52, 64, 0.1)",
      borderWidth: 1,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} €`,
      },
    },
  },
  scales: {
    x: {
      ticks: { 
        color: isDark.value ? "rgba(216, 222, 233, 0.5)" : "rgba(46, 52, 64, 0.5)", 
        font: { size: 11, family: "'Geist', sans-serif" } 
      },
      grid: { display: false },
    },
    y: {
      ticks: {
        color: isDark.value ? "rgba(216, 222, 233, 0.5)" : "rgba(46, 52, 64, 0.5)",
        font: { size: 11, family: "'Geist', sans-serif" },
        callback: (val) => `${val} €`,
      },
      grid: { 
        color: isDark.value ? "rgba(216, 222, 233, 0.05)" : "rgba(46, 52, 64, 0.05)",
        drawBorder: false,
      },
    },
  },
}));
</script>

<template>
  <div class="space-y-6">
    <!-- Répartition des charges (Doughnut) -->
    <div v-if="hasCharges" class="terminal-card overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 flex items-center justify-between border-b border-base-content/[0.06]">
        <div class="flex items-center gap-3">
          <span class="inline-block w-2 h-2 rounded-full bg-primary"></span>
          <span class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/60">Répartition des charges</span>
        </div>
        <PieChart :size="14" class="text-base-content/30" />
      </div>
      <div class="p-6">
        <div class="h-72">
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
        </div>
      </div>
    </div>

    <!-- Évolution mensuelle (Bar) -->
    <div v-if="hasMultipleMonths" class="terminal-card overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 flex items-center justify-between border-b border-base-content/[0.06]">
        <div class="flex items-center gap-3">
          <span class="inline-block w-2 h-2 rounded-full bg-info"></span>
          <span class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/60">Évolution mensuelle</span>
        </div>
        <BarChart3 :size="14" class="text-base-content/30" />
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
      class="terminal-card overflow-hidden"
    >
      <div class="p-8 text-center">
        <div class="w-16 h-16 rounded-lg bg-base-content/5 flex items-center justify-center mx-auto mb-4">
          <BarChart3 :size="32" class="text-base-content/30" stroke-width="1.5" />
        </div>
        <p class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/40">Les graphiques apparaîtront une fois des données ajoutées</p>
      </div>
    </div>
  </div>
</template>
