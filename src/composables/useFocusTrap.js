import { watch, nextTick } from "vue";

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Composable pour piéger le focus dans un élément (modale, etc.)
 * @param {import('vue').Ref<HTMLElement|null>} containerRef - Ref vers le conteneur
 * @param {import('vue').Ref<boolean>} isActive - Ref indiquant si le trap est actif
 * @param {Object} options
 * @param {Function} [options.onEscape] - Callback appelé quand Escape est pressé
 */
export function useFocusTrap(containerRef, isActive, { onEscape } = {}) {
  let previouslyFocusedElement = null;

  function getFocusableElements() {
    if (!containerRef.value) return [];
    return [...containerRef.value.querySelectorAll(FOCUSABLE_SELECTORS)].filter(
      (el) => !el.closest('[hidden]') && el.offsetParent !== null
    );
  }

  function handleKeydown(e) {
    if (e.key === "Escape" && onEscape) {
      e.preventDefault();
      onEscape();
      return;
    }

    if (e.key !== "Tab") return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  watch(isActive, async (active) => {
    if (active) {
      previouslyFocusedElement = document.activeElement;
      await nextTick();
      // Focus le conteneur ou le premier élément focusable
      if (containerRef.value) {
        containerRef.value.addEventListener("keydown", handleKeydown);
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          containerRef.value.focus();
        }
      }
    } else {
      if (containerRef.value) {
        containerRef.value.removeEventListener("keydown", handleKeydown);
      }
      // Restaurer le focus précédent
      if (previouslyFocusedElement && previouslyFocusedElement.focus) {
        previouslyFocusedElement.focus();
        previouslyFocusedElement = null;
      }
    }
  });
}
