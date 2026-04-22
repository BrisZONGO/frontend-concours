// ===============================
// 📅 GESTION DÉBLOCAGE PAR SEMAINE
// ===============================

export const isUnlocked = (weekIndex, startDate) => {
  const now = new Date();

  const unlockDate = new Date(startDate);
  unlockDate.setDate(unlockDate.getDate() + (7 * weekIndex));

  return now >= unlockDate;
};

// Option bonus : retourner la date de déblocage
export const getUnlockDate = (weekIndex, startDate) => {
  const unlockDate = new Date(startDate);
  unlockDate.setDate(unlockDate.getDate() + (7 * weekIndex));
  return unlockDate;
};