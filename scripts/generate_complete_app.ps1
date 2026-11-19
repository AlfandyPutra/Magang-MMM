$ErrorActionPreference = "Stop"

# 1. Read existing HTML
$html = [System.IO.File]::ReadAllText('c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html', [System.Text.Encoding]::UTF8)

# Find <script> index
$scriptTag = "<script>"
$scriptIdx = $html.IndexOf($scriptTag)
if ($scriptIdx -lt 0) { throw "Could not find <script> tag in HTML" }

# Extract HTML before <script>
$htmlBeforeScript = $html.Substring(0, $scriptIdx + $scriptTag.Length)

# 2. Read real data
$realDataJs = [System.IO.File]::ReadAllText('c:\Kuliah\AntiGravity\Magang MMM\mms_real_data.js', [System.Text.Encoding]::UTF8)

# 3. Read JS template (single-quoted so `${var}` is preserved for JavaScript)
$jsHeader = @'

        /**
         * ============================================================================
         * MMS (Maintenance Management System) - MtD Module
         * PT Mitra Mulia Makmur (MMM Plastic)
         * Data Sumber Riil: Ticket Detail Report (01 - 10 Nov 2026) - 4 Cabang
         * ============================================================================
         */

'@

$jsBody = @'

        // ============================================================================
        // 2. STATE MANAGEMENT
        // ============================================================================
        let currentAggregatedList = [];
        let currentTotals = {};

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

            clearActivePreset();
            const mapId = {
                '2026-11-01_2026-11-10': 'preset-nov-real',
                '2026-11-01_2026-11-17': 'preset-nov',
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
            const selectedBranch = document.getElementById('filterBranch').value;
            const selectedCat = document.getElementById('filterCategory').value;
            const machineSelect = document.getElementById('filterMachineCode');
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
            document.getElementById('kpiDtRepair').textContent = `${totals.dtRepair.toFixed(1)} Jam`;
            document.getElementById('kpiDtPm').textContent = `${totals.dtPm.toFixed(1)} Jam`;
            document.getElementById('kpiTotalCost').textContent = formatIDR(totals.totalCost);
            document.getElementById('kpiCostBreakdown').textContent = `DT: ${formatIDR(totals.costDt)} • PM: ${formatIDR(totals.costPm)}`;
            document.getElementById('kpiTotalSpk').textContent = `${totals.totalSpk} SPK`;
            document.getElementById('kpiSpkBreakdown').textContent = `SPK DT: ${totals.spkDt} • SPK PM: ${totals.spkPm}`;
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

        function renderDtHoursTable(items, totals) {
            const sorted = [...items].sort((a, b) => b.totalHours - a.totalHours || b.dtRepair - a.dtRepair);
            const tbody = document.getElementById('dtHoursTableBody');
            const tfoot = document.getElementById('dtHoursTableFoot');

            if (sorted.length === 0) {
                tbody.innerHTML = renderEmptyRow(8, "Data mesin tidak ditemukan.");
            } else {
                tbody.innerHTML = sorted.map((item, idx) => `
                    <tr onclick="openMachineModal('${item.code}')" class="hover:bg-blue-50/60 cursor-pointer transition">
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center text-gray-500">${idx + 1}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center">${getBranchBadge(item.branch)}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 font-bold text-blue-700 whitespace-nowrap">${item.code}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-gray-800">${item.unitName}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200">${getCategoryBadge(item.category)}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-right font-semibold ${item.dtRepair > 0 ? 'text-red-600' : 'text-gray-400'}">${item.dtRepair.toFixed(1)}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-right font-medium ${item.dtPm > 0 ? 'text-blue-700' : 'text-gray-400'}">${item.dtPm.toFixed(1)}</td>
                        <td class="py-2.5 px-3 text-right font-bold bg-slate-50 text-gray-900">${item.totalHours.toFixed(1)}</td>
                    </tr>
                `).join('');
            }

            tfoot.innerHTML = `
                <tr>
                    <td colspan="5" class="py-2.5 px-3 border-r border-gray-300 text-right uppercase text-xs">Total Keseluruhan Downtime (Jam)</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-right text-red-600">${totals.dtRepair.toFixed(1)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-right text-blue-700">${totals.dtPm.toFixed(1)}</td>
                    <td class="py-2.5 px-3 text-right bg-slate-200 text-gray-900">${totals.totalHours.toFixed(1)}</td>
                </tr>
            `;
        }

        function renderCostTable(items, totals) {
            const sorted = [...items].sort((a, b) => b.totalCost - a.totalCost || b.totalHours - a.totalHours);
            const tbody = document.getElementById('costTableBody');
            const tfoot = document.getElementById('costTableFoot');

            if (sorted.length === 0) {
                tbody.innerHTML = renderEmptyRow(9, "Data cost tidak ditemukan.");
            } else {
                tbody.innerHTML = sorted.map((item, idx) => `
                    <tr onclick="openMachineModal('${item.code}')" class="hover:bg-blue-50/60 cursor-pointer transition">
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center text-gray-500">${idx + 1}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center">${getBranchBadge(item.branch)}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 font-bold text-blue-700 whitespace-nowrap">${item.code}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-gray-800">${item.unitName}</td>
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
            }

            tfoot.innerHTML = `
                <tr>
                    <td colspan="5" class="py-2.5 px-3 border-r border-gray-300 text-right uppercase text-xs">Total Biaya Maintenance (IDR)</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-right text-red-600">${formatIDR(totals.costDt)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-right text-blue-700">${formatIDR(totals.costPm)}</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-right bg-amber-100 text-gray-900">${formatIDR(totals.totalCost)}</td>
                    <td class="py-2.5 px-3 text-xs text-gray-500 italic">Akumulasi seluruh unit mesin terfilter</td>
                </tr>
            `;
        }

        function renderSpkTable(items, totals) {
            const sorted = [...items].sort((a, b) => b.totalSpk - a.totalSpk || b.totalHours - a.totalHours);
            const tbody = document.getElementById('spkTableBody');
            const tfoot = document.getElementById('spkTableFoot');

            if (sorted.length === 0) {
                tbody.innerHTML = renderEmptyRow(8, "Data SPK tidak ditemukan.");
            } else {
                tbody.innerHTML = sorted.map((item, idx) => `
                    <tr onclick="openMachineModal('${item.code}')" class="hover:bg-blue-50/60 cursor-pointer transition">
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center text-gray-500">${idx + 1}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center">${getBranchBadge(item.branch)}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 font-bold text-blue-700 whitespace-nowrap">${item.code}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-gray-800">${item.unitName}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200">${getCategoryBadge(item.category)}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center font-semibold ${item.spkDt > 0 ? 'text-red-600' : 'text-gray-400'}">${item.spkDt}</td>
                        <td class="py-2.5 px-3 border-r border-gray-200 text-center font-medium ${item.spkPm > 0 ? 'text-blue-700' : 'text-gray-400'}">${item.spkPm}</td>
                        <td class="py-2.5 px-3 text-center font-bold bg-emerald-50/40 text-gray-900">${item.totalSpk}</td>
                    </tr>
                `).join('');
            }

            tfoot.innerHTML = `
                <tr>
                    <td colspan="5" class="py-2.5 px-3 border-r border-gray-300 text-right uppercase text-xs">Total Akumulasi Realisasi SPK</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-center text-red-600">${totals.spkDt}</td>
                    <td class="py-2.5 px-3 border-r border-gray-300 text-center text-blue-700">${totals.spkPm}</td>
                    <td class="py-2.5 px-3 text-center bg-emerald-100 text-gray-900">${totals.totalSpk}</td>
                </tr>
            `;
        }

        // ============================================================================
        // 6. CONTROLLER & FILTER ORCHESTRATION
        // ============================================================================
        function applyFilters() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const branch = document.getElementById('filterBranch').value;
            const category = document.getElementById('filterCategory').value;
            const machineCode = document.getElementById('filterMachineCode').value;
            const keyword = document.getElementById('searchInput').value.trim();

            document.querySelectorAll('.period-label').forEach(el => {
                el.textContent = `${formatDateIndo(startDate)} — ${formatDateIndo(endDate)}`;
            });

            const { aggregated, totals } = computeAggregates(startDate, endDate, branch, category, machineCode, keyword);

            currentAggregatedList = aggregated;
            currentTotals = totals;
            document.getElementById('showingCount').textContent = aggregated.length;

            renderKpiCards(totals);
            renderTop5Table(aggregated);
            renderDtHoursTable(aggregated, totals);
            renderCostTable(aggregated, totals);
            renderSpkTable(aggregated, totals);
        }

        function resetFilters() {
            document.getElementById('startDate').value = '2026-11-01';
            document.getElementById('endDate').value = '2026-11-10';
            document.getElementById('filterBranch').value = 'ALL';
            document.getElementById('filterCategory').value = 'ALL';
            updateMachineDropdown();
            document.getElementById('filterMachineCode').value = 'ALL';
            document.getElementById('searchInput').value = '';

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
        // 8. DATA EXPORT (EXCEL .XLS BERWARNA & CSV)
        // ============================================================================
        function exportToExcel() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const selectedBranch = document.getElementById('filterBranch').value;
            const selectedCat = document.getElementById('filterCategory').value;
            const selectedCode = document.getElementById('filterMachineCode').value;

            const sortedData = [...currentAggregatedList].sort(
                (a, b) => b.totalHours - a.totalHours || b.dtRepair - a.dtRepair
            );

            const totals = currentTotals;
            const top5Data = sortedData.filter(i => i.totalHours > 0).slice(0, 5);

            const escapeHTML = (str) => {
                if (str === null || str === undefined) return '';
                return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            };

            const getCategoryStyle = (cat) => {
                const styles = {
                    'Injection': 'background-color: #e0e7ff; color: #3730a3; border: 0.5pt solid #c7d2fe;',
                    'Printing': 'background-color: #f3e8ff; color: #6b21a8; border: 0.5pt solid #e9d5ff;',
                    'Utility': 'background-color: #fef3c7; color: #92400e; border: 0.5pt solid #fde68a;',
                    'Robot': 'background-color: #ffe4e6; color: #9f1239; border: 0.5pt solid #fecdd3;',
                    'Auxiliary': 'background-color: #cffafe; color: #155e75; border: 0.5pt solid #a5f3fc;',
                    'Lain-lain': 'background-color: #ccfbf1; color: #115e59; border: 0.5pt solid #99f6e4;'
                };
                return styles[cat] || 'background-color: #f1f5f9; color: #334155; border: 0.5pt solid #cbd5e1;';
            };

            let tableRowsHtml = '';
            sortedData.forEach((item, idx) => {
                const zebraBg = (idx % 2 === 1) ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
                const catStyle = getCategoryStyle(item.category);

                tableRowsHtml += `
<tr style="${zebraBg}">
  <td class="td-c">${idx + 1}</td>
  <td class="td-c" style="font-weight: bold;">${escapeHTML(item.branch)}</td>
  <td class="td-c" style="font-weight: bold; mso-number-format: '\\@';">${escapeHTML(item.code)}</td>
  <td class="td-l" style="font-weight: 500;">${escapeHTML(item.unitName)}</td>
  <td class="td-c"><span style="display:inline-block; padding: 2px 8px; font-size: 8.5pt; font-weight: bold; ${catStyle}">${escapeHTML(item.category)}</span></td>
  <td class="num-dec" style="color: #dc2626; font-weight: bold;">${item.dtRepair.toFixed(1)}</td>
  <td class="num-dec" style="color: #2563eb;">${item.dtPm.toFixed(1)}</td>
  <td class="num-dec" style="font-weight: bold; background-color: #f1f5f9;">${item.totalHours.toFixed(1)}</td>
  <td class="num-curr">${item.costDt}</td>
  <td class="num-curr">${item.costPm}</td>
  <td class="num-curr" style="font-weight: bold; background-color: #fef3c7;">${item.totalCost}</td>
  <td class="num-int">${item.spkDt}</td>
  <td class="num-int">${item.spkPm}</td>
  <td class="num-int" style="font-weight: bold; background-color: #d1fae5;">${item.totalSpk}</td>
  <td class="td-l" style="font-size: 8.5pt; white-space: normal;">${escapeHTML(item.problemSummary)}</td>
  <td class="td-l" style="font-size: 8.5pt; white-space: normal;">${escapeHTML(item.sparepartSummary)}</td>
</tr>`;
            });

            let top5RowsHtml = '';
            top5Data.forEach((item, idx) => {
                const rankBadgeStyle = idx === 0 
                    ? 'background-color: #fee2e2; color: #b91c1c; font-weight: bold; border: 1pt solid #f87171;' 
                    : 'background-color: #fef3c7; color: #92400e; font-weight: bold; border: 1pt solid #fbbf24;';

                top5RowsHtml += `
<tr>
  <td class="td-c" style="${rankBadgeStyle}">#${idx + 1}</td>
  <td class="td-c" style="font-weight: bold;">${escapeHTML(item.branch)}</td>
  <td class="td-c" style="font-weight: bold; mso-number-format: '\\@';">${escapeHTML(item.code)}</td>
  <td class="td-l" colspan="2" style="font-weight: bold;">${escapeHTML(item.unitName)}</td>
  <td class="td-c"><span style="display:inline-block; padding: 2px 8px; font-size: 8.5pt; font-weight: bold; ${getCategoryStyle(item.category)}">${escapeHTML(item.category)}</span></td>
  <td class="num-dec" style="color: #dc2626; font-weight: bold; font-size: 10.5pt;">${item.dtRepair.toFixed(1)}</td>
  <td class="num-dec" style="color: #2563eb;">${item.dtPm.toFixed(1)}</td>
  <td class="num-dec" style="font-weight: bold; background-color: #fee2e2; font-size: 10.5pt;">${item.totalHours.toFixed(1)}</td>
  <td class="num-curr" colspan="2" style="font-weight: bold;">${item.totalCost}</td>
  <td class="num-int">${item.totalSpk}</td>
  <td class="td-l" colspan="4" style="font-size: 8.5pt; white-space: normal;"><strong>Problem:</strong> ${escapeHTML(item.problemSummary)}<br><strong>Part:</strong> ${escapeHTML(item.sparepartSummary)}</td>
</tr>`;
            });

            const tagHtmlOpen = '<' + 'html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            const tagHeadOpen = '<' + 'head>';
            const tagHeadClose = '</' + 'head>';
            const tagBodyOpen = '<' + 'body>';
            const tagBodyClose = '</' + 'body>';
            const tagHtmlClose = '</' + 'html>';

            const excelTemplate = `${tagHtmlOpen}
${tagHeadOpen}
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>Maintenance Summary</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
     <x:Print><x:Orientation>Landscape</x:Orientation></x:Print>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body, table, td, th { font-family: "Segoe UI", Calibri, Arial, sans-serif; font-size: 9.5pt; color: #1e293b; }
  .banner-company { background-color: #1e3a8a; color: #ffffff; font-size: 15pt; font-weight: bold; text-align: center; padding: 12px; }
  .banner-subtitle { background-color: #dbeafe; color: #1e3a8a; font-size: 11pt; font-weight: bold; text-align: center; padding: 7px; border-bottom: 2pt solid #2563eb; }
  .section-header { background-color: #1e40af; color: #ffffff; font-size: 10.5pt; font-weight: bold; padding: 8px 12px; border: 1pt solid #1e3a8a; text-transform: uppercase; }
  .meta-title { font-size: 9pt; color: #475569; font-weight: bold; padding: 5px 8px; border: 0.5pt solid #cbd5e1; background-color: #f1f5f9; }
  .meta-val { font-size: 9pt; color: #0f172a; padding: 5px 8px; border: 0.5pt solid #cbd5e1; }
  .th-blue { background-color: #2563eb; color: #ffffff; font-weight: bold; text-align: center; border: 1pt solid #1d4ed8; padding: 8px 6px; font-size: 9pt; }
  .th-accent { background-color: #1d4ed8; color: #ffffff; font-weight: bold; text-align: center; border: 1pt solid #172554; padding: 8px 6px; font-size: 9pt; }
  .td-c { border: 0.5pt solid #cbd5e1; padding: 6px; text-align: center; vertical-align: middle; }
  .td-l { border: 0.5pt solid #cbd5e1; padding: 6px; text-align: left; vertical-align: middle; }
  .td-r { border: 0.5pt solid #cbd5e1; padding: 6px; text-align: right; vertical-align: middle; }
  .num-dec { border: 0.5pt solid #cbd5e1; padding: 6px; text-align: right; vertical-align: middle; mso-number-format: "0\\.0"; }
  .num-curr { border: 0.5pt solid #cbd5e1; padding: 6px; text-align: right; vertical-align: middle; mso-number-format: "\"Rp \"\\#\\,\\#\\#0"; }
  .num-int { border: 0.5pt solid #cbd5e1; padding: 6px; text-align: center; vertical-align: middle; mso-number-format: "\\#\\,\\#\\#0"; }
  .total-row { background-color: #e2e8f0; font-weight: bold; border-top: 2pt solid #334155; border-bottom: 3pt double #334155; }
</style>
${tagHeadClose}
${tagBodyOpen}
<table border="0" cellpadding="0" cellspacing="0">
<col width="45">
<col width="65">
<col width="110">
<col width="230">
<col width="105">
<col width="125">
<col width="120">
<col width="130">
<col width="150">
<col width="150">
<col width="165">
<col width="80">
<col width="80">
<col width="90">
<col width="340">
<col width="320">

<!-- Header Perusahaan -->
<tr><td colspan="16" class="banner-company">PT MITRA MULIA MAKMUR (MMM PLASTIC)</td></tr>
<tr><td colspan="16" class="banner-subtitle">LAPORAN SUMMARY MAINTENANCE (MONTH TO DATE)</td></tr>
<tr><td colspan="16" style="height: 6px;"></td></tr>

<!-- Meta Info Laporan -->
<tr>
  <td colspan="3" class="meta-title">Periode Laporan:</td>
  <td colspan="5" class="meta-val"><strong>${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)}</strong></td>
  <td colspan="3" class="meta-title">Filter Terpasang:</td>
  <td colspan="5" class="meta-val">Cabang: <strong>${escapeHTML(selectedBranch)}</strong> | Kat: <strong>${escapeHTML(selectedCat)}</strong> | Unit: <strong>${escapeHTML(selectedCode)}</strong></td>
</tr>
<tr>
  <td colspan="3" class="meta-title">Tanggal & Jam Unduh:</td>
  <td colspan="5" class="meta-val">${new Date().toLocaleString('id-ID')}</td>
  <td colspan="3" class="meta-title">Total Unit Terekam:</td>
  <td colspan="5" class="meta-val"><strong>${sortedData.length} Mesin</strong></td>
</tr>
<tr><td colspan="16" style="height: 10px;"></td></tr>

<!-- Kartu KPI Berwarna -->
<tr>
  <td colspan="4" style="background-color: #fee2e2; border: 1.5pt solid #ef4444; padding: 10px; text-align: center;">
    <span style="font-size: 8.5pt; color: #991b1b; font-weight: bold;">TOTAL DT PERBAIKAN</span><br>
    <span style="font-size: 16pt; color: #dc2626; font-weight: bold;">${totals.dtRepair.toFixed(1)} Jam</span><br>
    <span style="font-size: 8pt; color: #7f1d1d;">Akumulasi breakdown mesin</span>
  </td>
  <td colspan="4" style="background-color: #dbeafe; border: 1.5pt solid #3b82f6; padding: 10px; text-align: center;">
    <span style="font-size: 8.5pt; color: #1e40af; font-weight: bold;">TOTAL PREVENTIVE (PM)</span><br>
    <span style="font-size: 16pt; color: #2563eb; font-weight: bold;">${totals.dtPm.toFixed(1)} Jam</span><br>
    <span style="font-size: 8pt; color: #1e3a8a;">Akumulasi jadwal PM rutin</span>
  </td>
  <td colspan="4" style="background-color: #fef3c7; border: 1.5pt solid #f59e0b; padding: 10px; text-align: center;">
    <span style="font-size: 8.5pt; color: #92400e; font-weight: bold;">TOTAL BIAYA MAINTENANCE</span><br>
    <span style="font-size: 15pt; color: #b45309; font-weight: bold;">${formatIDR(totals.totalCost)}</span><br>
    <span style="font-size: 8pt; color: #78350f;">DT: ${formatIDR(totals.costDt)} | PM: ${formatIDR(totals.costPm)}</span>
  </td>
  <td colspan="4" style="background-color: #d1fae5; border: 1.5pt solid #10b981; padding: 10px; text-align: center;">
    <span style="font-size: 8.5pt; color: #065f46; font-weight: bold;">TOTAL REALISASI SPK</span><br>
    <span style="font-size: 16pt; color: #059669; font-weight: bold;">${totals.totalSpk} SPK</span><br>
    <span style="font-size: 8pt; color: #064e3b;">DT: ${totals.spkDt} SPK | PM: ${totals.spkPm} SPK</span>
  </td>
</tr>
<tr><td colspan="16" style="height: 14px;"></td></tr>

<!-- Bagian 1: Top 5 Pareto -->
<tr><td colspan="16" class="section-header">BAGIAN 1: TOP 5 DOWNTIME TERBESAR & DETAIL PROBLEM UTAMA (PARETO)</td></tr>
<tr>
  <th class="th-accent" style="width: 45px;">Rank</th>
  <th class="th-accent" style="width: 65px;">Cabang</th>
  <th class="th-accent" style="width: 110px;">Kode Mesin</th>
  <th class="th-accent" colspan="2" style="width: 335px;">Nama / Spesifikasi Unit</th>
  <th class="th-accent" style="width: 105px;">Kategori</th>
  <th class="th-accent" style="width: 125px;">DT Perbaikan (Jam)</th>
  <th class="th-accent" style="width: 120px;">PM (Jam)</th>
  <th class="th-accent" style="width: 130px; background-color: #991b1b;">Total DT+PM</th>
  <th class="th-accent" colspan="2" style="width: 300px;">Total Biaya (IDR)</th>
  <th class="th-accent" style="width: 80px;">Total SPK</th>
  <th class="th-accent" colspan="4">Detail Problem Terbesar & Sparepart Terpakai</th>
</tr>
${top5RowsHtml}
<tr><td colspan="16" style="height: 14px;"></td></tr>

<!-- Bagian 2: Rekapitulasi Komprehensif Seluruh Mesin -->
<tr><td colspan="16" class="section-header">BAGIAN 2: REKAPITULASI DETAIL SELURUH MESIN (DOWNTIME, BIAYA & SPK)</td></tr>
<tr>
  <th class="th-blue">No</th>
  <th class="th-blue">Cabang</th>
  <th class="th-blue">Kode Mesin</th>
  <th class="th-blue">Nama / Spesifikasi Unit</th>
  <th class="th-blue">Kategori</th>
  <th class="th-blue">DT Perbaikan (Jam)</th>
  <th class="th-blue">PM (Jam)</th>
  <th class="th-accent">Total Jam</th>
  <th class="th-blue">Cost DT (IDR)</th>
  <th class="th-blue">Cost PM (IDR)</th>
  <th class="th-accent">Total Cost (IDR)</th>
  <th class="th-blue">SPK DT</th>
  <th class="th-blue">SPK PM</th>
  <th class="th-accent">Total SPK</th>
  <th class="th-blue">Detail Problem Perbaikan</th>
  <th class="th-blue">Sparepart / Tindakan</th>
</tr>
${tableRowsHtml}
<tr class="total-row">
  <td colspan="5" class="td-r" style="font-size: 9.5pt; padding-right: 12px;">TOTAL KESELURUHAN</td>
  <td class="num-dec" style="color: #dc2626;">${totals.dtRepair.toFixed(1)}</td>
  <td class="num-dec" style="color: #2563eb;">${totals.dtPm.toFixed(1)}</td>
  <td class="num-dec" style="background-color: #cbd5e1;">${totals.totalHours.toFixed(1)}</td>
  <td class="num-curr" style="color: #dc2626;">${totals.costDt}</td>
  <td class="num-curr" style="color: #2563eb;">${totals.costPm}</td>
  <td class="num-curr" style="background-color: #cbd5e1;">${totals.totalCost}</td>
  <td class="num-int" style="color: #dc2626;">${totals.spkDt}</td>
  <td class="num-int" style="color: #2563eb;">${totals.spkPm}</td>
  <td class="num-int" style="background-color: #cbd5e1;">${totals.totalSpk}</td>
  <td colspan="2" class="td-l" style="font-size: 8.5pt; color: #475569;">Akumulasi Seluruh Unit Terfilter (${sortedData.length} Mesin)</td>
</tr>
</table>
${tagBodyClose}
${tagHtmlClose}`;

            const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `Maintenance_Summary_${selectedBranch}_${startDate}_sd_${endDate}.xls`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showToast("File laporan Excel (.XLS) berwarna & terformat rapi berhasil diunduh!");
        }

        function exportToCSV() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const selectedBranch = document.getElementById('filterBranch').value;
            const selectedCat = document.getElementById('filterCategory').value;
            const selectedCode = document.getElementById('filterMachineCode').value;

            const escapeCSV = (val) => {
                if (val === null || val === undefined) return '""';
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            };

            const sortedData = [...currentAggregatedList].sort(
                (a, b) => b.totalHours - a.totalHours || b.dtRepair - a.dtRepair
            );

            const totals = currentTotals;

            const metaRows = [
                ["PT MITRA MULIA MAKMUR (MMM PLASTIC)"],
                ["LAPORAN MAINTENANCE SUMMARY (MONTH TO DATE)"],
                [`Periode Laporan: ${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)}`],
                [`Filter Cabang: ${selectedBranch} | Filter Kategori: ${selectedCat} | Filter Kode Mesin: ${selectedCode}`],
                [`Tanggal Unduh: ${new Date().toLocaleString('id-ID')}`],
                [],
                ["RINGKASAN KPI:"],
                ["Total Downtime Perbaikan (DT)", `${totals.dtRepair.toFixed(1)} Jam`],
                ["Total Downtime Preventive (PM)", `${totals.dtPm.toFixed(1)} Jam`],
                ["Total Akumulasi Jam DT + PM", `${totals.totalHours.toFixed(1)} Jam`],
                ["Total Biaya DT Perbaikan (IDR)", totals.costDt],
                ["Total Biaya Preventive PM (IDR)", totals.costPm],
                ["Total Biaya Maintenance (IDR)", totals.totalCost],
                ["Total Realisasi SPK", `${totals.totalSpk} SPK (DT: ${totals.spkDt}, PM: ${totals.spkPm})`],
                []
            ];

            const tableHeaders = [
                "No",
                "Cabang",
                "Kode Mesin",
                "Nama / Spesifikasi Unit",
                "Kategori",
                "DT Perbaikan (Jam)",
                "DT Preventive PM (Jam)",
                "Total Downtime (Jam)",
                "Cost DT Perbaikan (IDR)",
                "Cost Preventive PM (IDR)",
                "Total Cost (IDR)",
                "SPK DT",
                "SPK PM",
                "Total SPK",
                "Detail Problem Perbaikan",
                "Sparepart / Tindakan"
            ];

            const dataRows = sortedData.map((item, idx) => [
                idx + 1,
                item.branch,
                item.code,
                item.unitName,
                item.category,
                item.dtRepair.toFixed(1),
                item.dtPm.toFixed(1),
                item.totalHours.toFixed(1),
                item.costDt,
                item.costPm,
                item.totalCost,
                item.spkDt,
                item.spkPm,
                item.totalSpk,
                item.problemSummary,
                item.sparepartSummary
            ]);

            const summaryRow = [
                "TOTAL KESELURUHAN",
                "",
                "",
                "",
                "",
                totals.dtRepair.toFixed(1),
                totals.dtPm.toFixed(1),
                totals.totalHours.toFixed(1),
                totals.costDt,
                totals.costPm,
                totals.totalCost,
                totals.spkDt,
                totals.spkPm,
                totals.totalSpk,
                "",
                ""
            ];

            const csvLines = [
                ...metaRows.map(row => row.map(escapeCSV).join(",")),
                tableHeaders.map(escapeCSV).join(","),
                ...dataRows.map(row => row.map(escapeCSV).join(",")),
                summaryRow.map(escapeCSV).join(",")
            ];

            const csvContent = csvLines.join("\r\n");
            const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Maintenance_Summary_${selectedBranch}_${startDate}_sd_${endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showToast("File laporan Excel (.CSV) berhasil diunduh secara lengkap!");
        }

        // ============================================================================
        // 9. APPLICATION LIFECYCLE & EVENT LISTENERS
        // ============================================================================
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeModal();
            }
        });

        window.onload = function () {
            updateMachineDropdown();
            applyFilters();
        };
    </script>
</body>
</html>
'@

# Assemble final HTML
$finalHtml = $htmlBeforeScript + $jsHeader + $realDataJs + $jsBody

# Save final HTML
[System.IO.File]::WriteAllText('c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html', $finalHtml, [System.Text.Encoding]::UTF8)
Write-Host "maintenancesummary-mtd.html successfully regenerated with full real data!"
