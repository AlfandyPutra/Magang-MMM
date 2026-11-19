$filePath = "c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# ==============================================================================
# 1. SECTION 1: C1 in panelView_dt
# ==============================================================================
$targetC1 = @'
            <!-- ================= KPI STRATEGIS DARI FOTO: UTILISASI MESIN (CUSTOMER PERSPECTIVE) ================= -->
            <div class="mt-4 pt-3.5 border-t border-gray-100">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">C1</span>
                        <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Target &amp; Realisasi KPI: Utilisasi Mesin (Customer Perspective - Bobot 10%)</h4>
                    </div>
                    <span class="text-[11px] text-gray-500 font-medium">Berdasarkan Sasaran Objektif Strategis Perusahaan</span>
                </div>
                <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-2xs">
                    <table class="w-full text-xs text-left border-collapse">
                        <thead class="bg-[#1f4e79] text-white font-bold text-center">
                            <tr>
                                <th class="py-2 px-2 border border-blue-900 w-12">No</th>
                                <th class="py-2 px-3 border border-blue-900 text-left min-w-[200px]">Sasaran Objektif &amp; KPI</th>
                                <th class="py-2 px-2 border border-blue-900 w-16">Periode</th>
                                <th class="py-2 px-2 border border-blue-900 w-16">Verifikasi</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-20">Realisasi<br>Okt 2025</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-16">Target</th>
                                <th class="py-2 px-2 border border-blue-900 text-center w-16">Polarisasi</th>
                                <th class="py-2 px-2 border border-blue-900 text-center w-14">UoM</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-20">Realisasi<br>Okt 2026</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-20">Pencapaian<br>Okt 2026</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-16">Bobot (%)</th>
                                <th class="py-2 px-2 border border-blue-900 text-center w-16">SKOR AKHIR</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <!-- C1.a -->
                            <tr class="hover:bg-blue-50/40 transition">
                                <td class="py-2 px-2 text-center font-bold text-gray-700 border-r border-gray-200">C1.a</td>
                                <td class="py-2 px-3 font-semibold text-gray-800 border-r border-gray-200">% Downtime teknik all</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200">Bulanan</td>
                                <td class="py-2 px-2 text-center font-semibold text-gray-700 border-r border-gray-200">GM</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">1.03</td>
                                <td class="py-2 px-2 text-right font-bold text-gray-800 border-r border-gray-200 font-mono">3</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">Min</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">%</td>
                                <td class="py-2 px-2 text-right font-bold text-emerald-700 border-r border-gray-200 font-mono">3.02</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">3.00</td>
                                <td class="py-2 px-2 text-right font-bold border-r border-gray-200">5</td>
                                <td class="py-2 px-2 text-center font-bold bg-[#00b050] text-white font-mono text-xs shadow-2xs">0.15</td>
                            </tr>
                            <!-- C1.d -->
                            <tr class="hover:bg-blue-50/40 transition">
                                <td class="py-2 px-2 text-center font-bold text-gray-700 border-r border-gray-200">C1.d</td>
                                <td class="py-2 px-3 font-semibold text-gray-800 border-r border-gray-200"># Kasus downtime mesin utility all</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200">Bulanan</td>
                                <td class="py-2 px-2 text-center font-semibold text-gray-700 border-r border-gray-200">GM</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">4</td>
                                <td class="py-2 px-2 text-right font-bold text-gray-800 border-r border-gray-200 font-mono">0</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">Min</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">kasus</td>
                                <td class="py-2 px-2 text-right font-bold text-red-700 border-r border-gray-200 font-mono">7</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">1.00</td>
                                <td class="py-2 px-2 text-right font-bold border-r border-gray-200">5</td>
                                <td class="py-2 px-2 text-center font-bold bg-[#ff0000] text-white font-mono text-xs shadow-2xs">0.05</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
'@

