<script setup>
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PieChart,
  FolderSync,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-vue-next";
import zenfinityLogo from "../assets/zenfinity.webp";

const props = defineProps({
  open: Boolean,
  collapsed: Boolean,
});

const emit = defineEmits(["update:open", "update:collapsed"]);

const route = useRoute();

const navItems = [
  {
    to: "/",
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    to: "/budget",
    label: "Budget",
    icon: Wallet,
  },
  {
    to: "/revenus",
    label: "Revenus & Charges",
    icon: ArrowLeftRight,
  },
  {
    to: "/repartition",
    label: "Répartition",
    icon: PieChart,
  },
  {
    to: "/import-export",
    label: "Import / Export",
    icon: FolderSync,
  },
  {
    to: "/parametres",
    label: "Paramètres",
    icon: Settings,
  },
];

function isActive(to) {
  return route.path === to;
}

function toggleCollapse() {
  emit("update:collapsed", !props.collapsed);
}

function handleNavClick() {
  // Close mobile sidebar on nav click
  emit("update:open", false);
}

// Close sidebar on route change (mobile)
watch(
  () => route.path,
  () => {
    emit("update:open", false);
  }
);
</script>

<template>
  <!-- Mobile overlay -->
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 bg-black/60 z-40 lg:hidden"
      @click="$emit('update:open', false)"
    ></div>
  </Transition>

  <aside
    class="fixed top-0 left-0 h-full bg-base-200 border-r-3 border-brutal z-50 flex flex-col overflow-y-auto sidebar-brutal"
    :class="[
      collapsed ? 'w-[4.5rem]' : 'w-64',
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <!-- Logo -->
    <div class="p-4 border-b-3 border-brutal flex items-center" :class="collapsed ? 'justify-center' : 'gap-3'">
      <router-link to="/" class="flex items-center gap-3 shrink-0" @click="handleNavClick">
        <div
          class="w-10 h-10 border-3 border-brutal bg-base-100 p-1 flex items-center justify-center brutal-shadow-sm"
        >
          <img :src="zenfinityLogo" alt="ZenFinity" class="w-full h-full object-contain" />
        </div>
        <div v-if="!collapsed" class="overflow-hidden">
          <h1 class="text-lg font-black tracking-tight uppercase whitespace-nowrap">
            ZenFinity
          </h1>
          <p class="text-[10px] font-bold uppercase text-base-content/50 tracking-widest whitespace-nowrap">
            Budget Tracker
          </p>
        </div>
      </router-link>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-3 space-y-1">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        @click="handleNavClick"
        class="flex items-center gap-3 font-bold text-sm uppercase tracking-wide transition-all duration-150 border-3"
        :class="[
          collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
          isActive(item.to)
            ? 'bg-primary text-primary-content border-brutal brutal-shadow-sm'
            : 'border-transparent hover:border-base-content/20 hover:bg-base-content/5 text-base-content/70 hover:text-base-content',
        ]"
        :title="collapsed ? item.label : undefined"
      >
        <component :is="item.icon" :size="20" :stroke-width="2.5" class="shrink-0" />
        <span v-if="!collapsed" class="whitespace-nowrap overflow-hidden">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Collapse toggle (desktop only) -->
    <div class="hidden lg:block p-3 border-t-3 border-brutal">
      <button
        @click="toggleCollapse"
        class="w-full flex items-center gap-3 px-3 py-2 border-3 border-transparent hover:border-base-content/20 hover:bg-base-content/5 text-base-content/50 hover:text-base-content transition-all font-bold text-xs uppercase cursor-pointer"
        :class="collapsed ? 'justify-center' : ''"
        :title="collapsed ? 'Agrandir' : 'Réduire'"
      >
        <ChevronsLeft v-if="!collapsed" :size="18" :stroke-width="2.5" />
        <ChevronsRight v-else :size="18" :stroke-width="2.5" />
        <span v-if="!collapsed">Réduire</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-brutal {
  transition: width 0.2s ease, transform 0.2s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
