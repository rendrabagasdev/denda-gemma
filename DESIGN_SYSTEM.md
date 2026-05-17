-# GEMMA Design System: Cartoon-Premium

Dokumentasi ini berisi panduan gaya dan komponen UI untuk menjaga konsistensi desain antara aplikasi Guest, Undangan, dan Admin Panel masa depan.

---

## 1. Core Styles (Global CSS)
Semua komponen utama menggunakan kelas utilitas Tailwind yang didefinisikan di `app/globals.css`.

### Cartoon Card
Kartu dengan border tebal dan efek bayangan solid.
- **Kelas**: `.cartoon-card`
- **Gaya**: `bg-white border-4 border-zinc-900 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`

### Cartoon Button
Tombol interaktif dengan efek tekan.
- **Kelas**: `.cartoon-btn`
- **Gaya**: `border-4 border-zinc-900 font-black uppercase tracking-widest active:translate-x-1 active:translate-y-1 active:shadow-none transition-all`
- **Shadow**: `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`

### Cartoon Input
Input field dengan gaya yang senada.
- **Kelas**: `.cartoon-input`
- **Gaya**: `border-4 border-zinc-900 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/20 outline-none transition-all`

---

## 2. Navigasi Utama

### AdminSidebar (`/components/AdminSidebar.tsx`)
Digunakan untuk navigasi desktop.
- **Props**: `mode: 'undangan' | 'admin'`
- **Warna Aksen**: 
  - Undangan: `Indigo/Primary`
  - Denda: `Yellow/Secondary`

### BottomBar (`/components/BottomBar.tsx`)
Digunakan untuk navigasi mobile.
- **Letak**: `fixed bottom-0`
- **Fitur**: Otomatis menyembunyikan diri di desktop (`hidden lg:flex`).

---

## 3. Modals & Sheets

### ConfirmModal (`/components/ConfirmModal.tsx`)
Modal konfirmasi untuk aksi destruktif (hapus, dsb).
- **Style**: Menggunakan `AnimatePresence` dan `framer-motion` untuk efek *pop-up*.

### TikTokModal (Pattern)
Pola Bottom Sheet yang digunakan di halaman tamu dan detail.
- **Style**: `fixed inset-0 items-end` (mobile) | `items-center` (desktop).
- **Animasi**: `y: "100%"` ke `y: 0`.
- **Border Radius**: `rounded-t-[2.5rem]` (mobile).

---

## 4. Palette Warna (Tailwind Config)
Pastikan `tailwind.config.ts` kamu menyertakan warna-warna berikut:
- **Primary**: `#4f46e5` (Indigo) - Digunakan untuk Modul Undangan.
- **Secondary**: `#ffdc00` (Yellow) - Digunakan untuk Modul Denda.
- **Accent**: Warna-warna cerah lainnya untuk badge dan status.

---

## 5. Tipografi
- **Headings**: `font-black uppercase tracking-tighter`
- **Subheadings/Badges**: `text-[10px] font-black uppercase tracking-widest`
- **Body**: `font-sans`

---

## 6. Contoh Penggunaan (Snippet)
```tsx
<div className="cartoon-card p-8 bg-white">
  <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">
    Judul Panel
  </h2>
  <input type="text" className="cartoon-input mb-4" placeholder="Input data..." />
  <button className="cartoon-btn bg-primary px-8 py-4 text-white">
    Simpan Data
  </button>
</div>
```

---
*Dokumentasi ini dibuat untuk membantu pengembangan Admin Panel GEMMA yang terpisah.*
