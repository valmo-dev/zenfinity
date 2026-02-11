<script setup>
import { ref, provide, computed } from "vue";
import { useBudgetStore } from "./stores/budget";
import { Sun, Moon, Plus, Menu } from "lucide-vue-next";
import AppSidebar from "./components/AppSidebar.vue";
import AddEntryModal from "./components/AddEntryModal.vue";
import ToastNotification from "./components/ToastNotification.vue";

const store = useBudgetStore();
const showAddModal = ref(false);
const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);
const toastRef = ref(null);

// Theme toggle
const isDarkTheme = computed({
  get: () => store.theme === "zenfinity-dark",
  set: (value) => store.setTheme(value ? "zenfinity-dark" : "zenfinity-light"),
});

function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value;
}

// Toast system
function showToast(type, message, duration = 4000) {
  if (toastRef.value) {
    toastRef.value.addToast(type, message, duration);
  } else {
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type, message, duration },
      }),
    );
  }
}

provide("showToast", showToast);

function handleEntryAdded() {
  showAddModal.value = false;
  showToast("success", "Entrée ajoutée avec succès");
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Sidebar -->
    <AppSidebar
      v-model:open="sidebarOpen"
      v-model:collapsed="sidebarCollapsed"
    />

    <!-- Main content area -->
    <div
      class="min-h-screen transition-[margin] duration-200 ease-in-out"
      :class="sidebarCollapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-64'"
    >
      <!-- Top bar -->
      <header
        class="sticky top-0 z-20 bg-base-200 border-b border-base-content/[0.06] px-4 sm:px-6 py-4 flex items-center justify-between"
      >
        <!-- Mobile menu button -->
        <button
          class="brutal-btn !p-2 cursor-pointer lg:!hidden"
          @click="sidebarOpen = true"
        >
          <Menu :size="22" />
        </button>

        <div class="flex-1"></div>

        <div class="flex items-center gap-3">
          <!-- System Status indicator -->
          <div class="hidden sm:flex flex-col items-end mr-1">
            <span
              class="text-[10px] font-mono uppercase tracking-[0.15em] text-base-content/40 leading-tight"
              >État Système</span
            >
            <div class="flex items-center gap-1.5">
              <span class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3BE8C] opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-2 w-2 bg-[#A3BE8C]"
                ></span>
              </span>
              <span class="text-xs font-semibold font-mono text-base-content/80"
                >Opérationnel</span
              >
            </div>
          </div>

          <!-- Theme toggle -->
          <button
            class="brutal-btn w-10 h-10 !p-0 flex items-center justify-center cursor-pointer"
            @click="toggleTheme"
            :title="
              isDarkTheme ? 'Passer au theme clair' : 'Passer au theme sombre'
            "
          >
            <Sun v-if="isDarkTheme" :size="20" :stroke-width="2" />
            <Moon v-else :size="20" :stroke-width="2" />
          </button>

          <!-- Add button -->
          <button
            class="brutal-btn brutal-btn-primary cursor-pointer"
            @click="showAddModal = true"
            title="Ajouter un revenu ou une charge"
          >
            <Plus :size="18" stroke-width="2" />
            <span class="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </header>

      <!-- Router content -->
      <main class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <router-view />
      </main>

      <!-- Footer -->
      <footer class="border-t border-base-content/[0.06] p-6 text-center">
        <p class="text-xs font-medium tracking-widest text-base-content/50">
          ZenFinity &middot; Budget Tracker
        </p>
      </footer>
    </div>

    <!-- Modal d'ajout (global) -->
    <AddEntryModal
      :isOpen="showAddModal"
      @close="showAddModal = false"
      @added="handleEntryAdded"
    />

    <!-- Toast notifications (global) -->
    <ToastNotification ref="toastRef" />
  </div>
</template>
