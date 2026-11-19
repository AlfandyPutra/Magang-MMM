# MMS Maintenance Summary Dashboard (Month-to-Date)
**PT Mitra Mulia Makmur (MMM Plastic)**  
*Sistem Rekapitulasi Downtime (Jam), Cost Pemeliharaan (IDR), Realisasi SPK & Monitoring Proyek Maintenance*

---

## 📁 Struktur Direktori Proyek

Folder proyek telah dirapikan ke dalam struktur modular berikut agar mudah dikelola dan dipelihara:

```text
c:\Kuliah\AntiGravity\Magang MMM\
│
├── maintenancesummary-mtd.html    # Aplikasi Dashboard Utama (Standalone Single-Page App)
├── index.html                     # Halaman pintasan redirect otomatis untuk Live Server
├── README.md                      # Dokumentasi & panduan struktur direktori
│
├── 📁 data/                       # Berkas data sumber & hasil parsing
│   ├── Ticket_Detail_Source.xlsx  # File Excel data riil dari sistem MMS (1.190 tiket)
│   ├── mms_real_data.js           # Dataset riil terstruktur format JavaScript
│   ├── generated_data.js          # Dataset cadangan
│   ├── ticket_detail_parsed.csv   # Data tiket terurai format CSV
│   └── ticket_detail_parsed.tsv   # Data tiket terurai format TSV
│
├── 📁 reports/                    # Berkas laporan hasil ekspor (Excel & CSV)
│   ├── Maintenance_Summary_Real_2026-11-01_sd_2026-11-10.xls
│   ├── Maintenance_Summary_2026-11-01_sd_2026-11-17.xls
│   ├── Maintenance_Summary_2026-11-01_sd_2026-11-17.csv
│   ├── Maintenance_Summary_2026-10-01_sd_2026-10-31.xls
│   └── Maintenance_Summary_2026-10-01_sd_2026-10-31.csv
│
├── 📁 scripts/                    # Skrip otomasi PowerShell untuk parsing & build
│   ├── analyze_xlsx.ps1           # Analisis struktur kolom file Excel
│   ├── build_full_app.ps1         # Kompilasi aplikasi dashboard
│   ├── build_real_data.ps1        # Ekstraksi data riil sheet 1 & sheet 2
│   ├── export_real_excel.ps1      # Generator file laporan Excel (.XLS)
│   ├── generate_complete_app.ps1  # Generator dashboard lengkap
│   ├── generate_js_data.ps1       # Generator variabel JavaScript
│   ├── generate_reports.ps1       # Generator laporan periodik
│   ├── parse_xlsx.ps1             # Parser berkas OpenXML XLSX
│   ├── patch_ui.ps1               # Patch antarmuka visual
│   ├── read_xlsx.ps1              # Reader cepat berkas Excel
│   └── ... skrip verifikasi & pengujian
│
└── 📁 backups/                    # Berkas cadangan versi sebelumnya
    ├── maintenancesummary-mtd.html.bak
    ├── maintenancesummary-mtd.html.bak2
    └── maintenancesummary-mtd.html.bak3
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
