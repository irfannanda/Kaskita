/**
 * Menghitung saldo bersih dari daftar transaksi.
 * @param {Transaction[]} list
 * @returns {number}
 */
export function calculateBalance(list) {
  return list.reduce(
    (balance, transaction) =>
      balance +
      (transaction.type === "income"
        ? transaction.amount
        : -transaction.amount),
    0,
  );
}

/**
 * Menjumlahkan pengeluaran untuk setiap kategori.
 * @param {Transaction[]} list
 * @returns {Record<string, number>}
 */
export function totalByCategory(list) {
  const totals = {};

  for (const transaction of list) {
    if (transaction.type !== "expense") {
      continue;
    }

    if (!Object.hasOwn(totals, transaction.category)) {
      totals[transaction.category] = 0;
    }

    totals[transaction.category] += transaction.amount;
  }

  return totals;
}
