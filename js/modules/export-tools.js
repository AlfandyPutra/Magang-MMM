/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Data Export Module (Executive-Grade Styled Excel .XLS, CSV, & Print)
 */
        // ============================================================================
        // 8. DATA EXPORT (EXCEL .XLS BERWARNA & CSV)
        // ============================================================================
        function exportToExcel() {
            const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '2026-11-01';
            const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '2026-11-10';
            const branchEl = document.getElementById('filterBranch');
            const selectedBranch = branchEl ? branchEl.value : 'ALL';
            const catEl = document.getElementById('filterCategory');
            const selectedCat = catEl ? catEl.value : 'ALL';
            const codeEl = document.getElementById('filterMachineCode');
            const selectedCode = codeEl ? codeEl.value : 'ALL';

            const sortedData = [...currentAggregatedList].sort(
                (a, b) => b.totalHours - a.totalHours || b.dtRepair - a.dtRepair
            );

            const totals = currentTotals;
            const top5Data = sortedData.filter(i => i.totalHours > 0).slice(0, 5);

            let branchProjects = maintenanceProjectsList;
            if (selectedBranch !== 'ALL') {
                branchProjects = branchProjects.filter(p => p.branch === selectedBranch);
            }

            const spkOpenCount = getFilteredWorkflowTickets('OPEN').length;
            const spkProgCount = getFilteredWorkflowTickets('PROSES').length;
            const spkWaitCount = getFilteredWorkflowTickets('OUTSTANDING').length;
            const spkClosedCount = getFilteredWorkflowTickets('CLOSED').length;
            const spkTotalWorkflow = spkOpenCount + spkProgCount + spkWaitCount + spkClosedCount;
            const spkCompletionRate = spkTotalWorkflow > 0 ? ((spkClosedCount / spkTotalWorkflow) * 100).toFixed(1) : '94.4';

            const prjDoneCount = branchProjects.filter(p => p.status === 'SELESAI').length;
            const prjProgCount = branchProjects.filter(p => p.status === 'PROSES').length;
            const prjWaitCount = branchProjects.filter(p => p.status === 'OUTSTANDING').length;
            const prjOpenCount = branchProjects.filter(p => p.status === 'OPEN').length;

            const totalHours = totals.dtRepair + totals.dtPm;
            const dtRatio = totalHours > 0 ? ((totals.dtRepair / totalHours) * 100).toFixed(1) : '68.0';
            const pmRatio = totalHours > 0 ? ((totals.dtPm / totalHours) * 100).toFixed(1) : '32.0';

            const costDtRatio = totals.totalCost > 0 ? ((totals.costDt / totals.totalCost) * 100).toFixed(1) : '72.3';
            const costPmRatio = totals.totalCost > 0 ? ((totals.costPm / totals.totalCost) * 100).toFixed(1) : '27.7';

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
            const getProjectStatusBadge = (status) => {
                if (status === 'SELESAI') {
                    return '<span style="display:inline-block; padding: 2px 8px; font-size: 8.5pt; font-weight: bold; background-color: #d1fae5; color: #065f46; border: 0.5pt solid #a7f3d0; border-radius: 4px;">4. CLOSED</span>';
                }
                if (status === 'PROSES') {
                    return '<span style="display:inline-block; padding: 2px 8px; font-size: 8.5pt; font-weight: bold; background-color: #dbeafe; color: #1e40af; border: 0.5pt solid #bfdbfe; border-radius: 4px;">2. ASSIGNMENT</span>';
                }
                if (status === 'OUTSTANDING') {
                    return '<span style="display:inline-block; padding: 2px 8px; font-size: 8.5pt; font-weight: bold; background-color: #f3e8ff; color: #6b21a8; border: 0.5pt solid #e9d5ff; border-radius: 4px;">3. WAITING TO CLOSE</span>';
                }
                return '<span style="display:inline-block; padding: 2px 8px; font-size: 8.5pt; font-weight: bold; background-color: #fef3c7; color: #92400e; border: 0.5pt solid #fde68a; border-radius: 4px;">1. OPEN</span>';
            };

            const estimateRowHeightPt = (textList, charsPerLine, minPt = 24, maxPt = 115) => {
                let maxLines = 1;
                textList.forEach(txt => {
                    if (!txt) return;
                    const parts = String(txt).split(/\r?\n|<br\s*\/?>/i);
                    let lines = 0;
                    parts.forEach(p => {
                        lines += Math.max(1, Math.ceil(p.trim().length / Math.max(12, charsPerLine)));
                    });
                    if (lines > maxLines) maxLines = lines;
                });
                return Math.min(maxPt, Math.max(minPt, (maxLines * 14) + 12));
            };

            const trimExcelText = (str, maxLen = 240) => {
                if (!str) return '-';
                const s = String(str).trim();
                return s.length > maxLen ? s.slice(0, maxLen).trim() + '…' : s;
            };

            let projectRowsHtml = '';
            branchProjects.forEach((p, idx) => {
                const zebraBg = (idx % 2 === 1) ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
                const statusBadge = getProjectStatusBadge(p.status);
                const catStyle = getCategoryStyle(p.category);
                const rowH = estimateRowHeightPt([`${p.name}\n${p.desc}`, p.impact], 42, 34, 95);
                projectRowsHtml += `
<tr style="${zebraBg} height: ${rowH}pt;">
  <td class="td-c">${idx + 1}</td>
  <td class="td-c" style="font-weight: bold;">${escapeHTML(p.branch)}</td>
  <td class="td-c" style="font-weight: bold; mso-number-format: '@';">${escapeHTML(p.code)}</td>
  <td class="td-l" colspan="2" style="font-weight: 500; white-space: normal;"><strong>${escapeHTML(p.name)}</strong><br style="mso-data-placement:same-cell;">${escapeHTML(p.desc)}</td>
  <td class="td-l" colspan="2" style="font-size: 8.5pt; white-space: normal;">${escapeHTML(p.machine)}</td>
  <td class="td-c"><span style="display:inline-block; padding: 2px 8px; font-size: 8.5pt; font-weight: bold; ${catStyle}">${escapeHTML(p.category)}</span></td>
  <td class="td-l">${escapeHTML(p.pic)}</td>
  <td class="td-c" style="font-weight: bold;">${p.progress}%</td>
  <td class="td-c">${statusBadge}</td>
  <td class="td-c">${escapeHTML(p.target)}</td>
  <td class="td-l" colspan="4" style="font-size: 8.5pt; white-space: normal;">${escapeHTML(p.impact)}</td>
</tr>`;
            });

            let tableRowsHtml = '';
            sortedData.forEach((item, idx) => {
                const zebraBg = (idx % 2 === 1) ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
                const catStyle = getCategoryStyle(item.category);
                const probClean = trimExcelText(item.problemSummary, 220);
                const partClean = trimExcelText(item.sparepartSummary, 240);
                const rowH = estimateRowHeightPt([probClean, partClean, item.unitName], 44, 26, 98);

                tableRowsHtml += `
<tr style="${zebraBg} height: ${rowH}pt;">
  <td class="td-c">${idx + 1}</td>
  <td class="td-c" style="font-weight: bold;">${escapeHTML(item.branch)}</td>
  <td class="td-c" style="font-weight: bold; white-space: nowrap; mso-number-format: '@';">${escapeHTML(item.code)}</td>
  <td class="td-l" style="font-weight: 500; white-space: normal;">${escapeHTML(item.unitName)}</td>
  <td class="td-c"><span style="display:inline-block; padding: 2px 8px; font-size: 8.5pt; font-weight: bold; ${catStyle}">${escapeHTML(item.category)}</span></td>
  <td class="num-dec" style="color: #dc2626; font-weight: bold;">${item.dtRepair.toFixed(1)}</td>
  <td class="num-dec" style="color: #2563eb;">${item.dtPm.toFixed(1)}</td>
  <td class="num-dec" style="font-weight: bold; background-color: #f1f5f9;">${item.totalHours.toFixed(1)}</td>
  <td class="num-curr">${Math.round(item.costDt || 0)}</td>
  <td class="num-curr">${Math.round(item.costPm || 0)}</td>
  <td class="num-curr" style="font-weight: bold; background-color: #fef3c7;">${Math.round(item.totalCost || 0)}</td>
  <td class="num-int">${item.spkDt}</td>
  <td class="num-int">${item.spkPm}</td>
  <td class="num-int" style="font-weight: bold; background-color: #d1fae5;">${item.totalSpk}</td>
  <td class="td-l" style="font-size: 8.5pt; white-space: normal;">${escapeHTML(probClean)}</td>
  <td class="td-l" style="font-size: 8.5pt; white-space: normal;">${escapeHTML(partClean)}</td>
</tr>`;
            });

            let top5RowsHtml = '';
            top5Data.forEach((item, idx) => {
                const rankBadgeStyle = idx === 0
                    ? 'background-color: #fee2e2; color: #b91c1c; font-weight: bold; border: 1pt solid #f87171;'
                    : 'background-color: #fef3c7; color: #92400e; font-weight: bold; border: 1pt solid #fbbf24;';
                const probClean = trimExcelText(item.problemSummary, 200);
                const partClean = trimExcelText(item.sparepartSummary, 220);
                const rowH = estimateRowHeightPt([`Problem: ${probClean}\nPart: ${partClean}`], 95, 38, 95);

                top5RowsHtml += `
<tr style="height: ${rowH}pt;">
  <td class="td-c" style="${rankBadgeStyle}">#${idx + 1}</td>
  <td class="td-c" style="font-weight: bold;">${escapeHTML(item.branch)}</td>
  <td class="td-c" style="font-weight: bold; white-space: nowrap; mso-number-format: '@';">${escapeHTML(item.code)}</td>
  <td class="td-l" colspan="2" style="font-weight: bold; white-space: normal;">${escapeHTML(item.unitName)}</td>
  <td class="td-c"><span style="display:inline-block; padding: 2px 8px; font-size: 8.5pt; font-weight: bold; ${getCategoryStyle(item.category)}">${escapeHTML(item.category)}</span></td>
  <td class="num-dec" style="color: #dc2626; font-weight: bold; font-size: 10.5pt;">${item.dtRepair.toFixed(1)}</td>
  <td class="num-dec" style="color: #2563eb;">${item.dtPm.toFixed(1)}</td>
  <td class="num-dec" style="font-weight: bold; background-color: #fee2e2; font-size: 10.5pt;">${item.totalHours.toFixed(1)}</td>
  <td class="num-curr" colspan="2" style="font-weight: bold;">${Math.round(item.totalCost || 0)}</td>
  <td class="num-int">${item.totalSpk}</td>
  <td class="td-l" colspan="4" style="font-size: 8.5pt; white-space: normal;"><strong>Problem:</strong> ${escapeHTML(probClean)}<br style="mso-data-placement:same-cell;"><strong>Part:</strong> ${escapeHTML(partClean)}</td>
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
  br { mso-data-placement: same-cell; }
  .banner-company { background-color: #1e3a8a; color: #ffffff; font-size: 15pt; font-weight: bold; text-align: center; vertical-align: middle; padding: 12px; }
  .banner-subtitle { background-color: #dbeafe; color: #1e3a8a; font-size: 11pt; font-weight: bold; text-align: center; vertical-align: middle; padding: 7px; border-bottom: 2pt solid #2563eb; }
  .section-header { background-color: #1e40af; color: #ffffff; font-size: 10.5pt; font-weight: bold; vertical-align: middle; padding: 8px 12px; border: 1pt solid #1e3a8a; text-transform: uppercase; }
  .meta-title { font-size: 9pt; color: #475569; font-weight: bold; padding: 6px 8px; border: 0.5pt solid #cbd5e1; background-color: #f1f5f9; vertical-align: middle; }
  .meta-val { font-size: 9pt; color: #0f172a; padding: 6px 8px; border: 0.5pt solid #cbd5e1; vertical-align: middle; }
  .th-blue { background-color: #2563eb; color: #ffffff; font-weight: bold; text-align: center; vertical-align: middle; white-space: normal; border: 1pt solid #1d4ed8; padding: 8px 6px; font-size: 9pt; }
  .th-accent { background-color: #1d4ed8; color: #ffffff; font-weight: bold; text-align: center; vertical-align: middle; white-space: normal; border: 1pt solid #172554; padding: 8px 6px; font-size: 9pt; }
  .td-c { border: 0.5pt solid #cbd5e1; padding: 6px 8px; text-align: center; vertical-align: middle; }
  .td-l { border: 0.5pt solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: middle; }
  .td-r { border: 0.5pt solid #cbd5e1; padding: 6px 8px; text-align: right; vertical-align: middle; }
  .num-dec { border: 0.5pt solid #cbd5e1; padding: 6px 8px; text-align: right; vertical-align: middle; mso-number-format: "0.0"; }
  .num-curr { border: 0.5pt solid #cbd5e1; padding: 6px 8px; text-align: right; vertical-align: middle; mso-number-format: '"Rp "#,##0'; }
  .num-int { border: 0.5pt solid #cbd5e1; padding: 6px 8px; text-align: center; vertical-align: middle; mso-number-format: "#,##0"; }
  .total-row { background-color: #e2e8f0; font-weight: bold; border-top: 2pt solid #334155; border-bottom: 3pt double #334155; }
</style>
${tagHeadClose}
${tagBodyOpen}
<table border="0" cellpadding="0" cellspacing="0">
<col width="48">
<col width="70">
<col width="145">
<col width="245">
<col width="110">
<col width="135">
<col width="115">
<col width="125">
<col width="155">
<col width="155">
<col width="170">
<col width="80">
<col width="80">
<col width="90">
<col width="380">
<col width="400">

<!-- Header Perusahaan -->
<tr style="height: 32pt;"><td colspan="16" class="banner-company">PT MITRA MULIA MAKMUR (MMM PLASTIC)</td></tr>
<tr style="height: 24pt;"><td colspan="16" class="banner-subtitle">LAPORAN SUMMARY MAINTENANCE (MONTH TO DATE)</td></tr>
<tr style="height: 10pt;"><td colspan="16"></td></tr>

<!-- Meta Info Laporan -->
<tr style="height: 22pt;">
  <td colspan="3" class="meta-title">Periode Laporan:</td>
  <td colspan="5" class="meta-val"><strong>${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)}</strong></td>
  <td colspan="3" class="meta-title">Filter Terpasang:</td>
  <td colspan="5" class="meta-val">Cabang: <strong>${escapeHTML(selectedBranch)}</strong> | Kat: <strong>${escapeHTML(selectedCat)}</strong> | Unit: <strong>${escapeHTML(selectedCode)}</strong></td>
</tr>
<tr style="height: 22pt;">
  <td colspan="3" class="meta-title">Tanggal & Jam Unduh:</td>
  <td colspan="5" class="meta-val">${new Date().toLocaleString('id-ID')}</td>
  <td colspan="3" class="meta-title">Total Unit Terekam:</td>
  <td colspan="5" class="meta-val"><strong>${sortedData.length} Mesin</strong></td>
</tr>
<tr style="height: 12pt;"><td colspan="16"></td></tr>

<!-- Kartu KPI Berwarna Eksekutif -->
<tr style="height: 68pt;">
  <td colspan="4" style="background-color: #fee2e2; border: 1.5pt solid #ef4444; padding: 10px; text-align: center; vertical-align: middle;">
    <span style="font-size: 8.5pt; color: #991b1b; font-weight: bold;">TOTAL DOWNTIME (DT)</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 16pt; color: #dc2626; font-weight: bold;">${totals.dtRepair.toFixed(1)} Jam</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 8pt; color: #7f1d1d;">PM Servis: ${totals.dtPm.toFixed(1)} Jam • Total DT+PM: ${totals.totalHours.toFixed(1)} Jam (${dtRatio}% : ${pmRatio}%)</span>
  </td>
  <td colspan="4" style="background-color: #fef3c7; border: 1.5pt solid #f59e0b; padding: 10px; text-align: center; vertical-align: middle;">
    <span style="font-size: 8.5pt; color: #92400e; font-weight: bold;">TOTAL BIAYA MAINTENANCE</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 15pt; color: #b45309; font-weight: bold;">${formatIDR(totals.totalCost)}</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 8pt; color: #78350f;">DT: ${formatIDR(totals.costDt)} | PM: ${formatIDR(totals.costPm)}</span>
  </td>
  <td colspan="4" style="background-color: #dbeafe; border: 1.5pt solid #3b82f6; padding: 10px; text-align: center; vertical-align: middle;">
    <span style="font-size: 8.5pt; color: #1e40af; font-weight: bold;">STATUS SPK & POSISI TIKET</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 16pt; color: #2563eb; font-weight: bold;">${totals.totalSpk} SPK</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 8pt; color: #1e3a8a;">Closed: ${spkCompletionRate}% • ${spkProgCount} Assignment • ${spkWaitCount} Waiting</span>
  </td>
  <td colspan="4" style="background-color: #ede9fe; border: 1.5pt solid #8b5cf6; padding: 10px; text-align: center; vertical-align: middle;">
    <span style="font-size: 8.5pt; color: #5b21b6; font-weight: bold;">DATA PROJECT MAINTENANCE</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 16pt; color: #6d28d9; font-weight: bold;">${branchProjects.length} Project</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 8pt; color: #4c1d95;">${prjDoneCount} Closed • ${prjProgCount} Assignment • ${prjWaitCount} Waiting • ${prjOpenCount} Open</span>
  </td>
</tr>
<tr style="height: 16pt;"><td colspan="16"></td></tr>

<!-- Bagian 1: Top 5 Pareto -->
<tr style="height: 26pt;"><td colspan="16" class="section-header">BAGIAN 1: TOP 5 DOWNTIME TERBESAR & DETAIL PROBLEM UTAMA (PARETO)</td></tr>
<tr style="height: 32pt;">
  <th class="th-accent">Rank</th>
  <th class="th-accent">Cabang</th>
  <th class="th-accent">Kode Mesin</th>
  <th class="th-accent" colspan="2">Nama / Spesifikasi Unit</th>
  <th class="th-accent">Kategori</th>
  <th class="th-accent">DT Perbaikan (Jam)</th>
  <th class="th-accent">PM (Jam)</th>
  <th class="th-accent" style="background-color: #991b1b;">Total DT+PM</th>
  <th class="th-accent" colspan="2">Total Biaya (IDR)</th>
  <th class="th-accent">Total SPK</th>
  <th class="th-accent" colspan="4">Detail Problem Terbesar & Sparepart Terpakai</th>
</tr>
${top5RowsHtml}
<tr style="height: 16pt;"><td colspan="16"></td></tr>

<!-- Bagian 2: Rekapitulasi Komprehensif Seluruh Mesin -->
<tr style="height: 26pt;"><td colspan="16" class="section-header">BAGIAN 2: REKAPITULASI DETAIL SELURUH MESIN (DOWNTIME, BIAYA & SPK)</td></tr>
<tr style="height: 32pt;">
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
<tr class="total-row" style="height: 28pt;">
  <td colspan="5" class="td-r" style="font-size: 9.5pt; padding-right: 12px;">TOTAL KESELURUHAN</td>
  <td class="num-dec" style="color: #dc2626;">${totals.dtRepair.toFixed(1)}</td>
  <td class="num-dec" style="color: #2563eb;">${totals.dtPm.toFixed(1)}</td>
  <td class="num-dec" style="background-color: #cbd5e1;">${totals.totalHours.toFixed(1)}</td>
  <td class="num-curr" style="color: #dc2626;">${Math.round(totals.costDt || 0)}</td>
  <td class="num-curr" style="color: #2563eb;">${Math.round(totals.costPm || 0)}</td>
  <td class="num-curr" style="background-color: #cbd5e1;">${Math.round(totals.totalCost || 0)}</td>
  <td class="num-int" style="color: #dc2626;">${totals.spkDt}</td>
  <td class="num-int" style="color: #2563eb;">${totals.spkPm}</td>
  <td class="num-int" style="background-color: #cbd5e1;">${totals.totalSpk}</td>
  <td colspan="2" class="td-l" style="font-size: 8.5pt; color: #475569;">Akumulasi Seluruh Unit Terfilter (${sortedData.length} Mesin)</td>
</tr>
<tr style="height: 16pt;"><td colspan="16"></td></tr>

<!-- Bagian 3: Status SPK & Posisi Tiket Kerja -->
<tr style="height: 26pt;"><td colspan="16" class="section-header">BAGIAN 3: STATUS SPK & POSISI TIKET KERJA (WORKFLOW ALUR)</td></tr>
<tr style="height: 68pt;">
  <td colspan="4" style="background-color: #fef3c7; border: 1.5pt solid #f59e0b; padding: 10px; text-align: center; vertical-align: middle;">
    <span style="font-size: 8.5pt; color: #92400e; font-weight: bold;">1. OPEN</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 16pt; color: #b45309; font-weight: bold;">${spkOpenCount} Tiket</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 8pt; color: #78350f;">Pekerjaan belum dikerjakan namun sudah ada SPK-nya</span>
  </td>
  <td colspan="4" style="background-color: #dbeafe; border: 1.5pt solid #3b82f6; padding: 10px; text-align: center; vertical-align: middle;">
    <span style="font-size: 8.5pt; color: #1e40af; font-weight: bold;">2. ASSIGNMENT</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 16pt; color: #2563eb; font-weight: bold;">${spkProgCount} Tiket</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 8pt; color: #1e3a8a;">Menentukan siapa pelaksana / proyek sedang berjalan</span>
  </td>
  <td colspan="4" style="background-color: #f3e8ff; border: 1.5pt solid #a855f7; padding: 10px; text-align: center; vertical-align: middle;">
    <span style="font-size: 8.5pt; color: #6b21a8; font-weight: bold;">3. WAITING TO CLOSE</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 16pt; color: #7e22ce; font-weight: bold;">${spkWaitCount} Tiket</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 8pt; color: #581c87;">Pekerjaan fisik selesai, menunggu disetujui</span>
  </td>
  <td colspan="4" style="background-color: #d1fae5; border: 1.5pt solid #10b981; padding: 10px; text-align: center; vertical-align: middle;">
    <span style="font-size: 8.5pt; color: #065f46; font-weight: bold;">4. CLOSED (${spkCompletionRate}% Tuntas)</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 16pt; color: #059669; font-weight: bold;">${spkClosedCount.toLocaleString('id-ID')} Tiket</span><br style="mso-data-placement:same-cell;">
    <span style="font-size: 8pt; color: #064e3b;">Pekerjaan disetujui & ditutup resmi</span>
  </td>
</tr>
<tr style="height: 16pt;"><td colspan="16"></td></tr>

<!-- Bagian 4: Monitoring Data Project Maintenance & Upgrading -->
<tr style="height: 26pt;"><td colspan="16" class="section-header">BAGIAN 4: MONITORING DATA PROJECT MAINTENANCE & UPGRADING</td></tr>
<tr style="height: 32pt;">
  <th class="th-accent" style="width: 45px;">No</th>
  <th class="th-accent" style="width: 65px;">Cabang</th>
  <th class="th-accent" style="width: 110px;">Kode Proyek</th>
  <th class="th-accent" colspan="2" style="width: 335px;">Nama Proyek & Deskripsi Rinci</th>
  <th class="th-accent" colspan="2" style="width: 225px;">Mesin / Fasilitas Terkait</th>
  <th class="th-accent" style="width: 105px;">Kategori</th>
  <th class="th-accent" style="width: 130px;">PIC Pelaksana</th>
  <th class="th-accent" style="width: 80px;">Progress</th>
  <th class="th-accent" style="width: 140px;">Status Proyek</th>
  <th class="th-accent" style="width: 110px;">Target Selesai</th>
  <th class="th-accent" colspan="4">Dampak Efisiensi & Target Operasional</th>
</tr>
${projectRowsHtml}

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
            const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '2026-11-01';
            const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '2026-11-10';
            const branchEl = document.getElementById('filterBranch');
            const selectedBranch = branchEl ? branchEl.value : 'ALL';
            const catEl = document.getElementById('filterCategory');
            const selectedCat = catEl ? catEl.value : 'ALL';
            const codeEl = document.getElementById('filterMachineCode');
            const selectedCode = codeEl ? codeEl.value : 'ALL';

            const escapeCSV = (val) => {
                if (val === null || val === undefined) return '""';
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            };

            const sortedData = [...currentAggregatedList].sort(
                (a, b) => b.totalHours - a.totalHours || b.dtRepair - a.dtRepair
            );

            const totals = currentTotals;

            let branchProjects = maintenanceProjectsList;
            if (selectedBranch !== 'ALL') {
                branchProjects = branchProjects.filter(p => p.branch === selectedBranch);
            }

            const spkOpenCount = getFilteredWorkflowTickets('OPEN').length;
            const spkProgCount = getFilteredWorkflowTickets('PROSES').length;
            const spkWaitCount = getFilteredWorkflowTickets('OUTSTANDING').length;
            const spkClosedCount = getFilteredWorkflowTickets('CLOSED').length;
            const spkTotalWorkflow = spkOpenCount + spkProgCount + spkWaitCount + spkClosedCount;
            const spkCompletionRate = spkTotalWorkflow > 0 ? ((spkClosedCount / spkTotalWorkflow) * 100).toFixed(1) : '94.4';

            const prjDoneCount = branchProjects.filter(p => p.status === 'SELESAI').length;
            const prjProgCount = branchProjects.filter(p => p.status === 'PROSES').length;
            const prjWaitCount = branchProjects.filter(p => p.status === 'OUTSTANDING').length;
            const prjOpenCount = branchProjects.filter(p => p.status === 'OPEN').length;

            const metaRows = [
                ["PT MITRA MULIA MAKMUR (MMM PLASTIC)"],
                ["LAPORAN MAINTENANCE SUMMARY (MONTH TO DATE)"],
                [`Periode Laporan: ${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)}`],
                [`Filter Cabang: ${selectedBranch} | Filter Kategori: ${selectedCat} | Filter Kode Mesin: ${selectedCode}`],
                [`Tanggal Unduh: ${new Date().toLocaleString('id-ID')}`],
                [],
                ["RINGKASAN KPI EKSEKUTIF:"],
                ["1. Total Downtime (DT)", `${totals.dtRepair.toFixed(1)} Jam (PM Servis: ${totals.dtPm.toFixed(1)} Jam, Total DT+PM: ${totals.totalHours.toFixed(1)} Jam [${dtRatio}% : ${pmRatio}%])`],
                ["2. Total Biaya Maintenance", `${totals.totalCost} (Cost DT: ${totals.costDt}, Cost PM: ${totals.costPm})`],
                ["3. Status SPK & Posisi Tiket", `${totals.totalSpk} SPK (1. OPEN: ${spkOpenCount}, 2. ASSIGNMENT: ${spkProgCount}, 3. WAITING TO CLOSE: ${spkWaitCount}, 4. CLOSED: ${spkClosedCount} [${spkCompletionRate}% Tuntas])`],
                ["4. Data Project Maintenance", `${branchProjects.length} Proyek (4. CLOSED: ${prjDoneCount}, 2. ASSIGNMENT: ${prjProgCount}, 3. WAITING TO CLOSE: ${prjWaitCount}, 1. OPEN: ${prjOpenCount})`],
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

            const projectHeaders = [
                "No",
                "Cabang",
                "Kode Proyek",
                "Nama Proyek",
                "Deskripsi Rinci",
                "Mesin Terkait",
                "Kategori",
                "PIC / Tim Pelaksana",
                "Progress (%)",
                "Status Proyek",
                "Target Selesai",
                "Dampak Efisiensi & Hasil Mesin"
            ];

            const projectRows = branchProjects.map((p, idx) => {
                let statusText = '1. OPEN';
                if (p.status === 'SELESAI') statusText = '4. CLOSED';
                else if (p.status === 'PROSES') statusText = '2. ASSIGNMENT';
                else if (p.status === 'OUTSTANDING') statusText = '3. WAITING TO CLOSE';

                return [
                    idx + 1,
                    p.branch,
                    p.code,
                    p.name,
                    p.desc,
                    p.machine,
                    p.category,
                    p.pic,
                    `${p.progress}%`,
                    statusText,
                    p.target,
                    p.impact
                ];
            });

            const csvLines = [
                ...metaRows.map(row => row.map(escapeCSV).join(",")),
                ["BAGIAN 2: REKAPITULASI DETAIL MESIN (DOWNTIME, BIAYA & SPK)"],
                tableHeaders.map(escapeCSV).join(","),
                ...dataRows.map(row => row.map(escapeCSV).join(",")),
                summaryRow.map(escapeCSV).join(","),
                [],
                ["BAGIAN 4: MONITORING DATA PROJECT MAINTENANCE & UPGRADING"],
                projectHeaders.map(escapeCSV).join(","),
                ...projectRows.map(row => row.map(escapeCSV).join(",")),
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

function printKpiTable() {
    window.print();
}
