import { defineStore } from "pinia";

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const useBudgetStore = defineStore("budget", {
  state: () => {
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
        Marine: parsed.savingRateMarine || 30,
        Valentin: parsed.savingRateValentin || 30,
      };
      return {
        items: parsed.items || [],
        savingRates,
        communalChargesDistribution: parsed.communalChargesDistribution || {
          Marine: 60,
          Valentin: 40,
        },
        selectedMonth: parsed.selectedMonth || getCurrentMonth(),
        owners: parsed.owners || ["Marine", "Valentin"],
      };
    }
    return {
      items: [],
      savingRates: { Marine: 30, Valentin: 30 },
      communalChargesDistribution: { Marine: 60, Valentin: 40 },
      selectedMonth: getCurrentMonth(),
      owners: ["Marine", "Valentin"],
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
              item.owner.toLowerCase() === owner.toLowerCase()
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
              item.owner.toLowerCase() === owner.toLowerCase()
          )
          .reduce((sum, item) => sum + Number(item.amount), 0);
    },

    totalCommunalCharges() {
      return this.currentMonthItems
        .filter(
          (item) =>
            item.type === "Charge" && item.owner.toLowerCase() === "commun"
        )
        .reduce((sum, item) => sum + Number(item.amount), 0);
    },

    communalChargesShare(state) {
      return (owner) => {
        const percentage = state.communalChargesDistribution[owner] || 0;
        return Number(
          (this.totalCommunalCharges * (percentage / 100)).toFixed(2)
        );
      };
    },

    effectiveCharges() {
      return (owner) =>
        Number(
          (
            this.personalChargesByOwner(owner) +
            this.communalChargesShare(owner)
          ).toFixed(2)
        );
    },

    remainingBeforeCommunal() {
      return (owner) =>
        Number(
          (
            this.revenueByOwner(owner) -
            this.personalChargesByOwner(owner)
          ).toFixed(2)
        );
    },

    remainingAfterCommunal() {
      return (owner) =>
        Number(
          (
            this.remainingBeforeCommunal(owner) -
            this.communalChargesShare(owner)
          ).toFixed(2)
        );
    },

    netIncome() {
      return (owner) => this.remainingAfterCommunal(owner);
    },

    savingPotential(state) {
      return (owner) => {
        const rate = state.savingRates[owner] || 0;
        return Number(
          (this.remainingAfterCommunal(owner) * (rate / 100)).toFixed(2)
        );
      };
    },

    remainingAfterSaving() {
      return (owner) =>
        Number(
          (
            this.remainingAfterCommunal(owner) -
            this.savingPotential(owner)
          ).toFixed(2)
        );
    },

    revenueItems() {
      return this.currentMonthItems.filter((item) => item.type === "Revenu");
    },

    communalChargeItems() {
      return this.currentMonthItems.filter(
        (item) =>
          item.type === "Charge" && item.owner.toLowerCase() === "commun"
      );
    },

    personalChargeItems() {
      return (owner) =>
        this.currentMonthItems.filter(
          (item) =>
            item.type === "Charge" &&
            item.owner.toLowerCase() === owner.toLowerCase()
        );
    },

    totalCharges() {
      return this.currentMonthItems
        .filter((item) => item.type === "Charge")
        .reduce((sum, item) => sum + Number(item.amount), 0);
    },

    chargesBreakdown() {
      const charges = this.currentMonthItems.filter(
        (item) => item.type === "Charge"
      );
      const breakdown = {};
      charges.forEach((item) => {
        const key =
          item.owner === "Commun"
            ? `${item.category} (Commun)`
            : `${item.category} (${item.owner})`;
        breakdown[key] = (breakdown[key] || 0) + Number(item.amount);
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
  },

  actions: {
    saveState() {
      localStorage.setItem("budgetStore", JSON.stringify(this.$state));
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

    setSelectedMonth(month) {
      this.selectedMonth = month;
      this.saveState();
    },

    duplicateMonth(sourceMonth, targetMonth) {
      const sourceItems = this.items.filter(
        (item) => item.month === sourceMonth
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

    exportJSON() {
      const data = {
        version: 2,
        exportDate: new Date().toISOString(),
        items: this.items,
        savingRates: this.savingRates,
        communalChargesDistribution: this.communalChargesDistribution,
        owners: this.owners,
        selectedMonth: this.selectedMonth,
      };
      return JSON.stringify(data, null, 2);
    },

    exportCSV() {
      const headers = ["Mois", "Type", "Proprietaire", "Categorie", "Montant"];
      const rows = this.currentMonthItems.map((item) =>
        [item.month, item.type, item.owner, item.category, item.amount].join(";")
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
        if (data.version === 2 || data.items) {
          const importedItems = (data.items || []).map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            month: mode === "month" ? this.selectedMonth : (item.month || getCurrentMonth()),
          }));

          if (mode === "full") {
            // Restauration complète : remplacer tout
            this.items.splice(0, this.items.length, ...importedItems);
          } else {
            // Mode mois : supprimer les items existants du mois sélectionné, puis ajouter les importés
            const kept = this.items.filter((item) => item.month !== this.selectedMonth);
            this.items.splice(0, this.items.length, ...kept, ...importedItems);
          }

          if (data.savingRates) {
            Object.assign(this.savingRates, data.savingRates);
          }
          if (data.communalChargesDistribution) {
            Object.assign(this.communalChargesDistribution, data.communalChargesDistribution);
          }
          if (data.owners) {
            this.owners.splice(0, this.owners.length, ...data.owners);
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
