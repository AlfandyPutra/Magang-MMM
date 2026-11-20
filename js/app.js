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
                btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-600', 'font-semibold');
                btn.classList.add('bg-white', 'text-gray-700', 'border-gray-300', 'font-medium');
            });
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
            const mapId = {
                '2026-11-01_2026-11-10': 'preset-nov-real',
                '2026-11-01_2026-11-17': 'preset-nov',
                '2026-11-01_2026-11-30': 'preset-nov',
                '2026-10-01_2026-10-31': 'preset-oct',
                '2026-09-01_2026-09-30': 'preset-sep'
            };
            const activeBtn = document.getElementById(mapId[`${start}_${end}`]);
            if (activeBtn) {
                activeBtn.classList.remove('bg-white', 'text-gray-700', 'border-gray-300', 'font-medium');
                activeBtn.classList.add('bg-blue-600', 'text-white', 'border-blue-600', 'font-semibold');
            }

            applyFilters();
            showToast(`Menampilkan periode ${label}`);
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
                const matchCategory = (selectedCat === 'ALL') || (m.category === selectedCat);
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
        function computeAggregates(startDate, endDate, branch, category, machineCode, keyword) {
            const targetMachines = masterMachines.filter(m => {
                const matchBranch = (branch === 'ALL') || (m.branch === branch);
                const matchCategory = (category === 'ALL') || (m.category === category);
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

                const uniqueProblems = [...new Set(logs.filter(l => l.problem && l.problem !== '-').map(l => `[${l.date.slice(8, 10)}/${l.date.slice(5, 7)}] ${l.problem}`))];
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
                const totalHours = totals.dtRepair + totals.dtPm;
                const dtRatio = totalHours > 0 ? ((totals.dtRepair / totalHours) * 100).toFixed(1) : '68.0';
                const pmRatio = totalHours > 0 ? ((totals.dtPm / totalHours) * 100).toFixed(1) : '32.0';
                dtSub.textContent = `PM Servis: ${totals.dtPm.toFixed(1)} Jam • Total: ${totalHours.toFixed(1)} Jam (${Math.round(dtRatio)}% : ${Math.round(pmRatio)}%)`;
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

            if (tabId === 'dt') renderMonthlyDtChart();
            if (tabId === 'cost') renderMonthlyCostChart();
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

        let isKioskEnabled = true;           // Status auto-cycle
        let isKioskUserInteracting = false;   // Sedang dijeda karena user sedang gerak mouse/klik
        let kioskIdleTimer = null;           // Timer deteksi kursor diam untuk resume
        let kioskCycleTimer = null;          // Timer pergantian tab setiap 6 detik

        function initKioskAutoCycle() {
            setupKioskEventListeners();
            startKioskCycle();
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

        function scrollToKpiScorecard() {
            const el = document.getElementById('sectionKpiScorecard');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                el.classList.add('ring-2', 'ring-blue-400');
                setTimeout(() => el.classList.remove('ring-2', 'ring-blue-400'), 2000);
            }
        }

        function toggleKpiScorecardTable() {
            const tableContainer = document.getElementById('kpiScorecardTableBody');
            const toggleText = document.getElementById('kpiScorecardToggleText');
            if (!tableContainer) return;
            const isHidden = tableContainer.classList.contains('hidden');
            if (isHidden) {
                tableContainer.classList.remove('hidden');
                if (toggleText) toggleText.textContent = 'Tutup Tabel ▲';
            } else {
                tableContainer.classList.add('hidden');
                if (toggleText) toggleText.textContent = 'Buka Tabel ▼';
            }
        }

        // UPDATE EXECUTIVE ANALYTICS SUMMARY
        function updateModularAnalytics(aggregated, totals, startDate, endDate) {
            // 1. Metrik DT
            const dtHoursEl = document.getElementById('dtSummaryHours');
            if (dtHoursEl) dtHoursEl.textContent = totals.dtRepair.toFixed(1);

            const totalHours = totals.dtRepair + totals.dtPm;
            const dtRatio = totalHours > 0 ? (totals.dtRepair / totalHours * 100) : 0;
            const pmRatio = totalHours > 0 ? (totals.dtPm / totalHours * 100) : 0;

            const dtRatioText = document.getElementById('dtRatioText');
            const pmRatioText = document.getElementById('pmRatioText');
            if (dtRatioText) dtRatioText.textContent = `${dtRatio.toFixed(1)}%`;
            if (pmRatioText) pmRatioText.textContent = `${pmRatio.toFixed(1)}%`;

            const dtBarRatio = document.getElementById('dtBarRatio');
            const pmBarRatio = document.getElementById('pmBarRatio');
            if (dtBarRatio) dtBarRatio.style.width = `${dtRatio.toFixed(1)}%`;
            if (pmBarRatio) pmBarRatio.style.width = `${pmRatio.toFixed(1)}%`;

            const dtHoursNominalText = document.getElementById('dtHoursNominalText');
            const pmHoursNominalText = document.getElementById('pmHoursNominalText');
            if (dtHoursNominalText) dtHoursNominalText.textContent = `DT: ${totals.dtRepair.toFixed(1)} Jam`;
            if (pmHoursNominalText) pmHoursNominalText.textContent = `PM: ${totals.dtPm.toFixed(1)} Jam`;

            // Rata-rata jam DT harian
            const s = new Date(startDate);
            const e = new Date(endDate);
            const diffDays = Math.max(1, Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1);
            const dailyAvg = (totals.dtRepair / diffDays).toFixed(1);
            const dtDailyAvgEl = document.getElementById('dtDailyAvg');
            if (dtDailyAvgEl) dtDailyAvgEl.textContent = `${dailyAvg} Jam`;

            const machinesWithDt = aggregated.filter(item => item.dtRepair > 0).length;
            const dtMachinesCountEl = document.getElementById('dtMachinesCount');
            if (dtMachinesCountEl) dtMachinesCountEl.textContent = `${machinesWithDt} Mesin`;

            const dtTicketCountEl = document.getElementById('dtTicketCount');
            if (dtTicketCountEl) dtTicketCountEl.textContent = `${totals.spkDt} SPK`;

            // Sebaran DT Cabang
            const branchDtTotals = { MMM: 0, MMG: 0, MMS: 0, MMN: 0 };
            const branchCostTotals = { MMM: 0, MMG: 0, MMS: 0, MMN: 0 };
            aggregated.forEach(item => {
                if (branchDtTotals[item.branch] !== undefined) branchDtTotals[item.branch] += item.dtRepair;
                if (branchCostTotals[item.branch] !== undefined) branchCostTotals[item.branch] += item.totalCost;
            });

            const maxBranchDt = Math.max(0.1, ...Object.values(branchDtTotals));
            ['MMM', 'MMG', 'MMS', 'MMN'].forEach(b => {
                const val = branchDtTotals[b];
                const pct = Math.min(100, (val / maxBranchDt) * 100);
                const bar = document.getElementById(`dtBranchBar_${b}`);
                const valEl = document.getElementById(`dtBranchVal_${b}`);
                if (bar) bar.style.width = `${pct}%`;
                if (valEl) valEl.textContent = `${val.toFixed(1)} Jam`;
            });

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

            // Update label aksi pada 4 kartu SPK dan KPI Card 3
            updateSpkWorkflowCardActions();

            // Jika tabel rincian workflow sedang terbuka, render ulang tabelnya
            if (currentWorkflowStatus) {
                renderWorkflowStatusTable();
            }

            // Sinkronisasi grafik bulanan
            renderMonthlyDtChart(totals.dtRepair, totals.dtPm);
            renderMonthlyCostChart(totals.totalCost, totals.costDt, totals.costPm);
        }

        function renderTop5Table(items) {
            const sortedByDt = [...items].sort((a, b) => b.totalHours - a.totalHours || b.dtRepair - a.dtRepair);
            const top5List = sortedByDt.filter(i => i.totalHours > 0).slice(0, 5);
            const tbody = document.getElementById('top5TableBody');

            if (top5List.length === 0) {
                tbody.innerHTML = renderEmptyRow(8, "Tidak ada data downtime pada periode dan filter yang dipilih.");
                return;
            }

            tbody.innerHTML = top5List.map((item, idx) => `
                <tr onclick="openMachineModal('${item.code}')" class="hover:bg-blue-50/60 cursor-pointer transition">
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center font-bold">
                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full ${idx === 0 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'} text-xs">${idx + 1}</span>
                    </td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-center">${getBranchBadge(item.branch)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 font-bold text-blue-700 whitespace-nowrap">${item.code}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-gray-800 font-medium">${item.unitName}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200">${getCategoryBadge(item.category)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-right font-semibold text-red-600">${item.dtRepair.toFixed(1)} Jam</td>
                    <td class="py-2.5 px-3 border-r border-gray-200 text-right font-bold text-gray-900 bg-red-50/50">${item.totalHours.toFixed(1)} Jam</td>
                    <td class="py-2.5 px-3 text-gray-700 text-xs">
                        <div class="line-clamp-2">${item.problemSummary}</div>
                        ${item.sparepartSummary !== '-' ? `<div class="text-[11px] text-gray-500 mt-0.5 font-medium line-clamp-1">Part: ${item.sparepartSummary}</div>` : ''}
                    </td>
                </tr>
            `).join('');
        }

        // ============================================================================
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
            const btn = document.getElementById('preset-nov-real');
            if (btn) {
                btn.classList.remove('bg-white', 'text-gray-700', 'border-gray-300', 'font-medium');
                btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600', 'font-semibold');
            }

            applyFilters();
            showToast("Filter direset ke periode data riil (01 - 10 Nov 2026).");
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
        if (typeof closeProjectModal === 'function') {
            closeProjectModal();
        }
    }
});

window.onload = function () {
    updateMachineDropdown();
    applyFilters();
    initKioskAutoCycle();
};