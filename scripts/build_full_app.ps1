$ErrorActionPreference = "Stop"

# 1. Read existing HTML
$html = [System.IO.File]::ReadAllText('c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html', [System.Text.Encoding]::UTF8)

# 2. Update Table Headers in HTML

# Top 5 Table Header
$oldTop5Thead = @'
                    <thead class="mms-thead-blue">
                        <tr>
                            <th class="py-3 px-3 border-r border-blue-400/40 text-center w-14">Rank</th>
                            <th class="py-3 px-3 border-r border-blue-400/40">Kode Mesin</th>
                            <th class="py-3 px-3 border-r border-blue-400/40">Kategori</th>
                            <th class="py-3 px-3 border-r border-blue-400/40 text-right">Downtime (Jam)</th>
                            <th class="py-3 px-3 border-r border-blue-400/40 text-right">Total DT + PM (Jam)</th>
                            <th class="py-3 px-3">Detail Problem Utama</th>
                        </tr>
                    </thead>
'@

$newTop5Thead = @'
                    <thead class="mms-thead-blue">
                        <tr>
                            <th class="py-3 px-3 border-r border-blue-400/40 text-center w-14">Rank</th>
                            <th class="py-3 px-3 border-r border-blue-400/40 text-center w-20">Cabang</th>
                            <th class="py-3 px-3 border-r border-blue-400/40">Kode Mesin</th>
                            <th class="py-3 px-3 border-r border-blue-400/40">Nama / Spesifikasi Unit</th>
                            <th class="py-3 px-3 border-r border-blue-400/40">Kategori</th>
                            <th class="py-3 px-3 border-r border-blue-400/40 text-right">Downtime (Jam)</th>
                            <th class="py-3 px-3 border-r border-blue-400/40 text-right">Total DT+PM</th>
                            <th class="py-3 px-3">Detail Problem Utama & Spare Part</th>
                        </tr>
                    </thead>
'@
$html = $html.Replace($oldTop5Thead, $newTop5Thead)

# Downtime Table Header
$oldDtThead = @'
                    <thead class="mms-thead-blue">
                        <tr>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 w-12 text-center">No</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40">Kode Mesin</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40">Nama / Spesifikasi Unit</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40">Kategori</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 text-right">Downtime (Jam)</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 text-right">PM (Jam)</th>
                            <th class="py-2.5 px-3 text-right font-bold bg-[#365fa8]">Total Jam</th>
                        </tr>
                    </thead>
'@

$newDtThead = @'
                    <thead class="mms-thead-blue">
                        <tr>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 w-12 text-center">No</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 text-center w-20">Cabang</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40">Kode Mesin</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40">Nama / Spesifikasi Unit</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40">Kategori</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 text-right">Downtime (Jam)</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 text-right">PM (Jam)</th>
                            <th class="py-2.5 px-3 text-right font-bold bg-[#365fa8]">Total Jam</th>
                        </tr>
                    </thead>
'@
$html = $html.Replace($oldDtThead, $newDtThead)

# Cost Table Header
$oldCostThead = @'
                    <thead class="mms-thead-blue">
                        <tr>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 w-12 text-center">No</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 whitespace-nowrap">Kode Mesin</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40">Kategori</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 text-right whitespace-nowrap">Cost DT
                                Perbaikan</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 text-right whitespace-nowrap">Cost
                                Preventive (PM)</th>
                            <th
                                class="py-2.5 px-3 border-r border-blue-400/40 text-right font-bold bg-[#365fa8] whitespace-nowrap">
                                Total Cost (IDR)</th>
                            <th class="py-2.5 px-3 min-w-[280px]">Alasan / Detail Problem Perbaikan & Spare Part</th>
                        </tr>
                    </thead>
'@

$newCostThead = @'
                    <thead class="mms-thead-blue">
                        <tr>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 w-12 text-center">No</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 text-center w-20">Cabang</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 whitespace-nowrap">Kode Mesin</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40">Nama / Spesifikasi Unit</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40">Kategori</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 text-right whitespace-nowrap">Cost DT (IDR)</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 text-right whitespace-nowrap">Cost PM (IDR)</th>
                            <th class="py-2.5 px-3 border-r border-blue-400/40 text-right font-bold bg-[#365fa8] whitespace-nowrap">Total Cost (IDR)</th>
                            <th class="py-2.5 px-3 min-w-[260px]">Alasan / Detail Problem Perbaikan & Spare Part</th>
                        </tr>
                    </thead>
'@
$html = $html.Replace($oldCostThead, $newCostThead)

# SPK Table Header
$oldSpkThead = @'
                    <thead class="mms-thead-blue">
                        <tr>
                            <th class="py-3 px-3 border-r border-blue-400/40">Kode Mesin</th>
                            <th class="py-3 px-3 border-r border-blue-400/40">Nama / Spesifikasi Unit</th>
                            <th class="py-3 px-3 border-r border-blue-400/40">Kategori</th>
                            <th class="py-3 px-3 border-r border-blue-400/40 text-center">Jumlah SPK DT (Perbaikan)</th>
                            <th class="py-3 px-3 border-r border-blue-400/40 text-center">Jumlah SPK PM (Preventive)
                            </th>
                            <th class="py-3 px-3 text-center font-bold bg-[#365fa8]">Total SPK</th>
                        </tr>
                    </thead>
'@

$newSpkThead = @'
                    <thead class="mms-thead-blue">
                        <tr>
                            <th class="py-3 px-3 border-r border-blue-400/40 w-12 text-center">No</th>
                            <th class="py-3 px-3 border-r border-blue-400/40 text-center w-20">Cabang</th>
                            <th class="py-3 px-3 border-r border-blue-400/40">Kode Mesin</th>
                            <th class="py-3 px-3 border-r border-blue-400/40">Nama / Spesifikasi Unit</th>
                            <th class="py-3 px-3 border-r border-blue-400/40">Kategori</th>
                            <th class="py-3 px-3 border-r border-blue-400/40 text-center">SPK DT (Perbaikan)</th>
                            <th class="py-3 px-3 border-r border-blue-400/40 text-center">SPK PM (Preventive)</th>
                            <th class="py-3 px-3 text-center font-bold bg-[#365fa8]">Total SPK</th>
                        </tr>
                    </thead>
'@
$html = $html.Replace($oldSpkThead, $newSpkThead)

# Save intermediate HTML with updated theads
[System.IO.File]::WriteAllText('c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html', $html, [System.Text.Encoding]::UTF8)
Write-Host "Table headers updated successfully."
