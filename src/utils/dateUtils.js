// =============================
// 🔧 VALIDATION DATE
// =============================
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

// =============================
// 🔓 DÉBLOCAGE PAR SEMAINE (P4)
// =============================
export const isUnlocked = (weekIndex, startDate) => {
  try {
    const now = new Date();
    const baseDate = new Date(startDate);

    if (!isValidDate(baseDate)) {
      console.warn("⚠️ Date invalide pour déblocage");
      return false;
    }

    const unlockDate = new Date(baseDate);
    unlockDate.setDate(unlockDate.getDate() + (7 * weekIndex));

    return now >= unlockDate;

  } catch (error) {
    console.error("❌ Erreur isUnlocked:", error);
    return false;
  }
};

// =============================
// 📅 DATE DE DÉBLOCAGE
// =============================
export const getUnlockDate = (weekIndex, startDate) => {
  try {
    const baseDate = new Date(startDate);

    if (!isValidDate(baseDate)) {
      throw new Error("Date invalide");
    }

    const date = new Date(baseDate);
    date.setDate(date.getDate() + (7 * weekIndex));

    return date;

  } catch (error) {
    console.error("❌ Erreur getUnlockDate:", error);
    return null;
  }
};

// =============================
// ⏳ JOURS RESTANTS AVANT DÉBLOCAGE
// =============================
export const getDaysRemaining = (weekIndex, startDate) => {
  try {
    const now = new Date();
    const unlockDate = getUnlockDate(weekIndex, startDate);

    if (!unlockDate) return null;

    const diff = unlockDate - now;

    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;

  } catch (error) {
    console.error("❌ Erreur getDaysRemaining:", error);
    return null;
  }
};

// =============================
// 📆 FORMATAGE DATE (FR)
// =============================
export const formatDateFR = (date) => {
  try {
    const d = new Date(date);

    if (!isValidDate(d)) return "Date invalide";

    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

  } catch (error) {
    console.error("❌ Erreur formatDateFR:", error);
    return "Erreur date";
  }
};

// =============================
// ⏱️ FORMAT COURT (JJ/MM/AAAA)
// =============================
export const formatShortDate = (date) => {
  try {
    const d = new Date(date);

    if (!isValidDate(d)) return "--/--/----";

    return d.toLocaleDateString("fr-FR");

  } catch (error) {
    console.error("❌ Erreur formatShortDate:", error);
    return "--/--/----";
  }
};