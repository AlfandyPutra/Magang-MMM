$filePath = "c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# 1. Update section subtitle in panelView_spk header
$targetHeaderDesc = '<p class="text-xs text-gray-500">Pemberitahuan posisi status pekerjaan: Open, In Progress,
                            Outstanding, & Selesai</p>'
$replacementHeaderDesc = '<p class="text-xs text-gray-500">Pemberitahuan posisi status pekerjaan: Open, Assignment, Waiting to Close, & Closed</p>'
if ($content.Contains($targetHeaderDesc)) {
    $content = $content.Replace($targetHeaderDesc, $replacementHeaderDesc)
    Write-Host "Updated SPK header subtitle"
} else {
    # try regex replacement
    $patternHeader = '(?s)<p class="text-xs text-gray-500">Pemberitahuan posisi status pekerjaan:.*?</p>'
    if ($content -match $patternHeader) {
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, $patternHeader, $replacementHeaderDesc, 1)
        Write-Host "Updated SPK header subtitle via regex"
    }
}

# 2. Update the 4 cards in panelView_spk
$targetCardsSpk = @'
            <!-- 4 STATUS PIPELINE WORKFLOW (SESUAI ORION MMS GAMBAR 2) -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <!-- Status 1: OPEN -->
                <div id="spkWorkflowCard_OPEN" onclick="toggleWorkflowStatusDetail('OPEN')"
                    class="bg-amber-50/80 hover:bg-amber-100/90 border-2 border-amber-300 hover:border-amber-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-amber-800 uppercase tracking-wide">1. OPEN</span>
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    </div>
                    <div class="mt-2">
                        <span id="spkCount_open" class="text-2xl font-black text-amber-700">2</span>
                        <span class="text-xs font-semibold text-gray-500 ml-1">Tiket</span>
                    </div>
                    <p class="text-[11px] text-amber-900/70 mt-1 font-medium">Tiket baru diajukan, menunggu penugasan
                        teknisi</p>
                    <div
                        class="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px] font-bold text-amber-800 group-hover:underline">
                        <span id="spkAction_OPEN">Buka 2 Tiket Open ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>

                <!-- Status 2: PROSES / IN PROGRESS -->
                <div id="spkWorkflowCard_PROSES" onclick="toggleWorkflowStatusDetail('PROSES')"
                    class="bg-blue-50/80 hover:bg-blue-100/90 border-2 border-blue-300 hover:border-blue-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-blue-800 uppercase tracking-wide">2. PROSES</span>
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                    </div>
                    <div class="mt-2">
                        <span id="spkCount_progress" class="text-2xl font-black text-blue-700">32</span>
                        <span class="text-xs font-semibold text-gray-500 ml-1">Tiket</span>
                    </div>
                    <p class="text-[11px] text-blue-900/70 mt-1 font-medium">Sedang dalam pengerjaan teknisi di lapangan
                    </p>
                    <div
                        class="mt-2.5 pt-2 border-t border-blue-200/80 flex items-center justify-between text-[11px] font-bold text-blue-800 group-hover:underline">
                        <span id="spkAction_PROSES">Buka 32 Tiket Proses ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>

                <!-- Status 3: OUTSTANDING / WAITING TO CLOSE -->
                <div id="spkWorkflowCard_OUTSTANDING" onclick="toggleWorkflowStatusDetail('OUTSTANDING')"
                    class="bg-purple-50/80 hover:bg-purple-100/90 border-2 border-purple-300 hover:border-purple-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-purple-800 uppercase tracking-wide">3. OUTSTANDING</span>
                        <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    </div>
                    <div class="mt-2">
                        <span id="spkCount_waiting" class="text-2xl font-black text-purple-700">33</span>
                        <span class="text-xs font-semibold text-gray-500 ml-1">Tiket</span>
                    </div>
                    <p class="text-[11px] text-purple-900/70 mt-1 font-medium">Pekerjaan fisik selesai, menunggu review
                        closing & QC</p>
                    <div
                        class="mt-2.5 pt-2 border-t border-purple-200/80 flex items-center justify-between text-[11px] font-bold text-purple-800 group-hover:underline">
                        <span id="spkAction_OUTSTANDING">Buka 33 Tiket Outstanding ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>

                <!-- Status 4: SELESAI / CLOSED -->
                <div id="spkWorkflowCard_CLOSED" onclick="toggleWorkflowStatusDetail('CLOSED')"
                    class="bg-emerald-50/80 hover:bg-emerald-100/90 border-2 border-emerald-400 hover:border-emerald-500 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide">4. SELESAI
                            (CLOSED)</span>
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <div class="mt-2">
                        <span id="spkCount_closed" class="text-2xl font-black text-emerald-700">1.123</span>
                        <span class="text-xs font-semibold text-gray-500 ml-1">Tiket</span>
                    </div>
                    <p class="text-[11px] text-emerald-900/70 mt-1 font-medium">Tuntas, mesin verifikasi operasional
                        normal</p>
                    <div
                        class="mt-2.5 pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px] font-bold text-emerald-800 group-hover:underline">
                        <span id="spkAction_CLOSED">Buka 1.123 Tiket Selesai ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>
            </div>
