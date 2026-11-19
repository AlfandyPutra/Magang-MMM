/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Strategic Project Maintenance & Upgrading Tracking Module
 */
        // 5.4 MODUL DATA PROJECT (INTERAKTIF & DINAMIS SESUAI CABANG)
        // ============================================================================
        let currentPrjStatus = null; // null | 'ALL' | 'SELESAI' | 'PROSES' | 'OUTSTANDING'
        let prjSearchKeyword = '';

        function getFilteredProjects(statusFilter) {
            const branchEl = document.getElementById('filterBranch');
            const branch = branchEl ? branchEl.value : 'ALL';
            let list = maintenanceProjectsList;

            if (branch !== 'ALL') {
                list = list.filter(p => p.branch === branch);
            }

            if (statusFilter && statusFilter !== 'ALL') {
                list = list.filter(p => p.status === statusFilter);
            }

            if (prjSearchKeyword) {
                const q = prjSearchKeyword.toLowerCase();
                list = list.filter(p =>
                    p.code.toLowerCase().includes(q) ||
                    p.name.toLowerCase().includes(q) ||
                    p.pic.toLowerCase().includes(q) ||
                    p.desc.toLowerCase().includes(q) ||
                    p.branch.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q)
                );
            }

            return list;
        }

        function updateProjectModule(selectedBranch) {
            const branch = selectedBranch || (document.getElementById('filterBranch') ? document.getElementById('filterBranch').value : 'ALL');

            let branchProjects = maintenanceProjectsList;
            if (branch !== 'ALL') {
                branchProjects = branchProjects.filter(p => p.branch === branch);
            }

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
                    ? `${doneCount} Closed â€¢ ${progCount} Assignment â€¢ ${outCount} Waiting`
                    : `Proyek Cabang ${branch}: ${totalCount} Terdaftar â€¢ ${doneCount} Closed`;
            }

            const isPrjContainerHidden = document.getElementById('prjWorkflowDetailContainer')?.classList.contains('hidden');
            const cardPrjActionText = document.getElementById('cardPrjActionText');
            const cardPrjActionIcon = document.getElementById('cardPrjActionIcon');
            if (cardPrjActionText) {
                cardPrjActionText.textContent = isPrjContainerHidden
                    ? `Buka Rincian ${totalCount} Project`
                    : `Tutup Rincian ${totalCount} Project`;
            }
            if (cardPrjActionIcon) {
                if (isPrjContainerHidden) cardPrjActionIcon.classList.remove('rotate-180');
                else cardPrjActionIcon.classList.add('rotate-180');
            }

            // 2. Update 4 Kartu Status di dalam panelView_prj (1. OPEN, 2. ASSIGNMENT, 3. WAITING TO CLOSE, 4. CLOSED)
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
            if (actOpen) actOpen.textContent = currentPrjStatus === 'OPEN' ? 'Tutup Rincian â–²' : `Buka ${openCount} Proyek Open â–¼`;
            if (actProg) actProg.textContent = currentPrjStatus === 'PROSES' ? 'Tutup Rincian â–²' : `Buka ${progCount} Proyek Assignment â–¼`;
            if (actOut) actOut.textContent = currentPrjStatus === 'OUTSTANDING' ? 'Tutup Rincian â–²' : `Buka ${outCount} Proyek Waiting to Close â–¼`;
            if (actDone) actDone.textContent = currentPrjStatus === 'SELESAI' ? 'Tutup Rincian â–²' : `Buka ${doneCount} Proyek Closed â–¼`;

            // 3. Update Tombol Header Toggle
            const btnToggleText = document.getElementById('btnTogglePrjText');
            if (btnToggleText) {
                const isContainerHidden = document.getElementById('prjWorkflowDetailContainer')?.classList.contains('hidden');
                btnToggleText.textContent = isContainerHidden ? `Buka Detail Seluruh ${totalCount} Proyek â–¼` : (currentPrjStatus && currentPrjStatus !== 'ALL' ? `Tampilkan Semua ${totalCount} Proyek` : `Tutup Daftar Proyek â–²`);
            }

            // 4. Update Rata-rata Progress & Bar
            const avgProgress = totalCount > 0 ? (branchProjects.reduce((sum, p) => sum + p.progress, 0) / totalCount).toFixed(1) : '0.0';
            const avgPrgEl = document.getElementById('prjAvgProgress');
            const avgPrgBar = document.getElementById('prjAvgProgressBar');
            if (avgPrgEl) avgPrgEl.textContent = `${avgProgress}%`;
            if (avgPrgBar) avgPrgBar.style.width = `${avgProgress}%`;

            // 5. Update Sebaran Proyek per Cabang
            updateBranchProjectDistribution();

            // 6. Update Highlight Projects (Top 4 untuk cabang terpilih)
            renderHighlightProjects(branchProjects);

            // 7. Jika tabel detail sedang terbuka, refresh isinya
            if (currentPrjStatus) {
                renderPrjWorkflowTable();
            }
        }

        function updateBranchProjectDistribution() {
            const distContainer = document.getElementById('prjBranchDistribution');
            if (!distContainer) return;

            const mmmCount = maintenanceProjectsList.filter(p => p.branch === 'MMM').length;
            const mmgCount = maintenanceProjectsList.filter(p => p.branch === 'MMG').length;
            const mmsCount = maintenanceProjectsList.filter(p => p.branch === 'MMS').length;
            const mmnCount = maintenanceProjectsList.filter(p => p.branch === 'MMN').length;

            distContainer.innerHTML = `
                <span>MMM Sidoarjo: <strong>${mmmCount} Proyek</strong></span>
                <span>MMG Gresik: <strong>${mmgCount} Proyek</strong></span>
                <span>MMS Serang: <strong>${mmsCount} Proyek</strong></span>
                <span>MMN Ngoro: <strong>${mmnCount} Proyek</strong></span>
            `;
        }

        function renderHighlightProjects(projects) {
            const container = document.getElementById('prjHighlightList');
            if (!container) return;

            if (projects.length === 0) {
                container.innerHTML = '<div class="p-3 text-center text-gray-400 bg-gray-50 rounded-lg">Tidak ada proyek aktif pada cabang ini.</div>';
                return;
            }

            const top4 = projects.slice(0, 4);
            container.innerHTML = top4.map(p => {
                let badgeBg = 'bg-blue-100 text-blue-700';
                let cardBg = 'bg-blue-50/50 border-blue-200';
                let statusText = `${p.progress}% Assignment`;

                if (p.status === 'SELESAI') {
                    badgeBg = 'bg-emerald-100 text-emerald-700';
                    cardBg = 'bg-emerald-50/50 border-emerald-200';
                    statusText = '100% Closed';
                } else if (p.status === 'OUTSTANDING') {
                    badgeBg = 'bg-purple-100 text-purple-700';
                    cardBg = 'bg-purple-50/50 border-purple-200';
                    statusText = `${p.progress}% Waiting to Close`;
                } else if (p.status === 'OPEN') {
                    badgeBg = 'bg-amber-100 text-amber-700';
                    cardBg = 'bg-amber-50/50 border-amber-200';
                    statusText = `${p.progress}% Open`;
                }

                return `
                    <div onclick="openProjectModal('${p.code}')" class="p-2.5 rounded-lg ${cardBg} border flex items-center justify-between cursor-pointer hover:shadow-sm hover:scale-[1.01] transition group">
                        <div class="pr-2">
                            <div class="flex items-center gap-1.5">
                                <span class="font-bold text-gray-900 group-hover:text-indigo-600 transition block text-xs">${p.code}: ${p.name}</span>
                                ${getBranchBadge(p.branch)}
                            </div>
                            <span class="text-[11px] text-gray-500 block mt-0.5">PIC: ${p.pic} â€¢ Target: ${p.target}</span>
                        </div>
                        <div class="text-right shrink-0">
                            <span class="px-2 py-0.5 rounded text-[11px] font-bold ${badgeBg}">${statusText}</span>
                            <span class="block text-[10px] text-indigo-600 font-semibold mt-1 group-hover:underline">Lihat Rincian â†’</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

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
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">1. OPEN</span>',
                    title: 'Rincian Proyek Status: 1. OPEN (Belum Dikerjakan)',
                    subtitle: 'Proyek belum dikerjakan namun sudah ada perencanaannya / SPK proyek.',
                    bannerClass: 'bg-amber-500 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR PROYEK STATUS: 1. OPEN (BELUM DIKERJAKAN / SUDAH ADA SPK)'
                },
                'PROSES': {
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">2. ASSIGNMENT</span>',
                    title: 'Rincian Proyek Status: 2. ASSIGNMENT (Penugasan & Sedang Berjalan)',
                    subtitle: 'Menentukan siapa yang mengerjakan project tersebut atau project itu sudah berjalan.',
                    bannerClass: 'bg-blue-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR PROYEK STATUS: 2. ASSIGNMENT (PENUGASAN & SEDANG BERJALAN)'
                },
                'OUTSTANDING': {
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">3. WAITING TO CLOSE</span>',
                    title: 'Rincian Proyek Status: 3. WAITING TO CLOSE (Menunggu Disetujui)',
                    subtitle: 'Pekerjaan proyek sudah selesai namun menunggu disetujui (approval) sebelum ditutup.',
                    bannerClass: 'bg-purple-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR PROYEK STATUS: 3. WAITING TO CLOSE (PEKERJAAN SELESAI, MENUNGGU PERSETUJUAN)'
                },
                'SELESAI': {
                    badge: '<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">4. CLOSED</span>',
                    title: 'Rincian Proyek Status: 4. CLOSED (Sudah Disetujui & Tuntas)',
                    subtitle: 'Proyek sudah disetujui dan dinyatakan masuk ke closed secara tuntas.',
                    bannerClass: 'bg-emerald-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR PROYEK STATUS: 4. CLOSED (SUDAH DISETUJUI & TUNTAS)'
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
            if (btnToggleText) btnToggleText.textContent = `Tutup Daftar Proyek â–²`;

            // Update label aksi dan icon panah di KPI Card 4 atas
            const cardPrjText = document.getElementById('cardPrjActionText');
            const cardPrjIcon = document.getElementById('cardPrjActionIcon');
            if (cardPrjText) cardPrjText.textContent = `Tutup Rincian ${branchProjects.length} Project`;
            if (cardPrjIcon) cardPrjIcon.classList.add('rotate-180');

            // Update action texts on the 4 cards
            const actOpen = document.getElementById('prjAction_open');
            const actProg = document.getElementById('prjAction_progress');
            const actOut = document.getElementById('prjAction_outstanding');
            const actDone = document.getElementById('prjAction_completed');
            if (actOpen) actOpen.textContent = currentPrjStatus === 'OPEN' ? 'Tutup Rincian â–²' : `Buka ${branchProjects.filter(p => p.status === 'OPEN').length} Proyek Open â–¼`;
            if (actProg) actProg.textContent = currentPrjStatus === 'PROSES' ? 'Tutup Rincian â–²' : `Buka ${branchProjects.filter(p => p.status === 'PROSES').length} Proyek Assignment â–¼`;
            if (actOut) actOut.textContent = currentPrjStatus === 'OUTSTANDING' ? 'Tutup Rincian â–²' : `Buka ${branchProjects.filter(p => p.status === 'OUTSTANDING').length} Proyek Waiting to Close â–¼`;
            if (actDone) actDone.textContent = currentPrjStatus === 'SELESAI' ? 'Tutup Rincian â–²' : `Buka ${branchProjects.filter(p => p.status === 'SELESAI').length} Proyek Closed â–¼`;

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
            if (btnToggleText) btnToggleText.textContent = `Buka Detail Seluruh ${branchProjects.length} Proyek â–¼`;

            // Update label aksi dan icon panah di KPI Card 4 atas
            const cardPrjText = document.getElementById('cardPrjActionText');
            const cardPrjIcon = document.getElementById('cardPrjActionIcon');
            if (cardPrjText) cardPrjText.textContent = `Buka Rincian ${branchProjects.length} Project`;
            if (cardPrjIcon) cardPrjIcon.classList.remove('rotate-180');

            const actOpen = document.getElementById('prjAction_open');
            const actProg = document.getElementById('prjAction_progress');
            const actOut = document.getElementById('prjAction_outstanding');
            const actDone = document.getElementById('prjAction_completed');
            if (actOpen) actOpen.textContent = `Buka ${branchProjects.filter(p => p.status === 'OPEN').length} Proyek Open â–¼`;
            if (actProg) actProg.textContent = `Buka ${branchProjects.filter(p => p.status === 'PROSES').length} Proyek Assignment â–¼`;
            if (actOut) actOut.textContent = `Buka ${branchProjects.filter(p => p.status === 'OUTSTANDING').length} Proyek Waiting to Close â–¼`;
            if (actDone) actDone.textContent = `Buka ${branchProjects.filter(p => p.status === 'SELESAI').length} Proyek Closed â–¼`;
        }

        function handlePrjSearch(keyword) {
            prjSearchKeyword = keyword;
            tablePaginationState.prj.page = 1;
            renderPrjWorkflowTable();
        }

        function renderPrjWorkflowTable() {
            const tbody = document.getElementById('prjWorkflowTableBody');
            if (!tbody) return;

            const items = getFilteredProjects(currentPrjStatus);
            const countEl = document.getElementById('prjWorkflowShowingCount');
            if (countEl) countEl.textContent = items.length;

            const { page, pageSize } = tablePaginationState.prj;
            const totalPages = pageSize === Infinity ? 1 : Math.ceil(items.length / pageSize) || 1;
            const activePage = Math.min(Math.max(1, page), totalPages);
            tablePaginationState.prj.page = activePage;

            const pagedItems = pageSize === Infinity
                ? items
                : items.slice((activePage - 1) * pageSize, activePage * pageSize);

            const baseIdx = pageSize === Infinity ? 0 : (activePage - 1) * pageSize;

            if (pagedItems.length === 0) {
                tbody.innerHTML = `<tr><td colspan="10" class="py-6 text-center text-gray-400">Tidak ada proyek yang sesuai dengan filter atau kata kunci.</td></tr>`;
                renderPaginationControls('prj', 0, 1, 10);
                return;
            }

            tbody.innerHTML = pagedItems.map((item, idx) => {
                let statusBadge = '';
                if (item.status === 'SELESAI') statusBadge = '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">4. CLOSED</span>';
                else if (item.status === 'PROSES') statusBadge = '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">2. ASSIGNMENT</span>';
                else if (item.status === 'OUTSTANDING') statusBadge = '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">3. WAITING TO CLOSE</span>';
                else statusBadge = '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">1. OPEN</span>';

                return `
                    <tr onclick="openProjectModal('${item.code}')" class="hover:bg-indigo-50/50 cursor-pointer transition">
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center font-bold text-gray-700">${baseIdx + idx + 1}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center">${getBranchBadge(item.branch)}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 font-mono font-bold text-indigo-700 whitespace-nowrap">${item.code}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200">
                            <span class="font-bold text-gray-800 block text-xs">${item.name}</span>
                            <span class="text-[11px] text-gray-500">${item.desc}</span>
                        </td>
                        <td class="py-2.5 px-3 border-r border-gray-200">${getCategoryBadge(item.category)}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 font-medium text-gray-700 whitespace-nowrap">${item.pic}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center">
                            <div class="flex items-center gap-1.5 justify-center">
                                <div class="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div class="h-2 rounded-full ${item.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}" style="width: ${item.progress}%"></div>
                                </div>
                                <span class="font-bold text-[11px] text-gray-700">${item.progress}%</span>
                            </div>
                        </td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center whitespace-nowrap">${statusBadge}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center text-xs font-semibold text-gray-600 whitespace-nowrap">${item.target}</td>
                        <td class="py-2.5 px-3 text-center whitespace-nowrap">
                            <button type="button" onclick="event.stopPropagation(); openProjectModal('${item.code}')" class="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition shadow-2xs cursor-pointer">
                                Detail ðŸ”
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            renderPaginationControls('prj', items.length, activePage, pageSize);
        }

        // ============================================================================
        // MODAL PROYEK DETAIL
        // ============================================================================
        function openProjectModal(code) {
            const prj = maintenanceProjectsList.find(p => p.code === code);
            if (!prj) return;

            const modal = document.getElementById('projectDetailModal');
            if (!modal) return;

            document.getElementById('prjModalCategoryBadge').innerHTML = getCategoryBadge(prj.category);
            document.getElementById('prjModalBranchBadge').innerHTML = getBranchBadge(prj.branch);

            let statusBadge = '<span class="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500 text-white rounded">CLOSED (100%)</span>';
            if (prj.status === 'PROSES') statusBadge = '<span class="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-500 text-white rounded">ASSIGNMENT</span>';
            else if (prj.status === 'OUTSTANDING') statusBadge = '<span class="px-2 py-0.5 text-[10px] font-bold uppercase bg-purple-500 text-white rounded">WAITING TO CLOSE</span>';
            else if (prj.status === 'OPEN') statusBadge = '<span class="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500 text-white rounded">OPEN</span>';
            document.getElementById('prjModalStatusBadge').innerHTML = statusBadge;

            document.getElementById('prjModalTitle').textContent = `${prj.code}: ${prj.name}`;
            document.getElementById('prjModalDesc').textContent = prj.desc;
            document.getElementById('prjModalProgressPct').textContent = `${prj.progress}%`;
            document.getElementById('prjModalTarget').textContent = prj.target;
            document.getElementById('prjModalPic').textContent = prj.pic;
            document.getElementById('prjModalProgressBarText').textContent = `${prj.progress}%`;

            const bar = document.getElementById('prjModalProgressBar');
            if (bar) {
                bar.style.width = `${prj.progress}%`;
                bar.className = `h-2.5 rounded-full transition-all duration-500 ${prj.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`;
            }

            document.getElementById('prjModalMachine').textContent = prj.machine || `Sektor Mesin ${prj.category} Cabang [${prj.branch}]`;
            document.getElementById('prjModalImpact').textContent = prj.impact || 'Efisiensi operasional maintenance, penurunan risiko breakdown, dan peningkatan keandalan mesin.';

            const milestones = [
                { name: '1. Perencanaan Teknis & Pengadaan Sparepart', done: prj.progress >= 25, desc: 'Penyusunan gambar kerja teknik, spesifikasi suku cadang, dan approval purchasing.' },
                { name: '2. Pembongkaran, Fabrikasi & Modifikasi Fisik', done: prj.progress >= 50, desc: 'Pengerjaan mekanikal, permesinan presisi, atau fabrikasi dudukan unit.' },
                { name: '3. Instalasi Komponen, Wiring Elektrikal & Sensor', done: prj.progress >= 75, desc: 'Pemasangan part baru, integrasi sistem kontrol PLC / inverter / pneumatic.' },
                { name: '4. Commissioning, QC Running Test & Handover', done: prj.progress === 100, desc: 'Uji coba operasional beban produksi 24 jam, QC sign-off, dan closing SPK proyek.' }
            ];

            const milestonesList = document.getElementById('prjModalMilestonesList');
            if (milestonesList) {
                milestonesList.innerHTML = milestones.map(m => `
                    <div class="p-2.5 rounded-lg border ${m.done ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'} flex items-start gap-2.5">
                        <span class="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full ${m.done ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'} text-[11px] font-bold shrink-0">
                            ${m.done ? 'âœ“' : 'â€¢'}
                        </span>
                        <div>
                            <strong class="text-xs ${m.done ? 'text-emerald-900' : 'text-gray-700'} block">${m.name}</strong>
                            <span class="text-[11px] ${m.done ? 'text-emerald-700/80' : 'text-gray-500'}">${m.desc}</span>
                        </div>
                    </div>
                `).join('');
            }

            modal.classList.remove('hidden');
        }

        function closeProjectModal() {
            const modal = document.getElementById('projectDetailModal');
            if (modal) modal.classList.add('hidden');
        }

        // Bridge to maintain backwards compatibility
        function renderPrjTable() {
            updateProjectModule();
        }