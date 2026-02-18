<script setup>
import { ref, computed, inject } from "vue";
import { useBudgetStore } from "../stores/budget";
import { User, UsersRound, Handshake, Info } from "lucide-vue-next";


const store = useBudgetStore();
const showToast = inject("showToast");

// Local copies for editing
const localMode = ref(store.householdMode);
const localOwners = ref([...store.owners]);

const modeOptions = [
  {
    value: "single",
    label: "Individuel",
    icon: User,
    description: "Budget pour une seule personne",
  },
  {
    value: "separate",
    label: "Séparé",
    icon: UsersRound,
    description: "Budget séparé par personne",
  },
  {
    value: "joint",
    label: "Commun",
    icon: Handshake,
    description: "Budget commun du foyer",
  },
];

function selectMode(mode) {
  localMode.value = mode;
  if (mode === "single") {
    localOwners.value = [localOwners.value[0] || "Moi"];
  } else if (localOwners.value.length < 2) {
    localOwners.value.push("Partenaire");
  }
}

function save() {
  store.setHouseholdMode(localMode.value);
  store.setOwners([...localOwners.value]);
  if (showToast) showToast("success", "Paramètres enregistrés");
}

// Reset local state when store changes
function resetLocal() {
  localMode.value = store.householdMode;
  localOwners.value = [...store.owners];
}
</script>

<template>
  <div class="space-y-8">
    <!-- Titre de page -->
    <div>
      <p class="text-[11px] font-mono uppercase tracking-[0.2em] text-primary/60 mb-1 flex items-center gap-2">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
        Configuration
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-base-content">Paramètres</h1>
      <p class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/40 mt-2">
        Configuration du foyer et objectifs
      </p>
    </div>

    <!-- Mode du foyer -->
    <div class="terminal-card p-0 overflow-hidden">
      <div class="px-6 py-4 flex items-center justify-between border-b border-base-content/[0.06]">
        <div class="flex items-center gap-3">
          <span class="inline-block w-2 h-2 rounded-full bg-info"></span>
          <span class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/60">Mode du foyer</span>
        </div>
      </div>
      <div class="p-6 space-y-6">
        <!-- Mode selection -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            v-for="option in modeOptions"
            :key="option.value"
            @click="selectMode(option.value)"
            class="terminal-card p-4 text-left transition-all cursor-pointer"
            :class="
              localMode === option.value
                ? 'border-primary bg-primary/10 brutal-shadow-active'
                : 'hover:translate-x-1 hover:-translate-y-1'
            "
          >
            <div class="flex items-center gap-3 mb-2">
              <div
                class="w-10 h-10 rounded border border-base-content/[0.06] flex items-center justify-center"
                :class="
                  localMode === option.value ? 'bg-primary text-primary-content' : 'bg-base-content/5'
                "
              >
                <component :is="option.icon" :size="20" />
              </div>
              <span class="font-semibold text-sm uppercase">{{
                option.label
              }}</span>
            </div>
            <p class="text-xs text-base-content/60">{{ option.description }}</p>
          </button>
        </div>

        <!-- Owner names -->
        <div class="space-y-3">
          <label class="text-[11px] font-mono uppercase tracking-[0.15em] text-base-content/60"
            >Noms des personnes</label
          >
          <div
            v-for="(owner, index) in localOwners"
            :key="index"
            class="flex items-center gap-3"
          >
            <div
              class="w-3 h-3 rounded-full border border-base-content/[0.06]"
              :class="index === 0 ? 'bg-primary' : 'bg-secondary'"
            ></div>
            <input
              v-model="localOwners[index]"
              type="text"
              :aria-label="`Nom de la personne ${index + 1}`"
              class="w-full max-w-xs px-4 py-3 bg-base-content/5 border border-base-content/[0.06] rounded text-base-content focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              :placeholder="'Personne ' + (index + 1)"
            />
          </div>
        </div>

        <!-- Info box -->
        <div
          class="terminal-card p-4 border-info/20"
        >
          <div class="flex gap-3">
            <Info :size="18" class="text-info shrink-0 mt-0.5" />
            <p class="text-sm text-base-content/70">
              Le mode détermine comment les revenus et charges sont répartis et
              affichés. Vous pouvez changer de mode à tout moment.
            </p>
          </div>
        </div>

        <!-- Save / Reset buttons -->
        <div class="flex justify-end gap-3">
          <button class="brutal-btn brutal-btn-ghost" @click="resetLocal">
            Réinitialiser
          </button>
          <button class="brutal-btn brutal-btn-primary" @click="save">
            Enregistrer
          </button>
        </div>
      </div>
    </div>


  </div>
</template>