$replacementC1 = @'
            <!-- ================= KPI STRATEGIS EKSEKUTIF: UTILISASI MESIN (CUSTOMER PERSPECTIVE) ================= -->
            <div class="mt-4 pt-3.5 border-t border-gray-100">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">C1</span>
                        <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Target &amp; Realisasi KPI: Utilisasi Mesin (Customer Perspective)</h4>
                    </div>
                    <span class="text-[11px] text-gray-400 font-medium">Sasaran Objektif Strategis Perusahaan</span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <!-- Kartu C1.a -->
                    <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col justify-between">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <div class="flex items-center gap-1.5 mb-0.5">
                                    <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 font-mono">C1.a</span>
                                    <span class="text-xs font-bold text-gray-800">% Downtime Teknik All</span>
                                </div>
                                <p class="text-[11px] text-gray-500">Maksimal toleransi akumulasi downtime seluruh unit mesin</p>
                            </div>
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sesuai Target
                            </span>
                        </div>
                        <div class="mt-3 pt-2.5 border-t border-slate-200/80 flex items-end justify-between">
                            <div>
                                <span class="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Realisasi (Okt 2026)</span>
                                <span class="text-2xl font-black text-emerald-600 font-mono">3.02%</span>
                            </div>
                            <div class="text-right">
                                <span class="text-xs text-gray-700 font-medium block">Target: <strong class="text-gray-900 font-mono">≤ 3.00%</strong></span>
                                <span class="text-[11px] text-gray-400 font-mono">Bobot: 5% • Skor Akhir: <strong class="text-emerald-700">0.15</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- Kartu C1.d -->
                    <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-red-300 hover:bg-red-50/20 transition-all flex flex-col justify-between">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <div class="flex items-center gap-1.5 mb-0.5">
                                    <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 font-mono">C1.d</span>
                                    <span class="text-xs font-bold text-gray-800">Kasus Downtime Mesin Utility All</span>
                                </div>
                                <p class="text-[11px] text-gray-500">Insiden kerusakan mesin utility pendukung (chiller, kompresor)</p>
                            </div>
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 shrink-0">
                                <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Melebihi Target
                            </span>
                        </div>
                        <div class="mt-3 pt-2.5 border-t border-slate-200/80 flex items-end justify-between">
                            <div>
                                <span class="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Realisasi (Okt 2026)</span>
                                <span class="text-2xl font-black text-red-600 font-mono">7 Kasus</span>
                            </div>
                            <div class="text-right">
                                <span class="text-xs text-gray-700 font-medium block">Target: <strong class="text-gray-900 font-mono">0 Kasus</strong></span>
                                <span class="text-[11px] text-gray-400 font-mono">Bobot: 5% • Skor Akhir: <strong class="text-red-700">0.05</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
'@

if ($content.Contains($targetC1)) {
    $content = $content.Replace($targetC1, $replacementC1)
    Write-Host "Updated Section 1 (C1 in DT) to Executive Cards"
} else {
    Write-Error "targetC1 not found"
    exit 1
}

