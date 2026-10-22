const STORAGE_KEY = "kaskita:transactions";

/**
 * Membaca transaksi tersimpan.
 * @returns {Transaction[]}
 */
export function loadTransactions() {
  try {
    const storedTransactions = localStorage.getItem(STORAGE_KEY);

    if (storedTransactions === null) {
      return [];
    }

    const transactions = JSON.parse(storedTransactions);
    return Array.isArray(transactions) ? transactions : [];
  } catch {
    return [];
  }
}

/**
 * Menyimpan daftar transaksi.
 * @param {Transaction[]} list
 * @returns {void}
 */
export function saveTransactions(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
