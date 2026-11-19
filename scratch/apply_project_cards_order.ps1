$filePath = "c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# 1. Replace 4 cards in panelView_prj
$targetCards = @'
            <!-- 4 KOTAK STATUS PROJECT (INTERAKTIF & DINAMIS SESUAI CABANG) -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <!-- Status 1: TOTAL PROYEK -->
                <div id="prjCard_all" onclick="toggleProjectStatusDetail('ALL')"
                    class="bg-indigo-50/80 hover:bg-indigo-100/90 border-2 border-indigo-200 hover:border-indigo-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-indigo-800 uppercase tracking-wide">Total Proyek Aktif</span>
                        <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    </div>
                    <div class="mt-2 text-center sm:text-left">
                        <span id="prjCount_all" class="text-2xl font-black text-indigo-700">13 Project</span>
                    </div>
                    <p class="text-[11px] text-indigo-900/70 mt-1 font-medium">Akumulasi seluruh proyek pada cabang terpilih</p>
                    <div class="mt-2.5 pt-2 border-t border-indigo-200/80 flex items-center justify-between text-[11px] font-bold text-indigo-800 group-hover:underline">
                        <span id="prjAction_all">Buka 13 Proyek ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>

                <!-- Status 2: SELESAI -->
                <div id="prjCard_done" onclick="toggleProjectStatusDetail('SELESAI')"
                    class="bg-emerald-50/80 hover:bg-emerald-100/90 border-2 border-emerald-200 hover:border-emerald-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide">Selesai (Completed)</span>
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <div class="mt-2 text-center sm:text-left">
                        <span id="prjCount_done" class="text-2xl font-black text-emerald-700">8 Proyek</span>
                    </div>
                    <p class="text-[11px] text-emerald-900/70 mt-1 font-medium">Proyek tuntas 100%, verifikasi trial normal</p>
                    <div class="mt-2.5 pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px] font-bold text-emerald-800 group-hover:underline">
                        <span id="prjAction_done">Buka 8 Proyek Selesai ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>

                <!-- Status 3: IN PROGRESS -->
                <div id="prjCard_progress" onclick="toggleProjectStatusDetail('PROSES')"
                    class="bg-blue-50/80 hover:bg-blue-100/90 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-blue-800 uppercase tracking-wide">In Progress (Pengerjaan)</span>
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                    </div>
                    <div class="mt-2 text-center sm:text-left">
                        <span id="prjCount_progress" class="text-2xl font-black text-blue-700">3 Proyek</span>
                    </div>
                    <p class="text-[11px] text-blue-900/70 mt-1 font-medium">Sedang dalam pengerjaan teknisi di lapangan</p>
                    <div class="mt-2.5 pt-2 border-t border-blue-200/80 flex items-center justify-between text-[11px] font-bold text-blue-800 group-hover:underline">
                        <span id="prjAction_progress">Buka 3 Proyek Proses ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>

                <!-- Status 4: OUTSTANDING / REVIEW -->
                <div id="prjCard_review" onclick="toggleProjectStatusDetail('OUTSTANDING')"
                    class="bg-purple-50/80 hover:bg-purple-100/90 border-2 border-purple-200 hover:border-purple-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-purple-800 uppercase tracking-wide">Outstanding / Review</span>
                        <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    </div>
                    <div class="mt-2 text-center sm:text-left">
                        <span id="prjCount_review" class="text-2xl font-black text-purple-700">2 Proyek</span>
                    </div>
                    <p class="text-[11px] text-purple-900/70 mt-1 font-medium">Pekerjaan fisik selesai, menunggu review QC</p>
                    <div class="mt-2.5 pt-2 border-t border-purple-200/80 flex items-center justify-between text-[11px] font-bold text-purple-800 group-hover:underline">
                        <span id="prjAction_review">Buka 2 Proyek Review ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>
            </div>
'@

