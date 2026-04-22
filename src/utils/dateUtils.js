// =============================
// 🔓 DÉBLOCAGE PAR SEMAINE (P4)
// =============================
export const isUnlocked = (weekIndex, startDate) => {
  const now = new Date();

  const unlockDate = new Date(startDate);
  unlockDate.setDate(unlockDate.getDate() + (7 * weekIndex));

  return now >= unlockDate;
};

// =============================
// 📅 DATE DE DÉBLOCAGE
// =============================
export const getUnlockDate = (weekIndex, startDate) => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + (7 * weekIndex));
  return date;
};