# ==============================================================================
# 2. SECTION 2: F1 in panelView_cost
# ==============================================================================
$targetF1 = @'
            <!-- ================= KPI STRATEGIS DARI FOTO: EFISIENSI BIAYA OPERASIONAL (FINANCIAL PERSPECTIVE) ================= -->
            <div class="mt-4 pt-3.5 border-t border-amber-200/70">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">F1</span>
                        <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Target &amp; Realisasi KPI: Efisiensi Biaya Operasional (Financial Perspective - Bobot 70%)</h4>
                    </div>
                    <span class="text-[11px] text-gray-500 font-medium">Berdasarkan Sasaran Objektif Strategis Perusahaan</span>
                </div>
                <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-2xs">
                    <table class="w-full text-xs text-left border-collapse">
                        <thead class="bg-[#1f4e79] text-white font-bold text-center">
                            <tr>
                                <th class="py-2 px-2 border border-blue-900 w-12">No</th>
                                <th class="py-2 px-3 border border-blue-900 text-left min-w-[200px]">Sasaran Objektif &amp; KPI</th>
                                <th class="py-2 px-2 border border-blue-900 w-16">Periode</th>
                                <th class="py-2 px-2 border border-blue-900 w-16">Verifikasi</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-20">Realisasi<br>Okt 2025</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-16">Target</th>
                                <th class="py-2 px-2 border border-blue-900 text-center w-16">Polarisasi</th>
                                <th class="py-2 px-2 border border-blue-900 text-center w-14">UoM</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-20">Realisasi<br>Okt 2026</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-20">Pencapaian<br>Okt 2026</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-16">Bobot (%)</th>
                                <th class="py-2 px-2 border border-blue-900 text-center w-16">SKOR AKHIR</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <!-- F1.a -->
                            <tr class="hover:bg-amber-50/40 transition">
                                <td class="py-2 px-2 text-center font-bold text-gray-700 border-r border-gray-200">F1.a</td>
                                <td class="py-2 px-3 font-semibold text-gray-800 border-r border-gray-200">IDR Gaji teknik / kg produksi all</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200">Tahunan</td>
                                <td class="py-2 px-2 text-center font-semibold text-gray-700 border-r border-gray-200">HRGA</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">216.13</td>
                                <td class="py-2 px-2 text-right font-bold text-gray-800 border-r border-gray-200 font-mono">220</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">Min</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">IDR</td>
                                <td class="py-2 px-2 text-right font-bold text-red-700 border-r border-gray-200 font-mono">363.50</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">1.00</td>
                                <td class="py-2 px-2 text-right font-bold border-r border-gray-200">20</td>
                                <td class="py-2 px-2 text-center font-bold bg-[#ff0000] text-white font-mono text-xs shadow-2xs">0.20</td>
                            </tr>
                            <!-- F1.d -->
                            <tr class="hover:bg-amber-50/40 transition">
                                <td class="py-2 px-2 text-center font-bold text-gray-700 border-r border-gray-200">F1.d</td>
                                <td class="py-2 px-3 font-semibold text-gray-800 border-r border-gray-200">IDR Pemeliharaan / kg produksi all</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200">Tahunan</td>
                                <td class="py-2 px-2 text-center font-semibold text-gray-700 border-r border-gray-200">FA</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">167.56</td>
                                <td class="py-2 px-2 text-right font-bold text-gray-800 border-r border-gray-200 font-mono">190</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">Min</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">IDR</td>
                                <td class="py-2 px-2 text-right font-bold text-red-700 border-r border-gray-200 font-mono">402.57</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">1.00</td>
                                <td class="py-2 px-2 text-right font-bold border-r border-gray-200">15</td>
                                <td class="py-2 px-2 text-center font-bold bg-[#ff0000] text-white font-mono text-xs shadow-2xs">0.15</td>
                            </tr>
                            <!-- F1.e -->
                            <tr class="hover:bg-amber-50/40 transition">
                                <td class="py-2 px-2 text-center font-bold text-gray-700 border-r border-gray-200">F1.e</td>
                                <td class="py-2 px-3 font-semibold text-gray-800 border-r border-gray-200">% Cost saving &amp; cost reduction engineering</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200">Tahunan</td>
                                <td class="py-2 px-2 text-center font-semibold text-gray-700 border-r border-gray-200">Dir</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">1.93</td>
                                <td class="py-2 px-2 text-right font-bold text-gray-800 border-r border-gray-200 font-mono">90</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">Max</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">%</td>
                                <td class="py-2 px-2 text-right font-bold text-red-700 border-r border-gray-200 font-mono">5.79</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">1.00</td>
                                <td class="py-2 px-2 text-right font-bold border-r border-gray-200">15</td>
                                <td class="py-2 px-2 text-center font-bold bg-[#ff0000] text-white font-mono text-xs shadow-2xs">0.15</td>
                            </tr>
                            <!-- F1.f -->
                            <tr class="hover:bg-amber-50/40 transition">
                                <td class="py-2 px-2 text-center font-bold text-gray-700 border-r border-gray-200">F1.f</td>
                                <td class="py-2 px-3 font-semibold text-gray-800 border-r border-gray-200"># kWh / ton produksi all</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200">Bulanan</td>
                                <td class="py-2 px-2 text-center font-semibold text-gray-700 border-r border-gray-200">FA</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">1,471.71</td>
                                <td class="py-2 px-2 text-right font-bold text-gray-800 border-r border-gray-200 font-mono">1,310</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">Min</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">kWh</td>
                                <td class="py-2 px-2 text-right font-bold text-emerald-700 border-r border-gray-200 font-mono">1,289.63</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">4.00</td>
                                <td class="py-2 px-2 text-right font-bold border-r border-gray-200">20</td>
                                <td class="py-2 px-2 text-center font-bold bg-[#00b050] text-white font-mono text-xs shadow-2xs">0.80</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
'@

