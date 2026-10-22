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

/**
 * Menampilkan transaksi terbaru di daftar.
 * @param {Transaction[]} list
 */
export function renderTransactions(list) {
  const transactionList = document.querySelector('#transaction-list');
  const emptyState = document.querySelector('#transaction-empty');

  if (
    !(transactionList instanceof HTMLUListElement) ||
    !(emptyState instanceof HTMLParagraphElement)
  ) {
    throw new Error('Daftar transaksi tidak ditemukan.');
  }

  transactionList.replaceChildren();
  emptyState.hidden = list.length > 0;
  transactionList.hidden = list.length === 0;

  [...list]
    .sort((first, second) => second.date.localeCompare(first.date))
    .forEach((transaction) => transactionList.append(createTransactionItem(transaction)));
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

function addTransactionToList(transaction) {
  const transactionList = document.querySelector('#transaction-list');
  const emptyState = document.querySelector('#transaction-empty');

  if (
    !(transactionList instanceof HTMLUListElement) ||
    !(emptyState instanceof HTMLParagraphElement)
  ) {
    throw new Error('Daftar transaksi tidak ditemukan.');
  }

  const nextItem = [...transactionList.children].find(
    (item) => item.dataset.date <= transaction.date
  );
  transactionList.insertBefore(createTransactionItem(transaction), nextItem ?? null);
  transactionList.hidden = false;
  emptyState.hidden = true;
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
  addTransactionToList(event.detail);
});

renderTransactions([]);
initializeTransactionForm();
