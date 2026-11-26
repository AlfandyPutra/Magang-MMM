# MMS Maintenance Summary Dashboard (Month-to-Date)
**PT Mitra Mulia Makmur (MMM Plastic)**  
*Sistem Rekapitulasi Downtime (Jam), Cost Pemeliharaan (IDR), Realisasi SPK & Monitoring Proyek Maintenance*

---

## 📁 Struktur Direktori Proyek

Folder proyek telah dirapikan ke dalam struktur modular berikut agar mudah dikelola dan dipelihara:

```text
c:\Kuliah\AntiGravity\Magang MMM\
│
├── index.html                     # Halaman pintasan redirect otomatis untuk Live Server
├── maintenancesummary-mtd.html    # Aplikasi Dashboard Utama (Executive Single-Page App)
├── README.md                      # Dokumentasi & panduan struktur direktori
├── LARAVEL_MIGRATION_GUIDE.md     # Panduan integrasi backend Laravel & API
│
├── 📁 assets/
│   └── logo-mmm.png               # Logo resmi PT Mitra Mulia Makmur (MMM Plastic)
│
├── 📁 css/
│   └── style.css                  # Styling tambahan & kustomisasi antarmuka
│
├── 📁 js/
│   ├── app.js                     # Logika inti dashboard, filter, modal, & kalkulasi KPI
│   ├── 📁 data/                   # Dataset terstruktur (Mesin, Log Harian, Proyek)
│   │   ├── daily-logs.js
│   │   ├── machines-data.js
│   │   └── projects-data.js
│   └── 📁 modules/                # Modul fungsional terpisah
│       ├── charts.js              # Konfigurasi & rendering grafik Chart.js
│       ├── workflow-spk.js        # Logika alur kerja & pelacakan tiket SPK
│       ├── project-module.js      # Modul monitoring proyek maintenance
│       └── export-tools.js        # Fitur ekspor laporan Excel (.XLS) & CSV
│
├── 📁 data/
│   └── Ticket_Detail_Source.xlsx  # File Excel sumber data riil MMS
│
└── 📁 reports/
    └── Maintenance_Summary_Real_2026-11-01_sd_2026-11-10.xls  # Contoh laporan hasil ekspor
```

---

## 🚀 Cara Menjalankan Dashboard

1. **Menggunakan VS Code Live Server (Direkomendasikan)**:
   - Buka folder proyek di VS Code.
   - Klik kanan pada `maintenancesummary-mtd.html` atau `index.html` -> pilih **Open with Live Server**.
   - Buka browser di alamat: `http://127.0.0.1:5500/` atau `http://127.0.0.1:5500/maintenancesummary-mtd.html`.

2. **Membuka Langsung di Browser**:
   - Klik ganda pada file `maintenancesummary-mtd.html` untuk langsung membukanya di browser Google Chrome / Microsoft Edge.

---

## 🌟 Fitur Utama Dashboard Eksekutif
1. **Desain 1 Layar Bersih (*Single-Screen View*)**: Bebas tumpukan tabel mentah; fokus pada ringkasan visual.
2. **4 Pilar Kartu KPI Interaktif**:
   - **Total Downtime (DT)**: Jam kerusakan, rasio perbaikan vs preventif, dan grafik rasio bulanan.
   - **Total Biaya (Cost)**: Rasio biaya perbaikan (DT 72.3%) vs preventive (PM 27.7%), biaya/jam DT, sebaran cabang, dan grafik biaya bulanan.
   - **Status SPK & Posisi Tiket**: Posisi alur kerja tiket (1. Open, 2. Proses, 3. Outstanding, 4. Selesai), completion rate 94.4%, response time, dan komposisi workload.
   - **Data Project**: 13 Proyek strategis pemeliharaan & upgrading, progress penyelesaian, dan rincian PIC teknisi.
3. **Detail Tabel On-Demand**: Tabel Top 5 Pareto, Rekap Jam DT, Rekap Biaya, SPK per Mesin, dan Rincian Proyek dapat dibuka/ditutup melalui klik tombol detail dengan pagination 10 baris per tabel.
4. **Integrasi Sasaran Objektif & KPI Strategis Perusahaan**: Setiap kolom/modul mengintegrasikan data target, realisasi, bobot, dan skor KPI dari foto scorecard (s/d No. B1.d): C1 pada Downtime, F1 pada Biaya, B1 pada SPK & Project.
5. **Ekspor Data**: Mendukung ekspor laporan ke format Excel (.XLS terformat rapi & berwarna) dan CSV.
