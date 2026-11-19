$filePath = "c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# 1. Update switchDashboardTab for prj
$targetSwitch = @'
            if (tabId === 'dt') renderMonthlyDtChart();
            if (tabId === 'cost') renderMonthlyCostChart();
            if (tabId === 'prj') renderPrjTable();
'@

$replacementSwitch = @'
            if (tabId === 'dt') renderMonthlyDtChart();
            if (tabId === 'cost') renderMonthlyCostChart();
            if (tabId === 'prj') {
                renderPrjTable();
                // Tampilkan tabel rincian proyek secara default agar pengguna langsung melihat data detail
                const prjContainer = document.getElementById('prjWorkflowDetailContainer');
                if (prjContainer && prjContainer.classList.contains('hidden') && !currentPrjStatus) {
                    toggleProjectStatusDetail('ALL');
                }
            }
'@

if ($content.Contains($targetSwitch)) {
    $content = $content.Replace($targetSwitch, $replacementSwitch)
    Write-Host "Updated switchDashboardTab"
} else {
    Write-Warning "targetSwitch not found"
}

# 2. Update getFilteredProjects
$targetFilterPrj = @'
            if (statusFilter && statusFilter !== 'ALL') {
                if (statusFilter === 'OUTSTANDING') {
                    list = list.filter(p => p.status === 'OUTSTANDING' || p.status === 'OPEN');
                } else {
                    list = list.filter(p => p.status === statusFilter);
                }
            }
'@

$replacementFilterPrj = @'
            if (statusFilter && statusFilter !== 'ALL') {
                list = list.filter(p => p.status === statusFilter);
            }
'@

if ($content.Contains($targetFilterPrj)) {
    $content = $content.Replace($targetFilterPrj, $replacementFilterPrj)
    Write-Host "Updated getFilteredProjects"
} else {
    Write-Warning "targetFilterPrj not found"
}

# 3. Update updateProjectModule
$targetUpdatePrj = @'
            const totalCount = branchProjects.length;
            const doneCount = branchProjects.filter(p => p.status === 'SELESAI').length;
            const progCount = branchProjects.filter(p => p.status === 'PROSES').length;
            const reviewCount = branchProjects.filter(p => p.status === 'OUTSTANDING' || p.status === 'OPEN').length;

            // 1. Update Top KPI Card 4
            const kpiPrj = document.getElementById('kpiTotalPrj');
            if (kpiPrj) kpiPrj.textContent = `${totalCount} Project`;

            const kpiPrjSub = document.getElementById('kpiPrjSubtitle');
            if (kpiPrjSub) {
                kpiPrjSub.textContent = branch === 'ALL'
                    ? 'B1.a Proyek Tepat Waktu: 99.66% (Target ≥95%)'
                    : `Proyek Cabang ${branch}: ${totalCount} Terdaftar • ${doneCount} Selesai`;
            }

            const cardPrjActionText = document.getElementById('cardPrjActionText');
            if (cardPrjActionText) cardPrjActionText.textContent = `Buka Rincian ${totalCount} Project`;

            // 2. Update 4 Kartu Status di dalam panelView_prj
            const elAll = document.getElementById('prjCount_all');
            const elDone = document.getElementById('prjCount_done');
            const elProg = document.getElementById('prjCount_progress');
            const elRev = document.getElementById('prjCount_review');
            if (elAll) elAll.textContent = `${totalCount} Project`;
            if (elDone) elDone.textContent = `${doneCount} Proyek`;
            if (elProg) elProg.textContent = `${progCount} Proyek`;
            if (elRev) elRev.textContent = `${reviewCount} Proyek`;

            // Update Label Aksi pada 4 kartu
            const actAll = document.getElementById('prjAction_all');
            const actDone = document.getElementById('prjAction_done');
            const actProg = document.getElementById('prjAction_progress');
            const actRev = document.getElementById('prjAction_review');
            if (actAll) actAll.textContent = currentPrjStatus === 'ALL' ? 'Tutup Rincian ▲' : `Buka ${totalCount} Proyek ▼`;
            if (actDone) actDone.textContent = currentPrjStatus === 'SELESAI' ? 'Tutup Rincian ▲' : `Buka ${doneCount} Proyek Selesai ▼`;
            if (actProg) actProg.textContent = currentPrjStatus === 'PROSES' ? 'Tutup Rincian ▲' : `Buka ${progCount} Proyek Proses ▼`;
            if (actRev) actRev.textContent = currentPrjStatus === 'OUTSTANDING' ? 'Tutup Rincian ▲' : `Buka ${reviewCount} Proyek Review ▼`;

            // 3. Update Tombol Header Toggle
            const btnToggleText = document.getElementById('btnTogglePrjText');
            if (btnToggleText) {
                const isContainerHidden = document.getElementById('prjWorkflowDetailContainer')?.classList.contains('hidden');
                btnToggleText.textContent = isContainerHidden ? `Buka Detail Daftar ${totalCount} Proyek ▼` : `Tutup Daftar Proyek ▲`;
            }