'@

$replacementCardsSpk = @'
            <!-- 4 STATUS PIPELINE WORKFLOW (OPEN, ASSIGNMENT, WAITING TO CLOSE, CLOSED) -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <!-- Status 1: OPEN -->
                <div id="spkWorkflowCard_OPEN" onclick="toggleWorkflowStatusDetail('OPEN')"
                    class="bg-amber-50/80 hover:bg-amber-100/90 border-2 border-amber-300 hover:border-amber-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>
                            OPEN
                        </span>
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    </div>
                    <div class="mt-2">
                        <span id="spkCount_open" class="text-2xl font-black text-amber-700">2</span>
                        <span class="text-xs font-semibold text-gray-500 ml-1">Tiket</span>
                    </div>
                    <p class="text-[11px] text-amber-900/70 mt-1 font-medium">Pekerjaan belum dikerjakan namun sudah ada SPK-nya</p>
                    <div
                        class="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px] font-bold text-amber-800 group-hover:underline">
                        <span id="spkAction_OPEN">Buka 2 Tiket Open ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>

                <!-- Status 2: ASSIGNMENT -->
                <div id="spkWorkflowCard_PROSES" onclick="toggleWorkflowStatusDetail('PROSES')"
                    class="bg-blue-50/80 hover:bg-blue-100/90 border-2 border-blue-300 hover:border-blue-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/><path d="M14 6a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                            ASSIGNMENT
                        </span>
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                    </div>
                    <div class="mt-2">
                        <span id="spkCount_progress" class="text-2xl font-black text-blue-700">32</span>
                        <span class="text-xs font-semibold text-gray-500 ml-1">Tiket</span>
                    </div>
                    <p class="text-[11px] text-blue-900/70 mt-1 font-medium">Menentukan siapa yang mengerjakan atau pekerjaan sedang berjalan</p>
                    <div
                        class="mt-2.5 pt-2 border-t border-blue-200/80 flex items-center justify-between text-[11px] font-bold text-blue-800 group-hover:underline">
                        <span id="spkAction_PROSES">Buka 32 Tiket Assignment ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>

                <!-- Status 3: WAITING TO CLOSE -->
                <div id="spkWorkflowCard_OUTSTANDING" onclick="toggleWorkflowStatusDetail('OUTSTANDING')"
                    class="bg-purple-50/80 hover:bg-purple-100/90 border-2 border-purple-300 hover:border-purple-400 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-purple-800 uppercase tracking-wide flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            WAITING TO CLOSE
                        </span>
                        <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    </div>
                    <div class="mt-2">
                        <span id="spkCount_waiting" class="text-2xl font-black text-purple-700">33</span>
                        <span class="text-xs font-semibold text-gray-500 ml-1">Tiket</span>
                    </div>
                    <p class="text-[11px] text-purple-900/70 mt-1 font-medium">Pekerjaan sudah selesai namun menunggu disetujui</p>
                    <div
                        class="mt-2.5 pt-2 border-t border-purple-200/80 flex items-center justify-between text-[11px] font-bold text-purple-800 group-hover:underline">
                        <span id="spkAction_OUTSTANDING">Buka 33 Tiket Waiting to Close ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>

                <!-- Status 4: CLOSED -->
                <div id="spkWorkflowCard_CLOSED" onclick="toggleWorkflowStatusDetail('CLOSED')"
                    class="bg-emerald-50/80 hover:bg-emerald-100/90 border-2 border-emerald-400 hover:border-emerald-500 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                            CLOSED
                        </span>
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <div class="mt-2">
                        <span id="spkCount_closed" class="text-2xl font-black text-emerald-700">1.123</span>
                        <span class="text-xs font-semibold text-gray-500 ml-1">Tiket</span>
                    </div>
                    <p class="text-[11px] text-emerald-900/70 mt-1 font-medium">Pekerjaan sudah disetujui dan dinyatakan tuntas (closed)</p>
                    <div
                        class="mt-2.5 pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px] font-bold text-emerald-800 group-hover:underline">
                        <span id="spkAction_CLOSED">Buka 1.123 Tiket Closed ▼</span>
                        <span>&rarr;</span>
                    </div>
                </div>
            </div>
