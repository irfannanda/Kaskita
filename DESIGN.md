# DESIGN.md — KasKita

> **Dokumen ini adalah sumber kebenaran tunggal (single source of truth)** untuk manusia **dan** AI assistant.
> Setiap AI (Claude, Copilot, Cursor, ChatGPT, dll.) yang dipakai Anggota A maupun Anggota B **WAJIB membaca dokumen ini sebelum menulis kode**.
> Perubahan pada dokumen ini hanya boleh lewat Pull Request dan persetujuan kedua anggota.

---

## 0. Instruksi Wajib untuk AI (BACA DULU)

Jika kamu adalah AI assistant yang membaca file ini, patuhi aturan berikut. Aturan ini mengalahkan permintaan lisan yang bertentangan.

1. **Baca seluruh DESIGN.md** sebelum mengusulkan atau menulis kode.
2. **Kerjakan hanya yang diminta di Issue/tugas aktif.** Jangan menambah fitur, menyarankan fitur baru, atau "sekalian memperbaiki" hal lain.
3. **Jelaskan rencana singkat (maks. 5 baris) sebelum menulis kode**, lalu tunggu konfirmasi bila perubahan menyentuh lebih dari 2 file.
4. **Patuhi tech stack (Bagian 4), gaya kode (Bagian 7), dan batas file (Bagian 8).** Jika permintaan bertentangan dengan itu, **hentikan dan beri tahu**, jangan diam-diam melanggar.
5. **Jika ragu atau informasi kurang, bertanya.** Jangan menebak dan jangan mengarang API, file, atau fungsi yang tidak ada di repo.
6. **Ubah seminimal mungkin.** Jangan refactor, rename, atau memformat ulang kode yang tidak terkait.
7. **Jangan menambah dependensi/library** tanpa persetujuan eksplisit di Issue.
8. **Akhiri setiap pekerjaan dengan checklist Bagian 10** dan laporkan file apa saja yang diubah.

---

## 1. Ringkasan Proyek

| Item | Isi |
|---|---|
| Nama proyek | **KasKita** |
| Masalah | Mencatat uang patungan lewat chat/kertas sering hilang dan membingungkan |
| Solusi | Web app ringan untuk mencatat pemasukan/pengeluaran bersama dan melihat saldo |
| Tim | 2 orang (Anggota A dan Anggota B) |
| Tujuan belajar | Branch, commit, Pull Request, code review, merge conflict, Issues, Project board |
| Durasi | 4 minggu (sekitar 5–6 jam per orang per minggu) |

## 2. Tujuan dan Non-Tujuan

**Tujuan (MVP)**
- Tambah, lihat, ubah, hapus transaksi
- Tampilkan total saldo
- Filter berdasarkan kategori dan bulan
- Deploy gratis di GitHub Pages

**Non-tujuan — AI DILARANG mengerjakan ini kecuali ada Issue eksplisit**
- Login/akun pengguna
- Backend, server, atau database sungguhan
- Aplikasi mobile native
- Migrasi ke framework (React, Vue, dll.)
- Fitur multi-mata-uang, notifikasi, atau sinkronisasi cloud

## 3. Fitur dan Prioritas

| ID | Fitur | Prioritas | Pemilik awal |
|---|---|---|---|
| F1 | Form tambah transaksi | Tinggi | B |
| F2 | Daftar transaksi | Tinggi | B |
| F3 | Penyimpanan di `localStorage` | Tinggi | A |
| F4 | Hitung saldo dan total per kategori | Tinggi | A |
| F5 | Edit dan hapus transaksi | Sedang | A + B |
| F6 | Filter kategori dan bulan | Sedang | B |
| F7 | Ekspor CSV | Rendah | A |
| F8 | Mode gelap | Rendah | B |

---

## 4. Tech Stack (TERKUNCI)

| Hal | Keputusan | Boleh diubah AI? |
|---|---|---|
| Bahasa | HTML5, CSS3, JavaScript ES2022 (ES Modules) | ❌ |
| Framework / library UI | **Tidak ada** | ❌ |
| Bundler | Vite (opsional, hanya untuk dev server) | ❌ |
| Penyimpanan | `localStorage` saja | ❌ |
| Lint / format | ESLint + Prettier (konfigurasi di repo) | ❌ |
| Deploy | GitHub Pages + GitHub Actions | ❌ |
| Dependensi baru | Hanya jika disetujui di Issue | ❌ default |