$replacementF1 = @'
            <!-- ================= KPI STRATEGIS EKSEKUTIF: EFISIENSI BIAYA (FINANCIAL PERSPECTIVE) ================= -->
            <div class="mt-4 pt-3.5 border-t border-amber-200/70">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">F1</span>
                        <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Target &amp; Realisasi KPI: Efisiensi Biaya Operasional (Financial Perspective)</h4>
                    </div>
                    <span class="text-[11px] text-gray-400 font-medium">Sasaran Objektif Strategis Perusahaan</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <!-- F1.a -->
                    <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-red-300 hover:bg-red-50/20 transition-all flex flex-col justify-between">
                        <div class="flex items-start justify-between gap-1.5 mb-2">
                            <div>
                                <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 font-mono block w-fit mb-1">F1.a</span>
                                <span class="text-xs font-bold text-gray-800 block line-clamp-1">Gaji Teknik / kg</span>
                                <span class="text-[10px] text-gray-500">Upah per kg produksi all</span>
                            </div>
                            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 shrink-0">Over Target</span>
                        </div>
                        <div class="pt-2 border-t border-slate-200/80 flex items-end justify-between">
                            <div>
                                <span class="text-[9px] uppercase font-bold text-gray-400 block">Realisasi</span>
                                <span class="text-lg font-black text-red-600 font-mono">Rp 363.50</span>
                            </div>
                            <div class="text-right text-[10px]">
                                <span class="text-gray-500 block">Target: <strong>≤ Rp 220</strong></span>
                                <span class="text-gray-400 font-mono">Bobot 20% • Skor <strong class="text-red-700">0.20</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- F1.d -->
                    <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-red-300 hover:bg-red-50/20 transition-all flex flex-col justify-between">
                        <div class="flex items-start justify-between gap-1.5 mb-2">
                            <div>
                                <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 font-mono block w-fit mb-1">F1.d</span>
                                <span class="text-xs font-bold text-gray-800 block line-clamp-1">Biaya MTC / kg</span>
                                <span class="text-[10px] text-gray-500">Pemeliharaan per volume all</span>
                            </div>
                            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 shrink-0">Over Target</span>
                        </div>
                        <div class="pt-2 border-t border-slate-200/80 flex items-end justify-between">
                            <div>
                                <span class="text-[9px] uppercase font-bold text-gray-400 block">Realisasi</span>
                                <span class="text-lg font-black text-red-600 font-mono">Rp 402.57</span>
                            </div>
                            <div class="text-right text-[10px]">
                                <span class="text-gray-500 block">Target: <strong>≤ Rp 190</strong></span>
                                <span class="text-gray-400 font-mono">Bobot 15% • Skor <strong class="text-red-700">0.15</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- F1.e -->
                    <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-red-300 hover:bg-red-50/20 transition-all flex flex-col justify-between">
                        <div class="flex items-start justify-between gap-1.5 mb-2">
                            <div>
                                <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 font-mono block w-fit mb-1">F1.e</span>
                                <span class="text-xs font-bold text-gray-800 block line-clamp-1">% Cost Saving</span>
                                <span class="text-[10px] text-gray-500">Inovasi reduksi engineering</span>
                            </div>
                            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 shrink-0">Di Bawah</span>
                        </div>
                        <div class="pt-2 border-t border-slate-200/80 flex items-end justify-between">
                            <div>
                                <span class="text-[9px] uppercase font-bold text-gray-400 block">Realisasi</span>
                                <span class="text-lg font-black text-red-600 font-mono">5.79%</span>
                            </div>
                            <div class="text-right text-[10px]">
                                <span class="text-gray-500 block">Target: <strong>≥ 90%</strong></span>
                                <span class="text-gray-400 font-mono">Bobot 15% • Skor <strong class="text-red-700">0.15</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- F1.f -->
                    <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col justify-between">
                        <div class="flex items-start justify-between gap-1.5 mb-2">
                            <div>
                                <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 font-mono block w-fit mb-1">F1.f</span>
                                <span class="text-xs font-bold text-gray-800 block line-clamp-1">Energi (kWh/ton)</span>
                                <span class="text-[10px] text-gray-500">Konsumsi listrik per ton</span>
                            </div>
                            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">Tercapai</span>
                        </div>
                        <div class="pt-2 border-t border-slate-200/80 flex items-end justify-between">
                            <div>
                                <span class="text-[9px] uppercase font-bold text-gray-400 block">Realisasi</span>
                                <span class="text-lg font-black text-emerald-600 font-mono">1,289.6</span>
                            </div>
                            <div class="text-right text-[10px]">
                                <span class="text-gray-500 block">Target: <strong>≤ 1,310</strong></span>
                                <span class="text-gray-400 font-mono">Bobot 20% • Skor <strong class="text-emerald-700">0.80</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
'@