'@

if ($content.Contains($targetCardsSpk)) {
    $content = $content.Replace($targetCardsSpk, $replacementCardsSpk)
    Write-Host "Updated 4 SPK cards in HTML"
} else {
    Write-Error "targetCardsSpk not found"
    exit 1
}

# 3. Update updateSpkModule in JS
$targetSpkActionText = @'
            if (spkActionOpen) spkActionOpen.textContent = currentWorkflowStatus === 'OPEN' ? 'Tutup Rincian ▲' : `Buka ${openTickets} Tiket Open ▼`;
            if (spkActionProg) spkActionProg.textContent = currentWorkflowStatus === 'PROSES' ? 'Tutup Rincian ▲' : `Buka ${inProgressTickets} Tiket Proses ▼`;
            if (spkActionWait) spkActionWait.textContent = currentWorkflowStatus === 'OUTSTANDING' ? 'Tutup Rincian ▲' : `Buka ${waitingCloseTickets} Tiket Outstanding ▼`;
            if (spkActionClose) spkActionClose.textContent = currentWorkflowStatus === 'CLOSED' ? 'Tutup Rincian ▲' : `Buka ${closedTickets.toLocaleString('id-ID')} Tiket Selesai ▼`;

            const completionRate = totalTickets > 0 ? ((closedTickets / totalTickets) * 100).toFixed(1) : '94.4';
            const spkCompletionEl = document.getElementById('spkCompletionPct');
            if (spkCompletionEl) spkCompletionEl.textContent = `${completionRate}% Tuntas`;

            const spkBarClosed = document.getElementById('spkBarClosed');
            if (spkBarClosed) spkBarClosed.style.width = `${completionRate}%`;

            const spkSubtitle = document.getElementById('kpiSpkStatusSubtitle');
            if (spkSubtitle) spkSubtitle.textContent = `Selesai: ${completionRate}% • ${inProgressTickets} Proses • ${waitingCloseTickets} Outst.`;
'@

$replacementSpkActionText = @'
            if (spkActionOpen) spkActionOpen.textContent = currentWorkflowStatus === 'OPEN' ? 'Tutup Rincian ▲' : `Buka ${openTickets} Tiket Open ▼`;
            if (spkActionProg) spkActionProg.textContent = currentWorkflowStatus === 'PROSES' ? 'Tutup Rincian ▲' : `Buka ${inProgressTickets} Tiket Assignment ▼`;
            if (spkActionWait) spkActionWait.textContent = currentWorkflowStatus === 'OUTSTANDING' ? 'Tutup Rincian ▲' : `Buka ${waitingCloseTickets} Tiket Waiting to Close ▼`;
            if (spkActionClose) spkActionClose.textContent = currentWorkflowStatus === 'CLOSED' ? 'Tutup Rincian ▲' : `Buka ${closedTickets.toLocaleString('id-ID')} Tiket Closed ▼`;

            const completionRate = totalTickets > 0 ? ((closedTickets / totalTickets) * 100).toFixed(1) : '94.4';
            const spkCompletionEl = document.getElementById('spkCompletionPct');
            if (spkCompletionEl) spkCompletionEl.textContent = `${completionRate}% Tuntas`;

            const spkBarClosed = document.getElementById('spkBarClosed');
            if (spkBarClosed) spkBarClosed.style.width = `${completionRate}%`;

            const spkSubtitle = document.getElementById('kpiSpkStatusSubtitle');
            if (spkSubtitle) spkSubtitle.textContent = `Closed: ${completionRate}% • ${inProgressTickets} Assignment • ${waitingCloseTickets} Waiting`;
'@

if ($content.Contains($targetSpkActionText)) {
    $content = $content.Replace($targetSpkActionText, $replacementSpkActionText)
    Write-Host "Updated updateSpkModule in JS"
} else {
    Write-Error "targetSpkActionText not found"
    exit 1
}