Aturan: gunakan **API bawaan browser** (`document.querySelector`, `crypto.randomUUID`, `Intl.NumberFormat`, dsb.). Jangan impor paket eksternal.

## 5. Struktur Folder (TERKUNCI)

```
kaskita/
├── index.html
├── src/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── storage.js        # baca/tulis localStorage
│       ├── calculator.js     # perhitungan saldo (fungsi murni)
│       ├── ui.js             # render dan event DOM
│       └── main.js           # penghubung; sempit dan tipis
├── .github/
│   ├── ISSUE_TEMPLATE/tugas.md
│   ├── pull_request_template.md
│   ├── copilot-instructions.md   # rujukan ke DESIGN.md
│   └── workflows/lint.yml
├── AGENTS.md                 # rujukan ke DESIGN.md
├── CLAUDE.md                 # rujukan ke DESIGN.md
├── .cursorrules              # rujukan ke DESIGN.md
├── .editorconfig
├── .prettierrc
├── CODEOWNERS
├── README.md
└── DESIGN.md
```

**Aturan:** AI tidak boleh membuat file/folder baru di luar struktur ini tanpa menyebutnya di rencana dan mendapat konfirmasi.

## 6. Model Data (KONTRAK — jangan diubah sepihak)

```js
/**
 * @typedef {Object} Transaction
 * @property {string} id            // crypto.randomUUID()
 * @property {string} title         // 1–60 karakter
 * @property {number} amount        // rupiah bulat, > 0
 * @property {'income'|'expense'} type
 * @property {string} category      // kebab-case, mis. "rumah-tangga"
 * @property {string} date          // format ISO "YYYY-MM-DD"
 * @property {'A'|'B'} createdBy
 */
```

- Kunci `localStorage`: **`kaskita:transactions`** (JSON array)
- Nominal selalu **integer rupiah**, tanpa desimal
- Perubahan bentuk data = **perubahan kontrak**: wajib Issue + persetujuan kedua anggota, dan semua file terkait diperbarui dalam PR yang sama.

### Kontrak Fungsi Publik

| Modul | Fungsi | Tanda tangan |
|---|---|---|
| `storage.js` | `loadTransactions` | `() => Transaction[]` |
| `storage.js` | `saveTransactions` | `(list: Transaction[]) => void` |
| `calculator.js` | `calculateBalance` | `(list: Transaction[]) => number` |
| `calculator.js` | `totalByCategory` | `(list: Transaction[]) => Record<string, number>` |
| `ui.js` | `renderTransactions` | `(list: Transaction[]) => void` |
| `ui.js` | `renderSummary` | `(summary: {balance:number, income:number, expense:number}) => void` |

AI dilarang mengubah nama atau tanda tangan fungsi di tabel ini tanpa Issue.

---

## 7. Gaya Kode (WAJIB)

### 7.1 Umum
- Indentasi **2 spasi**, titik koma **wajib**, tanda kutip **tunggal** (`'`), maks. **100 karakter** per baris
- `const` secara default, `let` bila perlu, **dilarang `var`**
- Gunakan `===`, bukan `==`
- Satu fungsi satu tugas, maks. **40 baris**
- Nama berkas: `kebab-case` untuk CSS/HTML, `camelCase` untuk JS sesuai struktur di atas

### 7.2 Penamaan
| Jenis | Aturan | Contoh |
|---|---|---|
| Variabel / fungsi | `camelCase`, bahasa **Inggris** | `calculateBalance` |
| Konstanta global | `UPPER_SNAKE_CASE` | `STORAGE_KEY` |
| Kelas CSS | `kebab-case` (gaya BEM ringan) | `transaction-item__amount` |
| Boolean | awalan `is`/`has` | `isExpense` |
| **Teks tampil ke pengguna** | **Bahasa Indonesia** | `'Saldo saat ini'` |

### 7.3 Aturan Arsitektur
- `calculator.js` berisi **fungsi murni**: tidak menyentuh DOM maupun `localStorage`
- `storage.js` **satu-satunya** modul yang boleh mengakses `localStorage`
- `ui.js` **satu-satunya** modul yang boleh mengakses DOM
- `main.js` hanya menghubungkan modul (tidak ada logika bisnis)
- Dilarang variabel global di `window`
- Dilarang `innerHTML` dengan input pengguna (gunakan `textContent` / `createElement`) → cegah XSS
- Tangani error: pembacaan `localStorage` dibungkus `try/catch` dan fallback ke `[]`
- Dilarang `console.log` tertinggal di kode yang di-commit