if ($content.Contains($targetF1)) {
    $content = $content.Replace($targetF1, $replacementF1)
    Write-Host "Updated Section 2 (F1 in Cost) to Executive Cards"
} else {
    Write-Error "targetF1 not found"
    exit 1
}

# ==============================================================================
# 3. SECTION 3: B1 in panelView_spk
# ==============================================================================
$targetB1Spk = @'
            <!-- ================= KPI STRATEGIS DARI FOTO: KETEPATAN SPK & PERAWATAN (INTERNAL BUSINESS PROCESS) ================= -->
            <div class="mt-4 pt-3.5 border-t border-gray-100">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">B1</span>
                        <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Target &amp; Realisasi KPI: Pelaksanaan Perawatan &amp; SPK Tepat Waktu (Internal Process - s/d B1.d)</h4>
                    </div>
                    <span class="text-[11px] text-gray-500 font-medium">Berdasarkan Sasaran Objektif Strategis Perusahaan</span>
                </div>
                <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-2xs">
                    <table class="w-full text-xs text-left border-collapse">
                        <thead class="bg-[#1f4e79] text-white font-bold text-center">
                            <tr>
                                <th class="py-2 px-2 border border-blue-900 w-12">No</th>
                                <th class="py-2 px-3 border border-blue-900 text-left min-w-[200px]">Sasaran Objektif &amp; KPI</th>
                                <th class="py-2 px-2 border border-blue-900 w-16">Periode</th>
                                <th class="py-2 px-2 border border-blue-900 w-16">Verifikasi</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-20">Realisasi<br>Okt 2025</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-16">Target</th>
                                <th class="py-2 px-2 border border-blue-900 text-center w-16">Polarisasi</th>
                                <th class="py-2 px-2 border border-blue-900 text-center w-14">UoM</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-20">Realisasi<br>Okt 2026</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-20">Pencapaian<br>Okt 2026</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-16">Bobot (%)</th>
                                <th class="py-2 px-2 border border-blue-900 text-center w-16">SKOR AKHIR</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <!-- B1.d -->
                            <tr class="hover:bg-blue-50/40 transition">
                                <td class="py-2 px-2 text-center font-bold text-gray-700 border-r border-gray-200">B1.d</td>
                                <td class="py-2 px-3 font-semibold text-gray-800 border-r border-gray-200">% Pelaksanaan perawatan tepat waktu all</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200">Bulanan</td>
                                <td class="py-2 px-2 text-center font-semibold text-gray-700 border-r border-gray-200">GM</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">100.00</td>
                                <td class="py-2 px-2 text-right font-bold text-gray-800 border-r border-gray-200 font-mono">95</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">Max</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">%</td>
                                <td class="py-2 px-2 text-right font-bold text-emerald-700 border-r border-gray-200 font-mono">100.00</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">4.00</td>
                                <td class="py-2 px-2 text-right font-bold border-r border-gray-200">5</td>
                                <td class="py-2 px-2 text-center font-bold bg-[#00b050] text-white font-mono text-xs shadow-2xs">0.20</td>
                            </tr>
                            <!-- B1.a -->
                            <tr class="hover:bg-blue-50/40 transition">
                                <td class="py-2 px-2 text-center font-bold text-gray-700 border-r border-gray-200">B1.a</td>
                                <td class="py-2 px-3 font-semibold text-gray-800 border-r border-gray-200">% Realisasi SPK repair dan proyek tepat waktu all</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200">Bulanan</td>
                                <td class="py-2 px-2 text-center font-semibold text-gray-700 border-r border-gray-200">GM</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">100.00</td>
                                <td class="py-2 px-2 text-right font-bold text-gray-800 border-r border-gray-200 font-mono">95</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">Max</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">%</td>
                                <td class="py-2 px-2 text-right font-bold text-emerald-700 border-r border-gray-200 font-mono">99.66</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">4.00</td>
                                <td class="py-2 px-2 text-right font-bold border-r border-gray-200">5</td>
                                <td class="py-2 px-2 text-center font-bold bg-[#00b050] text-white font-mono text-xs shadow-2xs">0.20</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
'@

