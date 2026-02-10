<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useBudgetStore } from "../stores/budget";
import { DEFAULT_CATEGORIES } from "../stores/budget";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Ex: Salaire, Loyer, Courses...",
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  focusColor: {
    type: String,
    default: "primary",
  },
});

const emit = defineEmits(["update:modelValue"]);

const store = useBudgetStore();

const inputRef = ref(null);
const isOpen = ref(false);
const highlightIndex = ref(-1);

const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Combine used categories + defaults, filtered by search
const suggestions = computed(() => {
  const query = inputValue.value.toLowerCase().trim();
  const used = store.usedCategories;

  // Default categories for the selected type
  const defaultsForType = props.type
    ? DEFAULT_CATEGORIES[props.type] || []
    : [...DEFAULT_CATEGORIES.Revenu, ...DEFAULT_CATEGORIES.Charge];

  // Merge: used first, then defaults not already in used
  const usedLower = new Set(used.map((c) => c.toLowerCase()));
  const allCats = [
    ...used,
    ...defaultsForType.filter((c) => !usedLower.has(c.toLowerCase())),
  ];

  if (!query) return allCats.slice(0, 15);

  return allCats
    .filter((cat) => cat.toLowerCase().includes(query))
    .slice(0, 10);
});

function onFocus() {
  isOpen.value = true;
  highlightIndex.value = -1;
}

function onBlur() {
  // Delay to allow click on suggestion
  setTimeout(() => {
    isOpen.value = false;
    // Normalize: capitalize first letter, trim
    if (inputValue.value) {
      const trimmed = inputValue.value.trim();
      if (trimmed) {
        inputValue.value = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      }
    }
  }, 150);
}

function onInput() {
  isOpen.value = true;
  highlightIndex.value = -1;
}

function selectSuggestion(cat) {
  inputValue.value = cat;
  isOpen.value = false;
  highlightIndex.value = -1;
}

function onKeydown(e) {
  if (!isOpen.value || suggestions.value.length === 0) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      isOpen.value = true;
    }
    return;
  }

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      highlightIndex.value = Math.min(
        highlightIndex.value + 1,
        suggestions.value.length - 1,
      );
      break;
    case "ArrowUp":
      e.preventDefault();
      highlightIndex.value = Math.max(highlightIndex.value - 1, -1);
      break;
    case "Enter":
      e.preventDefault();
      if (highlightIndex.value >= 0 && highlightIndex.value < suggestions.value.length) {
        selectSuggestion(suggestions.value[highlightIndex.value]);
      }
      break;
    case "Escape":
      isOpen.value = false;
      highlightIndex.value = -1;
      break;
  }
}

const showDropdown = computed(
  () => isOpen.value && suggestions.value.length > 0,
);
</script>

<template>
  <div class="relative">
    <input
      ref="inputRef"
      v-model="inputValue"
      type="text"
      :placeholder="placeholder"
      class="w-full px-4 py-3 rounded-xl bg-base-content/5 border text-base-content placeholder-base-content/30 focus:outline-none focus:ring-2 transition-all"
      :class="hasError
        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
        : focusColor === 'secondary'
          ? 'border-base-content/10 focus:border-secondary/50 focus:ring-secondary/20'
          : 'border-base-content/10 focus:border-primary/50 focus:ring-primary/20'"
      autocomplete="off"
      @focus="onFocus"
      @blur="onBlur"
      @input="onInput"
      @keydown="onKeydown"
    />

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="showDropdown"
        class="absolute z-50 w-full mt-1 py-1 rounded-xl bg-base-100 border border-base-content/10 shadow-2xl max-h-48 overflow-y-auto"
      >
        <button
          v-for="(cat, index) in suggestions"
          :key="cat"
          type="button"
          class="w-full text-left px-4 py-2 text-sm transition-colors"
          :class="index === highlightIndex
            ? 'bg-primary/20 text-base-content'
            : 'text-base-content/80 hover:bg-base-content/5'"
          @mousedown.prevent="selectSuggestion(cat)"
          @mouseenter="highlightIndex = index"
        >
          {{ cat }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