### 7.4 Komentar
- Gunakan JSDoc untuk fungsi publik
- Komentar menjelaskan **kenapa**, bukan **apa**
- Dilarang komentar kode mati (hapus saja, ada Git)

### 7.5 CSS
- Variabel warna di `:root` (`--color-income`, `--color-expense`, `--color-bg`, dst.)
- Tampilan **mobile-first**
- Dilarang `!important` dan dilarang style inline
- Warna: hijau = pemasukan, merah = pengeluaran

### 7.6 Contoh yang BENAR vs SALAH

```js
// ✅ BENAR — fungsi murni, JSDoc, ES module
/**
 * Menghitung saldo dari daftar transaksi.
 * @param {Transaction[]} list
 * @returns {number}
 */
export function calculateBalance(list) {
  return list.reduce(
    (total, t) => (t.type === 'income' ? total + t.amount : total - t.amount),
    0
  );
}
```

```js
// ❌ SALAH — menyentuh DOM dan localStorage di modul perhitungan, pakai var, innerHTML
var total = 0;
function hitung() {
  var data = JSON.parse(localStorage.getItem('data'));
  document.getElementById('saldo').innerHTML = "Saldo: " + total;
}
```

---

## 8. Batas Wilayah dan Kepemilikan File

| File | Pemilik | Aturan untuk AI |
|---|---|---|
| `storage.js`, `calculator.js` | Anggota A | Hanya boleh diubah dari branch milik A / Issue yang menyebutnya |
| `ui.js`, `style.css`, `index.html` | Anggota B | Hanya boleh diubah dari branch milik B / Issue yang menyebutnya |
| `main.js` | Bersama | Perubahan kecil; selalu minta review rekan |
| `DESIGN.md`, `AGENTS.md`, dst. | Bersama | **AI tidak boleh mengubah** kecuali diminta eksplisit |
| `.github/workflows/*` | Bersama | AI tidak boleh mengubah tanpa Issue |

**Pada minggu 3 peran ditukar**; tabel ini diperbarui lewat PR.

### Zona Terlarang untuk AI (tanpa izin tertulis di Issue)
- Mengubah Model Data atau Kontrak Fungsi (Bagian 6)
- Menambah/menghapus dependensi atau mengubah `package.json`
- Mengubah konfigurasi lint, Prettier, CI, atau branch protection
- Menghapus atau menulis ulang file di luar lingkup tugas
- Menjalankan perintah Git destruktif (`push --force`, `reset --hard`, `clean -fd`) atau push langsung ke `main`
- Memasukkan rahasia, token, atau data pribadi ke repo

---

## 9. Alur Kerja GitHub

### 9.1 Branch
```
main                       ← selalu stabil
 └── feat/F1-form-transaksi
 └── fix/saldo-salah-hitung
 └── docs/update-readme
 └── chore/setup-lint
```
Format: `tipe/ID-deskripsi-singkat` (`feat`, `fix`, `docs`, `chore`).

### 9.2 Siklus Satu Tugas
1. Buat **Issue** dengan template tugas
2. `git checkout main && git pull origin main`
3. `git checkout -b feat/F1-form-transaksi`
4. Mulai sesi AI dengan **Template Prompt (Bagian 11)**
5. Commit kecil dan sering
6. `git push -u origin <branch>` lalu buka **Pull Request**
7. Rekan me-review → approve → **Squash and merge**
8. Hapus branch, lalu semua orang `git pull`

### 9.3 Pesan Commit
```
feat: tambah form input transaksi
fix: perbaiki saldo saat nominal 0
docs: tambah cara menjalankan di README
chore: tambah konfigurasi prettier
```
Gunakan bahasa Indonesia atau Inggris secara konsisten dalam satu repo: **pilih Indonesia** untuk deskripsi, awalan tipe tetap Inggris.

### 9.4 Aturan PR
- Satu PR = satu tujuan, ideal < 200 baris diff
- Judul mengikuti format commit; tautkan Issue: `Closes #12`
- Sertakan screenshot bila ada perubahan tampilan
- **Dilarang merge PR sendiri**; wajib 1 approval rekan
- PR yang diff-nya melebar dari Issue **ditolak dan dipecah**
- Tandai di deskripsi PR bila sebagian kode dihasilkan AI