'@

$replacementUpdatePrj = @'
            const totalCount = branchProjects.length;
            const openCount = branchProjects.filter(p => p.status === 'OPEN').length;
            const progCount = branchProjects.filter(p => p.status === 'PROSES').length;
            const outCount = branchProjects.filter(p => p.status === 'OUTSTANDING').length;
            const doneCount = branchProjects.filter(p => p.status === 'SELESAI').length;

            // 1. Update Top KPI Card 4
            const kpiPrj = document.getElementById('kpiTotalPrj');
            if (kpiPrj) kpiPrj.textContent = `${totalCount} Project`;

            const kpiPrjSub = document.getElementById('kpiPrjSubtitle');
            if (kpiPrjSub) {
                kpiPrjSub.textContent = branch === 'ALL'
                    ? 'B1.a Proyek Tepat Waktu: 99.66% (Target ≥95%)'
                    : `Proyek Cabang ${branch}: ${totalCount} Terdaftar • ${doneCount} Selesai`;
            }

            const cardPrjActionText = document.getElementById('cardPrjActionText');
            if (cardPrjActionText) cardPrjActionText.textContent = `Buka Rincian ${totalCount} Project`;

            // 2. Update 4 Kartu Status di dalam panelView_prj (1. OPEN, 2. IN PROGRESS, 3. OUTSTANDING, 4. COMPLETED)
            const elOpen = document.getElementById('prjCount_open');
            const elProg = document.getElementById('prjCount_progress');
            const elOut = document.getElementById('prjCount_outstanding');
            const elDone = document.getElementById('prjCount_completed');
            if (elOpen) elOpen.textContent = `${openCount} Proyek`;
            if (elProg) elProg.textContent = `${progCount} Proyek`;
            if (elOut) elOut.textContent = `${outCount} Proyek`;
            if (elDone) elDone.textContent = `${doneCount} Proyek`;

            // Update Label Aksi pada 4 kartu
            const actOpen = document.getElementById('prjAction_open');
            const actProg = document.getElementById('prjAction_progress');
            const actOut = document.getElementById('prjAction_outstanding');
            const actDone = document.getElementById('prjAction_completed');
            if (actOpen) actOpen.textContent = currentPrjStatus === 'OPEN' ? 'Tutup Rincian ▲' : `Buka ${openCount} Proyek Open ▼`;
            if (actProg) actProg.textContent = currentPrjStatus === 'PROSES' ? 'Tutup Rincian ▲' : `Buka ${progCount} Proyek Proses ▼`;
            if (actOut) actOut.textContent = currentPrjStatus === 'OUTSTANDING' ? 'Tutup Rincian ▲' : `Buka ${outCount} Proyek Outstanding ▼`;
            if (actDone) actDone.textContent = currentPrjStatus === 'SELESAI' ? 'Tutup Rincian ▲' : `Buka ${doneCount} Proyek Selesai ▼`;

            // 3. Update Tombol Header Toggle
            const btnToggleText = document.getElementById('btnTogglePrjText');
            if (btnToggleText) {
                const isContainerHidden = document.getElementById('prjWorkflowDetailContainer')?.classList.contains('hidden');
                btnToggleText.textContent = isContainerHidden ? `Buka Detail Seluruh ${totalCount} Proyek ▼` : (currentPrjStatus && currentPrjStatus !== 'ALL' ? `Tampilkan Semua ${totalCount} Proyek` : `Tutup Daftar Proyek ▲`);
            }