$replacementB1Spk = @'
            <!-- ================= KPI STRATEGIS EKSEKUTIF: KETEPATAN SPK & PERAWATAN (INTERNAL PROCESS) ================= -->
            <div class="mt-4 pt-3.5 border-t border-gray-100">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">B1</span>
                        <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Target &amp; Realisasi KPI: Pelaksanaan Perawatan &amp; SPK (Internal Business Process)</h4>
                    </div>
                    <span class="text-[11px] text-gray-400 font-medium">Sasaran Objektif Strategis Perusahaan</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <!-- B1.d -->
                    <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col justify-between">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <div class="flex items-center gap-1.5 mb-0.5">
                                    <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 font-mono">B1.d</span>
                                    <span class="text-xs font-bold text-gray-800">% Pelaksanaan Perawatan Tepat Waktu</span>
                                </div>
                                <p class="text-[11px] text-gray-500">Ketepatan jadwal preventive maintenance berkala seluruh mesin</p>
                            </div>
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 100% Sempurna
                            </span>
                        </div>
                        <div class="mt-3 pt-2.5 border-t border-slate-200/80 flex items-end justify-between">
                            <div>
                                <span class="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Realisasi (Okt 2026)</span>
                                <span class="text-2xl font-black text-emerald-600 font-mono">100.00%</span>
                            </div>
                            <div class="text-right">
                                <span class="text-xs text-gray-700 font-medium block">Target: <strong class="text-gray-900 font-mono">≥ 95%</strong></span>
                                <span class="text-[11px] text-gray-400 font-mono">Bobot: 5% • Skor Akhir: <strong class="text-emerald-700">0.20</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- B1.a -->
                    <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col justify-between">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <div class="flex items-center gap-1.5 mb-0.5">
                                    <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 font-mono">B1.a</span>
                                    <span class="text-xs font-bold text-gray-800">% Realisasi SPK Repair &amp; Proyek Tepat Waktu</span>
                                </div>
                                <p class="text-[11px] text-gray-500">Tingkat keberhasilan penyelesaian tiket kerja &amp; repair sesuai SLA</p>
                            </div>
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Tercapai
                            </span>
                        </div>
                        <div class="mt-3 pt-2.5 border-t border-slate-200/80 flex items-end justify-between">
                            <div>
                                <span class="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Realisasi (Okt 2026)</span>
                                <span class="text-2xl font-black text-emerald-600 font-mono">99.66%</span>
                            </div>
                            <div class="text-right">
                                <span class="text-xs text-gray-700 font-medium block">Target: <strong class="text-gray-900 font-mono">≥ 95%</strong></span>
                                <span class="text-[11px] text-gray-400 font-mono">Bobot: 5% • Skor Akhir: <strong class="text-emerald-700">0.20</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
'@

if ($content.Contains($targetB1Spk)) {
    $content = $content.Replace($targetB1Spk, $replacementB1Spk)
    Write-Host "Updated Section 3 (B1 in SPK) to Executive Cards"
} else {
    Write-Error "targetB1Spk not found"
    exit 1
}

# ==============================================================================
# 4. SECTION 4: B1 in panelView_prj
# ==============================================================================
$targetB1Prj = @'
            <!-- ================= KPI STRATEGIS DARI FOTO: KETEPATAN PENYELESAIAN PROYEK (INTERNAL PROCESS - S/D B1.d) ================= -->
            <div class="mt-4 pt-3.5 border-t border-gray-100">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold">B1</span>
                        <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Target &amp; Realisasi KPI: Kecepatan &amp; Ketepatan Penyelesaian Project (Sasaran B1)</h4>
                    </div>
                    <span class="text-[11px] text-gray-500 font-medium">Berdasarkan Sasaran Objektif Strategis Perusahaan</span>
                </div>
                <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-2xs">
                    <table class="w-full text-xs text-left border-collapse">
                        <thead class="bg-[#1f4e79] text-white font-bold text-center">
                            <tr>
                                <th class="py-2 px-2 border border-blue-900 w-12">No</th>
                                <th class="py-2 px-3 border border-blue-900 text-left min-w-[200px]">Sasaran Objektif &amp; KPI</th>
                                <th class="py-2 px-2 border border-blue-900 w-16">Periode</th>
                                <th class="py-2 px-2 border border-blue-900 w-16">Verifikasi</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-20">Realisasi<br>Okt 2025</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-16">Target</th>
                                <th class="py-2 px-2 border border-blue-900 text-center w-16">Polarisasi</th>
                                <th class="py-2 px-2 border border-blue-900 text-center w-14">UoM</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-20">Realisasi<br>Okt 2026</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-20">Pencapaian<br>Okt 2026</th>
                                <th class="py-2 px-2 border border-blue-900 text-right w-16">Bobot (%)</th>
                                <th class="py-2 px-2 border border-blue-900 text-center w-16">SKOR AKHIR</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <!-- B1.a -->
                            <tr class="hover:bg-indigo-50/40 transition">
                                <td class="py-2 px-2 text-center font-bold text-gray-700 border-r border-gray-200">B1.a</td>
                                <td class="py-2 px-3 font-semibold text-gray-800 border-r border-gray-200">% Realisasi SPK repair dan proyek tepat waktu all</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200">Bulanan</td>
                                <td class="py-2 px-2 text-center font-semibold text-gray-700 border-r border-gray-200">GM</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">100.00</td>
                                <td class="py-2 px-2 text-right font-bold text-gray-800 border-r border-gray-200 font-mono">95</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">Max</td>
                                <td class="py-2 px-2 text-center border-r border-gray-200 text-gray-600">%</td>
                                <td class="py-2 px-2 text-right font-bold text-emerald-700 border-r border-gray-200 font-mono">99.66</td>
                                <td class="py-2 px-2 text-right border-r border-gray-200 font-mono">4.00</td>
                                <td class="py-2 px-2 text-right font-bold border-r border-gray-200">5</td>
                                <td class="py-2 px-2 text-center font-bold bg-[#00b050] text-white font-mono text-xs shadow-2xs">0.20</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