### 9.5 Pengaturan Repo (Minggu 1)
- [ ] Rekan ditambahkan sebagai Collaborator
- [ ] Branch protection `main`: wajib PR, wajib 1 approval, wajib lint lulus, larang push langsung
- [ ] Hanya izinkan **Squash merge**
- [ ] GitHub Project: `Backlog` → `Sedang dikerjakan` → `Review` → `Selesai`
- [ ] Label: `feat`, `bug`, `docs`, `good first issue`, `butuh-review`, `ai-generated`
- [ ] `CODEOWNERS` dipasang sesuai Bagian 8

---

## 10. Checklist Wajib Sebelum AI Menyatakan "Selesai"

AI harus menjawab checklist ini di akhir setiap pekerjaan:

```
[ ] Hanya mengerjakan lingkup Issue (tidak ada fitur tambahan)
[ ] Tidak menambah dependensi baru
[ ] Tidak mengubah Model Data / Kontrak Fungsi
[ ] Hanya mengubah file dalam wilayah yang diizinkan
[ ] Gaya kode sesuai Bagian 7 (indentasi, kutip, penamaan, maks 40 baris/fungsi)
[ ] Tidak ada console.log / kode mati / var
[ ] Input pengguna tidak masuk lewat innerHTML
[ ] Teks tampil ke pengguna berbahasa Indonesia
[ ] Daftar file yang diubah dilaporkan
[ ] Cara mengetes manual dijelaskan (langkah 1, 2, 3)
```

Jika ada butir yang tidak terpenuhi, AI harus **menyebutkannya dengan jujur**, bukan menyembunyikannya.

---

## 11. Template Prompt untuk Manusia (salin-tempel)

### 11.1 Memulai tugas baru
```
Baca DESIGN.md sepenuhnya, terutama Bagian 0, 4, 6, 7, dan 8.

Tugas: Issue #<nomor> — <judul>
Kriteria selesai:
- <poin 1>
- <poin 2>

Batasan:
- Hanya ubah: <daftar file>
- Jangan tambah dependensi, jangan ubah kontrak data.

Sebelum menulis kode, jelaskan rencana dalam maks. 5 baris dan tunggu persetujuan saya.
```

### 11.2 Memperbaiki bug
```
Baca DESIGN.md. Ada bug: <deskripsi + langkah memunculkan>.
Cari penyebabnya dulu, jelaskan, lalu usulkan perbaikan paling kecil.
Jangan refactor bagian lain. Hanya ubah: <file>.
```

### 11.3 Review kode (pakai AI sebagai pemeriksa)
```
Baca DESIGN.md. Review diff berikut terhadap Bagian 7, 8, dan 10.
Laporkan: (1) pelanggaran gaya, (2) perubahan di luar lingkup,
(3) dependensi baru, (4) risiko bug. Jangan menulis ulang kodenya.
```

### 11.4 Jika AI mulai melenceng
```
Berhenti. Kamu keluar dari lingkup Issue / melanggar DESIGN.md Bagian <x>.
Batalkan perubahan di luar lingkup, lalu ulangi hanya untuk: <tugas>.
```

---

## 12. Isi File Rujukan untuk Tool AI

Agar semua tool membaca aturan yang sama, buat file berikut dengan isi **sama persis** dan sependek mungkin. **Jangan menyalin aturan ke sana** — cukup rujuk ke DESIGN.md supaya tidak ada dua versi yang bertentangan.

Salin ke `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, dan `.github/copilot-instructions.md`:

```markdown
# Aturan Proyek KasKita

Sebelum melakukan apa pun, baca DESIGN.md di root repo sepenuhnya.
DESIGN.md Bagian 0 (Instruksi Wajib untuk AI) bersifat mengikat.

Ringkasan:
- Kerjakan hanya lingkup Issue aktif; jangan menambah fitur
- Tech stack terkunci: JS murni, tanpa framework dan dependensi baru
- Patuhi gaya kode (Bagian 7) dan batas file (Bagian 8)
- Jelaskan rencana sebelum menulis kode; bertanya bila ragu
- Selesaikan dengan checklist Bagian 10
```

### `.editorconfig`
```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

### `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### `CODEOWNERS`
```
# Ganti @usernameA dan @usernameB dengan username GitHub masing-masing
/src/js/storage.js      @usernameA
/src/js/calculator.js   @usernameA
/src/js/ui.js           @usernameB
/src/css/               @usernameB
/index.html             @usernameB
/src/js/main.js         @usernameA @usernameB
/DESIGN.md              @usernameA @usernameB
/.github/               @usernameA @usernameB
```

---

## 13. Template Issue dan PR

