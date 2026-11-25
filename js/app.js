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

        let currentActivePreset = 'monthly';

        function clearActivePreset() {
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.classList.remove('bg-white', 'text-blue-700', 'font-bold', 'shadow-xs', 'border', 'border-gray-200/80');
                btn.classList.add('text-gray-600', 'font-medium');
            });
        }

        // Hitung rentang [startDate, endDate] secara dinamis berdasarkan 1 tanggal acuan terpilih
        function calculateDateRangeFromSelected(baseDateStr, preset) {
            if (!baseDateStr) baseDateStr = '2026-11-10';
            const parts = baseDateStr.split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[2], 10);
            const endDate = baseDateStr;
            let startDate = baseDateStr;
            let label = '';

            if (preset === 'daily') {
                startDate = endDate;
                label = `Harian (${formatDateIndo(endDate)})`;
            } else if (preset === 'weekly') {
                // Mengurangi 6 hari ke belakang (7 hari terakhir hingga tanggal terpilih)
                const d = new Date(year, month - 1, day);
                d.setDate(d.getDate() - 6);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const dt = String(d.getDate()).padStart(2, '0');
                startDate = `${y}-${m}-${dt}`;
                label = `Mingguan (7 Hari: ${formatDateIndo(startDate)} — ${formatDateIndo(endDate)})`;
            } else if (preset === 'yearly') {
                startDate = `${year}-01-01`;
                label = `Tahunan YtD (${formatDateIndo(startDate)} — ${formatDateIndo(endDate)})`;
            } else { // monthly (default)
                const m = String(month).padStart(2, '0');
                startDate = `${year}-${m}-01`;
                label = `Bulanan MtD (${formatDateIndo(startDate)} — ${formatDateIndo(endDate)})`;
            }

            return { startDate, endDate, label };
        }

        // ============================================================================
        // CUSTOM DATEPICKER CONTROLLER (FORMAT RESMI DD-MM-YYYY: HARI-BULAN-TAHUN)
        // ============================================================================
        let calendarViewYear = 2026;
        let calendarViewMonth = 10; // 0-indexed: 10 is November

        const monthNamesIndo = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        function toggleDatePickerPopup() {
            const popup = document.getElementById('datePickerPopup');
            if (!popup) return;
            const isHidden = popup.classList.contains('hidden');
            if (isHidden) {
                const curVal = document.getElementById('filterDate')?.value || '2026-11-10';
                const parts = curVal.split('-');
                if (parts.length === 3) {
                    calendarViewYear = parseInt(parts[0], 10);
                    calendarViewMonth = parseInt(parts[1], 10) - 1;
                }
                renderCustomCalendar();
                popup.classList.remove('hidden');
            } else {
                popup.classList.add('hidden');
            }
        }

        function hideDatePickerPopup() {
            const popup = document.getElementById('datePickerPopup');
            if (popup) popup.classList.add('hidden');
        }

        function navigateCalendarMonth(step) {
            calendarViewMonth += step;
            if (calendarViewMonth < 0) {
                calendarViewMonth = 11;
                calendarViewYear--;
            } else if (calendarViewMonth > 11) {
                calendarViewMonth = 0;
                calendarViewYear++;
            }
            renderCustomCalendar();
        }

        function renderCustomCalendar() {
            const headerText = document.getElementById('calendarMonthYearText');
            const grid = document.getElementById('calendarDaysGrid');
            if (!headerText || !grid) return;

            headerText.textContent = `${monthNamesIndo[calendarViewMonth]} ${calendarViewYear}`;

            const curVal = document.getElementById('filterDate')?.value || '2026-11-10';

            const firstDayOfWeek = new Date(calendarViewYear, calendarViewMonth, 1).getDay();
            const daysInMonth = new Date(calendarViewYear, calendarViewMonth + 1, 0).getDate();

            let html = '';

            for (let i = 0; i < firstDayOfWeek; i++) {
                html += `<div class="p-1.5 text-transparent select-none">-</div>`;
            }

            for (let d = 1; d <= daysInMonth; d++) {
                const mm = String(calendarViewMonth + 1).padStart(2, '0');
                const dd = String(d).padStart(2, '0');
                const isoStr = `${calendarViewYear}-${mm}-${dd}`;
                const isSelected = isoStr === curVal;

                // Batas rentang tanggal database yang valid (01 Ags 2026 - 30 Nov 2026)
                const isOutOfRange = isoStr < '2026-08-01' || isoStr > '2026-11-30';

                if (isOutOfRange) {
                    html += `<div class="p-1.5 text-gray-300 cursor-not-allowed text-[11px] select-none">${d}</div>`;
                } else if (isSelected) {
                    html += `<button type="button" onclick="selectCalendarDate('${isoStr}')"
                        class="p-1.5 bg-blue-600 text-white font-bold rounded-lg shadow-2xs text-[11px] cursor-pointer hover:bg-blue-700 transition">${d}</button>`;
                } else {
                    html += `<button type="button" onclick="selectCalendarDate('${isoStr}')"
                        class="p-1.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-semibold rounded-lg text-[11px] cursor-pointer transition">${d}</button>`;
                }
            }

            grid.innerHTML = html;
        }

        function selectCalendarDate(isoStr) {
            const filterDateEl = document.getElementById('filterDate');
            const filterDisplayEl = document.getElementById('filterDateDisplay');
            if (!filterDateEl || !filterDisplayEl) return;

            filterDateEl.value = isoStr;
            const parts = isoStr.split('-');
            if (parts.length === 3) {
                // Format DD-MM-YYYY (Hari-Bulan-Tahun) persis seperti Dashboard MMM
                filterDisplayEl.value = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }

            hideDatePickerPopup();
            onSingleDateChanged();
        }

        // Tutup popup saat klik di luar
        document.addEventListener('click', function (e) {
            const container = document.getElementById('datePickerContainer');
            const popup = document.getElementById('datePickerPopup');
            if (container && popup && !container.contains(e.target)) {
                popup.classList.add('hidden');
            }
        });

        // Handler perubahan tanggal tunggal pada input #filterDate
        function onSingleDateChanged() {
            const filterDateEl = document.getElementById('filterDate');
            const baseDate = filterDateEl ? filterDateEl.value : '2026-11-10';
            const { startDate, endDate, label } = calculateDateRangeFromSelected(baseDate, currentActivePreset);

            if (document.getElementById('startDate')) document.getElementById('startDate').value = startDate;
            if (document.getElementById('endDate')) document.getElementById('endDate').value = endDate;

            tablePaginationState.dt = { page: 1, pageSize: 10 };
            tablePaginationState.cost = { page: 1, pageSize: 10 };
            tablePaginationState.spk = { page: 1, pageSize: 10 };
            if (document.getElementById('pageSizeDt')) document.getElementById('pageSizeDt').value = '10';
            if (document.getElementById('pageSizeCost')) document.getElementById('pageSizeCost').value = '10';
            if (document.getElementById('pageSizeSpk')) document.getElementById('pageSizeSpk').value = '10';

            applyFilters();
            showToast(`Filter tanggal diubah: ${label}`);
        }

        function setPeriodPreset(type) {
            currentActivePreset = type;
            clearActivePreset();

            const filterDateEl = document.getElementById('filterDate');
            const baseDate = filterDateEl ? filterDateEl.value : '2026-11-10';
            const { startDate, endDate, label } = calculateDateRangeFromSelected(baseDate, type);

            if (document.getElementById('startDate')) document.getElementById('startDate').value = startDate;
            if (document.getElementById('endDate')) document.getElementById('endDate').value = endDate;

            tablePaginationState.dt = { page: 1, pageSize: 10 };
            tablePaginationState.cost = { page: 1, pageSize: 10 };
            tablePaginationState.spk = { page: 1, pageSize: 10 };
            if (document.getElementById('pageSizeDt')) document.getElementById('pageSizeDt').value = '10';
            if (document.getElementById('pageSizeCost')) document.getElementById('pageSizeCost').value = '10';
            if (document.getElementById('pageSizeSpk')) document.getElementById('pageSizeSpk').value = '10';

            document.querySelectorAll(`.preset-btn[data-preset="${type}"]`).forEach(btn => {
                btn.classList.remove('text-gray-600', 'font-medium');
                btn.classList.add('bg-white', 'text-blue-700', 'font-bold', 'shadow-xs', 'border', 'border-gray-200/80');
            });

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

            // Update panelView_prj header badges
            const prjHeaderTotal = document.getElementById('prjHeaderTotalVal');
            const prjHeaderCompleted = document.getElementById('prjHeaderCompletedVal');
            const prjHeaderActive = document.getElementById('prjHeaderActiveVal');
            if (prjHeaderTotal) prjHeaderTotal.textContent = `${branchProjects.length} Proyek`;
            const donePrjCount = branchProjects.filter(p => p.status === 'SELESAI').length;
            const activeProjectsCount = branchProjects.length - donePrjCount;
            if (prjHeaderCompleted) prjHeaderCompleted.textContent = `${donePrjCount} Selesai`;
            if (prjHeaderActive) prjHeaderActive.textContent = `${activeProjectsCount} Berjalan`;
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

        // FUNGSI GANTI FOKUS MODUL (SLIM TAB BAR RESMI PERUSAHAAN MMM)
        function switchDashboardTab(tabId) {
            currentActiveDashboardTab = tabId;
            const tabs = ['dt', 'cost', 'spk', 'prj'];

            tabs.forEach(t => {
                const tabBtn = document.getElementById(`tabNav_${t}`);
                const panel = document.getElementById(`panelView_${t}`);

                if (t === tabId) {
                    if (tabBtn) {
                        tabBtn.classList.remove('border-transparent', 'text-gray-500');
                        tabBtn.classList.add('border-blue-600', 'text-blue-600', 'font-bold');
                        const icon = tabBtn.querySelector('svg');
                        if (icon) {
                            icon.classList.remove('text-gray-400', 'group-hover:text-amber-600', 'group-hover:text-blue-600', 'group-hover:text-indigo-600');
                            icon.classList.add('text-blue-600');
                        }
                    }
                    if (panel) panel.classList.remove('hidden');
                } else {
                    if (tabBtn) {
                        tabBtn.classList.remove('border-blue-600', 'text-blue-600', 'font-bold');
                        tabBtn.classList.add('border-transparent', 'text-gray-500', 'font-medium');
                        const icon = tabBtn.querySelector('svg');
                        if (icon) {
                            icon.classList.remove('text-blue-600');
                            icon.classList.add('text-gray-400');
                        }
                    }
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

            const subtitleEl = document.getElementById('dtBreakdownModalSubtitle');
            if (subtitleEl) subtitleEl.textContent = `Rincian seluruh tiket kerusakan & riwayat perbaikan mesin ${machine.code} (Murni DT)`;

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

            const subtitleEl = document.getElementById('dtBreakdownModalSubtitle');
            if (subtitleEl) subtitleEl.textContent = `Rincian tiket SPK kerusakan riil kategori ${cat.name} (Murni DT)`;

            showDtBreakdownModal();
        }

        let currentPlantModalBranch = 'MMM';
        let currentPlantModalLogs = [];
        let plantModalTicketFilterType = 'ALL';

        function openPlantCostBreakdown(branch) {
            currentPlantModalBranch = branch;
            const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
            const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';
            const branchNameMap = { MMM: 'Sidoarjo', MMN: 'Nganjuk', MMS: 'Serang', MMG: 'Malang' };
            const branchColorMap = {
                MMM: 'bg-blue-600',
                MMN: 'bg-purple-600',
                MMS: 'bg-amber-500',
                MMG: 'bg-emerald-600'
            };

            const allActiveLogs = dailyMaintenanceLogs.filter(l =>
                (!startDate || l.date >= startDate) &&
                (!endDate || l.date <= endDate) &&
                ((l.costDt || 0) > 0 || (l.costPm || 0) > 0)
            );
            const grandTotalCost = allActiveLogs.reduce((s, l) => s + (l.costDt || 0) + (l.costPm || 0), 0) || 1;

            const logs = allActiveLogs.filter(l => l.branch === branch);
            logs.sort((a, b) => ((b.costDt || 0) + (b.costPm || 0)) - ((a.costDt || 0) + (a.costPm || 0)));

            currentPlantModalLogs = logs;

            const dtCost = logs.reduce((s, l) => s + (l.costDt || 0), 0);
            const pmCost = logs.reduce((s, l) => s + (l.costPm || 0), 0);
            const totalCost = dtCost + pmCost;
            const sharePct = ((totalCost / grandTotalCost) * 100).toFixed(1);
            const dtPct = totalCost > 0 ? (dtCost / totalCost * 100) : 0;
            const pmPct = totalCost > 0 ? (pmCost / totalCost * 100) : 0;

            // 1. Header Modal
            const badgeEl = document.getElementById('plantModalBranchBadge');
            if (badgeEl) {
                badgeEl.textContent = branch;
                badgeEl.className = `px-2.5 py-1 rounded-lg text-xs sm:text-sm font-black text-white shadow-xs ${branchColorMap[branch] || 'bg-blue-600'}`;
            }
            const titleEl = document.getElementById('plantModalTitle');
            if (titleEl) titleEl.textContent = `Cost & Maintenance Breakdown — ${branch} (${branchNameMap[branch] || ''})`;
            const shareBadge = document.getElementById('plantModalShareBadge');
            if (shareBadge) shareBadge.textContent = `${sharePct}% Share`;
            const totalVal = document.getElementById('plantModalTotalVal');
            if (totalVal) totalVal.textContent = formatIDR(totalCost);

            // 2. Card 1: Rasio DT vs PM
            const periodLabelEl = document.getElementById('plantModalPeriodBadge');
            if (periodLabelEl) {
                const sLabel = startDate ? formatDateIndo(startDate) : '01 Nov 2026';
                const eLabel = endDate ? formatDateIndo(endDate) : '10 Nov 2026';
                periodLabelEl.textContent = `${sLabel} — ${eLabel}`;
            }
            const dtPctEl = document.getElementById('plantModalDtPct');
            const pmPctEl = document.getElementById('plantModalPmPct');
            if (dtPctEl) dtPctEl.textContent = `${dtPct.toFixed(1)}%`;
            if (pmPctEl) pmPctEl.textContent = `${pmPct.toFixed(1)}%`;
            const dtBar = document.getElementById('plantModalDtBar');
            const pmBar = document.getElementById('plantModalPmBar');
            if (dtBar) dtBar.style.width = `${dtPct}%`;
            if (pmBar) pmBar.style.width = `${pmPct}%`;
            const dtValEl = document.getElementById('plantModalDtVal');
            const pmValEl = document.getElementById('plantModalPmVal');
            if (dtValEl) dtValEl.textContent = `DT: ${formatIDR(dtCost)}`;
            if (pmValEl) pmValEl.textContent = `PM: ${formatIDR(pmCost)}`;

            plantModalSpecificFilter = null;

            // 3. Card 2: Kategori Biaya di Pabrik Ini (#plantModalCategoryTableBody)
            const catTbody = document.getElementById('plantModalCategoryTableBody');
            if (catTbody) {
                const catTotals = {};
                Object.keys(PROBLEM_CATEGORIES).forEach(k => {
                    catTotals[k] = { ...PROBLEM_CATEGORIES[k], cost: 0, count: 0 };
                });
                logs.forEach(l => {
                    const c = (l.costDt || 0) + (l.costPm || 0);
                    if (c <= 0) return;
                    const cat = classifyProblem(l.problem);
                    if (catTotals[cat.key]) {
                        catTotals[cat.key].cost += c;
                        catTotals[cat.key].count += 1;
                    }
                });
                const sortedCats = Object.values(catTotals).sort((a, b) => b.cost - a.cost);
                const plantCostBasis = Math.max(1, totalCost);
                catTbody.innerHTML = sortedCats.map(cat => {
                    const sh = ((cat.cost / plantCostBasis) * 100).toFixed(1);
                    return `
                        <tr onclick="filterPlantModalByCategory('${cat.key}')" class="hover:bg-amber-100/70 cursor-pointer transition">
                            <td class="py-1.5 px-2.5 font-medium text-gray-800">
                                <div class="flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full inline-block shrink-0" style="background-color: ${cat.color}"></span>
                                    <span class="truncate max-w-[150px]" title="${cat.name}">${cat.name}</span>
                                </div>
                            </td>
                            <td class="py-1.5 px-2 text-right font-bold text-gray-900 whitespace-nowrap">${formatIDR(cat.cost)}</td>
                            <td class="py-1.5 pr-3 text-right font-semibold text-gray-600 whitespace-nowrap">${sh}%</td>
                        </tr>
                    `;
                }).join('');
            }

            // 4. Card 3: Top 5 Mesin Paling Boros di Pabrik Ini (#plantModalTopMachinesTableBody)
            const topTbody = document.getElementById('plantModalTopMachinesTableBody');
            if (topTbody) {
                const machineTotals = {};
                logs.forEach(l => {
                    const c = (l.costDt || 0) + (l.costPm || 0);
                    if (c <= 0) return;
                    if (!machineTotals[l.code]) {
                        const mObj = masterMachines.find(m => m.code === l.code) || { code: l.code, name: l.code, unitName: '' };
                        machineTotals[l.code] = {
                            code: l.code,
                            unitName: mObj.unitName || mObj.name || '',
                            totalCost: 0,
                            costDt: 0,
                            costPm: 0,
                            topPart: l.sparepart || l.problem || '-'
                        };
                    }
                    machineTotals[l.code].totalCost += c;
                    machineTotals[l.code].costDt += (l.costDt || 0);
                    machineTotals[l.code].costPm += (l.costPm || 0);
                });
                const top5Machines = Object.values(machineTotals).sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);
                if (top5Machines.length === 0) {
                    topTbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-gray-400 italic">Tidak ada data mesin.</td></tr>';
                } else {
                    topTbody.innerHTML = top5Machines.map((m, idx) => {
                        const dtShare = m.totalCost > 0 ? (m.costDt / m.totalCost * 100) : 0;
                        const tagHtml = dtShare >= 75
                            ? '<span class="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 block mt-0.5">DT Dominan</span>'
                            : (dtShare <= 25 ? '<span class="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200 block mt-0.5">PM Dominan</span>'
                            : '<span class="text-[9px] font-semibold text-slate-500 bg-slate-50 px-1 py-0.2 rounded border border-slate-200 block mt-0.5">DT & PM</span>');
                        return `
                            <tr onclick="filterPlantModalByMachine('${m.code}')" class="hover:bg-amber-100/70 cursor-pointer transition">
                                <td class="py-1.5 px-2 text-center font-bold text-gray-400">${idx + 1}</td>
                                <td class="py-1.5 px-2 font-bold text-gray-800 whitespace-nowrap">
                                    ${m.code}
                                    <span class="text-[10px] font-normal text-gray-500 block truncate max-w-[110px]">${m.unitName}</span>
                                </td>
                                <td class="py-1.5 px-2 text-gray-600 text-[11px] truncate max-w-[150px]" title="${m.topPart}">${m.topPart}</td>
                                <td class="py-1.5 pr-3 text-right whitespace-nowrap">
                                    <span class="font-bold text-amber-700">${formatIDR(m.totalCost)}</span>
                                    ${tagHtml}
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
            }

            // 5. Right Column: Plant Trend History Chart
            const trendHeader = document.getElementById('plantModalTrendHeader');
            const presetUpper = (currentActivePreset || 'monthly').toUpperCase();
            if (trendHeader) trendHeader.textContent = `COST TREND HISTORY (${presetUpper}) — ${branch} (${branchNameMap[branch] || ''})`;

            // Hitung data harian khusus pabrik ini
            const sDate = startDate ? new Date(startDate) : new Date('2026-11-01');
            const eDate = endDate ? new Date(endDate) : new Date('2026-11-10');
            const pLabels = [];
            const pValues = [];
            const pSpikes = [];
            const cur = new Date(sDate);
            const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

            while (cur <= eDate) {
                const yyyy = cur.getFullYear();
                const mm = String(cur.getMonth() + 1).padStart(2, '0');
                const dd = String(cur.getDate()).padStart(2, '0');
                const dStr = `${yyyy}-${mm}-${dd}`;
                pLabels.push(`${dd} ${mNames[cur.getMonth()]}`);

                const bLogsOnDate = logs.filter(l => l.date === dStr);
                const dCost = bLogsOnDate.reduce((sum, l) => sum + (l.costDt || 0) + (l.costPm || 0), 0);
                const dCostDt = bLogsOnDate.reduce((sum, l) => sum + (l.costDt || 0), 0);
                const dCostPm = bLogsOnDate.reduce((sum, l) => sum + (l.costPm || 0), 0);
                pValues.push(dCost);

                const topBLog = [...bLogsOnDate].sort((a, b) => ((b.costDt || 0) + (b.costPm || 0)) - ((a.costDt || 0) + (a.costPm || 0)))[0];
                const topBCause = topBLog
                    ? `${topBLog.code}: ${topBLog.sparepart || topBLog.problem || 'Perbaikan Mesin'}`
                    : 'Operasional Standar';

                pSpikes.push({
                    cost: dCost,
                    costDt: dCostDt,
                    costPm: dCostPm,
                    cause: topBCause,
                    topCode: topBLog ? topBLog.code : '',
                    date: dStr
                });
                cur.setDate(cur.getDate() + 1);
            }

            const pCountDays = Math.max(1, pValues.length);
            const pSum = pValues.reduce((a, b) => a + b, 0);
            const pAvg = pSum / pCountDays;
            const pPeak = pValues.length > 0 ? Math.max(...pValues) : 0;
            const pPeakIdx = pValues.indexOf(pPeak);
            const pPeakDate = (pPeakIdx >= 0 && pPeak > 0) ? pLabels[pPeakIdx] : '-';
            const pLatest = pValues.length > 0 ? pValues[pValues.length - 1] : 0;

            const stLatest = document.getElementById('plantModalStatLatest');
            const stAvg = document.getElementById('plantModalStatAvg');
            const stPeak = document.getElementById('plantModalStatPeak');
            const stPeakDate = document.getElementById('plantModalStatPeakDate');
            if (stLatest) stLatest.textContent = formatIDR(pLatest);
            if (stAvg) stAvg.textContent = `${formatIDR(pAvg)}/H`;
            if (stPeak) stPeak.textContent = formatIDR(pPeak);
            if (stPeakDate) stPeakDate.textContent = `(${pPeakDate})`;

            // Spikes Container
            const spikesContainer = document.getElementById('plantModalSpikesContainer');
            if (spikesContainer) {
                const targetThreshold = (branch === 'MMM') ? 6000000 : 2500000;
                const activeSpikes = pSpikes.filter(s => s.cost > targetThreshold);
                if (activeSpikes.length === 0) {
                    spikesContainer.innerHTML = '<span class="text-[11px] text-gray-400 italic">Pengeluaran harian cabang ini terkendali dalam batas toleransi.</span>';
                } else {
                    spikesContainer.innerHTML = activeSpikes.map(sp => {
                        const dL = `${sp.date.slice(8, 10)} Nov`;
                        return `
                            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-left whitespace-nowrap shadow-2xs">
                                <span class="font-bold">📅 ${dL}:</span>
                                <span class="font-black text-amber-700">${formatIDR(sp.cost)}</span>
                                <span class="text-gray-300">|</span>
                                <span class="truncate max-w-[170px] font-medium text-slate-700">${sp.cause}</span>
                            </div>
                        `;
                    }).join('');
                }
            }

            // Render Chart
            setTimeout(() => {
                const plantTarget = (branch === 'MMM') ? 6000000 : 2500000;
                if (typeof renderPlantCostModalTrendChart === 'function') {
                    renderPlantCostModalTrendChart(pLabels, pValues, pSpikes, plantTarget);
                }
            }, 60);

            // 6. Accordion Tiket SPK
            const ticketCountEl = document.getElementById('plantModalTicketCount');
            if (ticketCountEl) ticketCountEl.textContent = logs.length;
            plantModalTicketFilterType = 'ALL';
            renderPlantModalTicketsTable(logs);

            // Open Modal
            const modal = document.getElementById('plantCostBreakdownModal');
            if (modal) modal.classList.remove('hidden');
        }

        function closePlantCostBreakdownModal() {
            closePlantTicketsListModal();
            const modal = document.getElementById('plantCostBreakdownModal');
            if (modal) modal.classList.add('hidden');
            if (typeof plantCostModalChartInstance !== 'undefined' && plantCostModalChartInstance) {
                plantCostModalChartInstance.destroy();
                plantCostModalChartInstance = null;
            }
        }

        function closePlantCostModalOnBackdrop(e) {
            if (e.target.id === 'plantCostBreakdownModal') {
                closePlantCostBreakdownModal();
            }
        }

        function openPlantTicketsListModal() {
            const modal = document.getElementById('plantTicketsListModal');
            if (!modal) return;

            const searchInput = document.getElementById('plantModalTicketSearchInput');
            if (searchInput) searchInput.value = '';

            // Sinkronkan judul modal dengan cabang yang sedang dibuka
            const branchTitleEl = document.getElementById('plantModalTitle');
            const ticketsTitleEl = document.getElementById('plantTicketsModalTitle');
            if (ticketsTitleEl) {
                const branchLabel = branchTitleEl ? branchTitleEl.textContent.replace(/^Cost & Maintenance Breakdown —\s*/i, '') : currentPlantModalBranch;
                ticketsTitleEl.textContent = `Rincian Tiket SPK — ${branchLabel}`;
            }

            applyPlantModalTicketsFilter();
            modal.classList.remove('hidden');
        }

        function closePlantTicketsListModal() {
            const modal = document.getElementById('plantTicketsListModal');
            if (modal) modal.classList.add('hidden');
        }

        function closePlantTicketsListModalOnBackdrop(e) {
            if (e.target.id === 'plantTicketsListModal') {
                closePlantTicketsListModal();
            }
        }

        function togglePlantModalTicketsTable() {
            openPlantTicketsListModal();
        }

        let plantModalSpecificFilter = null;

        function filterPlantModalByCategory(catKey) {
            const cat = PROBLEM_CATEGORIES[catKey] || PROBLEM_CATEGORIES.sensor_other;
            plantModalSpecificFilter = { type: 'cat', key: catKey, label: `Kategori ${cat.name}` };
            openPlantTicketsListModal();
        }

        function filterPlantModalByMachine(machineCode) {
            const mObj = masterMachines.find(m => m.code === machineCode) || { code: machineCode, unitName: '' };
            plantModalSpecificFilter = { type: 'machine', code: machineCode, label: `Mesin ${machineCode} (${mObj.unitName || ''})` };
            openPlantTicketsListModal();
        }

        function clearPlantModalSpecificFilter() {
            plantModalSpecificFilter = null;
            applyPlantModalTicketsFilter();
        }

        function openPlantTicketsAccordionWithFilter() {
            openPlantTicketsListModal();
        }

        function setPlantTicketFilter(type) {
            plantModalTicketFilterType = type;
            ['ALL', 'DT', 'PM'].forEach(t => {
                const btn = document.getElementById(`btnFilterPlantTicket_${t}`);
                if (!btn) return;
                if (t === type) {
                    btn.className = 'px-2.5 py-1 rounded-md transition text-slate-900 bg-white shadow-2xs font-bold cursor-pointer';
                } else {
                    btn.className = 'px-2.5 py-1 rounded-md transition text-slate-600 hover:text-slate-900 font-semibold cursor-pointer';
                }
            });
            applyPlantModalTicketsFilter();
        }

        function filterPlantModalTickets(keyword) {
            applyPlantModalTicketsFilter();
        }

        function applyPlantModalTicketsFilter() {
            const banner = document.getElementById('plantModalActiveFilterBanner');
            const filterText = document.getElementById('plantModalActiveFilterText');
            const filterCount = document.getElementById('plantModalActiveFilterCount');
            const searchInput = document.getElementById('plantModalTicketSearchInput');
            const kw = (searchInput ? searchInput.value : '').toLowerCase().trim();

            let logs = currentPlantModalLogs;

            // Filter spesifik (Kategori atau Mesin)
            if (plantModalSpecificFilter) {
                if (plantModalSpecificFilter.type === 'cat') {
                    logs = logs.filter(l => classifyProblem(l.problem).key === plantModalSpecificFilter.key);
                } else if (plantModalSpecificFilter.type === 'machine') {
                    logs = logs.filter(l => l.code === plantModalSpecificFilter.code);
                }
                if (banner) {
                    banner.classList.remove('hidden');
                    banner.classList.add('flex');
                }
                if (filterText) filterText.textContent = plantModalSpecificFilter.label;
                if (filterCount) filterCount.textContent = `${logs.length} Tiket`;
            } else {
                if (banner) {
                    banner.classList.add('hidden');
                    banner.classList.remove('flex');
                }
            }

            // Filter tipe (ALL / DT / PM)
            if (plantModalTicketFilterType === 'DT') {
                logs = logs.filter(l => !isPmLog(l));
            } else if (plantModalTicketFilterType === 'PM') {
                logs = logs.filter(l => isPmLog(l));
            }

            // Filter keyword
            if (kw) {
                logs = logs.filter(l =>
                    (l.ticketCode && l.ticketCode.toLowerCase().includes(kw)) ||
                    (l.problem && l.problem.toLowerCase().includes(kw)) ||
                    (l.sparepart && l.sparepart.toLowerCase().includes(kw)) ||
                    (l.code && l.code.toLowerCase().includes(kw)) ||
                    (l.date && l.date.includes(kw))
                );
            }

            renderPlantModalTicketsTable(logs);
        }

        function togglePlantTicketDetailRow(idx) {
            const detailRow = document.getElementById(`plantTicketDetailRow_${idx}`);
            const chevronEl = document.getElementById(`plantTicketChevron_${idx}`);
            const mainRow = document.getElementById(`plantTicketMainRow_${idx}`);
            if (!detailRow) return;

            const isHidden = detailRow.classList.contains('hidden');
            detailRow.classList.toggle('hidden');

            if (chevronEl) {
                chevronEl.textContent = isHidden ? '▾' : '▸';
                chevronEl.classList.toggle('text-blue-600', isHidden);
                chevronEl.classList.toggle('text-gray-400', !isHidden);
            }
            if (mainRow) {
                mainRow.classList.toggle('bg-blue-50/70', isHidden);
            }
        }

        function formatSparepartDetailList(rawText) {
            if (!rawText || rawText === '-') {
                return '<p class="text-xs text-gray-400 italic">Tidak ada catatan sparepart atau tindakan tambahan.</p>';
            }
            // Pisahkan antara daftar sparepart dan bagian Tindakan (biasanya dipisah tanda "•")
            const mainSections = String(rawText).split('•').map(s => s.trim()).filter(Boolean);
            return mainSections.map(sec => {
                if (sec.toLowerCase().startsWith('tindakan:')) {
                    const actionBody = sec.replace(/^tindakan:\s*/i, '').trim();
                    return `
                        <div class="mt-2 pt-2 border-t border-slate-200/80">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">Tindakan Perbaikan:</span>
                            <p class="text-xs text-gray-700 leading-relaxed">${actionBody}</p>
                        </div>
                    `;
                }
                const items = sec.split(';').map(i => i.trim()).filter(Boolean);
                if (items.length <= 1) {
                    return `<p class="text-xs text-gray-700 leading-relaxed">${sec}</p>`;
                }
                return `
                    <ul class="space-y-1 text-xs text-gray-700">
                        ${items.map(it => `
                            <li class="flex items-start gap-1.5 leading-snug">
                                <span class="text-amber-600 font-bold mt-0.5">•</span>
                                <span>${it}</span>
                            </li>
                        `).join('')}
                    </ul>
                `;
            }).join('');
        }

        function renderPlantModalTicketsTable(logs) {
            const tbody = document.getElementById('plantModalTicketsTableBody');
            const costBadge = document.getElementById('plantTicketsModalCostBadge');
            const footerInfo = document.getElementById('plantTicketsModalFooterInfo');

            const sumCost = logs.reduce((s, l) => s + (l.costDt || 0) + (l.costPm || 0), 0);
            if (costBadge) costBadge.textContent = `Total: ${formatIDR(sumCost)} (${logs.length} Tiket)`;
            if (footerInfo) footerInfo.textContent = `Menampilkan ${logs.length} tiket SPK pemeliharaan`;

            if (!tbody) return;
            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-gray-400 italic">Tidak ada tiket yang cocok dengan filter ini.</td></tr>';
                return;
            }
            tbody.innerHTML = logs.map((log, idx) => {
                const isPm = isPmLog(log);
                const cost = (log.costDt || 0) + (log.costPm || 0);
                const typeBadge = isPm
                    ? '<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mt-0.5">PM • Perawatan</span>'
                    : '<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mt-0.5">DT • Kerusakan</span>';
                const costValHtml = isPm
                    ? `<span class="font-bold text-blue-700 whitespace-nowrap">${formatIDR(cost)}</span>`
                    : `<span class="font-bold text-amber-700 whitespace-nowrap">${formatIDR(cost)}</span>`;
                const formattedDate = log.date ? `${log.date.slice(8, 10)}/${log.date.slice(5, 7)}/${log.date.slice(0, 4)}` : '-';

                const mObj = masterMachines.find(m => m.code === log.code) || { unitName: '' };
                const sparepartHtml = formatSparepartDetailList(log.sparepart);

                return `
                    <tr class="hover:bg-blue-50/40 transition border-b border-gray-100 align-top">
                        <td class="py-2.5 pl-3 pr-2 text-center font-bold text-gray-400 whitespace-nowrap">${idx + 1}</td>
                        <td class="py-2.5 px-2.5 whitespace-nowrap">
                            <span class="font-mono font-bold text-blue-700 block">${log.ticketCode || '-'}</span>
                            ${typeBadge}
                        </td>
                        <td class="py-2.5 px-2 text-center text-gray-600 whitespace-nowrap">${formattedDate}</td>
                        <td class="py-2.5 px-2.5 whitespace-nowrap">
                            <span class="font-bold text-gray-800 block">${log.code}</span>
                            <span class="text-[10px] text-gray-500 block truncate max-w-[120px]" title="${mObj.unitName || ''}">${mObj.unitName || ''}</span>
                        </td>
                        <td class="py-2.5 px-3 text-gray-800 leading-relaxed min-w-[200px]">${log.problem || '-'}</td>
                        <td class="py-2.5 px-3 text-gray-600 min-w-[240px]">${sparepartHtml}</td>
                        <td class="py-2.5 pr-4 pl-2 text-right whitespace-nowrap">${costValHtml}</td>
                    </tr>
                `;
            }).join('');
        }

        function openCostCategoryBreakdown(catKey) {
            const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
            const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';
            const branch = document.getElementById('filterBranch') ? document.getElementById('filterBranch').value : 'ALL';
            const cat = PROBLEM_CATEGORIES[catKey] || PROBLEM_CATEGORIES.sensor_other;

            const logs = dailyMaintenanceLogs.filter(l => {
                const cost = (l.costDt || 0) + (l.costPm || 0);
                if (cost <= 0) return false;
                const matchBranch = (branch === 'ALL') || (l.branch === branch);
                const matchDate = (!startDate || l.date >= startDate) && (!endDate || l.date <= endDate);
                const matchCat = classifyProblem(l.problem).key === catKey;
                return matchBranch && matchDate && matchCat;
            });

            logs.sort((a, b) => ((b.costDt || 0) + (b.costPm || 0)) - ((a.costDt || 0) + (a.costPm || 0)));
            const totalCost = logs.reduce((sum, l) => sum + (l.costDt || 0) + (l.costPm || 0), 0);

            activeBreakdownData = {
                title: `Kategori Biaya: ${cat.name}`,
                hours: totalCost,
                isCostMode: true,
                isSpkMode: false,
                allLogs: logs,
                filteredLogs: logs
            };

            const subtitleEl = document.getElementById('dtBreakdownModalSubtitle');
            if (subtitleEl) subtitleEl.textContent = `Rincian tiket pengeluaran biaya perbaikan & pembelian sparepart kategori ${cat.name}`;

            showDtBreakdownModal();
        }

        function openMachineCostBreakdown(machineCode) {
            const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
            const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';
            const branch = document.getElementById('filterBranch') ? document.getElementById('filterBranch').value : 'ALL';
            const machine = masterMachines.find(m => m.code === machineCode) || { code: machineCode, unitName: '' };

            const logs = dailyMaintenanceLogs.filter(l => {
                const cost = (l.costDt || 0) + (l.costPm || 0);
                if (cost <= 0) return false;
                const matchBranch = (branch === 'ALL') || (l.branch === branch);
                const matchDate = (!startDate || l.date >= startDate) && (!endDate || l.date <= endDate);
                return matchBranch && matchDate && l.code === machineCode;
            });

            logs.sort((a, b) => ((b.costDt || 0) + (b.costPm || 0)) - ((a.costDt || 0) + (a.costPm || 0)));
            const totalCost = logs.reduce((sum, l) => sum + (l.costDt || 0) + (l.costPm || 0), 0);

            activeBreakdownData = {
                title: `Rincian Biaya Mesin: ${machine.code} — ${machine.unitName || ''}`,
                hours: totalCost,
                isCostMode: true,
                isSpkMode: false,
                allLogs: logs,
                filteredLogs: logs
            };

            const subtitleEl = document.getElementById('dtBreakdownModalSubtitle');
            if (subtitleEl) subtitleEl.textContent = `Rincian seluruh pengeluaran biaya perbaikan & sparepart mesin ${machine.code}`;

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

        let activeCostBreakdownType = 'ALL';

        function setCostBreakdownTypeFilter(type) {
            activeCostBreakdownType = type;
            updateCostBreakdownFilterButtons();
            const searchInput = document.getElementById('dtBreakdownSearchInput');
            filterDtBreakdownTable(searchInput ? searchInput.value : '');
        }

        function updateCostBreakdownFilterButtons() {
            ['ALL', 'DT', 'PM'].forEach(t => {
                const btn = document.getElementById(`btnFilterCostType_${t}`);
                if (!btn) return;
                if (t === activeCostBreakdownType) {
                    btn.className = 'px-2.5 py-1 rounded-md transition text-slate-900 bg-white shadow-2xs font-bold cursor-pointer';
                } else {
                    btn.className = 'px-2.5 py-1 rounded-md transition text-slate-600 hover:text-slate-900 font-semibold cursor-pointer';
                }
            });
        }

        function showDtBreakdownModal() {
            const modal = document.getElementById('dtBreakdownModal');
            if (!modal) return;

            activeCostBreakdownType = 'ALL';
            const titleEl = document.getElementById('dtBreakdownModalTitle');
            const badgeEl = document.getElementById('dtBreakdownModalHoursBadge');
            const searchInput = document.getElementById('dtBreakdownSearchInput');
            const filterGroup = document.getElementById('costBreakdownTypeFilterGroup');

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

            if (filterGroup) {
                if (activeBreakdownData.isCostMode || activeBreakdownData.isSpkMode) {
                    filterGroup.classList.remove('hidden');
                    filterGroup.classList.add('flex');
                    const allCount = activeBreakdownData.allLogs.length;
                    const dtCount = activeBreakdownData.allLogs.filter(l => !isPmLog(l)).length;
                    const pmCount = activeBreakdownData.allLogs.filter(l => isPmLog(l)).length;
                    const cntAll = document.getElementById('costTypeCount_ALL');
                    const cntDt = document.getElementById('costTypeCount_DT');
                    const cntPm = document.getElementById('costTypeCount_PM');
                    if (cntAll) cntAll.textContent = allCount;
                    if (cntDt) cntDt.textContent = dtCount;
                    if (cntPm) cntPm.textContent = pmCount;
                    updateCostBreakdownFilterButtons();
                } else {
                    filterGroup.classList.add('hidden');
                    filterGroup.classList.remove('flex');
                }
            }

            if (searchInput) searchInput.value = '';

            activeBreakdownData.filteredLogs = activeBreakdownData.allLogs;
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
                if (isCost) {
                    let typeNote = 'gabungan';
                    if (activeCostBreakdownType === 'DT') typeNote = 'murni kerusakan (DT)';
                    else if (activeCostBreakdownType === 'PM') typeNote = 'perawatan rutin (PM)';
                    summaryText.textContent = `Menampilkan ${logs.length} tiket SPK biaya ${typeNote}`;
                } else if (isSpk) {
                    summaryText.textContent = `Menampilkan ${logs.length} tiket SPK pada periode aktif`;
                } else {
                    summaryText.textContent = `Menampilkan ${logs.length} tiket SPK kerusakan riil pada periode aktif (Murni DT, Tanpa PM)`;
                }
            }

            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="py-8 text-center text-gray-400 italic">Tidak ada tiket yang cocok dengan pencarian / filter tipe.</td></tr>';
                return;
            }

            const totalBasis = activeBreakdownData.hours || 1;
            tbody.innerHTML = logs.map((log, idx) => {
                const dt = log.dtRepair || 0;
                const cost = (log.costDt || 0) + (log.costPm || 0);
                const metricVal = isCost ? cost : dt;
                const pct = totalBasis > 0 ? ((metricVal / totalBasis) * 100).toFixed(1) : '0.0';
                const formattedDate = log.date ? `${log.date.slice(8, 10)}/${log.date.slice(5, 7)}/${log.date.slice(0, 4)}` : '-';
                const isPm = isPmLog(log);

                let colValHtml = `<span class="font-bold text-red-600 whitespace-nowrap">${dt.toFixed(1)} Jam</span>`;
                let typeBadge = '';
                if (isCost || isSpk) {
                    if (isPm) {
                        colValHtml = isCost
                            ? `<span class="font-bold text-blue-700 whitespace-nowrap">${formatIDR(cost)}</span>`
                            : `<span class="font-bold text-blue-700 whitespace-nowrap">${dt > 0 ? dt.toFixed(1) + ' Jam' : '0.0 Jam (PM)'}</span>`;
                        typeBadge = `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mt-1">PM • Perawatan</span>`;
                    } else {
                        colValHtml = isCost
                            ? `<span class="font-bold text-amber-700 whitespace-nowrap">${formatIDR(cost)}</span>`
                            : `<span class="font-bold text-red-600 whitespace-nowrap">${dt > 0 ? dt.toFixed(1) + ' Jam' : '0.0 Jam (DT)'}</span>`;
                        typeBadge = `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mt-1">DT • Kerusakan</span>`;
                    }
                }

                return `
                    <tr class="hover:bg-blue-50/50 transition border-b border-gray-100">
                        <td class="py-2.5 pl-4 pr-2 text-center font-bold text-gray-500">${idx + 1}</td>
                        <td class="py-2.5 px-3 whitespace-nowrap">
                            <span class="font-mono font-bold text-blue-700 block">${log.ticketCode || '-'}</span>
                            ${typeBadge}
                        </td>
                        <td class="py-2.5 px-2 text-center text-gray-600 whitespace-nowrap">${formattedDate}</td>
                        <td class="py-2.5 px-3 font-semibold text-gray-800 whitespace-nowrap">${log.code}</td>
                        <td class="py-2.5 px-3 text-gray-800 leading-relaxed">${log.problem || '-'}</td>
                        <td class="py-2.5 px-3 text-gray-600 text-[11px] leading-relaxed">${log.sparepart || '-'}</td>
                        <td class="py-2.5 px-3 text-right whitespace-nowrap">${colValHtml}</td>
                        <td class="py-2.5 pl-2 pr-5 text-right font-bold text-gray-700 whitespace-nowrap">${pct}%</td>
                    </tr>
                `;
            }).join('');
        }

        function filterDtBreakdownTable(keyword) {
            const kw = (keyword || '').toLowerCase().trim();
            let baseLogs = activeBreakdownData.allLogs;

            if ((activeBreakdownData.isCostMode || activeBreakdownData.isSpkMode) && activeCostBreakdownType !== 'ALL') {
                if (activeCostBreakdownType === 'DT') {
                    baseLogs = baseLogs.filter(l => !isPmLog(l));
                } else if (activeCostBreakdownType === 'PM') {
                    baseLogs = baseLogs.filter(l => isPmLog(l));
                }
            }

            if (!kw) {
                activeBreakdownData.filteredLogs = baseLogs;
            } else {
                activeBreakdownData.filteredLogs = baseLogs.filter(l =>
                    (l.ticketCode && l.ticketCode.toLowerCase().includes(kw)) ||
                    (l.problem && l.problem.toLowerCase().includes(kw)) ||
                    (l.sparepart && l.sparepart.toLowerCase().includes(kw)) ||
                    (l.code && l.code.toLowerCase().includes(kw)) ||
                    (l.date && l.date.includes(kw))
                );
            }

            // Update badge total nominal di header modal jika sedang mode cost
            const badgeEl = document.getElementById('dtBreakdownModalHoursBadge');
            if (badgeEl && activeBreakdownData.isCostMode) {
                const sumCost = activeBreakdownData.filteredLogs.reduce((s, l) => s + (l.costDt || 0) + (l.costPm || 0), 0);
                activeBreakdownData.hours = sumCost;
                let prefix = 'Total Biaya';
                if (activeCostBreakdownType === 'DT') prefix = 'Biaya DT (Kerusakan)';
                else if (activeCostBreakdownType === 'PM') prefix = 'Biaya PM (Perawatan)';
                badgeEl.textContent = `${prefix}: ${formatIDR(sumCost)}`;
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
                const dayCostDt = logsOnDate.reduce((sum, l) => sum + (l.costDt || 0), 0);
                const dayCostPm = logsOnDate.reduce((sum, l) => sum + (l.costPm || 0), 0);
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
                    costDt: dayCostDt,
                    costPm: dayCostPm,
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

            // Dinamiskan Judul dan Subtitle Grafik Mengikuti Periode (Gaya Resmi Dashboard MMM)
            const presetLabels = {
                daily: 'DAILY',
                weekly: 'WEEKLY',
                monthly: 'MONTHLY',
                yearly: 'YEARLY'
            };
            const currentPresetText = presetLabels[currentActivePreset] || 'MONTHLY';
            const sDay = sDate.getDate();
            const sMonth = monthNamesShort[sDate.getMonth()];
            const sYear = sDate.getFullYear();
            const eDay = eDate.getDate();
            const eMonth = monthNamesShort[eDate.getMonth()];
            const eYear = eDate.getFullYear();
            const rangeStr = (sYear === eYear && sMonth === eMonth)
                ? `${sDay} - ${eDay} ${eMonth} ${eYear}`
                : `${sDay} ${sMonth} - ${eDay} ${eMonth} ${eYear}`;

            const dtTitleEl = document.getElementById('dtTrendTitle');
            const dtSubtitleEl = document.getElementById('dtTrendSubtitle');
            if (dtTitleEl) dtTitleEl.textContent = `DOWNTIME TREND HISTORY (${currentPresetText})`;
            if (dtSubtitleEl) dtSubtitleEl.textContent = `Histori kurva jam kerusakan riil & target toleransi KPI (${rangeStr})`;

            const costTitleEl = document.getElementById('costTrendTitle');
            const costSubtitleEl = document.getElementById('costTrendSubtitle');
            if (costTitleEl) costTitleEl.textContent = `COST TREND HISTORY (${currentPresetText})`;
            if (costSubtitleEl) costSubtitleEl.textContent = `Histori kurva pengeluaran biaya perbaikan & toleransi anggaran KPI (${rangeStr})`;

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
                                    <span class="truncate max-w-[180px] sm:max-w-[220px]" title="${cat.name}">${cat.name}</span>
                                </div>
                            </td>
                            <td class="py-1.5 px-2 text-right font-bold text-gray-900 whitespace-nowrap">${cat.hours.toFixed(1)} Jam</td>
                            <td class="py-1.5 pr-3 text-right font-semibold text-gray-600 whitespace-nowrap">${share}%</td>
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
                    worstTbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-gray-400 italic">Tidak ada gangguan mesin pada filter ini.</td></tr>';
                } else {
                    worstTbody.innerHTML = worstList.map((m, idx) => {
                        const primaryProblem = m.problemSummary ? m.problemSummary.split(';')[0] : 'Kerusakan Mesin';
                        return `
                            <tr onclick="openMachineBreakdownModal('${m.code}')" class="hover:bg-red-50/50 cursor-pointer transition">
                                <td class="py-1.5 px-2 text-center font-bold text-gray-400">${idx + 1}</td>
                                <td class="py-1.5 px-2.5 font-bold text-blue-700 whitespace-nowrap">
                                    ${m.code}
                                    <span class="text-[10px] font-normal text-gray-500 block truncate max-w-[140px]">${m.unitName || ''}</span>
                                </td>
                                <td class="py-1.5 px-2 text-gray-700 text-[11px]">
                                    <span class="line-clamp-1 truncate max-w-[180px] block" title="${primaryProblem}">${primaryProblem}</span>
                                </td>
                                <td class="py-1.5 pr-3 text-right font-bold text-red-600 whitespace-nowrap">${m.dtRepair.toFixed(1)} Jam</td>
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
            const costDtRatio = totals.totalCost > 0 ? (totals.costDt / totals.totalCost * 100) : 0;
            const costPmRatio = totals.totalCost > 0 ? (totals.costPm / totals.totalCost * 100) : 0;

            const costSubtitle = document.getElementById('kpiCostRatioSubtitle');
            if (costSubtitle) costSubtitle.textContent = `Rasio DT: ${costDtRatio.toFixed(1)}% • PM: ${costPmRatio.toFixed(1)}%`;

            // Update Header Panel Badges (Total Biaya & Rasio)
            const costHeaderTotalVal = document.getElementById('costHeaderTotalVal');
            if (costHeaderTotalVal) costHeaderTotalVal.textContent = formatIDR(totals.totalCost);

            const costHeaderDtPct = document.getElementById('costHeaderDtPct');
            const costHeaderPmPct = document.getElementById('costHeaderPmPct');
            if (costHeaderDtPct) costHeaderDtPct.textContent = `DT: ${costDtRatio.toFixed(1)}%`;
            if (costHeaderPmPct) costHeaderPmPct.textContent = `PM: ${costPmRatio.toFixed(1)}%`;

            const costHeadlineEl = document.getElementById('costSummaryHeadline');
            if (costHeadlineEl) costHeadlineEl.textContent = formatIDR(totals.totalCost);

            // Render Tabel Kategori Pengeluaran Biaya (#costCategoryTableBody)
            const costCatTbody = document.getElementById('costCategoryTableBody');
            if (costCatTbody) {
                const catTotals = {};
                Object.keys(PROBLEM_CATEGORIES).forEach(k => {
                    catTotals[k] = { ...PROBLEM_CATEGORIES[k], cost: 0, count: 0 };
                });

                activeLogs.forEach(l => {
                    const cost = (l.costDt || 0) + (l.costPm || 0);
                    if (cost <= 0) return;
                    const cat = classifyProblem(l.problem);
                    if (catTotals[cat.key]) {
                        catTotals[cat.key].cost += cost;
                        catTotals[cat.key].count += 1;
                    }
                });

                const sortedCats = Object.values(catTotals).sort((a, b) => b.cost - a.cost);
                const totalCostActive = Math.max(1, totals.totalCost);

                costCatTbody.innerHTML = sortedCats.map(cat => {
                    const share = ((cat.cost / totalCostActive) * 100).toFixed(1);
                    return `
                        <tr onclick="openCostCategoryBreakdown('${cat.key}')" class="hover:bg-amber-50/60 cursor-pointer transition">
                            <td class="py-1.5 px-2.5 font-medium text-gray-800">
                                <div class="flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full inline-block shrink-0" style="background-color: ${cat.color}"></span>
                                    <span class="truncate max-w-[180px] sm:max-w-[220px]" title="${cat.name}">${cat.name}</span>
                                </div>
                            </td>
                            <td class="py-1.5 px-2 text-right font-bold text-gray-900 whitespace-nowrap">${formatIDR(cat.cost)}</td>
                            <td class="py-1.5 pr-3 text-right font-semibold text-gray-600 whitespace-nowrap">${share}%</td>
                        </tr>
                    `;
                }).join('');
            }

            // Render Top Mesin Penyerap Biaya (#costTopMachinesTableBody)
            const costTopTbody = document.getElementById('costTopMachinesTableBody');
            if (costTopTbody) {
                const topCostList = [...aggregated]
                    .filter(m => m.totalCost > 0)
                    .sort((a, b) => b.totalCost - a.totalCost)
                    .slice(0, 5);

                if (topCostList.length === 0) {
                    costTopTbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-gray-400 italic">Tidak ada pengeluaran biaya pada filter ini.</td></tr>';
                } else {
                    costTopTbody.innerHTML = topCostList.map((m, idx) => {
                        const mLogs = activeLogs.filter(l => l.code === m.code && ((l.costDt || 0) + (l.costPm || 0)) > 0);
                        mLogs.sort((a, b) => ((b.costDt || 0) + (b.costPm || 0)) - ((a.costDt || 0) + (a.costPm || 0)));
                        const topPart = mLogs.length > 0 && mLogs[0].sparepart ? mLogs[0].sparepart : (m.problemSummary ? m.problemSummary.split(';')[0] : 'Perbaikan Komponen');
                        const dtShare = m.totalCost > 0 ? ((m.costDt || 0) / m.totalCost * 100) : 0;
                        let costTypeBadge = '';
                        if (dtShare >= 75) {
                            costTypeBadge = '<span class="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 block mt-0.5">DT Dominan</span>';
                        } else if (dtShare <= 25) {
                            costTypeBadge = '<span class="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200 block mt-0.5">PM Dominan</span>';
                        } else {
                            costTypeBadge = '<span class="text-[9px] font-semibold text-slate-500 bg-slate-50 px-1 py-0.2 rounded border border-slate-200 block mt-0.5">DT & PM</span>';
                        }
                        return `
                            <tr onclick="openMachineCostBreakdown('${m.code}')" class="hover:bg-amber-50/60 cursor-pointer transition">
                                <td class="py-1.5 px-2 text-center font-bold text-gray-400">${idx + 1}</td>
                                <td class="py-1.5 px-2.5 font-bold text-amber-800 whitespace-nowrap">
                                    ${m.code}
                                    <span class="text-[10px] font-normal text-gray-500 block truncate max-w-[140px]">${m.unitName || ''}</span>
                                </td>
                                <td class="py-1.5 px-2 text-gray-700 text-[11px]">
                                    <span class="line-clamp-1 truncate max-w-[180px] block" title="${topPart}">${topPart}</span>
                                </td>
                                <td class="py-1.5 pr-3 text-right whitespace-nowrap">
                                    <span class="font-bold text-amber-700">${formatIDR(m.totalCost)}</span>
                                    ${costTypeBadge}
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
            }

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

            // Update panelView_spk header badges
            const spkHeaderTotal = document.getElementById('spkHeaderTotalVal');
            const spkHeaderClosed = document.getElementById('spkHeaderClosedVal');
            const spkHeaderPending = document.getElementById('spkHeaderPendingVal');
            if (spkHeaderTotal) spkHeaderTotal.textContent = `${totalTickets} SPK`;
            if (spkHeaderClosed) spkHeaderClosed.textContent = `${completionRate}% Closed`;
            if (spkHeaderPending) spkHeaderPending.textContent = `${openTickets + inProgressTickets + waitingCloseTickets} Pending`;

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
            currentActivePreset = 'monthly';
            if (document.getElementById('filterDate')) document.getElementById('filterDate').value = '2026-11-10';
            if (document.getElementById('filterDateDisplay')) document.getElementById('filterDateDisplay').value = '10-11-2026';
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
            document.querySelectorAll('.preset-btn[data-preset="monthly"]').forEach(btn => {
                btn.classList.remove('text-gray-600', 'font-medium');
                btn.classList.add('bg-white', 'text-blue-700', 'font-bold', 'shadow-xs', 'border', 'border-gray-200/80');
            });

            applyFilters();
            showToast("Filter direset ke periode bulanan (01 - 10 Nov 2026).");
        }

        // ============================================================================
        // 7.1 MACHINE STATUS MODAL HANDLERS (RUNNING / BREAKDOWN / NO ORDER)
        // ============================================================================
        let activeMachineStatusModalData = { items: [], status: 'Breakdown', branch: '', category: '' };

        // Konfigurasi jumlah status real-time per cabang & kategori (selaras dengan kartu Machine Status)
        const MACHINE_STATUS_COUNTS = {
            MMM: { Injection: { Breakdown: 4, Running: 21, 'No Order': 27 }, Printing: { Breakdown: 3, Running: 0, 'No Order': 13 } },
            MMN: { Injection: { Breakdown: 1, Running: 11, 'No Order': 53 }, Blowing: { Breakdown: 0, Running: 0, 'No Order': 6 } },
            MMS: { Injection: { Breakdown: 4, Running: 0, 'No Order': 19 }, Printing: { Breakdown: 0, Running: 0, 'No Order': 2 } },
            MMG: { Injection: { Breakdown: 3, Running: 0, 'No Order': 13 } }
        };

        function showBreakdownMachinesModal(branch, category) {
            showMachineStatusModal(branch, category, 'Breakdown');
        }

        function showMachineStatusModal(branch, category, status = 'Breakdown', expectedCount = null) {
            const modal = document.getElementById('breakdownMachinesModal');
            if (!modal) return;

            const headerEl = document.getElementById('breakdownModalHeader');
            const iconEl = document.getElementById('breakdownModalIcon');
            const titleEl = document.getElementById('breakdownModalTitle');
            const subtitleEl = document.getElementById('breakdownModalSubtitle');
            const badgeEl = document.getElementById('breakdownModalCountBadge');
            const col4HeaderEl = document.getElementById('breakdownModalCol4Header');
            const searchEl = document.getElementById('breakdownModalSearch');
            if (searchEl) searchEl.value = '';

            // Hitung agregasi mesin lengkap untuk cabang & kategori ini (tidak terpengaruh filter top bar)
            const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
            const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';
            const branchAgg = computeAggregates(startDate, endDate, branch, category, 'ALL', '').aggregated;

            // Urutkan dari downtime tertinggi agar mesin bermasalah konsisten masuk kelompok Breakdown
            branchAgg.sort((a, b) => b.dtRepair - a.dtRepair || a.code.localeCompare(b.code));

            const counts = (MACHINE_STATUS_COUNTS[branch] && MACHINE_STATUS_COUNTS[branch][category]) || { Breakdown: 0, Running: 0, 'No Order': 0 };
            const bdCount = counts.Breakdown || 0;
            const runCount = counts.Running || 0;
            const noCount = counts['No Order'] || 0;

            let selectedItems = [];
            if (status === 'Breakdown') {
                const limit = expectedCount || bdCount || 4;
                selectedItems = branchAgg.slice(0, limit);
            } else if (status === 'Running') {
                const limit = expectedCount || runCount;
                selectedItems = branchAgg.slice(bdCount, bdCount + limit);
            } else { // 'No Order'
                const limit = expectedCount || noCount;
                selectedItems = branchAgg.slice(bdCount + runCount, bdCount + runCount + limit);
                // Jika jumlah master mesin lebih sedikit dari expectedCount, tampilkan sisa mesin yang tersedia
                if (selectedItems.length === 0 && branchAgg.length > 0) {
                    selectedItems = branchAgg.slice(0, limit);
                }
            }

            // Tema warna dinamis sesuai status
            const themes = {
                'Running': {
                    headerBg: 'bg-emerald-50/70',
                    iconBg: 'bg-emerald-100 text-emerald-700',
                    iconText: '✓',
                    badgeClass: 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200',
                    title: `[${branch}] Mesin Running — Divisi ${category}`,
                    subtitle: 'Unit mesin yang sedang aktif beroperasi & produksi normal',
                    col4: 'Status Operasional / Riwayat Terakhir',
                    badgeLabel: `${selectedItems.length} Mesin Aktif`
                },
                'Breakdown': {
                    headerBg: 'bg-red-50/60',
                    iconBg: 'bg-red-100 text-red-600',
                    iconText: '⚠️',
                    badgeClass: 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200',
                    title: `[${branch}] Mesin Breakdown — Divisi ${category}`,
                    subtitle: 'Unit mesin yang sedang dalam penanganan perbaikan teknisi',
                    col4: 'Masalah Utama / Tiket SPK',
                    badgeLabel: `${selectedItems.length} Mesin Breakdown`
                },
                'No Order': {
                    headerBg: 'bg-amber-50/70',
                    iconBg: 'bg-amber-100 text-amber-700',
                    iconText: '⏸',
                    badgeClass: 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200',
                    title: `[${branch}] Mesin No Order — Divisi ${category}`,
                    subtitle: 'Unit mesin sedang standby (tanpa jadwal produksi) — ideal untuk jadwal Preventive Maintenance (PM)',
                    col4: 'Catatan Kondisi & Rekomendasi PM',
                    badgeLabel: `${selectedItems.length} Mesin Standby`
                }
            };
            const t = themes[status] || themes['Breakdown'];

            if (headerEl) {
                headerEl.className = `p-4 sm:p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 ${t.headerBg}`;
            }
            if (iconEl) {
                iconEl.className = `w-9 h-9 rounded-xl ${t.iconBg} flex items-center justify-center font-bold text-sm shadow-2xs`;
                iconEl.textContent = t.iconText;
            }
            if (titleEl) titleEl.textContent = t.title;
            if (subtitleEl) subtitleEl.textContent = t.subtitle;
            if (badgeEl) {
                badgeEl.className = t.badgeClass;
                badgeEl.textContent = t.badgeLabel;
            }
            if (col4HeaderEl) col4HeaderEl.textContent = t.col4;

            activeMachineStatusModalData = { items: selectedItems, status, branch, category };
            renderMachineStatusModalRows(selectedItems, status);
            modal.classList.remove('hidden');
        }

        function filterMachineStatusModal(keyword) {
            const kw = (keyword || '').toLowerCase().trim();
            const { items, status } = activeMachineStatusModalData;
            const filtered = !kw ? items : items.filter(m =>
                (m.code && m.code.toLowerCase().includes(kw)) ||
                (m.unitName && m.unitName.toLowerCase().includes(kw)) ||
                (m.problemSummary && m.problemSummary.toLowerCase().includes(kw))
            );
            renderMachineStatusModalRows(filtered, status);
        }

        function renderMachineStatusModalRows(items, status) {
            const tbody = document.getElementById('breakdownModalTableBody');
            if (!tbody) return;

            if (!items || items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-gray-400 italic">Tidak ada unit mesin yang cocok untuk status ${status}.</td></tr>`;
                return;
            }

            const hoverClass = status === 'Running' ? 'hover:bg-emerald-50/50'
                : (status === 'No Order' ? 'hover:bg-amber-50/50' : 'hover:bg-red-50/40');
            const statusPill = status === 'Running'
                ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Running</span>'
                : (status === 'No Order'
                    ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">No Order</span>'
                    : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">Breakdown</span>');

            tbody.innerHTML = items.map((m, idx) => {
                const hasRealProb = m.problemSummary && m.problemSummary !== 'Tidak ada catatan kerusakan pada periode ini';
                let noteText = '';
                if (status === 'Breakdown') {
                    noteText = hasRealProb ? m.problemSummary.split(';')[0] : 'Pemeriksaan Berkala & Perbaikan Mekanikal';
                } else if (status === 'Running') {
                    noteText = hasRealProb ? `Beroperasi Normal (Riwayat: ${m.problemSummary.split(';')[0]})` : 'Beroperasi Normal • Tanpa Gangguan Periode Ini';
                } else {
                    noteText = m.dtPm > 0 ? 'Standby (PM terjadwal periode ini)' : 'Standby • Direkomendasikan untuk Jadwal PM Rutin';
                }

                const dtColor = m.dtRepair > 0 ? 'text-red-600' : 'text-gray-400';

                return `
                    <tr onclick="closeBreakdownMachinesModal(); openMachineModal('${m.code}')" class="${hoverClass} cursor-pointer transition">
                        <td class="py-2 px-3 text-center font-bold text-gray-500">${idx + 1}</td>
                        <td class="py-2 px-3 font-bold text-blue-700 whitespace-nowrap">${m.code}</td>
                        <td class="py-2 px-3 font-medium text-gray-800 whitespace-nowrap">${m.unitName || 'Unit Mesin'}</td>
                        <td class="py-2 px-3 text-gray-700 text-xs">
                            <span class="line-clamp-1 block" title="${noteText}">${noteText}</span>
                        </td>
                        <td class="py-2 px-3 text-right font-bold ${dtColor} whitespace-nowrap">${m.dtRepair.toFixed(1)} Jam</td>
                        <td class="py-2 pr-4 pl-2 text-center whitespace-nowrap">${statusPill}</td>
                    </tr>
                `;
            }).join('');
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
            let machine = currentAggregatedList.find(m => m.code === code);
            if (!machine) {
                const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
                const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';
                const allAgg = computeAggregates(startDate, endDate, 'ALL', 'ALL', code, '').aggregated;
                machine = allAgg[0];
            }
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
