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

initializeTransactionForm();