$replacementCards = @'
            <!-- 4 STATUS PIPELINE PROJECT (URUTAN: OPEN, IN PROGRESS, OUTSTANDING, COMPLETED) -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <!-- Status 1: 1. OPEN (WARNA KUNING) -->
                <div id="prjCard_open" onclick="toggleProjectStatusDetail('OPEN')"
                    class="bg-amber-50/80 hover:bg-amber-100/90 border-2 border-amber-300 hover:border-amber-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-amber-800 uppercase tracking-wide">1. OPEN</span>
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    </div>
                    <div class="mt-2 text-center sm:text-left">
                        <span id="prjCount_open" class="text-2xl font-black text-amber-700">1 Proyek</span>
                    </div>
                    <p class="text-[11px] text-amber-900/70 mt-1 font-medium">Perencanaan awal, pengadaan sparepart & review desain</p>
                    <div class="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px] font-bold text-amber-800 group-hover:underline">
                        <span id="prjAction_open">Buka 1 Proyek Open ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>

                <!-- Status 2: 2. IN PROGRESS (WARNA BIRU) -->
                <div id="prjCard_progress" onclick="toggleProjectStatusDetail('PROSES')"
                    class="bg-blue-50/80 hover:bg-blue-100/90 border-2 border-blue-300 hover:border-blue-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-blue-800 uppercase tracking-wide">2. IN PROGRESS</span>
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                    </div>
                    <div class="mt-2 text-center sm:text-left">
                        <span id="prjCount_progress" class="text-2xl font-black text-blue-700">3 Proyek</span>
                    </div>
                    <p class="text-[11px] text-blue-900/70 mt-1 font-medium">Sedang dalam pengerjaan & modifikasi teknisi di lapangan</p>
                    <div class="mt-2.5 pt-2 border-t border-blue-200/80 flex items-center justify-between text-[11px] font-bold text-blue-800 group-hover:underline">
                        <span id="prjAction_progress">Buka 3 Proyek Proses ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>

                <!-- Status 3: 3. OUTSTANDING (WARNA UNGU) -->
                <div id="prjCard_outstanding" onclick="toggleProjectStatusDetail('OUTSTANDING')"
                    class="bg-purple-50/80 hover:bg-purple-100/90 border-2 border-purple-300 hover:border-purple-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-purple-800 uppercase tracking-wide">3. OUTSTANDING</span>
                        <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    </div>
                    <div class="mt-2 text-center sm:text-left">
                        <span id="prjCount_outstanding" class="text-2xl font-black text-purple-700">1 Proyek</span>
                    </div>
                    <p class="text-[11px] text-purple-900/70 mt-1 font-medium">Pekerjaan fisik selesai, menunggu review closing & QC</p>
                    <div class="mt-2.5 pt-2 border-t border-purple-200/80 flex items-center justify-between text-[11px] font-bold text-purple-800 group-hover:underline">
                        <span id="prjAction_outstanding">Buka 1 Proyek Outstanding ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>

                <!-- Status 4: 4. COMPLETED (WARNA HIJAU) -->
                <div id="prjCard_completed" onclick="toggleProjectStatusDetail('SELESAI')"
                    class="bg-emerald-50/80 hover:bg-emerald-100/90 border-2 border-emerald-400 hover:border-emerald-500 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide">4. COMPLETED</span>
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <div class="mt-2 text-center sm:text-left">
                        <span id="prjCount_completed" class="text-2xl font-black text-emerald-700">8 Proyek</span>
                    </div>
                    <p class="text-[11px] text-emerald-900/70 mt-1 font-medium">Proyek tuntas 100%, verifikasi trial normal operasional</p>
                    <div class="mt-2.5 pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px] font-bold text-emerald-800 group-hover:underline">
                        <span id="prjAction_completed">Buka 8 Proyek Selesai ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>
            </div>
'@

if ($content.Contains($targetCards)) {
    $content = $content.Replace($targetCards, $replacementCards)
    Write-Host "Replaced 4 cards successfully"
} else {
    Write-Error "targetCards not found in HTML"
    exit 1
}

# 2. Update toggleDetailTable button in panelView_prj header
$targetBtnHeader = '<span id="btnTogglePrjText">Buka Detail Daftar 13 Proyek ▼</span>'
$replacementBtnHeader = '<span id="btnTogglePrjText">Buka Detail Seluruh 13 Proyek ▼</span>'
if ($content.Contains($targetBtnHeader)) {
    $content = $content.Replace($targetBtnHeader, $replacementBtnHeader)
    Write-Host "Updated header button text"
}

# 3. Add 'Tampilkan Semua Proyek' button to prjWorkflowDetailContainer header
$targetContainerHeader = @'
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="closePrjWorkflowDetail()"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer">
                            <span>Tutup Rincian Proyek</span>
                            <span class="font-bold text-sm leading-none">&times;</span>
                        </button>
                    </div>
'@

$replacementContainerHeader = @'
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="toggleProjectStatusDetail('ALL')"
                            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer">
                            <span>Tampilkan Semua Proyek</span>
                        </button>
                        <button type="button" onclick="closePrjWorkflowDetail()"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer">
                            <span>Tutup Rincian</span>
                            <span class="font-bold text-sm leading-none">&times;</span>
                        </button>
                    </div>
'@

if ($content.Contains($targetContainerHeader)) {
    $content = $content.Replace($targetContainerHeader, $replacementContainerHeader)
    Write-Host "Updated container header"
}

[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Step 1 HTML written successfully"
