/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * SPK Workflow Tracking Module (4-Stage Pipeline: OPEN, PROSES, OUTSTANDING, CLOSED)
 */
        // WORKFLOW SPK STATUS FUNCTIONS (INTERAKTIF KLIK KARTU WORKFLOW)
        // ============================================================================
        let currentWorkflowStatus = null; // null | 'OPEN' | 'PROSES' | 'OUTSTANDING' | 'CLOSED'
        let workflowSearchKeyword = '';

        const workflowStatusIndices = {
            open: new Set([0, 126]),
            proses: new Set([1, 2, 3, 4, 127, 128, 129, 130, 7, 8, 9, 10, 11, 12, 13, 14, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66]),
            outstanding: new Set([5, 133, 134, 135, 131, 132, 246, 247, 15, 16, 17, 18, 19, 20, 21, 22, 23, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82])
        };

        function getTicketWorkflowStatus(index) {
            if (workflowStatusIndices.open.has(index)) return 'OPEN';
            if (workflowStatusIndices.proses.has(index)) return 'PROSES';
            if (workflowStatusIndices.outstanding.has(index)) return 'OUTSTANDING';
            return 'CLOSED';
        }

        function getFilteredWorkflowTickets(status) {
            const branch = (document.getElementById('filterBranch'))?.value || 'ALL';
            const startDate = (document.getElementById('startDate') || document.getElementById('filterStartDate'))?.value || '';
            const endDate = (document.getElementById('endDate') || document.getElementById('filterEndDate'))?.value || '';
            const category = (document.getElementById('filterCategory'))?.value || 'ALL';
            const machineCode = (document.getElementById('filterMachineCode') || document.getElementById('filterMachine'))?.value || 'ALL';

            const machineMap = {};
            masterMachines.forEach(m => { machineMap[m.code] = m; });

            let list = [];
            for (let i = 0; i < dailyMaintenanceLogs.length; i++) {
                const log = dailyMaintenanceLogs[i];
                const ticketStatus = getTicketWorkflowStatus(i);
                if (status && ticketStatus !== status) continue;

                // Match filters
                if (branch !== 'ALL' && log.branch !== branch) continue;
                if (startDate && log.date < startDate) continue;
                if (endDate && log.date > endDate) continue;
                if (machineCode !== 'ALL' && log.code !== machineCode) continue;

                const machine = machineMap[log.code] || { unitName: log.code, category: 'General', branch: log.branch };
                if (category !== 'ALL' && machine.category !== category) continue;

                list.push({
                    ...log,
                    ticketStatus,
                    unitName: machine.unitName || log.code,
                    category: machine.category || 'General'
                });
            }

            if (workflowSearchKeyword) {
                const q = workflowSearchKeyword.toLowerCase();
                list = list.filter(item =>
                    (item.ticketCode && item.ticketCode.toLowerCase().includes(q)) ||
                    (item.code && item.code.toLowerCase().includes(q)) ||
                    (item.unitName && item.unitName.toLowerCase().includes(q)) ||
                    (item.branch && item.branch.toLowerCase().includes(q)) ||
                    (item.problem && item.problem.toLowerCase().includes(q)) ||
                    (item.sparepart && item.sparepart.toLowerCase().includes(q))
                );
            }

            return list;
        }

        function updateSpkWorkflowCardActions() {
            const container = document.getElementById('spkWorkflowDetailContainer');
            const isHidden = !container || container.classList.contains('hidden');

            const openTickets = getFilteredWorkflowTickets('OPEN').length;
            const inProgressTickets = getFilteredWorkflowTickets('PROSES').length;
            const waitingCloseTickets = getFilteredWorkflowTickets('OUTSTANDING').length;
            const closedTickets = getFilteredWorkflowTickets('CLOSED').length;

            const spkActionOpen = document.getElementById('spkAction_OPEN');
            const spkActionProg = document.getElementById('spkAction_PROSES');
            const spkActionWait = document.getElementById('spkAction_OUTSTANDING');
            const spkActionClose = document.getElementById('spkAction_CLOSED');

            if (spkActionOpen) {
                spkActionOpen.textContent = (!isHidden && currentWorkflowStatus === 'OPEN')
                    ? 'Tutup Rincian â–²'
                    : `Buka ${openTickets} Tiket Open â–¼`;
            }
            if (spkActionProg) {
                spkActionProg.textContent = (!isHidden && currentWorkflowStatus === 'PROSES')
                    ? 'Tutup Rincian â–²'
                    : `Buka ${inProgressTickets} Tiket Assignment â–¼`;
            }
            if (spkActionWait) {
                spkActionWait.textContent = (!isHidden && currentWorkflowStatus === 'OUTSTANDING')
                    ? 'Tutup Rincian â–²'
                    : `Buka ${waitingCloseTickets} Tiket Waiting to Close â–¼`;
            }
            if (spkActionClose) {
                spkActionClose.textContent = (!isHidden && currentWorkflowStatus === 'CLOSED')
                    ? 'Tutup Rincian â–²'
                    : `Buka ${closedTickets.toLocaleString('id-ID')} Tiket Closed â–¼`;
            }

            const cardSpkActionText = document.getElementById('cardSpkActionText');
            const cardSpkActionIcon = document.getElementById('cardSpkActionIcon');
            if (cardSpkActionText) {
                cardSpkActionText.textContent = isHidden ? 'Buka Detail Tabel SPK' : 'Tutup Detail Tabel SPK';
            }
            if (cardSpkActionIcon) {
                if (isHidden) cardSpkActionIcon.classList.remove('rotate-180');
                else cardSpkActionIcon.classList.add('rotate-180');
            }
        }

        function toggleWorkflowStatusDetail(status) {
            const container = document.getElementById('spkWorkflowDetailContainer');
            if (!container) return;

            if (currentWorkflowStatus === status && !container.classList.contains('hidden')) {
                closeWorkflowDetail();
                return;
            }

            currentWorkflowStatus = status;
            tablePaginationState.workflow.page = 1;
            container.classList.remove('hidden');

            // Reset active styles on all 4 cards
            ['OPEN', 'PROSES', 'OUTSTANDING', 'CLOSED'].forEach(s => {
                const card = document.getElementById(`spkWorkflowCard_${s}`);
                if (card) {
                    card.classList.remove('ring-4', 'ring-amber-500', 'ring-blue-600', 'ring-purple-600', 'ring-emerald-600', 'shadow-lg');
                }
            });

            // Apply active ring to selected card
            const activeCard = document.getElementById(`spkWorkflowCard_${status}`);
            const ringColors = {
                OPEN: ['ring-4', 'ring-amber-500', 'shadow-lg'],
                PROSES: ['ring-4', 'ring-blue-600', 'shadow-lg'],
                OUTSTANDING: ['ring-4', 'ring-purple-600', 'shadow-lg'],
                CLOSED: ['ring-4', 'ring-emerald-600', 'shadow-lg']
            };
            if (activeCard && ringColors[status]) {
                activeCard.classList.add(...ringColors[status]);
            }

            // Update badge, title, subtitle, banner
            const badgeEl = document.getElementById('workflowBadgeStatus');
            const titleEl = document.getElementById('workflowDetailTitle');
            const subtitleEl = document.getElementById('workflowDetailSubtitle');
            const bannerEl = document.getElementById('workflowTableBanner');

            const statusMeta = {
                OPEN: {
                    badgeClass: 'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300',
                    badgeText: '1. OPEN',
                    title: 'Rincian Tiket Status: 1. OPEN (Belum Dikerjakan)',
                    subtitle: 'Pekerjaan belum dikerjakan namun sudah ada SPK-nya.',
                    bannerClass: 'bg-amber-500 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR TIKET WORKFLOW: 1. OPEN (BELUM DIKERJAKAN / SUDAH ADA SPK)'
                },
                PROSES: {
                    badgeClass: 'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300',
                    badgeText: '2. ASSIGNMENT',
                    title: 'Rincian Tiket Status: 2. ASSIGNMENT (Penugasan & Sedang Berjalan)',
                    subtitle: 'Menentukan siapa yang mengerjakan project tersebut atau project itu sudah berjalan.',
                    bannerClass: 'bg-blue-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR TIKET WORKFLOW: 2. ASSIGNMENT (PENUGASAN & SEDANG BERJALAN)'
                },
                OUTSTANDING: {
                    badgeClass: 'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300',
                    badgeText: '3. WAITING TO CLOSE',
                    title: 'Rincian Tiket Status: 3. WAITING TO CLOSE (Menunggu Disetujui)',
                    subtitle: 'Pekerjaan sudah selesai namun menunggu disetujui (approval) sebelum ditutup.',
                    bannerClass: 'bg-purple-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR TIKET WORKFLOW: 3. WAITING TO CLOSE (PEKERJAAN SELESAI, MENUNGGU PERSETUJUAN)'
                },
                CLOSED: {
                    badgeClass: 'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300',
                    badgeText: '4. CLOSED',
                    title: 'Rincian Tiket Status: 4. CLOSED (Sudah Disetujui & Tuntas)',
                    subtitle: 'Pekerjaan sudah disetujui dan dinyatakan masuk ke closed secara tuntas.',
                    bannerClass: 'bg-emerald-600 text-white font-bold text-center py-2 px-4 rounded-t-lg text-xs sm:text-sm uppercase tracking-wide',
                    bannerText: 'DAFTAR TIKET WORKFLOW: 4. CLOSED (SUDAH DISETUJUI & TUNTAS)'
                }
            };

            const meta = statusMeta[status];
            if (meta) {
                if (badgeEl) { badgeEl.className = meta.badgeClass; badgeEl.textContent = meta.badgeText; }
                if (titleEl) titleEl.textContent = meta.title;
                if (subtitleEl) subtitleEl.textContent = meta.subtitle;
                if (bannerEl) { bannerEl.className = meta.bannerClass; bannerEl.textContent = meta.bannerText; }
            }

            renderWorkflowStatusTable();

            updateSpkWorkflowCardActions();

            setTimeout(() => {
                container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 60);
        }

        function closeWorkflowDetail() {
            const container = document.getElementById('spkWorkflowDetailContainer');
            if (container) container.classList.add('hidden');
            ['OPEN', 'PROSES', 'OUTSTANDING', 'CLOSED'].forEach(s => {
                const card = document.getElementById(`spkWorkflowCard_${s}`);
                if (card) card.classList.remove('ring-4', 'ring-amber-500', 'ring-blue-600', 'ring-purple-600', 'ring-emerald-600', 'shadow-lg');
            });
            currentWorkflowStatus = null;

            updateSpkWorkflowCardActions();
        }

        function handleWorkflowSearch(keyword) {
            workflowSearchKeyword = keyword;
            tablePaginationState.workflow.page = 1;
            renderWorkflowStatusTable();
        }

        function renderWorkflowStatusTable() {
            if (!currentWorkflowStatus) return;

            const tbody = document.getElementById('workflowTableBody');
            if (!tbody) return;

            const items = getFilteredWorkflowTickets(currentWorkflowStatus);
            const countEl = document.getElementById('workflowShowingCount');
            if (countEl) countEl.textContent = items.length;

            const { page, pageSize } = tablePaginationState.workflow;
            const totalPages = pageSize === Infinity ? 1 : Math.ceil(items.length / pageSize) || 1;
            const activePage = Math.min(Math.max(1, page), totalPages);
            tablePaginationState.workflow.page = activePage;

            const pagedItems = pageSize === Infinity
                ? items
                : items.slice((activePage - 1) * pageSize, activePage * pageSize);

            const baseIdx = pageSize === Infinity ? 0 : (activePage - 1) * pageSize;

            if (pagedItems.length === 0) {
                const labelStatus = currentWorkflowStatus === 'PROSES' ? 'ASSIGNMENT' : currentWorkflowStatus === 'OUTSTANDING' ? 'WAITING TO CLOSE' : currentWorkflowStatus;
                tbody.innerHTML = `<tr><td colspan="10" class="py-6 text-center text-gray-400">Tidak ada tiket ${labelStatus} pada filter yang dipilih.</td></tr>`;
                renderPaginationControls('workflow', 0, 1, 10);
                return;
            }

            const statusBadges = {
                OPEN: '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">1. OPEN</span>',
                PROSES: '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">2. ASSIGNMENT</span>',
                OUTSTANDING: '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">3. WAITING TO CLOSE</span>',
                CLOSED: '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">4. CLOSED</span>'
            };

            tbody.innerHTML = pagedItems.map((item, idx) => `
                <tr onclick="openMachineModal('${item.code}')" class="hover:bg-slate-50 cursor-pointer transition">
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center font-bold text-gray-500">${baseIdx + idx + 1}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 font-mono font-bold text-blue-700 whitespace-nowrap">${item.ticketCode || '-'}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center font-mono text-gray-600 whitespace-nowrap">${item.date}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center">${getBranchBadge(item.branch)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 whitespace-nowrap">
                        <span class="font-bold text-gray-800 block">${item.code}</span>
                        <span class="text-[11px] text-gray-500">${item.unitName}</span>
                    </td>
                    <td class="py-2.5 px-3 border-r border-gray-200">${getCategoryBadge(item.category)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-gray-800 text-xs max-w-xs">
                        <div class="line-clamp-2">${item.problem || '-'}</div>
                    </td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-gray-600 text-[11px] max-w-xs">
                        <div class="line-clamp-2">${item.sparepart && item.sparepart !== '-' ? item.sparepart : 'Pemeriksaan teknisi standar'}</div>
                    </td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-right font-mono font-semibold ${item.dtRepair > 0 ? 'text-red-600' : 'text-gray-400'} whitespace-nowrap">${item.dtRepair > 0 ? item.dtRepair.toFixed(1) + ' Jam' : '-'}</td>
                    <td class="py-2.5 px-3 text-center whitespace-nowrap">${statusBadges[item.ticketStatus] || item.ticketStatus}</td>
                </tr>
            `).join('');

            renderPaginationControls('workflow', items.length, activePage, pageSize);
        }