'@

$replacementB1Prj = @'
            <!-- ================= KPI STRATEGIS EKSEKUTIF: KECEPATAN & KETEPATAN PROYEK (SASARAN B1) ================= -->
            <div class="mt-4 pt-3.5 border-t border-gray-100">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">B1</span>
                        <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Target &amp; Realisasi KPI: Kecepatan &amp; Ketepatan Proyek (Internal Process)</h4>
                    </div>
                    <span class="text-[11px] text-gray-400 font-medium">Sasaran Objektif Strategis Perusahaan</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <!-- B1.a -->
                    <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col justify-between">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <div class="flex items-center gap-1.5 mb-0.5">
                                    <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800 font-mono">B1.a</span>
                                    <span class="text-xs font-bold text-gray-800">% Realisasi SPK &amp; Proyek Tepat Waktu</span>
                                </div>
                                <p class="text-[11px] text-gray-500">Ketepatan waktu milestone &amp; serah terima proyek upgrade/overhaul</p>
                            </div>
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> On Target
                            </span>
                        </div>
                        <div class="mt-3 pt-2.5 border-t border-slate-200/80 flex items-end justify-between">
                            <div>
                                <span class="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Realisasi (Okt 2026)</span>
                                <span class="text-2xl font-black text-emerald-600 font-mono">99.66%</span>
                            </div>
                            <div class="text-right">
                                <span class="text-xs text-gray-700 font-medium block">Target: <strong class="text-gray-900 font-mono">≥ 95%</strong></span>
                                <span class="text-[11px] text-gray-400 font-mono">Bobot: 5% • Skor Akhir: <strong class="text-emerald-700">0.20</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- B1.d -->
                    <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col justify-between">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <div class="flex items-center gap-1.5 mb-0.5">
                                    <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800 font-mono">B1.d</span>
                                    <span class="text-xs font-bold text-gray-800">% Pelaksanaan Overhaul &amp; Perawatan Tepat Waktu</span>
                                </div>
                                <p class="text-[11px] text-gray-500">Kepatuhan eksekusi preventive tahunan &amp; jadwal trial run mesin</p>
                            </div>
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 100% Selesai
                            </span>
                        </div>
                        <div class="mt-3 pt-2.5 border-t border-slate-200/80 flex items-end justify-between">
                            <div>
                                <span class="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Realisasi (Okt 2026)</span>
                                <span class="text-2xl font-black text-emerald-600 font-mono">100.00%</span>
                            </div>
                            <div class="text-right">
                                <span class="text-xs text-gray-700 font-medium block">Target: <strong class="text-gray-900 font-mono">≥ 95%</strong></span>
                                <span class="text-[11px] text-gray-400 font-mono">Bobot: 5% • Skor Akhir: <strong class="text-emerald-700">0.20</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
'@

if ($content.Contains($targetB1Prj)) {
    $content = $content.Replace($targetB1Prj, $replacementB1Prj)
    Write-Host "Updated Section 4 (B1 in Project) to Executive Cards"
} else {
    Write-Error "targetB1Prj not found"
    exit 1
}

[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "All 4 KPI sections successfully converted to Executive Metric Cards!"