'@

if ($content.Contains($targetUpdatePrj)) {
    $content = $content.Replace($targetUpdatePrj, $replacementUpdatePrj)
    Write-Host "Updated updateProjectModule"
} else {
    Write-Error "targetUpdatePrj not found"
    exit 1
}

# 4. Update toggleProjectStatusDetail & closePrjWorkflowDetail
$targetToggleDetail = @'
        function toggleProjectStatusDetail(status) {
            const container = document.getElementById('prjWorkflowDetailContainer');
            if (!container) return;

            if (currentPrjStatus === status && !container.classList.contains('hidden')) {
                closePrjWorkflowDetail();
                return;
            }

            currentPrjStatus = status;
            tablePaginationState.prj.page = 1;
            container.classList.remove('hidden');

            // Reset ring pada ke-4 kartu
            ['all', 'done', 'progress', 'review'].forEach(s => {
                const card = document.getElementById(`prjCard_${s}`);
                if (card) card.classList.remove('ring-4', 'ring-indigo-500', 'ring-emerald-500', 'ring-blue-600', 'ring-purple-600', 'shadow-lg');
            });

            const activeMap = {
                'ALL': { id: 'prjCard_all', ring: ['ring-4', 'ring-indigo-500', 'shadow-lg'] },
                'SELESAI': { id: 'prjCard_done', ring: ['ring-4', 'ring-emerald-500', 'shadow-lg'] },
                'PROSES': { id: 'prjCard_progress', ring: ['ring-4', 'ring-blue-600', 'shadow-lg'] },
                'OUTSTANDING': { id: 'prjCard_review', ring: ['ring-4', 'ring-purple-600', 'shadow-lg'] }
            };

            if (activeMap[status]) {
                const card = document.getElementById(activeMap[status].id);
                if (card) card.classList.add(...activeMap[status].ring);
            }

            const meta = {
                'ALL': {
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300">SEMUA PROYEK</span>',
                    title: 'Rincian Seluruh Proyek Maintenance & Upgrading',
                    subtitle: 'Daftar semua proyek strategis yang terdaftar pada cabang/plant terpilih',
                    bannerClass: 'bg-indigo-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR SELURUH PROYEK STRATEGIS MAINTENANCE & UPGRADING'
                },
                'SELESAI': {
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">SELESAI (COMPLETED)</span>',
                    title: 'Rincian Proyek Selesai 100% (Completed)',
                    subtitle: 'Proyek modifikasi & perawatan yang telah tuntas diuji dan operasional normal',
                    bannerClass: 'bg-emerald-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR PROYEK SELESAI (100% COMPLETED)'
                },
                'PROSES': {
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">IN PROGRESS (PENGERJAAN)</span>',
                    title: 'Rincian Proyek Dalam Pengerjaan Teknisi (In Progress)',
                    subtitle: 'Sedang dalam eksekusi fabrikasi, instalasi komponen, atau perakitan',
                    bannerClass: 'bg-blue-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR PROYEK DALAM PENGERJAAN (IN PROGRESS)'
                },
                'OUTSTANDING': {
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">OUTSTANDING / REVIEW</span>',
                    title: 'Rincian Proyek Outstanding & Review QC',
                    subtitle: 'Pekerjaan fisik selesai, menunggu review kelengkapan part, closing SPK, atau trial run',
                    bannerClass: 'bg-purple-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR PROYEK OUTSTANDING & REVIEW QC'
                }
            };

            const cur = meta[status] || meta['ALL'];
            const badgeEl = document.getElementById('prjWorkflowBadgeStatus');
            const titleEl = document.getElementById('prjWorkflowDetailTitle');
            const subtitleEl = document.getElementById('prjWorkflowDetailSubtitle');
            const bannerEl = document.getElementById('prjWorkflowTableBanner');
            if (badgeEl) badgeEl.innerHTML = cur.badge;
            if (titleEl) titleEl.textContent = cur.title;
            if (subtitleEl) subtitleEl.textContent = cur.subtitle;
            if (bannerEl) { bannerEl.className = cur.bannerClass; bannerEl.textContent = cur.bannerText; }

            renderPrjWorkflowTable();

            const btnToggleText = document.getElementById('btnTogglePrjText');
            if (btnToggleText) btnToggleText.textContent = `Tutup Daftar Proyek ▲`;

            setTimeout(() => {
                container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 60);
        }

        function closePrjWorkflowDetail() {
            const container = document.getElementById('prjWorkflowDetailContainer');
            if (container) container.classList.add('hidden');
            ['all', 'done', 'progress', 'review'].forEach(s => {
                const card = document.getElementById(`prjCard_${s}`);
                if (card) card.classList.remove('ring-4', 'ring-indigo-500', 'ring-emerald-500', 'ring-blue-600', 'ring-purple-600', 'shadow-lg');
            });
            currentPrjStatus = null;

            const branch = document.getElementById('filterBranch') ? document.getElementById('filterBranch').value : 'ALL';
            let branchProjects = maintenanceProjectsList;
            if (branch !== 'ALL') branchProjects = branchProjects.filter(p => p.branch === branch);

            const btnToggleText = document.getElementById('btnTogglePrjText');
            if (btnToggleText) btnToggleText.textContent = `Buka Detail Daftar ${branchProjects.length} Proyek ▼`;

            const actAll = document.getElementById('prjAction_all');
            const actDone = document.getElementById('prjAction_done');
            const actProg = document.getElementById('prjAction_progress');
            const actRev = document.getElementById('prjAction_review');
            if (actAll) actAll.textContent = `Buka ${branchProjects.length} Proyek ▼`;
            if (actDone) actDone.textContent = `Buka ${branchProjects.filter(p => p.status === 'SELESAI').length} Proyek Selesai ▼`;
            if (actProg) actProg.textContent = `Buka ${branchProjects.filter(p => p.status === 'PROSES').length} Proyek Proses ▼`;
            if (actRev) actRev.textContent = `Buka ${branchProjects.filter(p => p.status === 'OUTSTANDING' || p.status === 'OPEN').length} Proyek Review ▼`;
        }
'@

$replacementToggleDetail = @'
        function toggleProjectStatusDetail(status) {
            const container = document.getElementById('prjWorkflowDetailContainer');
            if (!container) return;

            if (currentPrjStatus === status && !container.classList.contains('hidden') && status !== 'ALL') {
                closePrjWorkflowDetail();
                return;
            }

            currentPrjStatus = status;
            tablePaginationState.prj.page = 1;
            container.classList.remove('hidden');

            // Reset ring pada ke-4 kartu (open, progress, outstanding, completed)
            ['open', 'progress', 'outstanding', 'completed'].forEach(s => {
                const card = document.getElementById(`prjCard_${s}`);
                if (card) card.classList.remove('ring-4', 'ring-amber-500', 'ring-blue-600', 'ring-purple-600', 'ring-emerald-500', 'shadow-lg');
            });

            const activeMap = {
                'OPEN': { id: 'prjCard_open', ring: ['ring-4', 'ring-amber-500', 'shadow-lg'] },
                'PROSES': { id: 'prjCard_progress', ring: ['ring-4', 'ring-blue-600', 'shadow-lg'] },
                'OUTSTANDING': { id: 'prjCard_outstanding', ring: ['ring-4', 'ring-purple-600', 'shadow-lg'] },
                'SELESAI': { id: 'prjCard_completed', ring: ['ring-4', 'ring-emerald-500', 'shadow-lg'] }
            };

            if (activeMap[status]) {
                const card = document.getElementById(activeMap[status].id);
                if (card) card.classList.add(...activeMap[status].ring);
            }

            const meta = {
                'ALL': {
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300">SEMUA PROYEK</span>',
                    title: 'Rincian Seluruh Proyek Maintenance & Upgrading',
                    subtitle: 'Daftar semua proyek strategis yang terdaftar pada cabang/plant terpilih',
                    bannerClass: 'bg-indigo-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR SELURUH PROYEK STRATEGIS MAINTENANCE & UPGRADING'
                },
                'OPEN': {
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">1. OPEN / PLANNING</span>',
                    title: 'Rincian Proyek Status: 1. OPEN / PLANNING',
                    subtitle: 'Perencanaan teknis awal, persiapan pengadaan komponen & review desain',
                    bannerClass: 'bg-amber-500 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR PROYEK STATUS: 1. OPEN / PLANNING'
                },
                'PROSES': {
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">2. IN PROGRESS (PENGERJAAN)</span>',
                    title: 'Rincian Proyek Status: 2. IN PROGRESS (PENGERJAAN)',
                    subtitle: 'Sedang dalam eksekusi fabrikasi, instalasi komponen elektrikal, atau perakitan di mesin',
                    bannerClass: 'bg-blue-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR PROYEK STATUS: 2. IN PROGRESS (PENGERJAAN)'
                },
                'OUTSTANDING': {
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">3. OUTSTANDING</span>',
                    title: 'Rincian Proyek Status: 3. OUTSTANDING',
                    subtitle: 'Pekerjaan fisik selesai, menunggu review kelengkapan part, closing SPK, atau trial run',
                    bannerClass: 'bg-purple-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR PROYEK STATUS: 3. OUTSTANDING'
                },
                'SELESAI': {
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">4. COMPLETED (SELESAI)</span>',
                    title: 'Rincian Proyek Status: 4. COMPLETED (SELESAI 100%)',
                    subtitle: 'Proyek modifikasi & perawatan yang telah tuntas diuji dan operasional normal',
                    bannerClass: 'bg-emerald-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR PROYEK STATUS: 4. COMPLETED (SELESAI 100%)'
                }
            };

            const cur = meta[status] || meta['ALL'];
            const badgeEl = document.getElementById('prjWorkflowBadgeStatus');
            const titleEl = document.getElementById('prjWorkflowDetailTitle');
            const subtitleEl = document.getElementById('prjWorkflowDetailSubtitle');
            const bannerEl = document.getElementById('prjWorkflowTableBanner');
            if (badgeEl) badgeEl.innerHTML = cur.badge;
            if (titleEl) titleEl.textContent = cur.title;
            if (subtitleEl) subtitleEl.textContent = cur.subtitle;
            if (bannerEl) { bannerEl.className = cur.bannerClass; bannerEl.textContent = cur.bannerText; }

            renderPrjWorkflowTable();

            const branch = document.getElementById('filterBranch') ? document.getElementById('filterBranch').value : 'ALL';
            let branchProjects = maintenanceProjectsList;
            if (branch !== 'ALL') branchProjects = branchProjects.filter(p => p.branch === branch);

            const btnToggleText = document.getElementById('btnTogglePrjText');
            if (btnToggleText) btnToggleText.textContent = `Tutup Daftar Proyek ▲`;

            // Update action texts on the 4 cards
            const actOpen = document.getElementById('prjAction_open');
            const actProg = document.getElementById('prjAction_progress');
            const actOut = document.getElementById('prjAction_outstanding');
            const actDone = document.getElementById('prjAction_completed');
            if (actOpen) actOpen.textContent = currentPrjStatus === 'OPEN' ? 'Tutup Rincian ▲' : `Buka ${branchProjects.filter(p => p.status === 'OPEN').length} Proyek Open ▼`;
            if (actProg) actProg.textContent = currentPrjStatus === 'PROSES' ? 'Tutup Rincian ▲' : `Buka ${branchProjects.filter(p => p.status === 'PROSES').length} Proyek Proses ▼`;
            if (actOut) actOut.textContent = currentPrjStatus === 'OUTSTANDING' ? 'Tutup Rincian ▲' : `Buka ${branchProjects.filter(p => p.status === 'OUTSTANDING').length} Proyek Outstanding ▼`;
            if (actDone) actDone.textContent = currentPrjStatus === 'SELESAI' ? 'Tutup Rincian ▲' : `Buka ${branchProjects.filter(p => p.status === 'SELESAI').length} Proyek Selesai ▼`;

            setTimeout(() => {
                container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 60);
        }

        function closePrjWorkflowDetail() {
            const container = document.getElementById('prjWorkflowDetailContainer');
            if (container) container.classList.add('hidden');
            ['open', 'progress', 'outstanding', 'completed'].forEach(s => {
                const card = document.getElementById(`prjCard_${s}`);
                if (card) card.classList.remove('ring-4', 'ring-amber-500', 'ring-blue-600', 'ring-purple-600', 'ring-emerald-500', 'shadow-lg');
            });
            currentPrjStatus = null;

            const branch = document.getElementById('filterBranch') ? document.getElementById('filterBranch').value : 'ALL';
            let branchProjects = maintenanceProjectsList;
            if (branch !== 'ALL') branchProjects = branchProjects.filter(p => p.branch === branch);

            const btnToggleText = document.getElementById('btnTogglePrjText');
            if (btnToggleText) btnToggleText.textContent = `Buka Detail Seluruh ${branchProjects.length} Proyek ▼`;

            const actOpen = document.getElementById('prjAction_open');
            const actProg = document.getElementById('prjAction_progress');
            const actOut = document.getElementById('prjAction_outstanding');
            const actDone = document.getElementById('prjAction_completed');
            if (actOpen) actOpen.textContent = `Buka ${branchProjects.filter(p => p.status === 'OPEN').length} Proyek Open ▼`;
            if (actProg) actProg.textContent = `Buka ${branchProjects.filter(p => p.status === 'PROSES').length} Proyek Proses ▼`;
            if (actOut) actOut.textContent = `Buka ${branchProjects.filter(p => p.status === 'OUTSTANDING').length} Proyek Outstanding ▼`;
            if (actDone) actDone.textContent = `Buka ${branchProjects.filter(p => p.status === 'SELESAI').length} Proyek Selesai ▼`;
        }
'@

if ($content.Contains($targetToggleDetail)) {
    $content = $content.Replace($targetToggleDetail, $replacementToggleDetail)
    Write-Host "Updated toggleProjectStatusDetail and closePrjWorkflowDetail"
} else {
    Write-Error "targetToggleDetail not found"
    exit 1
}

# 5. Update toggleDetailTable for 'prj'
$targetToggleDetailTable = @'
        function toggleDetailTable(type) {
            if (type === 'prj') {
                toggleProjectStatusDetail('ALL');
                return;
            }
'@

$replacementToggleDetailTable = @'
        function toggleDetailTable(type) {
            if (type === 'prj') {
                const container = document.getElementById('prjWorkflowDetailContainer');
                if (container && !container.classList.contains('hidden') && currentPrjStatus === 'ALL') {
                    closePrjWorkflowDetail();
                } else {
                    toggleProjectStatusDetail('ALL');
                }
                return;
            }
'@

if ($content.Contains($targetToggleDetailTable)) {
    $content = $content.Replace($targetToggleDetailTable, $replacementToggleDetailTable)
    Write-Host "Updated toggleDetailTable"
} else {
    Write-Warning "targetToggleDetailTable not found"
}

[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Step 2 JavaScript applied successfully"
