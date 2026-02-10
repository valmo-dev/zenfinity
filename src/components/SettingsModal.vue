<script setup>
import { ref, watch, computed } from "vue";
import { useBudgetStore } from "../stores/budget";
import { Settings, X, User, UsersRound, Info, Handshake } from "lucide-vue-next";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "save"]);

const store = useBudgetStore();

const householdMode = ref(store.householdMode);
const ownerNames = ref([...store.owners]);

// Reset values when modal opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      householdMode.value = store.householdMode;
      ownerNames.value = [...store.owners];
      // Ensure we have the right number of names
      while (ownerNames.value.length < 2) {
        ownerNames.value.push(`Personne ${ownerNames.value.length + 1}`);
      }
    }
  }
);

const showTwoNames = computed(() => householdMode.value !== "single");

const displayedOwners = computed(() => {
  return showTwoNames.value ? ownerNames.value.slice(0, 2) : ownerNames.value.slice(0, 1);
});

const isValid = computed(() => {
  const names = displayedOwners.value;
  // All names must be non-empty
  if (names.some((n) => !n.trim())) return false;
  // Names must be unique
  const uniqueNames = new Set(names.map((n) => n.trim().toLowerCase()));
  if (uniqueNames.size !== names.length) return false;
  // "Commun" is reserved
  if (names.some((n) => n.trim().toLowerCase() === "commun")) return false;
  return true;
});

function handleSubmit() {
  if (!isValid.value) return;
  
  const newOwners = displayedOwners.value.map((n) => n.trim());
  store.setOwners(newOwners);
  store.setHouseholdMode(householdMode.value);
  emit("save");
}

function handleClose() {
  emit("close");
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="handleClose"
        ></div>

        <!-- Modal -->
        <div
          class="relative w-full max-w-md bg-base-100 border border-base-content/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-base-content/10 bg-gradient-to-r from-blue-500/10 to-transparent">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-base-content flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Settings :size="16" class="text-blue-400" />
                </div>
                Paramètres
              </h2>
              <button
                class="w-8 h-8 rounded-full bg-base-content/5 hover:bg-base-content/10 flex items-center justify-center transition-colors"
                @click="handleClose"
              >
                <X :size="16" class="text-base-content/60" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <!-- Household mode -->
            <div class="space-y-3">
              <label class="text-sm font-medium text-base-content/70">
                Mode du foyer
              </label>
              <div class="flex flex-col gap-2">
                <button
                  type="button"
                  class="w-full py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 text-left"
                  :class="householdMode === 'single' 
                    ? 'border-primary bg-primary/20 text-primary' 
                    : 'border-base-content/10 bg-base-content/5 text-base-content/60 hover:bg-base-content/10'"
                  @click="householdMode = 'single'"
                >
                  <User :size="20" class="flex-shrink-0" />
                  <div>
                    <span class="font-medium block">1 personne</span>
                    <span class="text-xs opacity-70">Budget individuel</span>
                  </div>
                </button>
                <button
                  type="button"
                  class="w-full py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 text-left"
                  :class="householdMode === 'separate' 
                    ? 'border-primary bg-primary/20 text-primary' 
                    : 'border-base-content/10 bg-base-content/5 text-base-content/60 hover:bg-base-content/10'"
                  @click="householdMode = 'separate'"
                >
                  <UsersRound :size="20" class="flex-shrink-0" />
                  <div>
                    <span class="font-medium block">2 personnes - comptes séparés</span>
                    <span class="text-xs opacity-70">Chacun gère son budget, charges communes réparties</span>
                  </div>
                </button>
                <button
                  type="button"
                  class="w-full py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 text-left"
                  :class="householdMode === 'joint' 
                    ? 'border-primary bg-primary/20 text-primary' 
                    : 'border-base-content/10 bg-base-content/5 text-base-content/60 hover:bg-base-content/10'"
                  @click="householdMode = 'joint'"
                >
                  <Handshake :size="20" class="flex-shrink-0" />
                  <div>
                    <span class="font-medium block">2 personnes - compte commun</span>
                    <span class="text-xs opacity-70">Un seul budget foyer, épargne répartie 50/50</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Owner names -->
            <div v-if="showTwoNames || householdMode === 'single'" class="space-y-3">
              <label class="text-sm font-medium text-base-content/70">
                {{ householdMode === 'single' ? 'Nom' : 'Noms des personnes' }}
              </label>
              <div class="space-y-3">
                <div
                  v-for="(_, index) in displayedOwners"
                  :key="index"
                  class="relative"
                >
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div 
                      class="w-2 h-2 rounded-full"
                      :class="index === 0 ? 'bg-primary' : 'bg-secondary'"
                    ></div>
                  </div>
                  <input
                    v-model="ownerNames[index]"
                    type="text"
                    class="w-full pl-10 pr-4 py-3 bg-base-content/5 border border-base-content/10 rounded-xl text-base-content placeholder-base-content/30 focus:outline-none focus:border-primary/50 focus:bg-base-content/10 transition-all"
                    :placeholder="`Personne ${index + 1}`"
                    maxlength="30"
                  />
                </div>
              </div>
              <p v-if="!isValid" class="text-xs text-red-400">
                Les noms doivent être uniques et non vides. "Commun" est réservé.
              </p>
            </div>

            <!-- Info -->
            <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div class="flex gap-3">
                <Info :size="20" class="text-blue-400 flex-shrink-0 mt-0.5" />
                <p class="text-sm text-blue-400/80">
                  Les modifications seront appliquées à toutes vos données existantes.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-base-content/10 flex justify-end gap-3">
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl bg-base-content/5 hover:bg-base-content/10 text-base-content/70 font-medium transition-colors"
              @click="handleClose"
            >
              Annuler
            </button>
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-content font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!isValid"
              @click="handleSubmit"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