# 4. Update statusMeta in toggleWorkflowStatusDetail
$targetStatusMeta = @'
            const statusMeta = {
                OPEN: {
                    badgeClass: 'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300',
                    badgeText: '1. OPEN',
                    title: 'Rincian Tiket Status: 1. OPEN (Menunggu Penugasan)',
                    subtitle: 'Tiket baru diajukan oleh user produksi, menunggu penugasan teknisi maintenance.',
                    bannerClass: 'bg-amber-500 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR TIKET WORKFLOW: 1. OPEN (MENUNGGU PENUGASAN TEKNISI)'
                },
                PROSES: {
                    badgeClass: 'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300',
                    badgeText: '2. PROSES',
                    title: 'Rincian Tiket Status: 2. PROSES / IN PROGRESS (Sedang Dikerjakan)',
                    subtitle: 'Sedang dalam penanganan dan perbaikan langsung oleh teknisi maintenance di lapangan.',
                    bannerClass: 'bg-blue-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR TIKET WORKFLOW: 2. PROSES / IN PROGRESS (PENGERJAAN LAPANGAN)'
                },
                OUTSTANDING: {
                    badgeClass: 'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300',
                    badgeText: '3. OUTSTANDING',
                    title: 'Rincian Tiket Status: 3. OUTSTANDING (Menunggu Closing & QC)',
                    subtitle: 'Pekerjaan fisik perbaikan selesai, menunggu review kelengkapan part, closing SPK, atau QC test.',
                    bannerClass: 'bg-purple-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR TIKET WORKFLOW: 3. OUTSTANDING (MENUNGGU CLOSING & QC)'
                },
                CLOSED: {
                    badgeClass: 'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300',
                    badgeText: '4. SELESAI',
                    title: 'Rincian Tiket Status: 4. SELESAI (CLOSED) (Pekerjaan Tuntas)',
                    subtitle: 'Pekerjaan maintenance telah selesai tuntas dan mesin telah diverifikasi beroperasi normal.',
                    bannerClass: 'bg-emerald-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR TIKET WORKFLOW: 4. SELESAI / CLOSED (PEKERJAAN TUNTAS)'
                }
            };
'@

$replacementStatusMeta = @'
            const statusMeta = {
                OPEN: {
                    badgeClass: 'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300',
                    badgeText: 'OPEN',
                    title: 'Rincian Tiket Status: OPEN',
                    subtitle: 'Pekerjaan belum dikerjakan namun sudah ada SPK-nya.',
                    bannerClass: 'bg-amber-500 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR TIKET WORKFLOW: OPEN (BELUM DIKERJAKAN / SUDAH ADA SPK)'
                },
                PROSES: {
                    badgeClass: 'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300',
                    badgeText: 'ASSIGNMENT',
                    title: 'Rincian Tiket Status: ASSIGNMENT',
                    subtitle: 'Menentukan siapa yang mengerjakan atau pekerjaan sedang berjalan oleh teknisi di lapangan.',
                    bannerClass: 'bg-blue-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR TIKET WORKFLOW: ASSIGNMENT (PENUGASAN & SEDANG BERJALAN)'
                },
                OUTSTANDING: {
                    badgeClass: 'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300',
                    badgeText: 'WAITING TO CLOSE',
                    title: 'Rincian Tiket Status: WAITING TO CLOSE',
                    subtitle: 'Pekerjaan sudah selesai namun menunggu disetujui (approval) oleh atasan/user.',
                    bannerClass: 'bg-purple-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR TIKET WORKFLOW: WAITING TO CLOSE (MENUNGGU PERSETUJUAN)'
                },
                CLOSED: {
                    badgeClass: 'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300',
                    badgeText: 'CLOSED',
                    title: 'Rincian Tiket Status: CLOSED',
                    subtitle: 'Pekerjaan sudah disetujui dan dinyatakan selesai (tuntas) serta operasional normal.',
                    bannerClass: 'bg-emerald-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR TIKET WORKFLOW: CLOSED (SUDAH DISETUJUI & TUNTAS)'
                }
            };
'@

if ($content.Contains($targetStatusMeta)) {
    $content = $content.Replace($targetStatusMeta, $replacementStatusMeta)
    Write-Host "Updated statusMeta in JS"
} else {
    Write-Error "targetStatusMeta not found"
    exit 1
}

# 5. Update statusBadges in renderWorkflowStatusTable
$targetStatusBadges = @'
            const statusBadges = {
                OPEN: '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">1. OPEN</span>',
                PROSES: '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">2. PROSES</span>',
                OUTSTANDING: '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">3. OUTSTANDING</span>',
                CLOSED: '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">4. SELESAI</span>'
            };
'@

$replacementStatusBadges = @'
            const statusBadges = {
                OPEN: '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">OPEN</span>',
                PROSES: '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">ASSIGNMENT</span>',
                OUTSTANDING: '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">WAITING TO CLOSE</span>',
                CLOSED: '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">CLOSED</span>'
            };
'@

if ($content.Contains($targetStatusBadges)) {
    $content = $content.Replace($targetStatusBadges, $replacementStatusBadges)
    Write-Host "Updated statusBadges in JS"
} else {
    Write-Error "targetStatusBadges not found"
    exit 1
}

[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "All SPK naming & description updates successfully applied!"
