$filePath = "c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# 1. Update HTML for Card 1 (DT subtitle)
$targetCard1 = @'
                    <h3 id="kpiDtRepair" class="text-2xl font-black text-red-600 mt-1 tracking-tight">0 Jam</h3>
                    <p id="kpiDtSubtitle" class="text-[11px] text-gray-500 mt-0.5">C1.a % DT: 3.02% (Target ≤3%) • C1.d
                        Utility: 7 Kasus</p>
'@

$replacementCard1 = @'
                    <h3 id="kpiDtRepair" class="text-2xl font-black text-red-600 mt-1 tracking-tight">0 Jam</h3>
                    <p id="kpiDtSubtitle" class="text-[11px] text-gray-500 mt-0.5">Rasio DT: 72.1% • PM: 27.9%</p>
'@

if ($content.Contains($targetCard1)) {
    $content = $content.Replace($targetCard1, $replacementCard1)
    Write-Host "Updated Card 1 HTML subtitle"
} else {
    Write-Error "targetCard1 not found"
    exit 1
}

# 2. Update HTML for Card 2 (Cost subtitle)
$targetCard2 = @'
                    <p id="kpiCostRatioSubtitle" class="text-[11px] text-gray-500 mt-0.5">F1.d Pemeliharaan: Rp 402/kg •
                        F1.f Listrik: 1.289 kWh</p>
'@

$replacementCard2 = @'
                    <p id="kpiCostRatioSubtitle" class="text-[11px] text-gray-500 mt-0.5">Rasio DT: 72.3% • PM: 27.7%</p>
'@

if ($content.Contains($targetCard2)) {
    $content = $content.Replace($targetCard2, $replacementCard2)
    Write-Host "Updated Card 2 HTML subtitle"
}

# 3. Update HTML for Card 3 (SPK subtitle)
$targetCard3 = @'
                    <p id="kpiSpkStatusSubtitle" class="text-[11px] text-gray-500 mt-0.5">B1.d Perawatan Tepat Waktu:
                        100% (Target ≥95%)</p>
'@

$replacementCard3 = @'
                    <p id="kpiSpkStatusSubtitle" class="text-[11px] text-gray-500 mt-0.5">Selesai: 94.4% • 32 Proses • 33 Outst.</p>
'@

if ($content.Contains($targetCard3)) {
    $content = $content.Replace($targetCard3, $replacementCard3)
    Write-Host "Updated Card 3 HTML subtitle"
}

# 4. Update HTML for Card 4 (Project subtitle)
$targetCard4 = @'
                    <p id="kpiPrjSubtitle" class="text-[11px] text-gray-500 mt-0.5">Proyek Tepat Waktu: 99.66% (Target
                        ≥95%)</p>
'@

$replacementCard4 = @'
                    <p id="kpiPrjSubtitle" class="text-[11px] text-gray-500 mt-0.5">8 Selesai • 3 Proses • 1 Outst.</p>
'@

if ($content.Contains($targetCard4)) {
    $content = $content.Replace($targetCard4, $replacementCard4)
    Write-Host "Updated Card 4 HTML subtitle"
}

# 5. Update renderKpiCards in JS to dynamically update kpiDtSubtitle and kpiPrjSubtitle
$targetRenderKpi = @'
        function renderKpiCards(totals) {
            const dtEl = document.getElementById('kpiDtRepair');
            if (dtEl) dtEl.textContent = `${totals.dtRepair.toFixed(1)} Jam`;

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
                prjSub.textContent = selectedBranch === 'ALL'
                    ? 'Proyek Tepat Waktu: 99.66% (Target ≥95%)'
                    : `Proyek Cabang ${selectedBranch}: ${branchProjects.length} Terdaftar`;
            }
            const cardPrjActionText = document.getElementById('cardPrjActionText');
            if (cardPrjActionText) cardPrjActionText.textContent = `Buka Rincian ${branchProjects.length} Project`;
        }
'@

$replacementRenderKpi = @'
        function renderKpiCards(totals) {
            const dtEl = document.getElementById('kpiDtRepair');
            if (dtEl) dtEl.textContent = `${totals.dtRepair.toFixed(1)} Jam`;

            const dtSub = document.getElementById('kpiDtSubtitle');
            if (dtSub) {
                const totalHours = totals.dtRepair + totals.dtPm;
                const dtRatio = totalHours > 0 ? ((totals.dtRepair / totalHours) * 100).toFixed(1) : '72.1';
                const pmRatio = totalHours > 0 ? ((totals.dtPm / totalHours) * 100).toFixed(1) : '27.9';
                dtSub.textContent = `Rasio DT: ${dtRatio}% • PM: ${pmRatio}%`;
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
                    ? `${doneCount} Selesai • ${progCount} Proses • ${outCount} Outst.`
                    : `Proyek Cabang ${selectedBranch}: ${branchProjects.length} Terdaftar • ${doneCount} Selesai`;
            }
            const cardPrjActionText = document.getElementById('cardPrjActionText');
            if (cardPrjActionText) cardPrjActionText.textContent = `Buka Rincian ${branchProjects.length} Project`;
        }
'@

if ($content.Contains($targetRenderKpi)) {
    $content = $content.Replace($targetRenderKpi, $replacementRenderKpi)
    Write-Host "Updated renderKpiCards in JS"
} else {
    Write-Error "targetRenderKpi not found"
    exit 1
}

# 6. Update updateProjectModule in JS
$targetUpdatePrjSub = @'
            const kpiPrjSub = document.getElementById('kpiPrjSubtitle');
            if (kpiPrjSub) {
                kpiPrjSub.textContent = branch === 'ALL'
                    ? 'B1.a Proyek Tepat Waktu: 99.66% (Target ≥95%)'
                    : `Proyek Cabang ${branch}: ${totalCount} Terdaftar • ${doneCount} Selesai`;
            }
'@

$replacementUpdatePrjSub = @'
            const kpiPrjSub = document.getElementById('kpiPrjSubtitle');
            if (kpiPrjSub) {
                kpiPrjSub.textContent = branch === 'ALL'
                    ? `${doneCount} Selesai • ${progCount} Proses • ${outCount} Outst.`
                    : `Proyek Cabang ${branch}: ${totalCount} Terdaftar • ${doneCount} Selesai`;
            }
'@

if ($content.Contains($targetUpdatePrjSub)) {
    $content = $content.Replace($targetUpdatePrjSub, $replacementUpdatePrjSub)
    Write-Host "Updated updateProjectModule in JS"
} else {
    Write-Warning "targetUpdatePrjSub not found (may already be updated)"
}

[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "DT card subtitle successfully updated to operational metrics!"