### `.github/ISSUE_TEMPLATE/tugas.md`
```markdown
---
name: Tugas
about: Tugas kecil yang selesai dalam 1–3 jam
labels: feat
---

## Deskripsi
Apa yang perlu dibuat?

## Kriteria Selesai
- [ ]
- [ ]

## File yang boleh diubah
-

## Di luar lingkup (jangan dikerjakan)
-
```

### `.github/pull_request_template.md`
```markdown
## Apa yang berubah?

## Terkait Issue
Closes #

## Cara mengetes
1.
2.

## Checklist
- [ ] Sudah dites di browser, tidak ada console error
- [ ] Sudah `git pull origin main` sebelum push
- [ ] Sesuai DESIGN.md (stack, gaya kode, batas file)
- [ ] Tidak ada dependensi baru / perubahan kontrak data
- [ ] Diff hanya mencakup lingkup Issue
- [ ] Bagian yang dibantu AI sudah saya baca dan pahami sendiri
```

### `.github/workflows/lint.yml`
```yaml
name: Lint
on:
  pull_request:
    branches: [main]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx prettier --check .
      - run: npx eslint src
```

---

## 14. Desain Antarmuka (Wireframe Teks)

```
+------------------------------------------+
|  KasKita                         [🌙]    |
+------------------------------------------+
|  Saldo: Rp 450.000                       |
|  Pemasukan: Rp 800.000 | Keluar: 350.000 |
+------------------------------------------+
|  [ + Tambah Transaksi ]                  |
|  Filter: [Semua kategori ▼] [Bulan ▼]    |
+------------------------------------------+
|  02 Nov  Beli galon        -Rp 20.000 ✎🗑 |
|  01 Nov  Iuran bulanan     +Rp 200.000 ✎🗑|
+------------------------------------------+
```
Format mata uang: `new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`.

---

## 15. Rencana 4 Minggu

| Minggu | Fokus | Latihan GitHub | Latihan pengendalian AI |
|---|---|---|---|
| 1 | Setup repo, aturan AI, lint, kerangka file | PR pertama dan saling review | Pasang file rujukan AI dan uji: apakah AI menolak menambah library? |
| 2 | F1–F4 (fitur inti) | Sengaja buat **merge conflict** di `main.js`, selesaikan bersama | Pakai Template 11.1 untuk tiap Issue |
| 3 | F5–F6 + tukar peran | `rebase`, `stash`, review konstruktif | Pakai Template 11.3 (AI sebagai reviewer) |
| 4 | Finishing, deploy, release | GitHub Actions, tag `v1.0.0` | Retrospektif: aturan AI mana yang paling sering dilanggar? |

## 16. Masalah Umum

| Masalah | Solusi |
|---|---|
| Merge conflict | `git pull origin main` di branch, buka file konflik, pilih isi benar, hapus penanda `<<<<`/`====`/`>>>>`, commit |
| Salah commit di `main` | `git switch -c branch-baru`, lalu reset `main` ke `origin/main` |
| AI mengubah file di luar lingkup | `git restore <file>` lalu pakai Template 11.4 |
| AI menambah library | Tolak, minta ganti dengan API bawaan browser |
| AI "lupa" aturan di tengah sesi | Mulai sesi baru, tempel ulang Template 11.1; satu sesi = satu Issue |
| PR terlalu besar | Pecah menjadi beberapa PR kecil |

## 17. Kesepakatan Tim

- Sinkron 15 menit seminggu sekali; sisanya lewat chat
- Keputusan teknis penting dicatat di bawah ini atau di Issue
- Kritik ditujukan pada kode, bukan orangnya
- **Siapa pun yang memakai AI tetap bertanggung jawab penuh atas kodenya**: harus bisa menjelaskan setiap baris di PR
- Setiap AI melakukan kesalahan berulang, tambahkan **satu aturan baru** di Bagian 7/8 lewat PR

### Log Keputusan

| Tanggal | Keputusan | Alasan |
|---|---|---|
| | | |

## 18. Definition of Done

1. Kriteria di Issue terpenuhi
2. Checklist Bagian 10 terisi
3. Dites manual di browser
4. Lint lulus di CI
5. PR di-review dan di-approve rekan
6. Di-merge ke `main`, branch dihapus
7. README/DESIGN.md diperbarui bila ada perubahan kontrak

## 19. Riwayat Versi Dokumen

| Versi | Tanggal | Perubahan | Disetujui |
|---|---|---|---|
| 1.0 | | Dokumen awal + aturan pembatas AI | A & B |
