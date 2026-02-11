import { defineStore } from "pinia";

let _saveTimeout = null;
function debouncedSave(state) {
  clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(() => {
    localStorage.setItem("budgetStore", JSON.stringify(state));
  }, 150);
}


function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Feature 2 : Catégories prédéfinies par défaut
export const DEFAULT_CATEGORIES = {
  Revenu: ["Salaire", "Freelance", "Allocations", "Remboursement", "Autres revenus"],
  Charge: [
    "Loyer", "Énergie", "Eau", "Internet", "Téléphone", "Assurance",
    "Courses", "Transport", "Santé", "Loisirs", "Abonnements",
    "Vêtements", "Restaurant", "Cadeaux", "Impôts", "Autres charges",
  ],
};

export const useBudgetStore = defineStore("budget", {
  state: () => {
    try {
      const savedState = localStorage.getItem("budgetStore");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Migration : ajouter les champs manquants pour les anciennes données
        if (parsed.items) {
          parsed.items = parsed.items.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            month: item.month || getCurrentMonth(),
          }));
        }
        // Migration des anciens taux d'épargne individuels
        const savingRates = parsed.savingRates || {
          Personne1: parsed.savingRatePersonne1 || 30,
          Personne2: parsed.savingRatePersonne2 || 30,
        };
        // Migration : déduire householdMode si absent
        const owners = parsed.owners || ["Personne1", "Personne2"];
        const householdMode =
          parsed.householdMode ||
          (owners.length === 1 ? "single" : "separate");
        return {
          items: parsed.items || [],
          savingRates,
          communalChargesDistribution: parsed.communalChargesDistribution || {
            Personne1: 60,
            Personne2: 40,
          },
          selectedMonth: parsed.selectedMonth || getCurrentMonth(),
          owners,
          householdMode,
          foyerSavingRate: parsed.foyerSavingRate ?? 30,
          theme: parsed.theme || "zenfinity-dark",
          // Feature 1 : Récurrences
          recurringItems: parsed.recurringItems || [],
          appliedRecurringMonths: parsed.appliedRecurringMonths || [],
          // Feature 3 : Budget par catégorie
          categoryBudgets: parsed.categoryBudgets || {},
          // Feature 4 : Objectifs d'épargne
          savingsGoals: (parsed.savingsGoals || []).map((g) => ({
            ...g,
            owner: g.owner !== undefined ? g.owner : null,
          })),
        };
      }
    } catch (e) {
      // Corrupted localStorage — fall through to default state
      console.warn("Failed to parse budgetStore from localStorage:", e);
    }
    return {
      items: [],
      savingRates: { Personne1: 30, Personne2: 30 },
      communalChargesDistribution: { Personne1: 60, Personne2: 40 },
      selectedMonth: getCurrentMonth(),
      owners: ["Personne1", "Personne2"],
      householdMode: "separate",
      foyerSavingRate: 30,
      theme: "zenfinity-dark",
      // Feature 1 : Récurrences
      recurringItems: [],
      appliedRecurringMonths: [],
      // Feature 3 : Budget par catégorie
      categoryBudgets: {},
      // Feature 4 : Objectifs d'épargne
      savingsGoals: [],
    };
  },

  getters: {
    currentMonthItems(state) {
      return state.items.filter((item) => item.month === state.selectedMonth);
    },

    availableMonths(state) {
      const months = new Set(state.items.map((item) => item.month));
      months.add(state.selectedMonth);
      return [...months].sort();
    },

    revenueByOwner() {
      return (owner) =>
        this.currentMonthItems
          .filter(
            (item) =>
              item.type === "Revenu" &&
              item.owner.toLowerCase() === owner.toLowerCase(),
          )
          .reduce((sum, item) => sum + Number(item.amount), 0);
    },

    totalRevenue() {
      return this.currentMonthItems
        .filter((item) => item.type === "Revenu")
        .reduce((sum, item) => sum + Number(item.amount), 0);
    },

    contributionPercentage() {
      return (owner) => {
        const total = this.totalRevenue;
        if (total === 0) return 0;
        return Number(((this.revenueByOwner(owner) / total) * 100).toFixed(1));
      };
    },

    personalChargesByOwner() {
      return (owner) =>
        this.currentMonthItems
          .filter(
            (item) =>
              item.type === "Charge" &&
              item.owner.toLowerCase() === owner.toLowerCase(),
          )
          .reduce((sum, item) => sum + Number(item.amount), 0);
    },

    totalCommunalCharges() {
      return this.currentMonthItems
        .filter(
          (item) =>
            item.type === "Charge" && item.owner.toLowerCase() === "commun",
        )
        .reduce((sum, item) => sum + Number(item.amount), 0);
    },

    communalChargesShare(state) {
      return (owner) => {
        const percentage = state.communalChargesDistribution[owner] || 0;
        return Number(
          (this.totalCommunalCharges * (percentage / 100)).toFixed(2),
        );
      };
    },

    effectiveCharges() {
      return (owner) =>
        Number(
          (
            this.personalChargesByOwner(owner) +
            this.communalChargesShare(owner)
          ).toFixed(2),
        );
    },

    remainingBeforeCommunal() {
      return (owner) =>
        Number(
          (
            this.revenueByOwner(owner) - this.personalChargesByOwner(owner)
          ).toFixed(2),
        );
    },

    remainingAfterCommunal() {
      return (owner) =>
        Number(
          (
            this.remainingBeforeCommunal(owner) -
            this.communalChargesShare(owner)
          ).toFixed(2),
        );
    },

    netIncome() {
      return (owner) => this.remainingAfterCommunal(owner);
    },

    savingPotential(state) {
      return (owner) => {
        const rate = state.savingRates[owner] || 0;
        return Number(
          (this.remainingAfterCommunal(owner) * (rate / 100)).toFixed(2),
        );
      };
    },

    remainingAfterSaving() {
      return (owner) =>
        Number(
          (
            this.remainingAfterCommunal(owner) - this.savingPotential(owner)
          ).toFixed(2),
        );
    },

    revenueItems() {
      return this.currentMonthItems.filter((item) => item.type === "Revenu");
    },

    communalChargeItems() {
      return this.currentMonthItems.filter(
        (item) =>
          item.type === "Charge" && item.owner.toLowerCase() === "commun",
      );
    },

    personalChargeItems() {
      return (owner) =>
        this.currentMonthItems.filter(
          (item) =>
            item.type === "Charge" &&
            item.owner.toLowerCase() === owner.toLowerCase(),
        );
    },

    totalCharges() {
      return this.currentMonthItems
        .filter((item) => item.type === "Charge")
        .reduce((sum, item) => sum + Number(item.amount), 0);
    },

    chargesBreakdown() {
      const charges = this.currentMonthItems.filter(
        (item) => item.type === "Charge",
      );
      const breakdown = {};
      const needsOwnerSuffix = this.householdMode === "separate";
      charges.forEach((item) => {
        const key = needsOwnerSuffix
          ? item.owner === "Commun"
            ? `${item.category} (Commun)`
            : `${item.category} (${item.owner})`
          : item.category;
        breakdown[key] =
          Math.round(((breakdown[key] || 0) + Number(item.amount)) * 100) / 100;
      });
      return breakdown;
    },

    monthlyEvolution(state) {
      const months = [...this.availableMonths].sort();
      return months.map((month) => {
        const monthItems = state.items.filter((item) => item.month === month);
        const revenus = monthItems
          .filter((item) => item.type === "Revenu")
          .reduce((sum, item) => sum + Number(item.amount), 0);
        const charges = monthItems
          .filter((item) => item.type === "Charge")
          .reduce((sum, item) => sum + Number(item.amount), 0);
        return {
          month,
          revenus,
          charges,
          net: Number((revenus - charges).toFixed(2)),
        };
      });
    },

    currentMonthHasItems() {
      return this.currentMonthItems.length > 0;
    },

    // === Getters mode "joint" (compte commun) ===

    isJointMode(state) {
      return state.householdMode === "joint";
    },

    totalFoyerRevenue() {
      return this.totalRevenue;
    },

    totalFoyerCharges() {
      return this.currentMonthItems
        .filter((item) => item.type === "Charge")
        .reduce((sum, item) => sum + Number(item.amount), 0);
    },

    foyerNetIncome() {
      return Number((this.totalFoyerRevenue - this.totalFoyerCharges).toFixed(2));
    },

    foyerSavingPotential(state) {
      return Number(
        (this.foyerNetIncome * (state.foyerSavingRate / 100)).toFixed(2),
      );
    },

    foyerSavingPerPerson(state) {
      const count = state.owners.length || 1;
      return Number((this.foyerSavingPotential / count).toFixed(2));
    },

    foyerRemainingAfterSaving() {
      return Number((this.foyerNetIncome - this.foyerSavingPotential).toFixed(2));
    },

    allChargeItems() {
      return this.currentMonthItems.filter((item) => item.type === "Charge");
    },

    // === Feature 1 : Récurrences ===

    activeRecurringItems(state) {
      return state.recurringItems.filter((item) => item.isActive);
    },

    hasRecurringBeenApplied(state) {
      return (month) => state.appliedRecurringMonths.includes(month);
    },

    // === Feature 2 : Catégories utilisées ===

    usedCategories(state) {
      const allCats = [
        ...state.items.map((i) => i.category),
        ...state.recurringItems.map((i) => i.category),
      ];
      const seen = new Map();
      allCats.forEach((cat) => {
        const key = cat.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.set(key, cat.trim());
        }
      });
      return [...seen.values()].sort((a, b) =>
        a.localeCompare(b, "fr", { sensitivity: "base" }),
      );
    },

    // === Feature 3 : Budget par catégorie ===

    categorySpending(state) {
      return (category, owner) => {
        let charges = this.currentMonthItems.filter(
          (item) =>
            item.type === "Charge" &&
            item.category.toLowerCase() === category.toLowerCase(),
        );
        if (owner) {
          charges = charges.filter(
            (item) => item.owner.toLowerCase() === owner.toLowerCase(),
          );
        }
        return charges.reduce((sum, item) => sum + Number(item.amount), 0);
      };
    },

    categoryBudgetStatus(state) {
      return (category, owner) => {
        const budgetDef = state.categoryBudgets[category];
        if (!budgetDef) return null;

        let budget;
        if (owner && budgetDef.perPerson && budgetDef.perPerson[owner] != null) {
          budget = budgetDef.perPerson[owner];
        } else {
          budget = budgetDef.global;
        }
        if (budget == null || budget <= 0) return null;

        const spent = this.categorySpending(category, owner);
        const remaining = Number((budget - spent).toFixed(2));
        const percentage = Number(((spent / budget) * 100).toFixed(1));
        let status = "ok";
        if (percentage > 100) status = "over";
        else if (percentage >= 80) status = "warning";

        return { budget, spent, remaining, percentage, status };
      };
    },

    categoriesWithBudget(state) {
      return Object.keys(state.categoryBudgets);
    },

    // === Feature 4 : Objectifs d'épargne ===

    goalProgress(state) {
      return (goalId) => {
        const goal = state.savingsGoals.find((g) => g.id === goalId);
        if (!goal) return { totalSaved: 0, remaining: 0, percentage: 0 };
        const totalSaved = goal.allocations.reduce(
          (sum, a) => sum + Number(a.amount),
          0,
        );
        const remaining = Number((goal.targetAmount - totalSaved).toFixed(2));
        const percentage = goal.targetAmount > 0
          ? Number(((totalSaved / goal.targetAmount) * 100).toFixed(1))
          : 0;
        return { totalSaved, remaining: Math.max(0, remaining), percentage: Math.min(percentage, 100) };
      };
    },

    goalAllocationForMonth(state) {
      return (goalId, month, allocOwner = undefined) => {
        const goal = state.savingsGoals.find((g) => g.id === goalId);
        if (!goal) return 0;
        if (allocOwner !== undefined) {
          // Allocation d'une personne spécifique (objectif commun)
          const alloc = goal.allocations.find(
            (a) => a.month === month && a.owner === allocOwner,
          );
          return alloc ? Number(alloc.amount) : 0;
        }
        // Total de toutes les allocations pour ce mois
        return goal.allocations
          .filter((a) => a.month === month)
          .reduce((sum, a) => sum + Number(a.amount), 0);
      };
    },

    totalAllocatedForMonth(state) {
      return (month, owner = undefined) => {
        if (owner !== undefined) {
          // Somme des allocations imputables à ce owner :
          // - Objectifs personnels de ce owner : toutes les allocations du mois
          // - Objectifs communs : uniquement les allocations avec alloc.owner === owner
          return state.savingsGoals.reduce((sum, goal) => {
            if (goal.owner === owner) {
              // Objectif personnel de ce owner
              return sum + goal.allocations
                .filter((a) => a.month === month)
                .reduce((s, a) => s + Number(a.amount), 0);
            }
            if (goal.owner === null) {
              // Objectif commun : part de ce owner uniquement
              return sum + goal.allocations
                .filter((a) => a.month === month && a.owner === owner)
                .reduce((s, a) => s + Number(a.amount), 0);
            }
            return sum;
          }, 0);
        }
        // Sans filtre : somme totale toutes allocations
        return state.savingsGoals.reduce((sum, goal) => {
          return sum + goal.allocations
            .filter((a) => a.month === month)
            .reduce((s, a) => s + Number(a.amount), 0);
        }, 0);
      };
    },

    activeGoals(state) {
      return state.savingsGoals.filter((goal) => {
        const totalSaved = goal.allocations.reduce(
          (sum, a) => sum + Number(a.amount),
          0,
        );
        return totalSaved < goal.targetAmount;
      });
    },
  },

  actions: {
    saveState() {
      debouncedSave(this.$state);
    },

    addItem(item) {
      this.items.push({
        ...item,
        id: crypto.randomUUID(),
        month: this.selectedMonth,
      });
      this.saveState();
    },

    deleteItem(id) {
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items.splice(index, 1);
        this.saveState();
      }
    },

    editItem(id, updatedFields) {
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = { ...this.items[index], ...updatedFields };
        this.saveState();
      }
    },

    setSavingRate(owner, rate) {
      this.savingRates[owner] = Number(rate);
      this.saveState();
    },

    setCommunalChargesDistribution(distribution) {
      this.communalChargesDistribution = distribution;
      this.saveState();
    },

    setOwners(newOwners) {
      const oldOwners = [...this.owners];

      // Mettre à jour les items qui référencent les anciens noms
      this.items.forEach((item) => {
        const oldIndex = oldOwners.indexOf(item.owner);
        if (oldIndex !== -1 && newOwners[oldIndex]) {
          item.owner = newOwners[oldIndex];
        }
      });

      // Mettre à jour savingRates
      const newSavingRates = {};
      oldOwners.forEach((oldName, index) => {
        if (newOwners[index]) {
          newSavingRates[newOwners[index]] = this.savingRates[oldName] || 30;
        }
      });
      // Ajouter les nouveaux propriétaires qui n'existaient pas
      newOwners.forEach((name) => {
        if (!(name in newSavingRates)) {
          newSavingRates[name] = 30;
        }
      });
      this.savingRates = newSavingRates;

      // Mettre à jour communalChargesDistribution
      if (newOwners.length === 1) {
        this.communalChargesDistribution = { [newOwners[0]]: 100 };
      } else if (newOwners.length === 2) {
        const newDistribution = {};
        if (oldOwners.length === 2) {
          // Préserver les pourcentages existants
          newDistribution[newOwners[0]] =
            this.communalChargesDistribution[oldOwners[0]] || 50;
          newDistribution[newOwners[1]] =
            this.communalChargesDistribution[oldOwners[1]] || 50;
        } else {
          // Nouveau passage à 2 personnes
          newDistribution[newOwners[0]] = 50;
          newDistribution[newOwners[1]] = 50;
        }
        this.communalChargesDistribution = newDistribution;
      }

      this.owners = newOwners;
      this.saveState();
    },

    setHouseholdMode(mode) {
      this.householdMode = mode;
      // Ajuster owners selon le mode
      if (mode === "single" && this.owners.length > 1) {
        this.setOwners([this.owners[0]]);
      } else if (
        (mode === "separate" || mode === "joint") &&
        this.owners.length < 2
      ) {
        this.setOwners([this.owners[0], "Personne 2"]);
      }
      this.saveState();
    },

    setFoyerSavingRate(rate) {
      this.foyerSavingRate = Number(rate);
      this.saveState();
    },

    setSelectedMonth(month) {
      this.selectedMonth = month;
      this.saveState();
    },

    setTheme(theme) {
      this.theme = theme;
      document.documentElement.setAttribute("data-theme", theme);
      this.saveState();
    },

    initTheme() {
      document.documentElement.setAttribute("data-theme", this.theme);
    },

    duplicateMonth(sourceMonth, targetMonth) {
      const sourceItems = this.items.filter(
        (item) => item.month === sourceMonth,
      );
      if (sourceItems.length === 0) return false;
      const newItems = sourceItems.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        month: targetMonth,
      }));
      this.items.push(...newItems);
      this.saveState();
      return true;
    },

    getPreviousMonth(month) {
      const [year, m] = month.split("-").map(Number);
      const date = new Date(year, m - 2, 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    },

    // === Feature 1 : Récurrences ===

    addRecurringItem(item) {
      this.recurringItems.push({
        ...item,
        id: crypto.randomUUID(),
        isActive: true,
      });
      this.saveState();
    },

    editRecurringItem(id, fields) {
      const index = this.recurringItems.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.recurringItems[index] = { ...this.recurringItems[index], ...fields };
        this.saveState();
      }
    },

    deleteRecurringItem(id) {
      const index = this.recurringItems.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.recurringItems.splice(index, 1);
        this.saveState();
      }
    },

    toggleRecurringItem(id) {
      const item = this.recurringItems.find((item) => item.id === id);
      if (item) {
        item.isActive = !item.isActive;
        this.saveState();
      }
    },

    applyRecurringItems(month) {
      const active = this.recurringItems.filter((item) => item.isActive);
      if (active.length === 0) return 0;
      const newItems = active.map((template) => ({
        id: crypto.randomUUID(),
        month,
        type: template.type,
        owner: template.owner,
        category: template.category,
        amount: template.amount,
      }));
      this.items.push(...newItems);
      if (!this.appliedRecurringMonths.includes(month)) {
        this.appliedRecurringMonths.push(month);
      }
      this.saveState();
      return newItems.length;
    },

    // === Feature 3 : Budget par catégorie ===

    setCategoryBudget(category, budget) {
      this.categoryBudgets[category] = {
        global: budget.global ?? this.categoryBudgets[category]?.global ?? 0,
        perPerson: budget.perPerson ?? this.categoryBudgets[category]?.perPerson ?? {},
      };
      this.saveState();
    },

    deleteCategoryBudget(category) {
      delete this.categoryBudgets[category];
      this.saveState();
    },

    // === Feature 4 : Objectifs d'épargne ===

    addGoal({ name, targetAmount, owner = null }) {
      this.savingsGoals.push({
        id: crypto.randomUUID(),
        name,
        targetAmount: Number(targetAmount),
        owner, // null = commun, sinon nom du propriétaire
        createdAt: getCurrentMonth(),
        allocations: [],
      });
      this.saveState();
    },

    editGoal(id, fields) {
      const goal = this.savingsGoals.find((g) => g.id === id);
      if (goal) {
        if (fields.name != null) goal.name = fields.name;
        if (fields.targetAmount != null) goal.targetAmount = Number(fields.targetAmount);
        if (fields.owner !== undefined) goal.owner = fields.owner;
        this.saveState();
      }
    },

    deleteGoal(id) {
      const index = this.savingsGoals.findIndex((g) => g.id === id);
      if (index !== -1) {
        this.savingsGoals.splice(index, 1);
        this.saveState();
      }
    },

    allocateToGoal(goalId, month, amount, allocOwner = null) {
      const goal = this.savingsGoals.find((g) => g.id === goalId);
      if (!goal) return;
      if (goal.owner === null && allocOwner) {
        // Objectif commun : allocation par personne (clé = month + owner)
        const existing = goal.allocations.find(
          (a) => a.month === month && a.owner === allocOwner,
        );
        if (existing) {
          existing.amount = Number(amount);
        } else {
          goal.allocations.push({ month, amount: Number(amount), owner: allocOwner });
        }
      } else {
        // Objectif personnel : allocation simple (clé = month)
        const existing = goal.allocations.find((a) => a.month === month && !a.owner);
        if (existing) {
          existing.amount = Number(amount);
        } else {
          goal.allocations.push({ month, amount: Number(amount) });
        }
      }
      this.saveState();
    },

    exportJSON() {
      const data = {
        version: 3,
        exportDate: new Date().toISOString(),
        items: this.items,
        savingRates: this.savingRates,
        communalChargesDistribution: this.communalChargesDistribution,
        owners: this.owners,
        householdMode: this.householdMode,
        foyerSavingRate: this.foyerSavingRate,
        selectedMonth: this.selectedMonth,
        recurringItems: this.recurringItems,
        appliedRecurringMonths: this.appliedRecurringMonths,
        categoryBudgets: this.categoryBudgets,
        savingsGoals: this.savingsGoals,
      };
      return JSON.stringify(data, null, 2);
    },

    exportCSV() {
      const headers = ["Mois", "Type", "Proprietaire", "Categorie", "Montant"];
      const rows = this.currentMonthItems.map((item) =>
        [item.month, item.type, item.owner, item.category, item.amount].join(
          ";",
        ),
      );
      return [headers.join(";"), ...rows].join("\n");
    },

    /**
     * Importe un JSON en fusionnant les items dans le mois sélectionné.
     * - mode "month" (défaut) : les items importés sont assignés au mois actuellement sélectionné,
     *   les données existantes des autres mois sont préservées.
     * - mode "full" : remplace toutes les données (restauration complète).
     */
    importJSON(jsonString, mode = "month") {
      try {
        const data = JSON.parse(jsonString);
        if (data.version === 2 || data.version === 3 || data.items) {
          const importedItems = (data.items || []).map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            month:
              mode === "month"
                ? this.selectedMonth
                : item.month || getCurrentMonth(),
          }));

          if (mode === "full") {
            // Restauration complète : remplacer tout
            this.items.splice(0, this.items.length, ...importedItems);
          } else {
            // Mode mois : supprimer les items existants du mois sélectionné, puis ajouter les importés
            const kept = this.items.filter(
              (item) => item.month !== this.selectedMonth,
            );
            this.items.splice(0, this.items.length, ...kept, ...importedItems);
          }

          if (data.savingRates) {
            Object.assign(this.savingRates, data.savingRates);
          }
          if (data.communalChargesDistribution) {
            Object.assign(
              this.communalChargesDistribution,
              data.communalChargesDistribution,
            );
          }
          if (data.owners) {
            this.owners.splice(0, this.owners.length, ...data.owners);
          }
          if (data.householdMode) {
            this.householdMode = data.householdMode;
          }
          if (data.foyerSavingRate != null) {
            this.foyerSavingRate = data.foyerSavingRate;
          }

          // v3 fields
          if (data.recurringItems) {
            this.recurringItems.splice(0, this.recurringItems.length, ...data.recurringItems);
          }
          if (data.appliedRecurringMonths) {
            this.appliedRecurringMonths.splice(0, this.appliedRecurringMonths.length, ...data.appliedRecurringMonths);
          }
          if (data.categoryBudgets) {
            Object.keys(this.categoryBudgets).forEach((k) => delete this.categoryBudgets[k]);
            Object.assign(this.categoryBudgets, data.categoryBudgets);
          }
          if (data.savingsGoals) {
            const migrated = data.savingsGoals.map((g) => ({
              ...g,
              owner: g.owner !== undefined ? g.owner : null,
            }));
            this.savingsGoals.splice(0, this.savingsGoals.length, ...migrated);
          }

          this.saveState();
          return { success: true, count: importedItems.length };
        }
        return { success: false, error: "Format de fichier non reconnu" };
      } catch (e) {
        return { success: false, error: "Fichier JSON invalide" };
      }
    },
  },
});
