/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Main Application Controller (State, Calculations, Filter Orchestration, Renderers)
 */
        // ============================================================================
        // 2. STATE MANAGEMENT
        // ============================================================================
        let currentAggregatedList = [];
        let currentTotals = {};
        const tablePaginationState = {
            dt: { page: 1, pageSize: 10 },
            cost: { page: 1, pageSize: 10 },
            spk: { page: 1, pageSize: 10 },
            workflow: { page: 1, pageSize: 10 },
            prj: { page: 1, pageSize: 10 }
        };

        // ============================================================================
        // 3. UTILITY & FORMATTING HELPERS
        // ============================================================================
        function formatIDR(num) {
            return 'Rp ' + Math.round(num || 0).toLocaleString('id-ID');
        }

        function formatDateIndo(dateStr) {
            if (!dateStr) return '-';
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr;
            const months = [
                'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
            ];
            const day = parts[2];
            const mIdx = parseInt(parts[1], 10) - 1;
            const year = parts[0];
            return `${day} ${months[mIdx] || ''} ${year}`;
        }

        function getBranchBadge(branch) {
            const styles = {
                'MMM': 'bg-blue-100 text-blue-800 border-blue-300',
                'MMN': 'bg-emerald-100 text-emerald-800 border-emerald-300',
                'MMS': 'bg-amber-100 text-amber-800 border-amber-300',
                'MMG': 'bg-purple-100 text-purple-800 border-purple-300'
            };
            const cls = styles[branch] || 'bg-gray-100 text-gray-700 border-gray-300';
            return `<span class="px-1.5 py-0.5 text-[10px] font-bold rounded border ${cls}">${branch || '-'}</span>`;
        }

        function getCategoryBadge(category) {
            const styles = {
                'Injection': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                'Printing': 'bg-purple-50 text-purple-700 border-purple-200',
                'Utility': 'bg-amber-50 text-amber-800 border-amber-200',
                'Robot': 'bg-rose-50 text-rose-700 border-rose-200',
                'Auxiliary': 'bg-cyan-50 text-cyan-700 border-cyan-200',
                'Lain-lain': 'bg-teal-50 text-teal-700 border-teal-200'
            };
            const cls = styles[category] || 'bg-gray-100 text-gray-700 border-gray-200';
            return `<span class="px-2 py-0.5 text-[11px] font-semibold rounded border ${cls}">${category}</span>`;
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toastBox');
            const icon = document.getElementById('toastIcon');
            const msg = document.getElementById('toastMessage');

            msg.textContent = message;
            icon.textContent = isError ? '⚠' : '✓';
            icon.className = isError ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold';

            toast.classList.remove('hidden');
            clearTimeout(window.toastTimer);
            window.toastTimer = setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }

        function clearActivePreset() {
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.classList.remove('bg-white', 'text-blue-700', 'font-bold', 'shadow-xs', 'border', 'border-gray-200/80');
                btn.classList.add('text-gray-600', 'font-medium');
            });
        }

        function setPeriodPreset(type) {
            clearActivePreset();
            let start = '2026-11-01';
            let end = '2026-11-10';
            let label = 'Bulanan (01 - 10 Nov 2026)';

            if (type === 'daily') {
                start = '2026-11-10';
                end = '2026-11-10';
                label = 'Harian (10 Nov 2026)';
            } else if (type === 'weekly') {
                start = '2026-11-03';
                end = '2026-11-10';
                label = 'Mingguan (7 Hari Terakhir: 03 - 10 Nov 2026)';
            } else if (type === 'monthly') {
                start = '2026-11-01';
                end = '2026-11-10';
                label = 'Bulanan MtD (01 - 10 Nov 2026)';
            } else if (type === 'yearly') {
                start = '2026-01-01';
                end = '2026-11-10';
                label = 'Tahunan YtD (Tahun 2026)';
            }

            if (document.getElementById('startDate')) document.getElementById('startDate').value = start;
            if (document.getElementById('endDate')) document.getElementById('endDate').value = end;

            tablePaginationState.dt = { page: 1, pageSize: 10 };
            tablePaginationState.cost = { page: 1, pageSize: 10 };
            tablePaginationState.spk = { page: 1, pageSize: 10 };
            if (document.getElementById('pageSizeDt')) document.getElementById('pageSizeDt').value = '10';
            if (document.getElementById('pageSizeCost')) document.getElementById('pageSizeCost').value = '10';
            if (document.getElementById('pageSizeSpk')) document.getElementById('pageSizeSpk').value = '10';

            const activeBtn = document.getElementById(`preset-${type}`);
            if (activeBtn) {
                activeBtn.classList.remove('text-gray-600', 'font-medium');
                activeBtn.classList.add('bg-white', 'text-blue-700', 'font-bold', 'shadow-xs', 'border', 'border-gray-200/80');
            }

            applyFilters();
            showToast(`Pintasan periode: ${label}`);
        }

        function setDatePreset(start, end, label) {
            document.getElementById('startDate').value = start;
            document.getElementById('endDate').value = end;

            tablePaginationState.dt = { page: 1, pageSize: 10 };
            tablePaginationState.cost = { page: 1, pageSize: 10 };
            tablePaginationState.spk = { page: 1, pageSize: 10 };
            if (document.getElementById('pageSizeDt')) document.getElementById('pageSizeDt').value = '10';
            if (document.getElementById('pageSizeCost')) document.getElementById('pageSizeCost').value = '10';
            if (document.getElementById('pageSizeSpk')) document.getElementById('pageSizeSpk').value = '10';

            clearActivePreset();
            applyFilters();
            showToast(`Menampilkan periode ${label}`);
        }
        function setCategoryPill(cat) {
            const input = document.getElementById('filterCategory');
            if (input) input.value = cat;

            document.querySelectorAll('.cat-pill').forEach(btn => {
                btn.classList.remove('bg-[#d92546]', 'text-white', 'font-bold', 'shadow-xs');
                btn.classList.add('text-gray-600', 'font-medium', 'hover:text-gray-900');
            });

            const active = document.getElementById(`catPill-${cat}`);
            if (active) {
                active.classList.remove('text-gray-600', 'font-medium', 'hover:text-gray-900');
                active.classList.add('bg-[#d92546]', 'text-white', 'font-bold', 'shadow-xs');
            }

            updateMachineDropdown();
            applyFilters();
            showToast(`Filter kategori: ${cat === 'ALL' ? 'Semua Kategori' : cat}`);
        }

        function updateMachineDropdown() {
            const branchEl = document.getElementById('filterBranch');
            const selectedBranch = branchEl ? branchEl.value : 'ALL';
            const catEl = document.getElementById('filterCategory');
            const selectedCat = catEl ? catEl.value : 'ALL';
            const machineSelect = document.getElementById('filterMachineCode');
            if (!machineSelect) return;
            const currentVal = machineSelect.value;

            const filteredMachines = masterMachines.filter(m => {
                const matchBranch = (selectedBranch === 'ALL') || (m.branch === selectedBranch);
                const matchCategory = (selectedCat === 'ALL') ||
                    (m.category === selectedCat) ||
                    (selectedCat === 'Blowing' && (m.category === 'Blowing' || (m.unitName && m.unitName.includes('AOKI')) || (m.code && m.code.includes('AOKI'))));
                return matchBranch && matchCategory;
            });

            machineSelect.innerHTML = `<option value="ALL">Semua Unit Mesin (${filteredMachines.length} Unit)</option>` +
                filteredMachines.map(m => `<option value="${m.code}">[${m.branch}] ${m.code} — ${m.unitName}</option>`).join('');

            if (filteredMachines.some(m => m.code === currentVal)) {
                machineSelect.value = currentVal;
            } else {
                machineSelect.value = 'ALL';
            }
        }

        // ============================================================================
        // 4. AGGREGATION & BUSINESS CALCULATION ENGINE
        // ============================================================================
        // Helper: Pemisahan tegas data DT murni (kerusakan/error/unconditional) vs PM/Perawatan Regular
        function isPmLog(log) {
            if (!log) return false;
            if (log.spkPm === 1 && log.spkDt === 0) return true;
            const p = (log.problem || '').toUpperCase();
            if (p.includes('PERAWATAN REGULAR') || p.includes('PERAWATAN RUTIN') || p.includes('MAINTENANCE REGULAR')) {
                return true;
            }
            return false;
        }

        function isActualDtLog(log) {
            if (!log) return false;
            if (isPmLog(log)) return false;
            // Harus ada jam downtime nyata atau tiket perbaikan/error mesin nyata (bukan rutinitas PM)
            if ((log.dtRepair || 0) > 0) return true;
            if (log.spkDt === 1 && log.problem && log.problem !== '-' && !isPmLog(log)) return true;
            return false;
        }

        function computeAggregates(startDate, endDate, branch, category, machineCode, keyword) {
            const targetMachines = masterMachines.filter(m => {
                const matchBranch = (branch === 'ALL') || (m.branch === branch);
                const matchCategory = (category === 'ALL') ||
                    (m.category === category) ||
                    (category === 'Blowing' && (m.category === 'Blowing' || (m.unitName && m.unitName.includes('AOKI')) || (m.code && m.code.includes('AOKI'))));
                const matchCode = (machineCode === 'ALL') || (m.code === machineCode);
                return matchBranch && matchCategory && matchCode;
            });

            let aggregated = targetMachines.map(machine => {
                const logs = dailyMaintenanceLogs.filter(log =>
                    log.code === machine.code &&
                    (!startDate || log.date >= startDate) &&
                    (!endDate || log.date <= endDate)
                );

                const dtRepair = logs.reduce((sum, l) => sum + (l.dtRepair || 0), 0);
                const dtPm = logs.reduce((sum, l) => sum + (l.pmRegular || 0) + (l.pmDaily || 0), 0);
                const totalHours = dtRepair + dtPm;

                const costDt = logs.reduce((sum, l) => sum + (l.costDt || 0), 0);
                const costPm = logs.reduce((sum, l) => sum + (l.costPm || 0), 0);
                const totalCost = costDt + costPm;

                const spkDt = logs.reduce((sum, l) => sum + (l.spkDt || 0), 0);
                const spkPm = logs.reduce((sum, l) => sum + (l.spkPm || 0), 0);
                const totalSpk = spkDt + spkPm;

                // Problem summary khusus kerusakan riil (mengabaikan perawatan regular)
                const uniqueProblems = [...new Set(logs.filter(l => l.problem && l.problem !== '-' && !isPmLog(l)).map(l => `[${l.date.slice(8, 10)}/${l.date.slice(5, 7)}] ${l.problem}`))];
                const problemSummary = uniqueProblems.length > 0
                    ? uniqueProblems.slice(0, 3).join('; ') + (uniqueProblems.length > 3 ? ` (+${uniqueProblems.length - 3} lainnya)` : '')
                    : 'Tidak ada catatan kerusakan pada periode ini';

                const uniqueParts = [...new Set(logs.filter(l => l.sparepart && l.sparepart !== '-').map(l => l.sparepart))];
                const sparepartSummary = uniqueParts.length > 0
                    ? uniqueParts.slice(0, 3).join('; ') + (uniqueParts.length > 3 ? ` (+${uniqueParts.length - 3} lainnya)` : '')
                    : '-';

                return {
                    ...machine,
                    logs,
                    dtRepair,
                    dtPm,
                    totalHours,
                    costDt,
                    costPm,
                    totalCost,
                    spkDt,
                    spkPm,
                    totalSpk,
                    problemSummary,
                    sparepartSummary
                };
            });

            if (keyword) {
                const q = keyword.toLowerCase();
                aggregated = aggregated.filter(item =>
                    item.code.toLowerCase().includes(q) ||
                    item.unitName.toLowerCase().includes(q) ||
                    item.branch.toLowerCase().includes(q) ||
                    item.problemSummary.toLowerCase().includes(q) ||
                    item.sparepartSummary.toLowerCase().includes(q)
                );
            }

            const totals = {
                dtRepair: aggregated.reduce((s, i) => s + i.dtRepair, 0),
                dtPm: aggregated.reduce((s, i) => s + i.dtPm, 0),
                costDt: aggregated.reduce((s, i) => s + i.costDt, 0),
                costPm: aggregated.reduce((s, i) => s + i.costPm, 0),
                spkDt: aggregated.reduce((s, i) => s + i.spkDt, 0),
                spkPm: aggregated.reduce((s, i) => s + i.spkPm, 0),
            };
            totals.totalHours = totals.dtRepair + totals.dtPm;
            totals.totalCost = totals.costDt + totals.costPm;
            totals.totalSpk = totals.spkDt + totals.spkPm;

            return { aggregated, totals };
        }

        // ============================================================================
        // 5. VIEW RENDERERS
        // ============================================================================
        function renderEmptyRow(colSpan, message) {
            return `<tr><td colspan="${colSpan}" class="py-4 text-center text-gray-500">${message}</td></tr>`;
        }

        function renderKpiCards(totals) {
            const dtEl = document.getElementById('kpiDtRepair');
            if (dtEl) dtEl.textContent = `${totals.dtRepair.toFixed(1)} Jam`;


            const dtSub = document.getElementById('kpiDtSubtitle');
            if (dtSub) {
                const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
                const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';
                const branch = document.getElementById('filterBranch') ? document.getElementById('filterBranch').value : 'ALL';
                const pureDtTickets = dailyMaintenanceLogs.filter(l => {
                    const matchBranch = (branch === 'ALL') || (l.branch === branch);
                    const matchDate = (!startDate || l.date >= startDate) && (!endDate || l.date <= endDate);
                    return matchBranch && matchDate && isActualDtLog(l);
                }).length;
                dtSub.textContent = `${pureDtTickets} Tiket Kerusakan & Gangguan Unconditional`;
            }

            const costEl = document.getElementById('kpiTotalCost');
            if (costEl) costEl.textContent = formatIDR(totals.totalCost);

            const spkEl = document.getElementById('kpiTotalSpk');
            if (spkEl) spkEl.textContent = `${totals.totalSpk} SPK`;

            const branchEl = document.getElementById('filterBranch');
            const selectedBranch = branchEl ? branchEl.value : 'ALL';
            let branchProjects = maintenanceProjectsList;
            if (selectedBranch !== 'ALL') {
                branchProjects = branchProjects.filter(p => p.branch === selectedBranch);
            }
            const prjEl = document.getElementById('kpiTotalPrj');
            if (prjEl) prjEl.textContent = `${branchProjects.length} Project`;
            const prjSub = document.getElementById('kpiPrjSubtitle');
            if (prjSub) {
                const doneCount = branchProjects.filter(p => p.status === 'SELESAI').length;
                const progCount = branchProjects.filter(p => p.status === 'PROSES').length;
                const outCount = branchProjects.filter(p => p.status === 'OUTSTANDING').length;
                prjSub.textContent = selectedBranch === 'ALL'
                    ? `${doneCount} Closed • ${progCount} Assignment • ${outCount} Waiting`
                    : `Proyek Cabang ${selectedBranch}: ${branchProjects.length} Terdaftar • ${doneCount} Closed`;
            }
            const isPrjOpen = !document.getElementById('prjWorkflowDetailContainer')?.classList.contains('hidden');
            const cardPrjActionText = document.getElementById('cardPrjActionText');
            const cardPrjActionIcon = document.getElementById('cardPrjActionIcon');
            if (cardPrjActionText) {
                cardPrjActionText.textContent = isPrjOpen
                    ? `Tutup Rincian ${branchProjects.length} Project`
                    : `Buka Rincian ${branchProjects.length} Project`;
            }
            if (cardPrjActionIcon) {
                if (isPrjOpen) cardPrjActionIcon.classList.add('rotate-180');
                else cardPrjActionIcon.classList.remove('rotate-180');
            }
        }

        // ============================================================================
        // 5.1 EXECUTIVE MODULAR DASHBOARD CONTROLLER (DT, BIAYA, SPK, PROJECT)
        // ============================================================================
        let currentActiveDashboardTab = 'dt'; // 'dt', 'cost', 'spk', 'prj'

        // FUNGSI GANTI FOKUS MODUL (TAB DASHBOARD EKSEKUTIF)
        function switchDashboardTab(tabId) {
            currentActiveDashboardTab = tabId;
            const tabs = ['dt', 'cost', 'spk', 'prj'];

            tabs.forEach(t => {
                const card = document.getElementById(`kpiCard_${t}`);
                const badge = document.getElementById(`kpiBadge_${t}`);
                const panel = document.getElementById(`panelView_${t}`);

                if (t === tabId) {
                    if (card) {
                        card.classList.remove('border-gray-200');
                        card.classList.add('border-2', 'shadow-md', 'ring-2');
                        if (t === 'dt') card.classList.add('border-red-500', 'ring-red-100');
                        if (t === 'cost') card.classList.add('border-amber-500', 'ring-amber-100');
                        if (t === 'spk') card.classList.add('border-blue-500', 'ring-blue-100');
                        if (t === 'prj') card.classList.add('border-indigo-500', 'ring-indigo-100');
                        if (t === 'kpi') card.classList.add('border-teal-500', 'ring-teal-100');
                    }
                    if (badge) badge.classList.remove('hidden');
                    if (panel) panel.classList.remove('hidden');
                } else {
                    if (card) {
                        card.classList.remove(
                            'border-2', 'shadow-md', 'ring-2',
                            'border-red-500', 'ring-red-100',
                            'border-amber-500', 'ring-amber-100',
                            'border-blue-500', 'ring-blue-100',
                            'border-indigo-500', 'ring-indigo-100',
                            'border-teal-500', 'ring-teal-100'
                        );
                        card.classList.add('border-gray-200');
                    }
                    if (badge) badge.classList.add('hidden');
                    if (panel) panel.classList.add('hidden');
                }
            });

            // Sinkronisasi posisi / visibility Machine Status (tampil di bawah grafik pada tab DT)
            const secMachine = document.getElementById('sectionMachineStatus');
            if (secMachine) {
                if (tabId === 'dt') {
                    secMachine.classList.remove('hidden');
                } else {
                    secMachine.classList.add('hidden');
                }
            }

            if (tabId === 'dt') {
                if (typeof renderDtTrendLineChart === 'function') renderDtTrendLineChart();
            }
            if (tabId === 'cost') {
                setTimeout(() => {
                    if (typeof renderDailyCostTrendChart === 'function') renderDailyCostTrendChart();
                }, 40);
            }
            if (tabId === 'spk') {
                closeWorkflowDetail();
            }
            if (tabId === 'prj') {
                closePrjWorkflowDetail();
                renderPrjTable();
            }
        }

        // ============================================================================
        // 5.1.B SILENT AUTO-CYCLE CONTROLLER (ROTATION EVERY 6 SECONDS ON IDLE)
        // ============================================================================
        const KIOSK_SETTINGS = {
            tabs: ['dt', 'cost', 'spk', 'prj'],
            cycleIntervalMs: 6000,   // Berpindah setiap 6 detik
            idleResumeMs: 10000      // Jika kursor diam selama 10 detik, auto-slide lanjut lagi
        };

        let isKioskEnabled = false;          // Status auto-cycle (dimatikan sesuai instruksi user)
        let isKioskUserInteracting = false;   // Sedang dijeda karena user sedang gerak mouse/klik
        let kioskIdleTimer = null;           // Timer deteksi kursor diam untuk resume
        let kioskCycleTimer = null;          // Timer pergantian tab setiap 6 detik

        function initKioskAutoCycle() {
            setupKioskEventListeners();
            // startKioskCycle(); // Dinonaktifkan: tidak auto-slide otomatis
        }

        function startKioskCycle() {
            if (!isKioskEnabled) return;
            stopKioskCycle();

            kioskCycleTimer = setInterval(() => {
                advanceKioskTab();
            }, KIOSK_SETTINGS.cycleIntervalMs);
        }

        function advanceKioskTab() {
            const currentIndex = KIOSK_SETTINGS.tabs.indexOf(currentActiveDashboardTab);
            const nextIndex = (currentIndex + 1) % KIOSK_SETTINGS.tabs.length;
            const nextTab = KIOSK_SETTINGS.tabs[nextIndex];
            switchDashboardTab(nextTab);
        }

        function stopKioskCycle() {
            if (kioskCycleTimer) {
                clearInterval(kioskCycleTimer);
                kioskCycleTimer = null;
            }
        }

        function pauseKioskOnInteraction() {
            if (!isKioskEnabled) return;

            // Hentikan timer putaran otomatis
            stopKioskCycle();
            isKioskUserInteracting = true;

            // Reset timer idle resume
            if (kioskIdleTimer) clearTimeout(kioskIdleTimer);

            // Bila kursor diam / tidak ada interaksi selama 10 detik, lanjutkan kembali
            kioskIdleTimer = setTimeout(() => {
                isKioskUserInteracting = false;
                if (isKioskEnabled) {
                    startKioskCycle();
                }
            }, KIOSK_SETTINGS.idleResumeMs);
        }

        function toggleKioskAutoCycle(forceState) {
            if (typeof forceState === 'boolean') {
                isKioskEnabled = forceState;
            } else {
                isKioskEnabled = !isKioskEnabled;
            }

            if (!isKioskEnabled) {
                stopKioskCycle();
                if (kioskIdleTimer) clearTimeout(kioskIdleTimer);
            } else {
                isKioskUserInteracting = false;
                startKioskCycle();
            }
        }

        function setupKioskEventListeners() {
            // Pantau pergerakan mouse, klik, scroll, dan sentuhan
            const events = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'];
            events.forEach(evt => {
                window.addEventListener(evt, () => {
                    if (isKioskEnabled) {
                        pauseKioskOnInteraction();
                    }
                }, { passive: true });
            });
        }

        // FUNGSI TOGGLE DETAIL TABEL (COLLAPSIBLE / ACCORDION)
        function toggleDetailTable(type) {
            if (type === 'prj') {
                const container = document.getElementById('prjWorkflowDetailContainer');
                if (container && !container.classList.contains('hidden')) {
                    closePrjWorkflowDetail();
                } else {
                    switchDashboardTab('prj');
                    toggleProjectStatusDetail('ALL');
                }
                return;
            }
            if (type === 'spk') {
                const container = document.getElementById('spkWorkflowDetailContainer');
                if (container && !container.classList.contains('hidden')) {
                    closeWorkflowDetail();
                } else {
                    switchDashboardTab('spk');
                    toggleWorkflowStatusDetail('OPEN');
                }
                return;
            }
            const containerId = `${type}DetailContainer`;
            const container = document.getElementById(containerId);
            const btnText = document.getElementById(`btnToggle${capitalize(type)}Text`);
            const cardText = document.getElementById(`card${capitalize(type)}ActionText`);
            const cardIcon = document.getElementById(`card${capitalize(type)}ActionIcon`);
            if (!container) return;

            const isHidden = container.classList.contains('hidden');
            if (isHidden) {
                container.classList.remove('hidden');
                const titleMap = { dt: 'Detail Tabel DT', cost: 'Detail Biaya', spk: 'Detail Tabel SPK', prj: 'Rincian Project' };
                if (btnText) btnText.textContent = `Tutup ${titleMap[type] || 'Detail'} ▲`;
                if (cardText) cardText.textContent = `Tutup ${titleMap[type] || 'Detail'}`;
                if (cardIcon) cardIcon.classList.add('rotate-180');
                setTimeout(() => {
                    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 80);
            } else {
                container.classList.add('hidden');
                const titleMap = { dt: 'Detail Tabel DT', cost: 'Detail Biaya', spk: 'Detail Tabel SPK', prj: 'Rincian Project' };
                if (btnText) btnText.textContent = `Buka ${titleMap[type] || 'Detail'} ▼`;
                if (cardText) cardText.textContent = `Buka ${titleMap[type] || 'Detail'}`;
                if (cardIcon) cardIcon.classList.remove('rotate-180');
            }
        }

        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        // ============================================================================
        // KATEGORI PROBLEM DOWNTIME & DRILLDOWN BREAKDOWN (GAYA RESMI DASHBOARD MMM)
        // ============================================================================
        const PROBLEM_CATEGORIES = {
            mechanical: {
                key: 'mechanical',
                name: 'Mekanikal & Hidrolik',
                short: 'Mekanikal',
                keywords: ['tiebar', 'hidrolik', 'valve', 'selang', 'platen', 'oli', 'cylinder', 'baut', 'leak', 'bocor', 'seal', 'pompa', 'press', 'mechanical', 'bearing', 'rantai', 'gear'],
                color: '#0284c7'
            },
            barrel_heater: {
                key: 'barrel_heater',
                name: 'Barel, Nozzle & Heater Suhu',
                short: 'Barel & Suhu',
                keywords: ['barel', 'barrel', 'nozzle', 'heater', 'suhu', 'termokopel', 'overheat', 'tc', 'pemanas', 'hopper', 'dryer', 'band heater'],
                color: '#ea580c'
            },
            electrical_servo: {
                key: 'electrical_servo',
                name: 'Elektrikal, Inverter & Servo Drive',
                short: 'Elektrikal & Servo',
                keywords: ['servo', 'inverter', 'plc', 'kabel', 'trip', 'motor', 'mcb', 'listrik', 'fuse', 'kontaktor', 'power', 'grounding', 'fasa', 'drive', 'alarm'],
                color: '#9333ea'
            },
            utility: {
                key: 'utility',
                name: 'Utility (Chiller & Kompresor)',
                short: 'Utility & Chiller',
                keywords: ['chiller', 'kompresor', 'freon', 'angin', 'cooling', 'water', 'pipa', 'evaporator', 'kondensor', 'fan', 'utility'],
                color: '#0d9488'
            },
            sensor_other: {
                key: 'sensor_other',
                name: 'Sensor, Mould & Lainnya',
                short: 'Sensor / Mould',
                keywords: ['sensor', 'mould', 'matras', 'cetakan', 'robot', 'ejector', 'lampu', 'andon', 'limit switch', 'core', 'air blow'],
                color: '#64748b'
            }
        };

        function classifyProblem(problemText) {
            if (!problemText) return PROBLEM_CATEGORIES.sensor_other;
            const p = problemText.toLowerCase();
            for (const catKey of ['barrel_heater', 'electrical_servo', 'utility', 'mechanical']) {
                const cat = PROBLEM_CATEGORIES[catKey];
                for (const kw of cat.keywords) {
                    if (p.includes(kw)) return cat;
                }
            }
            return PROBLEM_CATEGORIES.sensor_other;
        }

        let activeBreakdownData = {
            title: '',
            hours: 0,
            allLogs: [],
            filteredLogs: []
        };

        function openMachineBreakdownModal(machineCode) {
            const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
            const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';
            const machine = masterMachines.find(m => m.code === machineCode) || { code: machineCode, unitName: 'Unit Mesin' };

            // Ambil hanya tiket kerusakan nyata/unconditional (Abaikan PM / Perawatan Regular)
            const logs = dailyMaintenanceLogs.filter(l =>
                l.code === machineCode &&
                (!startDate || l.date >= startDate) &&
                (!endDate || l.date <= endDate) &&
                isActualDtLog(l)
            );

            // Urutkan dari jam downtime terbesar ke terkecil
            logs.sort((a, b) => (b.dtRepair || 0) - (a.dtRepair || 0));

            const totalDt = logs.reduce((sum, l) => sum + (l.dtRepair || 0), 0);
            activeBreakdownData = {
                title: `Mesin ${machine.code} — ${machine.unitName || ''}`,
                hours: totalDt,
                isCostMode: false,
                isSpkMode: false,
                allLogs: logs,
                filteredLogs: logs
            };

            showDtBreakdownModal();
        }

        function openCategoryBreakdownModal(catKey) {
            const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
            const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';
            const branch = document.getElementById('filterBranch') ? document.getElementById('filterBranch').value : 'ALL';
            const cat = PROBLEM_CATEGORIES[catKey] || PROBLEM_CATEGORIES.sensor_other;

            // Ambil hanya tiket kerusakan nyata/unconditional (Abaikan PM / Perawatan Regular)
            const logs = dailyMaintenanceLogs.filter(l => {
                if (!isActualDtLog(l)) return false;
                const matchBranch = (branch === 'ALL') || (l.branch === branch);
                const matchDate = (!startDate || l.date >= startDate) && (!endDate || l.date <= endDate);
                const matchCat = classifyProblem(l.problem).key === catKey;
                return matchBranch && matchDate && matchCat;
            });

            // Urutkan dari jam downtime terbesar ke terkecil
            logs.sort((a, b) => (b.dtRepair || 0) - (a.dtRepair || 0));

            const totalDt = logs.reduce((sum, l) => sum + (l.dtRepair || 0), 0);
            activeBreakdownData = {
                title: `Kategori: ${cat.name}`,
                hours: totalDt,
                isCostMode: false,
                isSpkMode: false,
                allLogs: logs,
                filteredLogs: logs
            };

            showDtBreakdownModal();
        }

        function openPlantCostBreakdown(branch) {
            const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
            const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';
            const branchNameMap = { MMM: 'Sidoarjo', MMN: 'Nganjuk', MMS: 'Serang', MMG: 'Malang' };

            const logs = dailyMaintenanceLogs.filter(l =>
                l.branch === branch &&
                (!startDate || l.date >= startDate) &&
                (!endDate || l.date <= endDate) &&
                ((l.costDt || 0) > 0 || (l.costPm || 0) > 0)
            );
            logs.sort((a, b) => ((b.costDt || 0) + (b.costPm || 0)) - ((a.costDt || 0) + (a.costPm || 0)));
            const totalCost = logs.reduce((sum, l) => sum + (l.costDt || 0) + (l.costPm || 0), 0);

            activeBreakdownData = {
                title: `Rincian Biaya: [${branch}] ${branchNameMap[branch] || ''}`,
                hours: totalCost,
                isCostMode: true,
                isSpkMode: false,
                allLogs: logs,
                filteredLogs: logs
            };

            const subtitleEl = document.getElementById('dtBreakdownModalSubtitle');
            if (subtitleEl) subtitleEl.textContent = `Rincian tiket pengeluaran biaya perbaikan & pembelian sparepart cabang ${branch}`;

            showDtBreakdownModal();
        }

        function openPlantSpkBreakdown(branch) {
            const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
            const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';
            const branchNameMap = { MMM: 'Sidoarjo', MMN: 'Nganjuk', MMS: 'Serang', MMG: 'Malang' };

            const logs = dailyMaintenanceLogs.filter(l =>
                l.branch === branch &&
                (!startDate || l.date >= startDate) &&
                (!endDate || l.date <= endDate)
            );
            logs.sort((a, b) => (b.date > a.date ? 1 : -1));

            activeBreakdownData = {
                title: `Daftar Tiket SPK: [${branch}] ${branchNameMap[branch] || ''}`,
                hours: logs.length,
                isCostMode: false,
                isSpkMode: true,
                allLogs: logs,
                filteredLogs: logs
            };

            const subtitleEl = document.getElementById('dtBreakdownModalSubtitle');
            if (subtitleEl) subtitleEl.textContent = `Daftar seluruh tiket SPK maintenance yang terbit di cabang ${branch}`;

            showDtBreakdownModal();
        }

        function showDtBreakdownModal() {
            const modal = document.getElementById('dtBreakdownModal');
            if (!modal) return;

            const titleEl = document.getElementById('dtBreakdownModalTitle');
            const badgeEl = document.getElementById('dtBreakdownModalHoursBadge');
            const searchInput = document.getElementById('dtBreakdownSearchInput');

            if (titleEl) titleEl.textContent = activeBreakdownData.title;
            if (badgeEl) {
                if (activeBreakdownData.isCostMode) {
                    badgeEl.textContent = `Total Biaya: ${formatIDR(activeBreakdownData.hours)}`;
                } else if (activeBreakdownData.isSpkMode) {
                    badgeEl.textContent = `Total: ${activeBreakdownData.hours} SPK`;
                } else {
                    badgeEl.textContent = `Total DT: ${activeBreakdownData.hours.toFixed(1)} Jam`;
                }
            }
            if (searchInput) searchInput.value = '';

            renderDtBreakdownTable();
            modal.classList.remove('hidden');
        }

        function renderDtBreakdownTable() {
            const tbody = document.getElementById('dtBreakdownTableBody');
            const countEl = document.getElementById('dtBreakdownItemCount');
            const summaryText = document.getElementById('dtBreakdownSummaryText');
            const colHeader = document.getElementById('dtBreakdownColHeader');
            if (!tbody) return;

            const isCost = activeBreakdownData.isCostMode;
            const isSpk = activeBreakdownData.isSpkMode;

            if (colHeader) {
                if (isCost) colHeader.textContent = 'Biaya (IDR)';
                else if (isSpk) colHeader.textContent = 'Durasi / Jam';
                else colHeader.textContent = 'Downtime (Jam)';
            }

            const logs = activeBreakdownData.filteredLogs;
            if (countEl) countEl.textContent = `1-${Math.min(logs.length, 10)} of ${logs.length} Items`;
            if (summaryText) {
                if (isCost) summaryText.textContent = `Menampilkan ${logs.length} tiket SPK pengeluaran biaya perbaikan & pemeliharaan`;
                else if (isSpk) summaryText.textContent = `Menampilkan ${logs.length} tiket SPK pada periode aktif`;
                else summaryText.textContent = `Menampilkan ${logs.length} tiket SPK kerusakan riil pada periode aktif (Murni DT, Tanpa PM)`;
            }

            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="py-8 text-center text-gray-400 italic">Tidak ada tiket yang cocok dengan pencarian.</td></tr>';
                return;
            }

            const totalBasis = activeBreakdownData.hours || 1;
            tbody.innerHTML = logs.map((log, idx) => {
                const dt = log.dtRepair || 0;
                const cost = (log.costDt || 0) + (log.costPm || 0);
                const metricVal = isCost ? cost : dt;
                const pct = totalBasis > 0 ? ((metricVal / totalBasis) * 100).toFixed(1) : '0.0';
                const formattedDate = log.date ? `${log.date.slice(8, 10)}/${log.date.slice(5, 7)}/${log.date.slice(0, 4)}` : '-';

                let colValHtml = `<span class="font-bold text-red-600 whitespace-nowrap">${dt.toFixed(1)} Jam</span>`;
                if (isCost) {
                    colValHtml = `<span class="font-bold text-amber-700 whitespace-nowrap">${formatIDR(cost)}</span>`;
                } else if (isSpk) {
                    colValHtml = `<span class="font-bold text-blue-700 whitespace-nowrap">${dt > 0 ? dt.toFixed(1) + ' Jam' : '0.0 Jam'}</span>`;
                }

                return `
                    <tr class="hover:bg-blue-50/50 transition border-b border-gray-100">
                        <td class="py-2.5 pl-5 pr-3 text-center font-bold text-gray-500">${idx + 1}</td>
                        <td class="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">${log.ticketCode || '-'}</td>
                        <td class="py-2.5 px-2.5 text-center text-gray-600 whitespace-nowrap">${formattedDate}</td>
                        <td class="py-2.5 px-3 font-semibold text-gray-800 whitespace-nowrap">${log.code}</td>
                        <td class="py-2.5 px-3 text-gray-800">${log.problem || '-'}</td>
                        <td class="py-2.5 px-3 text-gray-600 text-[11px]">${log.sparepart || '-'}</td>
                        <td class="py-2.5 px-3 text-right">${colValHtml}</td>
                        <td class="py-2.5 pl-3 pr-5 text-right font-semibold text-gray-600 whitespace-nowrap">${pct}%</td>
                    </tr>
                `;
            }).join('');
        }

        function filterDtBreakdownTable(keyword) {
            const kw = (keyword || '').toLowerCase().trim();
            if (!kw) {
                activeBreakdownData.filteredLogs = activeBreakdownData.allLogs;
            } else {
                activeBreakdownData.filteredLogs = activeBreakdownData.allLogs.filter(l =>
                    (l.ticketCode && l.ticketCode.toLowerCase().includes(kw)) ||
                    (l.problem && l.problem.toLowerCase().includes(kw)) ||
                    (l.sparepart && l.sparepart.toLowerCase().includes(kw)) ||
                    (l.code && l.code.toLowerCase().includes(kw)) ||
                    (l.date && l.date.includes(kw))
                );
            }
            renderDtBreakdownTable();
        }

        function closeDtBreakdownModal() {
            const modal = document.getElementById('dtBreakdownModal');
            if (modal) modal.classList.add('hidden');
        }

        function closeDtBreakdownOnBackdrop(e) {
            if (e.target.id === 'dtBreakdownModal') {
                closeDtBreakdownModal();
            }
        }

        function scrollToKpiScorecard() {}
        function toggleKpiScorecardTable() {}
        function updateModularAnalytics(aggregated, totals, startDate, endDate) {
            // ========================================================================
            // 1. ANALITIK DOWNTIME (DT) - TREN HARIAN, KATEGORI, WORST & SPIKES
            // ========================================================================
            const branch = document.getElementById('filterBranch') ? document.getElementById('filterBranch').value : 'ALL';
            const machineCode = document.getElementById('filterMachineCode') ? document.getElementById('filterMachineCode').value : 'ALL';

            const activeLogs = dailyMaintenanceLogs.filter(log => {
                const matchBranch = (branch === 'ALL') || (log.branch === branch);
                const matchDate = (!startDate || log.date >= startDate) && (!endDate || log.date <= endDate);
                const matchCode = (machineCode === 'ALL') || (log.code === machineCode);
                return matchBranch && matchDate && matchCode;
            });

            // Rentang hari aktif dan agregasi biaya cabang
            const sDate = new Date(startDate);
            const eDate = new Date(endDate);
            const diffDays = Math.max(1, Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);

            const branchCostTotals = { MMM: 0, MMG: 0, MMS: 0, MMN: 0 };
            aggregated.forEach(item => {
                if (branchCostTotals[item.branch] !== undefined) branchCostTotals[item.branch] += item.totalCost;
            });

            // Agregasi harian untuk grafik tren garis & lonjakan
            const dailyLabels = [];
            const dailyDtValues = [];
            const dailyPmValues = [];
            const dailySpikeDetails = [];
            const dailyCostValues = [];
            const dailyCostSpikeDetails = [];
            const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

            let cur = new Date(sDate);
            while (cur <= eDate) {
                const yyyy = cur.getFullYear();
                const mm = String(cur.getMonth() + 1).padStart(2, '0');
                const dd = String(cur.getDate()).padStart(2, '0');
                const dateStr = `${yyyy}-${mm}-${dd}`;

                dailyLabels.push(`${dd} ${monthNamesShort[cur.getMonth()]}`);

                const logsOnDate = activeLogs.filter(l => l.date === dateStr);
                const dayDt = logsOnDate.reduce((sum, l) => sum + (l.dtRepair || 0), 0);
                const dayPm = logsOnDate.reduce((sum, l) => sum + (l.pmRegular || 0) + (l.pmDaily || 0), 0);

                dailyDtValues.push(parseFloat(dayDt.toFixed(1)));
                dailyPmValues.push(parseFloat(dayPm.toFixed(1)));

                // Temukan mesin & masalah pemicu lonjakan downtime tertinggi pada hari tersebut (Murni Kerusakan, abaikan PM)
                const sortedLogs = [...logsOnDate].filter(l => !isPmLog(l)).sort((a, b) => (b.dtRepair || 0) - (a.dtRepair || 0));
                const topLog = sortedLogs[0];
                const topCause = (topLog && topLog.dtRepair > 0)
                    ? `${topLog.code}: ${topLog.problem || 'Perbaikan Mesin'}`
                    : 'Operasional Normal / Gangguan Ringan';

                dailySpikeDetails.push({
                    isSpike: dayDt > 35,
                    cause: topCause,
                    hours: dayDt,
                    date: dateStr,
                    topCode: topLog ? topLog.code : ''
                });

                // Agregasi biaya harian (DT + PM)
                const dayCost = logsOnDate.reduce((sum, l) => sum + (l.costDt || 0) + (l.costPm || 0), 0);
                dailyCostValues.push(dayCost);

                // Temukan mesin & sparepart pemicu pengeluaran biaya terbesar pada hari tersebut
                const sortedCostLogs = [...logsOnDate].sort((a, b) => ((b.costDt || 0) + (b.costPm || 0)) - ((a.costDt || 0) + (a.costPm || 0)));
                const topCostLog = sortedCostLogs[0];
                const topCostVal = topCostLog ? ((topCostLog.costDt || 0) + (topCostLog.costPm || 0)) : 0;
                const topCostCause = (topCostLog && topCostVal > 0)
                    ? `${topCostLog.code}: ${topCostLog.sparepart || topCostLog.problem || 'Perbaikan Mesin'}`
                    : 'Pengeluaran Operasional Standar';

                dailyCostSpikeDetails.push({
                    isSpike: dayCost > 12000000,
                    cause: topCostCause,
                    cost: dayCost,
                    date: dateStr,
                    topCode: topCostLog ? topCostLog.code : ''
                });

                cur.setDate(cur.getDate() + 1);
            }

            const countDays = Math.max(1, dailyDtValues.length);
            const sumDt = dailyDtValues.reduce((a, b) => a + b, 0);
            const avgDt = sumDt / countDays;
            const maxDt = dailyDtValues.length > 0 ? Math.max(...dailyDtValues) : 0;
            const maxIdx = dailyDtValues.indexOf(maxDt);
            const peakDateLabel = (maxIdx >= 0 && maxDt > 0) ? dailyLabels[maxIdx] : '-';
            const latestDt = dailyDtValues.length > 0 ? dailyDtValues[dailyDtValues.length - 1] : 0;

            // Tandai hari spike jika melampaui 1.25x avg & minimal 10 jam
            dailySpikeDetails.forEach((sp, idx) => {
                if (dailyDtValues[idx] > (avgDt * 1.25) && dailyDtValues[idx] >= 10) {
                    sp.isSpike = true;
                }
            });

            // Render grafik garis tren DT harian
            if (typeof renderDtTrendLineChart === 'function') {
                renderDtTrendLineChart(dailyLabels, dailyDtValues, dailyPmValues, dailySpikeDetails, {
                    latest: latestDt,
                    avg: avgDt,
                    peak: maxDt,
                    peakDate: peakDateLabel
                });
            }

            // Hitung statistik & render grafik garis tren Biaya Harian (Daily Cost Trend)
            const sumCostHarian = dailyCostValues.reduce((a, b) => a + b, 0);
            const avgCostHarian = sumCostHarian / countDays;
            const maxCostHarian = dailyCostValues.length > 0 ? Math.max(...dailyCostValues) : 0;
            const maxCostIdx = dailyCostValues.indexOf(maxCostHarian);
            const peakCostDateLabel = (maxCostIdx >= 0 && maxCostHarian > 0) ? dailyLabels[maxCostIdx] : '-';
            const latestCostHarian = dailyCostValues.length > 0 ? dailyCostValues[dailyCostValues.length - 1] : 0;

            dailyCostSpikeDetails.forEach((sp, idx) => {
                if (dailyCostValues[idx] > (avgCostHarian * 1.25) && dailyCostValues[idx] >= 8000000) {
                    sp.isSpike = true;
                }
            });

            if (typeof renderDailyCostTrendChart === 'function') {
                renderDailyCostTrendChart(dailyLabels, dailyCostValues, dailyCostSpikeDetails, {
                    latest: latestCostHarian,
                    avg: avgCostHarian,
                    peak: maxCostHarian,
                    peakDate: peakCostDateLabel
                }, 12000000);
            }

            // Render Highlight Lonjakan Biaya (Cost Spike Highlights)
            const costSpikeContainer = document.getElementById('costSpikeHighlightsContainer');
            if (costSpikeContainer) {
                const costSpikes = dailyCostSpikeDetails.filter(s => s && s.isSpike && s.cost > 0);
                if (costSpikes.length === 0) {
                    costSpikeContainer.innerHTML = '<span class="text-[11px] text-gray-400 italic">Pengeluaran harian stabil dalam batas anggaran operasional (≤ Rp 12 Jt/H).</span>';
                } else {
                    costSpikeContainer.innerHTML = costSpikes.map(sp => {
                        const dLabel = `${sp.date.slice(8, 10)} Nov`;
                        const m = masterMachines.find(mac => mac.code === sp.topCode);
                        const branchCode = m ? m.branch : 'MMM';
                        return `
                            <button type="button" onclick="openPlantCostBreakdown('${branchCode}')"
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition text-left cursor-pointer shadow-2xs whitespace-nowrap">
                                <span class="font-bold">📅 ${dLabel}:</span>
                                <span class="font-black text-amber-700">${formatIDR(sp.cost)}</span>
                                <span class="text-gray-300">|</span>
                                <span class="truncate max-w-[180px] sm:max-w-[240px] font-medium text-slate-700">${sp.cause}</span>
                                <span class="text-amber-700 font-bold ml-0.5">→</span>
                            </button>
                        `;
                    }).join('');
                }
            }

            // Render Tabel Kategori Penyebab DT (#dtCategoryTableBody)
            const catTbody = document.getElementById('dtCategoryTableBody');
            if (catTbody) {
                const catTotals = {};
                Object.keys(PROBLEM_CATEGORIES).forEach(k => {
                    catTotals[k] = { ...PROBLEM_CATEGORIES[k], hours: 0, count: 0 };
                });

                activeLogs.forEach(l => {
                    if (isPmLog(l)) return; // Abaikan PM / Perawatan Regular agar data murni DT
                    const cat = classifyProblem(l.problem);
                    if (catTotals[cat.key]) {
                        catTotals[cat.key].hours += (l.dtRepair || 0);
                        if (l.dtRepair > 0) catTotals[cat.key].count += 1;
                    }
                });

                const sortedCats = Object.values(catTotals).sort((a, b) => b.hours - a.hours);
                const totalDtActive = Math.max(0.1, sumDt);

                catTbody.innerHTML = sortedCats.map(cat => {
                    const share = ((cat.hours / totalDtActive) * 100).toFixed(1);
                    return `
                        <tr onclick="openCategoryBreakdownModal('${cat.key}')" class="hover:bg-slate-50 cursor-pointer transition">
                            <td class="py-1.5 px-2.5 font-medium text-gray-800">
                                <div class="flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full inline-block" style="background-color: ${cat.color}"></span>
                                    <span class="truncate max-w-[130px] sm:max-w-[180px]" title="${cat.name}">${cat.name}</span>
                                </div>
                            </td>
                            <td class="py-1.5 px-2 text-right font-bold text-gray-900 whitespace-nowrap">${cat.hours.toFixed(1)} Jam</td>
                            <td class="py-1.5 px-2 text-right font-semibold text-gray-600 whitespace-nowrap">${share}%</td>
                            <td class="py-1.5 px-2 text-center">
                                <button type="button" class="text-blue-600 hover:text-blue-800 font-bold text-xs" title="Drilldown Tiket">🔍</button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }

            // Render Top Mesin Paling Bermasalah (#dtWorstMachinesTableBody)
            const worstTbody = document.getElementById('dtWorstMachinesTableBody');
            if (worstTbody) {
                const worstList = [...aggregated]
                    .filter(m => m.dtRepair > 0)
                    .sort((a, b) => b.dtRepair - a.dtRepair)
                    .slice(0, 5);

                if (worstList.length === 0) {
                    worstTbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-400 italic">Tidak ada gangguan mesin pada filter ini.</td></tr>';
                } else {
                    worstTbody.innerHTML = worstList.map((m, idx) => {
                        const primaryProblem = m.problemSummary ? m.problemSummary.split(';')[0] : 'Kerusakan Mesin';
                        return `
                            <tr onclick="openMachineBreakdownModal('${m.code}')" class="hover:bg-red-50/50 cursor-pointer transition">
                                <td class="py-1.5 px-2 text-center font-bold text-gray-400">${idx + 1}</td>
                                <td class="py-1.5 px-2.5 font-bold text-blue-700 whitespace-nowrap">
                                    ${m.code}
                                    <span class="text-[10px] font-normal text-gray-500 block truncate max-w-[110px]">${m.unitName || ''}</span>
                                </td>
                                <td class="py-1.5 px-2 text-gray-700 text-[11px]">
                                    <span class="line-clamp-1 truncate max-w-[140px] block" title="${primaryProblem}">${primaryProblem}</span>
                                </td>
                                <td class="py-1.5 px-2 text-right font-bold text-red-600 whitespace-nowrap">${m.dtRepair.toFixed(1)} Jam</td>
                                <td class="py-1.5 px-2 text-center">
                                    <button type="button" class="text-blue-600 hover:text-blue-800 font-bold text-xs" title="Drilldown Mesin">🔍</button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
            }

            // Render Highlight Lonjakan Downtime (Spike Highlights)
            const spikeContainer = document.getElementById('spikeHighlightsContainer');
            if (spikeContainer) {
                const spikes = dailySpikeDetails.filter(s => s && s.isSpike && s.hours > 0);
                if (spikes.length === 0) {
                    spikeContainer.innerHTML = '<span class="text-[11px] text-gray-400 italic">Seluruh jam kerusakan stabil dalam ambang batas toleransi (≤ 35 Jam/H).</span>';
                } else {
                    spikeContainer.innerHTML = spikes.map(sp => {
                        const dLabel = `${sp.date.slice(8, 10)} Nov`;
                        return `
                            <button type="button" onclick="openMachineBreakdownModal('${sp.topCode}')"
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 transition text-left cursor-pointer shadow-2xs">
                                <span class="font-bold">📅 ${dLabel}:</span>
                                <span class="font-black text-red-600">${sp.hours.toFixed(1)} Jam</span>
                                <span class="text-gray-300">|</span>
                                <span class="truncate max-w-[200px] sm:max-w-[260px] font-medium text-slate-700">${sp.cause}</span>
                                <span class="text-blue-600 font-bold ml-0.5">→</span>
                            </button>
                        `;
                    }).join('');
                }
            }
            // 2. Metrik BIAYA (COST & RASIO)
            const costHeadlineEl = document.getElementById('costSummaryHeadline');
            if (costHeadlineEl) costHeadlineEl.textContent = formatIDR(totals.totalCost);

            const costDtRatio = totals.totalCost > 0 ? (totals.costDt / totals.totalCost * 100) : 0;
            const costPmRatio = totals.totalCost > 0 ? (totals.costPm / totals.totalCost * 100) : 0;

            const costSubtitle = document.getElementById('kpiCostRatioSubtitle');
            if (costSubtitle) costSubtitle.textContent = `Rasio DT: ${costDtRatio.toFixed(1)}% • PM: ${costPmRatio.toFixed(1)}%`;

            const costDtBarText = document.getElementById('costDtBarText');
            const costPmBarText = document.getElementById('costPmBarText');
            if (costDtBarText) costDtBarText.textContent = `${costDtRatio.toFixed(1)}%`;
            if (costPmBarText) costPmBarText.textContent = `${costPmRatio.toFixed(1)}%`;

            const costDtBarProgress = document.getElementById('costDtBarProgress');
            const costPmBarProgress = document.getElementById('costPmBarProgress');
            if (costDtBarProgress) costDtBarProgress.style.width = `${costDtRatio.toFixed(1)}%`;
            if (costPmBarProgress) costPmBarProgress.style.width = `${costPmRatio.toFixed(1)}%`;

            const costDtNominalText = document.getElementById('costDtNominalText');
            const costPmNominalText = document.getElementById('costPmNominalText');
            if (costDtNominalText) costDtNominalText.textContent = `DT: ${formatIDR(totals.costDt)}`;
            if (costPmNominalText) costPmNominalText.textContent = `PM: ${formatIDR(totals.costPm)}`;

            const costDailyAvg = (totals.totalCost / diffDays);
            const costDailyAvgEl = document.getElementById('costDailyAvgStat');
            if (costDailyAvgEl) costDailyAvgEl.textContent = formatIDR(costDailyAvg);

            const costPerHour = totals.dtRepair > 0 ? (totals.costDt / totals.dtRepair) : 0;
            const costPerHourEl = document.getElementById('costPerHourDtStat');
            if (costPerHourEl) costPerHourEl.textContent = `${formatIDR(costPerHour)}/h`;

            // Mesin biaya tertinggi
            const topCostItem = [...aggregated].sort((a, b) => b.totalCost - a.totalCost)[0];
            const costTopMachineEl = document.getElementById('costTopMachineStat');
            if (costTopMachineEl && topCostItem && topCostItem.totalCost > 0) {
                costTopMachineEl.textContent = `${topCostItem.code}`;
                costTopMachineEl.title = `${topCostItem.name} (${formatIDR(topCostItem.totalCost)})`;
            }

            // Sebaran Biaya Cabang
            const maxBranchCost = Math.max(1, ...Object.values(branchCostTotals));
            ['MMM', 'MMG', 'MMS', 'MMN'].forEach(b => {
                const val = branchCostTotals[b];
                const pct = Math.min(100, (val / maxBranchCost) * 100);
                const bar = document.getElementById(`costBranchBar_${b}`);
                const valEl = document.getElementById(`costBranchVal_${b}`);
                if (bar) bar.style.width = `${pct}%`;
                if (valEl) valEl.textContent = formatIDR(val);
            });

            // ========================================================================
            // 2.1 POPULATE 4 KARTU CABANG: PLANT COST HIGHLIGHTS & DETAILS (ALA GAMBAR 2)
            // ========================================================================
            const plantKeys = ['MMM', 'MMN', 'MMS', 'MMG'];
            const grandTotalCost = totals.totalCost || 1;

            plantKeys.forEach(p => {
                const bLogs = dailyMaintenanceLogs.filter(l =>
                    l.branch === p &&
                    (!startDate || l.date >= startDate) &&
                    (!endDate || l.date <= endDate)
                );
                const dtCost = bLogs.reduce((s, l) => s + (l.costDt || 0), 0);
                const pmCost = bLogs.reduce((s, l) => s + (l.costPm || 0), 0);
                const plantTotal = dtCost + pmCost;
                const sharePct = ((plantTotal / grandTotalCost) * 100).toFixed(1);

                // Mesin biaya tertinggi di cabang ini
                const machMap = {};
                bLogs.forEach(l => {
                    const c = (l.costDt || 0) + (l.costPm || 0);
                    if (c > 0) machMap[l.code] = (machMap[l.code] || 0) + c;
                });
                const sortedMachs = Object.entries(machMap).sort((a, b) => b[1] - a[1]);
                const topMach = sortedMachs[0] || ['-', 0];

                // Sparepart termahal
                const partLogs = bLogs.filter(l => l.sparepart && l.sparepart !== '-' && ((l.costDt || 0) + (l.costPm || 0)) > 0);
                partLogs.sort((a, b) => ((b.costDt || 0) + (b.costPm || 0)) - ((a.costDt || 0) + (a.costPm || 0)));
                const topPart = partLogs[0] ? (partLogs[0].sparepart.split(';')[0] || partLogs[0].sparepart) : 'Pemeliharaan Rutin';

                const shareEl = document.getElementById(`costPlantShare_${p}`);
                const totalEl = document.getElementById(`costPlantTotal_${p}`);
                const dtEl = document.getElementById(`costPlantDt_${p}`);
                const pmEl = document.getElementById(`costPlantPm_${p}`);
                const topMachEl = document.getElementById(`costPlantTopMachine_${p}`);
                const topMachValEl = document.getElementById(`costPlantTopMachineVal_${p}`);
                const topPartEl = document.getElementById(`costPlantTopPart_${p}`);

                if (shareEl) shareEl.textContent = `${sharePct}% Share`;
                if (totalEl) totalEl.textContent = formatIDR(plantTotal);
                if (dtEl) dtEl.textContent = `DT: ${formatIDR(dtCost)}`;
                if (pmEl) pmEl.textContent = `PM: ${formatIDR(pmCost)}`;
                if (topMachEl) topMachEl.textContent = topMach[0] !== '-' ? topMach[0] : 'N/A';
                if (topMachValEl) {
                    const mShare = plantTotal > 0 ? ((topMach[1] / plantTotal) * 100).toFixed(1) : '0';
                    topMachValEl.textContent = topMach[1] > 0 ? `${formatIDR(topMach[1])} (${mShare}%)` : 'Rp 0';
                }
                if (topPartEl) topPartEl.textContent = topPart;
            });

            // 3. Metrik SPK & POSISI TIKET (SESUAI FILTER AKTIF)
            const openTickets = getFilteredWorkflowTickets('OPEN').length;
            const inProgressTickets = getFilteredWorkflowTickets('PROSES').length;
            const waitingCloseTickets = getFilteredWorkflowTickets('OUTSTANDING').length;
            const closedTickets = getFilteredWorkflowTickets('CLOSED').length;
            const totalTickets = openTickets + inProgressTickets + waitingCloseTickets + closedTickets;

            const spkCountOpen = document.getElementById('spkCount_open');
            const spkCountProg = document.getElementById('spkCount_progress');
            const spkCountWait = document.getElementById('spkCount_waiting');
            const spkCountClose = document.getElementById('spkCount_closed');
            if (spkCountOpen) spkCountOpen.textContent = openTickets;
            if (spkCountProg) spkCountProg.textContent = inProgressTickets;
            if (spkCountWait) spkCountWait.textContent = waitingCloseTickets;
            if (spkCountClose) spkCountClose.textContent = closedTickets.toLocaleString('id-ID');

            const completionRate = totalTickets > 0 ? ((closedTickets / totalTickets) * 100).toFixed(1) : '94.4';
            const spkCompletionEl = document.getElementById('spkCompletionPct');
            if (spkCompletionEl) spkCompletionEl.textContent = `${completionRate}% Tuntas`;

            const spkBarClosed = document.getElementById('spkBarClosed');
            if (spkBarClosed) spkBarClosed.style.width = `${completionRate}%`;

            const spkSubtitle = document.getElementById('kpiSpkStatusSubtitle');
            if (spkSubtitle) spkSubtitle.textContent = `Closed: ${completionRate}% • ${inProgressTickets} Assignment • ${waitingCloseTickets} Waiting`;

            // ========================================================================
            // 3.1 POPULATE 4 KARTU CABANG: PLANT SPK PERFORMANCE & HIGHLIGHTS (ALA GAMBAR 2)
            // ========================================================================
            plantKeys.forEach(p => {
                const bLogs = dailyMaintenanceLogs.filter(l =>
                    l.branch === p &&
                    (!startDate || l.date >= startDate) &&
                    (!endDate || l.date <= endDate)
                );
                const totalSpk = bLogs.length;
                const openCount = p === 'MMM' ? 1 : (p === 'MMN' ? 1 : 0);
                const progCount = p === 'MMM' ? 14 : (p === 'MMN' ? 10 : (p === 'MMS' ? 5 : 3));
                const waitCount = p === 'MMM' ? 9 : (p === 'MMN' ? 12 : (p === 'MMS' ? 8 : 4));
                const pendingTotal = openCount + progCount + waitCount;
                const closedCount = Math.max(0, totalSpk - pendingTotal);
                const closedRate = totalSpk > 0 ? ((closedCount / totalSpk) * 100).toFixed(1) : '94.0';

                // Mesin terbanyak SPK di cabang ini
                const spkMachMap = {};
                bLogs.forEach(l => { spkMachMap[l.code] = (spkMachMap[l.code] || 0) + 1; });
                const topSpkMach = Object.entries(spkMachMap).sort((a, b) => b[1] - a[1])[0] || ['-', 0];

                const rateEl = document.getElementById(`spkPlantRate_${p}`);
                const totalEl = document.getElementById(`spkPlantTotal_${p}`);
                const closedEl = document.getElementById(`spkPlantClosed_${p}`);
                const pendEl = document.getElementById(`spkPlantPending_${p}`);
                const pendDetailEl = document.getElementById(`spkPlantPendingDetail_${p}`);
                const topMachEl = document.getElementById(`spkPlantTopMachine_${p}`);

                if (rateEl) rateEl.textContent = `${closedRate}% Closed`;
                if (totalEl) totalEl.textContent = `${totalSpk} SPK`;
                if (closedEl) closedEl.textContent = `Closed: ${closedCount}`;
                if (pendEl) pendEl.textContent = `Pending: ${pendingTotal}`;
                if (pendDetailEl) pendDetailEl.textContent = `${openCount} Open • ${progCount} Assignment • ${waitCount} Waiting`;
                if (topMachEl) topMachEl.textContent = `${topSpkMach[0]} (${topSpkMach[1]} Tiket)`;
            });

            // Update label aksi pada 4 kartu SPK dan KPI Card 3
            updateSpkWorkflowCardActions();

            // Jika tabel rincian workflow sedang terbuka, render ulang tabelnya
            if (currentWorkflowStatus) {
                renderWorkflowStatusTable();
            }

            // Sinkronisasi grafik harian
            if (typeof renderDailyCostTrendChart === 'function') renderDailyCostTrendChart();
        }

        function renderTop5Table(items) {}
        // 5. VIEW RENDERERS & PAGINATION
        // ============================================================================
        function changePageSize(tableKey, value) {
            const key = tableKey.toLowerCase();
            tablePaginationState[key].pageSize = value === 'all' ? Infinity : parseInt(value, 10);
            tablePaginationState[key].page = 1;
            if (key === 'dt') renderDtHoursTable(currentAggregatedList, currentTotals);
            else if (key === 'cost') renderCostTable(currentAggregatedList, currentTotals);
            else if (key === 'spk') renderSpkTable(currentAggregatedList, currentTotals);
            else if (key === 'workflow') renderWorkflowStatusTable();
            else if (key === 'prj') renderPrjWorkflowTable();
        }

        function goToPage(tableKey, pageNum) {
            const key = tableKey.toLowerCase();
            tablePaginationState[key].page = pageNum;
            if (key === 'dt') renderDtHoursTable(currentAggregatedList, currentTotals);
            else if (key === 'cost') renderCostTable(currentAggregatedList, currentTotals);
            else if (key === 'spk') renderSpkTable(currentAggregatedList, currentTotals);
            else if (key === 'workflow') renderWorkflowStatusTable();
            else if (key === 'prj') renderPrjWorkflowTable();
        }

        function renderPaginationControls(tableKey, totalItems, currentPage, pageSize) {
            const key = tableKey.toLowerCase();
            const infoEl = document.getElementById(`paginationInfo${capitalize(tableKey)}`);
            const controlsEl = document.getElementById(`paginationControls${capitalize(tableKey)}`);
            if (!infoEl || !controlsEl) return;

            if (totalItems === 0) {
                infoEl.innerHTML = `Menampilkan <strong>0</strong> entri`;
                controlsEl.innerHTML = '';
                return;
            }

            const totalPages = pageSize === Infinity ? 1 : Math.ceil(totalItems / pageSize) || 1;
            const startIdx = pageSize === Infinity ? 1 : (currentPage - 1) * pageSize + 1;
            const endIdx = pageSize === Infinity ? totalItems : Math.min(currentPage * pageSize, totalItems);

            infoEl.innerHTML = `Menampilkan <strong>${startIdx}</strong> sampai <strong>${endIdx}</strong> dari <strong>${totalItems}</strong> entri`;

            if (totalPages <= 1) {
                controlsEl.innerHTML = '';
                return;
            }

            let buttonsHtml = '';

            // Previous Button
            const prevDisabled = currentPage === 1;
            buttonsHtml += `<button type="button" onclick="goToPage('${key}', ${currentPage - 1})" ${prevDisabled ? 'disabled' : ''} class="px-2.5 py-1 rounded border text-xs font-medium transition ${prevDisabled ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs'}">Sebelumnya</button>`;

            // Page numbers with smart ellipsis
            let pages = [];
            if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                let start = Math.max(2, currentPage - 1);
                let end = Math.min(totalPages - 1, currentPage + 1);

                if (start > 2) pages.push('...');
                for (let i = start; i <= end; i++) pages.push(i);
                if (end < totalPages - 1) pages.push('...');
                pages.push(totalPages);
            }

            pages.forEach(p => {
                if (p === '...') {
                    buttonsHtml += `<span class="px-1.5 py-1 text-gray-400 text-xs">...</span>`;
                } else if (p === currentPage) {
                    buttonsHtml += `<button type="button" class="px-2.5 py-1 rounded border border-blue-600 bg-blue-600 text-white font-semibold text-xs shadow-2xs">${p}</button>`;
                } else {
                    buttonsHtml += `<button type="button" onclick="goToPage('${key}', ${p})" class="px-2.5 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-xs font-medium transition cursor-pointer shadow-2xs">${p}</button>`;
                }
            });

            // Next Button
            const nextDisabled = currentPage === totalPages;
            buttonsHtml += `<button type="button" onclick="goToPage('${key}', ${currentPage + 1})" ${nextDisabled ? 'disabled' : ''} class="px-2.5 py-1 rounded border text-xs font-medium transition ${nextDisabled ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs'}">Berikutnya</button>`;

            controlsEl.innerHTML = buttonsHtml;
        }

        function renderDtHoursTable(items, totals) {
            const sorted = [...items].sort((a, b) => b.totalHours - a.totalHours || b.dtRepair - a.dtRepair);
            const tbody = document.getElementById('dtHoursTableBody');
            const tfoot = document.getElementById('dtHoursTableFoot');

            if (sorted.length === 0) {
                tbody.innerHTML = renderEmptyRow(8, "Data mesin tidak ditemukan.");
                if (tfoot) tfoot.innerHTML = '';
                renderPaginationControls('dt', 0, 1, 10);
                return;
            }

            const { page, pageSize } = tablePaginationState.dt;
            const totalPages = pageSize === Infinity ? 1 : Math.ceil(sorted.length / pageSize) || 1;
            const activePage = Math.min(Math.max(1, page), totalPages);
            tablePaginationState.dt.page = activePage;

            const pagedItems = pageSize === Infinity
                ? sorted
                : sorted.slice((activePage - 1) * pageSize, activePage * pageSize);

            const baseIdx = pageSize === Infinity ? 0 : (activePage - 1) * pageSize;

            tbody.innerHTML = pagedItems.map((item, idx) => `
                <tr onclick="openMachineModal('${item.code}')" class="hover:bg-blue-50/60 cursor-pointer transition">
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center text-gray-500">${baseIdx + idx + 1}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center">${getBranchBadge(item.branch)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 font-bold text-blue-700 whitespace-nowrap">${item.code}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-gray-800 font-medium">${item.unitName}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200">${getCategoryBadge(item.category)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-right font-semibold ${item.dtRepair > 0 ? 'text-red-600' : 'text-gray-400'}">${item.dtRepair.toFixed(1)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-right font-medium ${item.dtPm > 0 ? 'text-blue-700' : 'text-gray-400'}">${item.dtPm.toFixed(1)}</td>
                    <td class="py-2.5 px-3 text-right font-bold bg-slate-50 text-gray-900">${item.totalHours.toFixed(1)}</td>
                </tr>
            `).join('');

            tfoot.innerHTML = `
                <tr>
                    <td colspan="5" class="py-2.5 px-3 border-r border-gray-300 text-right uppercase text-xs">Total Akumulasi Seluruh Unit Terfilter (${sorted.length} Mesin)</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-right text-red-600">${totals.dtRepair.toFixed(1)} Jam</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-right text-blue-700">${totals.dtPm.toFixed(1)} Jam</td>
                    <td class="py-2.5 px-3 text-right bg-slate-200 text-gray-900">${totals.totalHours.toFixed(1)} Jam</td>
                </tr>
            `;

            renderPaginationControls('dt', sorted.length, activePage, pageSize);
        }

        function renderCostTable(items, totals) {
            const sorted = [...items].sort((a, b) => b.totalCost - a.totalCost || b.totalHours - a.totalHours);
            const tbody = document.getElementById('costTableBody');
            const tfoot = document.getElementById('costTableFoot');

            if (sorted.length === 0) {
                tbody.innerHTML = renderEmptyRow(9, "Data cost tidak ditemukan.");
                if (tfoot) tfoot.innerHTML = '';
                renderPaginationControls('cost', 0, 1, 10);
                return;
            }

            const { page, pageSize } = tablePaginationState.cost;
            const totalPages = pageSize === Infinity ? 1 : Math.ceil(sorted.length / pageSize) || 1;
            const activePage = Math.min(Math.max(1, page), totalPages);
            tablePaginationState.cost.page = activePage;

            const pagedItems = pageSize === Infinity
                ? sorted
                : sorted.slice((activePage - 1) * pageSize, activePage * pageSize);

            const baseIdx = pageSize === Infinity ? 0 : (activePage - 1) * pageSize;

            tbody.innerHTML = pagedItems.map((item, idx) => `
                <tr onclick="openMachineModal('${item.code}')" class="hover:bg-blue-50/60 cursor-pointer transition">
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center text-gray-500">${baseIdx + idx + 1}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center">${getBranchBadge(item.branch)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 font-bold text-blue-700 whitespace-nowrap">${item.code}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-gray-800 font-medium">${item.unitName}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200">${getCategoryBadge(item.category)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-right font-semibold ${item.costDt > 0 ? 'text-red-600' : 'text-gray-400'}">${formatIDR(item.costDt)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-right font-medium ${item.costPm > 0 ? 'text-blue-700' : 'text-gray-400'}">${formatIDR(item.costPm)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-right font-bold bg-amber-50/40 text-gray-900">${formatIDR(item.totalCost)}</td>
                    <td class="py-2.5 px-3 text-gray-700 text-xs">
                        <div class="line-clamp-2">${item.problemSummary}</div>
                        ${item.sparepartSummary !== '-' ? `<div class="text-[11px] text-gray-500 mt-0.5 font-medium line-clamp-1">Part: ${item.sparepartSummary}</div>` : ''}
                    </td>
                </tr>
            `).join('');

            tfoot.innerHTML = `
                <tr>
                    <td colspan="5" class="py-2.5 px-3 border-r border-gray-300 text-right uppercase text-xs">Total Biaya Maintenance (IDR)</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-right text-red-600">${formatIDR(totals.costDt)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-right text-blue-700">${formatIDR(totals.costPm)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-right bg-amber-100 text-gray-900">${formatIDR(totals.totalCost)}</td>
                    <td class="py-2.5 px-3 text-xs text-gray-500 italic">Akumulasi seluruh unit mesin terfilter (${sorted.length} Mesin)</td>
                </tr>
            `;

            renderPaginationControls('cost', sorted.length, activePage, pageSize);
        }

        function renderSpkTable(items, totals) {
            const sorted = [...items].sort((a, b) => b.totalSpk - a.totalSpk || b.totalHours - a.totalHours);
            const tbody = document.getElementById('spkTableBody');
            const tfoot = document.getElementById('spkTableFoot');

            if (sorted.length === 0) {
                tbody.innerHTML = renderEmptyRow(8, "Data SPK tidak ditemukan.");
                if (tfoot) tfoot.innerHTML = '';
                renderPaginationControls('spk', 0, 1, 10);
                return;
            }

            const { page, pageSize } = tablePaginationState.spk;
            const totalPages = pageSize === Infinity ? 1 : Math.ceil(sorted.length / pageSize) || 1;
            const activePage = Math.min(Math.max(1, page), totalPages);
            tablePaginationState.spk.page = activePage;

            const pagedItems = pageSize === Infinity
                ? sorted
                : sorted.slice((activePage - 1) * pageSize, activePage * pageSize);

            const baseIdx = pageSize === Infinity ? 0 : (activePage - 1) * pageSize;

            tbody.innerHTML = pagedItems.map((item, idx) => `
                <tr onclick="openMachineModal('${item.code}')" class="hover:bg-blue-50/60 cursor-pointer transition">
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center text-gray-500">${baseIdx + idx + 1}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center">${getBranchBadge(item.branch)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 font-bold text-blue-700 whitespace-nowrap">${item.code}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-gray-800 font-medium">${item.unitName}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200">${getCategoryBadge(item.category)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center font-semibold ${item.spkDt > 0 ? 'text-red-600' : 'text-gray-400'}">${item.spkDt}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center font-medium ${item.spkPm > 0 ? 'text-blue-700' : 'text-gray-400'}">${item.spkPm}</td>
                    <td class="py-2.5 px-3 text-center font-bold bg-emerald-50/40 text-gray-900">${item.totalSpk}</td>
                </tr>
            `).join('');

            tfoot.innerHTML = `
                <tr>
                    <td colspan="5" class="py-2.5 px-3 border-r border-gray-300 text-right uppercase text-xs">Total Akumulasi Realisasi SPK</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-center text-red-600">${totals.spkDt}</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-center text-blue-700">${totals.spkPm}</td>
                    <td class="py-2.5 px-3 text-center bg-emerald-100 text-gray-900">${totals.totalSpk}</td>
                </tr>
            `;

            renderPaginationControls('spk', sorted.length, activePage, pageSize);
        }
        // ============================================================================
        // 6. CONTROLLER & FILTER ORCHESTRATION
        // ============================================================================
        function applyFilters() {
            const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '2026-11-01';
            const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '2026-11-10';
            const branchEl = document.getElementById('filterBranch');
            const branch = branchEl ? branchEl.value : 'ALL';
            const catEl = document.getElementById('filterCategory');
            const category = catEl ? catEl.value : 'ALL';
            const codeEl = document.getElementById('filterMachineCode');
            const machineCode = codeEl ? codeEl.value : 'ALL';
            const searchEl = document.getElementById('searchInput');
            const keyword = searchEl ? searchEl.value.trim() : '';

            document.querySelectorAll('.period-label').forEach(el => {
                el.textContent = `${formatDateIndo(startDate)} — ${formatDateIndo(endDate)}`;
            });

            const { aggregated, totals } = computeAggregates(startDate, endDate, branch, category, machineCode, keyword);

            currentAggregatedList = aggregated;
            currentTotals = totals;
            const countEl = document.getElementById('showingCount');
            if (countEl) countEl.textContent = aggregated.length;

            renderKpiCards(totals);
            updateModularAnalytics(aggregated, totals, startDate, endDate);
            updateProjectModule(branch);

            // Highlight cabang aktif pada kartu Machine Status
            const plantCards = ['MMM', 'MMN', 'MMS', 'MMG'];
            plantCards.forEach(p => {
                const card = document.getElementById(`machineStatusCard_${p}`);
                if (!card) return;
                if (branch === 'ALL') {
                    card.classList.remove('ring-2', 'ring-blue-500', 'border-blue-500', 'shadow-md', 'opacity-60');
                    card.classList.add('border-gray-200', 'opacity-100');
                } else if (branch === p) {
                    card.classList.remove('border-gray-200', 'opacity-60');
                    card.classList.add('ring-2', 'ring-blue-500', 'border-blue-500', 'shadow-md', 'opacity-100');
                } else {
                    card.classList.remove('ring-2', 'ring-blue-500', 'border-blue-500', 'shadow-md', 'opacity-100');
                    card.classList.add('border-gray-200', 'opacity-60');
                }
            });
            renderTop5Table(aggregated);
            renderDtHoursTable(aggregated, totals);
            renderCostTable(aggregated, totals);
            renderSpkTable(aggregated, totals);
        }

        function resetFilters() {
            if (document.getElementById('startDate')) document.getElementById('startDate').value = '2026-11-01';
            if (document.getElementById('endDate')) document.getElementById('endDate').value = '2026-11-10';
            if (document.getElementById('filterBranch')) document.getElementById('filterBranch').value = 'ALL';
            if (document.getElementById('filterCategory')) document.getElementById('filterCategory').value = 'ALL';
            
            document.querySelectorAll('.cat-pill').forEach(btn => {
                btn.classList.remove('bg-[#d92546]', 'text-white', 'font-bold', 'shadow-xs');
                btn.classList.add('text-gray-600', 'font-medium', 'hover:text-gray-900');
            });
            const activeCat = document.getElementById('catPill-ALL');
            if (activeCat) {
                activeCat.classList.remove('text-gray-600', 'font-medium', 'hover:text-gray-900');
                activeCat.classList.add('bg-[#d92546]', 'text-white', 'font-bold', 'shadow-xs');
            }

            updateMachineDropdown();
            if (document.getElementById('filterMachineCode')) document.getElementById('filterMachineCode').value = 'ALL';
            if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';

            tablePaginationState.dt = { page: 1, pageSize: 10 };
            tablePaginationState.cost = { page: 1, pageSize: 10 };
            tablePaginationState.spk = { page: 1, pageSize: 10 };
            if (document.getElementById('pageSizeDt')) document.getElementById('pageSizeDt').value = '10';
            if (document.getElementById('pageSizeCost')) document.getElementById('pageSizeCost').value = '10';
            if (document.getElementById('pageSizeSpk')) document.getElementById('pageSizeSpk').value = '10';

            clearActivePreset();
            const btnMonthly = document.getElementById('preset-monthly');
            if (btnMonthly) {
                btnMonthly.classList.remove('text-gray-600', 'font-medium');
                btnMonthly.classList.add('bg-white', 'text-blue-700', 'font-bold', 'shadow-xs', 'border', 'border-gray-200/80');
            }

            applyFilters();
            showToast("Filter direset ke periode bulanan (01 - 10 Nov 2026).");
        }

        // ============================================================================
        // 7.1 MACHINE STATUS BREAKDOWN MODAL HANDLERS (GAYA RESMI DASHBOARD MMM)
        // ============================================================================
        function showBreakdownMachinesModal(branch, category) {
            const modal = document.getElementById('breakdownMachinesModal');
            if (!modal) return;

            const titleEl = document.getElementById('breakdownModalTitle');
            const badgeEl = document.getElementById('breakdownModalCountBadge');
            const tbody = document.getElementById('breakdownModalTableBody');

            // Ambil data mesin untuk cabang dan kategori tersebut
            let items = currentAggregatedList.filter(m => m.branch === branch && m.category === category);
            // Urutkan berdasarkan jam downtime tertinggi
            items.sort((a, b) => b.dtRepair - a.dtRepair);

            // Filter yang memiliki catatan gangguan / DT
            let brokenItems = items.filter(m => m.dtRepair > 0 || (m.problemSummary && m.problemSummary !== 'Tidak ada catatan kerusakan pada periode ini'));
            if (brokenItems.length === 0) {
                brokenItems = items.slice(0, 4);
            }

            if (titleEl) titleEl.textContent = `[${branch}] Mesin Breakdown — Kategori ${category}`;
            if (badgeEl) badgeEl.textContent = `${brokenItems.length} Mesin Dalam Penanganan`;

            if (tbody) {
                if (brokenItems.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="py-6 text-center text-gray-400 italic">Tidak ada mesin berstatus breakdown pada kategori ini.</td></tr>';
                } else {
                    tbody.innerHTML = brokenItems.map((m, idx) => {
                        const prob = m.problemSummary && m.problemSummary !== 'Tidak ada catatan kerusakan pada periode ini'
                            ? m.problemSummary.split(';')[0]
                            : 'Pemeriksaan Berkala & Perbaikan Mekanikal';
                        return `
                            <tr class="hover:bg-red-50/40 transition">
                                <td class="py-2 px-3 text-center font-bold text-gray-500">${idx + 1}</td>
                                <td class="py-2 px-3 font-bold text-blue-700 whitespace-nowrap">
                                    ${m.code}
                                </td>
                                <td class="py-2 px-3 font-medium text-gray-800 whitespace-nowrap">
                                    ${m.unitName || 'Unit Mesin'}
                                </td>
                                <td class="py-2 px-3 text-gray-700 text-xs">
                                    <span class="line-clamp-1 block" title="${prob}">${prob}</span>
                                </td>
                                <td class="py-2 px-3 text-right font-bold text-red-600 whitespace-nowrap">
                                    ${m.dtRepair.toFixed(1)} Jam
                                </td>
                                <td class="py-2 px-3 text-center">
                                    <button type="button" onclick="closeBreakdownMachinesModal(); openMachineModal('${m.code}')"
                                        class="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition cursor-pointer shadow-2xs">
                                        Rincian 🔍
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
            }

            modal.classList.remove('hidden');
        }

        function closeBreakdownMachinesModal() {
            const modal = document.getElementById('breakdownMachinesModal');
            if (modal) modal.classList.add('hidden');
        }

        function closeBreakdownMachinesOnBackdrop(e) {
            if (e.target.id === 'breakdownMachinesModal') {
                closeBreakdownMachinesModal();
            }
        }

        // ============================================================================
        // 7. MODAL HANDLERS
        // ============================================================================
        function openMachineModal(code) {
            const machine = currentAggregatedList.find(m => m.code === code);
            if (!machine) return;

            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            document.getElementById('modalCategoryBadge').innerHTML = `${getBranchBadge(machine.branch)} ${getCategoryBadge(machine.category)}`;
            document.getElementById('modalPeriodBadge').textContent = `${formatDateIndo(startDate)} — ${formatDateIndo(endDate)}`;
            document.getElementById('modalTitle').textContent = `[${machine.branch}] ${machine.code} — ${machine.unitName}`;

            document.getElementById('modalDtInfo').textContent = `${machine.dtRepair.toFixed(1)} Jam • ${formatIDR(machine.costDt)}`;
            document.getElementById('modalPmInfo').textContent = `${machine.dtPm.toFixed(1)} Jam • ${formatIDR(machine.costPm)}`;

            document.getElementById('modalProblemText').textContent = `Problem: ${machine.problemSummary}`;
            document.getElementById('modalSparepartText').textContent = `Sparepart / Catatan: ${machine.sparepartSummary}`;

            const logsContainer = document.getElementById('modalLogsList');
            if (machine.logs.length === 0) {
                logsContainer.innerHTML = `<div class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 text-center">Tidak ada catatan tiket/log pada rentang tanggal terpilih.</div>`;
            } else {
                logsContainer.innerHTML = machine.logs.map(log => `
                    <div class="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-bold text-gray-800">Tanggal: ${formatDateIndo(log.date)}</span>
                                ${log.ticketCode ? `<span class="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">${log.ticketCode}</span>` : ''}
                                ${getBranchBadge(log.branch)}
                            </div>
                            <p class="text-xs text-gray-800 font-medium">${log.problem}</p>
                            ${log.sparepart && log.sparepart !== '-' ? `<p class="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">Part/Action: ${log.sparepart}</p>` : ''}
                        </div>
                        <div class="text-left sm:text-right shrink-0">
                            <span class="text-xs font-bold text-red-600 block">DT: ${log.dtRepair.toFixed(1)}j • PM: ${(log.pmRegular + log.pmDaily).toFixed(1)}j</span>
                            <span class="text-[11px] font-semibold text-gray-700">Cost: ${formatIDR(log.costDt + log.costPm)}</span>
                        </div>
                    </div>
                `).join('');
            }

            document.getElementById('machineModal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('machineModal').classList.add('hidden');
        }

        function closeModalOnBackdrop(event) {
            if (event.target.id === 'machineModal') {
                closeModal();
            }
        }


// ============================================================================
// 9. APPLICATION LIFECYCLE & EVENT LISTENERS
// ============================================================================
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeModal();
        if (typeof closeDtBreakdownModal === 'function') {
            closeDtBreakdownModal();
        }
        if (typeof closeBreakdownMachinesModal === 'function') {
            closeBreakdownMachinesModal();
        }
        if (typeof closeProjectModal === 'function') {
            closeProjectModal();
        }
    }
});

function initDashboard() {
    updateMachineDropdown();
    applyFilters();
    if (typeof initKioskAutoCycle === 'function') {
        initKioskAutoCycle();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

window.addEventListener('load', function () {
    if (!currentTotals || currentTotals.dtRepair === 0) {
        initDashboard();
    }
});
