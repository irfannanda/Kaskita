const CURRENCY_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});
const DATE_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const MONTH_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  month: 'long',
  year: 'numeric',
});
let transactions = [];

/**
 * Menghubungkan formulir transaksi dengan event untuk diterima modul lain.
 */
export function initializeTransactionForm() {
  const form = document.querySelector('#transaction-form');
  const dateInput = document.querySelector('#date');
  const status = document.querySelector('#form-status');

  if (!(form instanceof HTMLFormElement)) {
    throw new Error('Formulir transaksi tidak ditemukan.');
  }

  if (!(dateInput instanceof HTMLInputElement) || !(status instanceof HTMLParagraphElement)) {
    throw new Error('Elemen tanggal atau status formulir tidak ditemukan.');
  }

  dateInput.value = getLocalDate();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitTransaction(form, status);
  });
}

function initializeThemeToggle() {
  const toggle = document.querySelector('#theme-toggle');
  const label = document.querySelector('#theme-toggle-label');
  const icon = toggle?.querySelector('.theme-toggle__icon');

  if (
    !(toggle instanceof HTMLButtonElement) ||
    !(label instanceof HTMLSpanElement) ||
    !(icon instanceof HTMLSpanElement)
  ) {
    throw new Error('Tombol mode tema tidak ditemukan.');
  }

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', `Aktifkan mode ${isDark ? 'terang' : 'gelap'}`);
    label.textContent = `Mode ${isDark ? 'terang' : 'gelap'}`;
    icon.textContent = isDark ? '☀' : '☾';
  });
}

/**
 * Menampilkan transaksi terbaru di daftar.
 * @param {Transaction[]} list
 */
export function renderTransactions(list) {
  const transactionList = document.querySelector('#transaction-list');

  if (!(transactionList instanceof HTMLUListElement)) {
    throw new Error('Daftar transaksi tidak ditemukan.');
  }

  transactions = [...list];
  updateFilterOptions();
  renderFilteredTransactions();
}

function createTransactionItem(transaction) {
  const item = document.createElement('li');
  const details = document.createElement('div');
  const title = document.createElement('p');
  const meta = document.createElement('p');
  const amount = document.createElement('span');
  const isIncome = transaction.type === 'income';

  item.className = 'transaction-item';
  item.dataset.date = transaction.date;
  details.className = 'transaction-item__details';
  title.className = 'transaction-item__title';
  title.textContent = transaction.title;
  meta.className = 'transaction-item__meta';
  meta.textContent = `${formatTransactionDate(transaction.date)} · ${transaction.category}`;
  amount.className = `transaction-item__amount transaction-item__amount--${
    isIncome ? 'income' : 'expense'
  }`;
  amount.textContent = `${isIncome ? '+' : '-'}${CURRENCY_FORMATTER.format(transaction.amount)}`;
  details.append(title, meta);
  item.append(details, amount);
  return item;
}

function formatTransactionDate(date) {
  return DATE_FORMATTER.format(new Date(`${date}T00:00:00`));
}

function initializeTransactionFilters() {
  const categoryFilter = document.querySelector('#category-filter');
  const monthFilter = document.querySelector('#month-filter');

  if (
    !(categoryFilter instanceof HTMLSelectElement) ||
    !(monthFilter instanceof HTMLSelectElement)
  ) {
    throw new Error('Filter kategori atau bulan tidak ditemukan.');
  }

  categoryFilter.addEventListener('change', renderFilteredTransactions);
  monthFilter.addEventListener('change', renderFilteredTransactions);
}

function updateFilterOptions() {
  const categoryFilter = document.querySelector('#category-filter');
  const monthFilter = document.querySelector('#month-filter');
  const transactionList = document.querySelector('#transaction-list');
  const emptyState = document.querySelector('#transaction-empty');

  if (
    !(categoryFilter instanceof HTMLSelectElement) ||
    !(monthFilter instanceof HTMLSelectElement) ||
    !(transactionList instanceof HTMLUListElement) ||
    !(emptyState instanceof HTMLParagraphElement)
  ) {
    throw new Error('Filter atau daftar transaksi tidak ditemukan.');
  }

  updateSelectOptions(
    categoryFilter,
    [...new Set(transactions.map((transaction) => transaction.category))].sort()
  );
  updateSelectOptions(
    monthFilter,
    [...new Set(transactions.map((transaction) => transaction.date.slice(0, 7)))]
      .sort()
      .reverse()
  );
}

function updateSelectOptions(select, values) {
  const selectedValue = values.includes(select.value) ? select.value : '';
  const defaultLabel = select.id === 'category-filter' ? 'Semua kategori' : 'Semua bulan';
  const options = [new Option(defaultLabel, '')];

  values.forEach((value) => {
    const label =
      select.id === 'month-filter'
        ? MONTH_FORMATTER.format(new Date(`${value}-01T00:00:00`))
        : value;
    options.push(new Option(label, value));
  });

  select.replaceChildren(...options);
  select.value = selectedValue;
}

function renderFilteredTransactions() {
  const transactionList = document.querySelector('#transaction-list');
  const emptyState = document.querySelector('#transaction-empty');
  const categoryFilter = document.querySelector('#category-filter');
  const monthFilter = document.querySelector('#month-filter');

  if (
    !(transactionList instanceof HTMLUListElement) ||
    !(emptyState instanceof HTMLParagraphElement) ||
    !(categoryFilter instanceof HTMLSelectElement) ||
    !(monthFilter instanceof HTMLSelectElement)
  ) {
    throw new Error('Filter atau daftar transaksi tidak ditemukan.');
  }

  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesCategory =
        !categoryFilter.value || transaction.category === categoryFilter.value;
      const matchesMonth = !monthFilter.value || transaction.date.startsWith(monthFilter.value);
      return matchesCategory && matchesMonth;
    })
    .sort((first, second) => second.date.localeCompare(first.date));

  transactionList.replaceChildren(
    ...filteredTransactions.map((transaction) => createTransactionItem(transaction))
  );
  transactionList.hidden = filteredTransactions.length === 0;
  emptyState.hidden = filteredTransactions.length > 0;
  emptyState.textContent =
    transactions.length === 0
      ? 'Belum ada transaksi. Transaksi yang ditambahkan akan muncul di sini.'
      : 'Tidak ada transaksi yang cocok dengan filter ini.';
}

function submitTransaction(form, status) {
  const formData = new FormData(form);
  const amount = Number(formData.get('amount'));

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    status.textContent = 'Nominal harus berupa bilangan bulat lebih dari nol.';
    status.classList.add('form-status--error');
    return;
  }

  const transaction = {
    id: crypto.randomUUID(),
    title: String(formData.get('title')).trim(),
    amount,
    type: String(formData.get('type')),
    category: String(formData.get('category')).trim(),
    date: String(formData.get('date')),
    createdBy: 'B',
  };

  form.dispatchEvent(
    new CustomEvent('transaction:created', {
      bubbles: true,
      detail: transaction,
    })
  );
  status.classList.remove('form-status--error');
  status.textContent = 'Data transaksi siap disimpan.';
  form.reset();
  form.elements.namedItem('date').value = getLocalDate();
}

function getLocalDate() {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

document.addEventListener('transaction:created', (event) => {
  transactions.unshift(event.detail);
  renderTransactions(transactions);
});

renderTransactions([]);
initializeTransactionForm();
initializeThemeToggle();
initializeTransactionFilters();
