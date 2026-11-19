$filePath = "c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Replace kpiDtSubtitle regex
$patternDt = '(?s)<p id="kpiDtSubtitle"[^>]*>.*?</p>'
$replacementDt = '<p id="kpiDtSubtitle" class="text-[11px] text-gray-500 mt-0.5">Rasio DT: 72.1% • PM: 27.9%</p>'
if ($content -match $patternDt) {
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, $patternDt, $replacementDt, 1)
    Write-Host "Updated kpiDtSubtitle in HTML"
} else {
    Write-Warning "kpiDtSubtitle not matched"
}

# Replace kpiCostRatioSubtitle regex
$patternCost = '(?s)<p id="kpiCostRatioSubtitle"[^>]*>.*?</p>'
$replacementCost = '<p id="kpiCostRatioSubtitle" class="text-[11px] text-gray-500 mt-0.5">Rasio DT: 72.3% • PM: 27.7%</p>'
if ($content -match $patternCost) {
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, $patternCost, $replacementCost, 1)
    Write-Host "Updated kpiCostRatioSubtitle in HTML"
}

# Replace kpiSpkStatusSubtitle regex
$patternSpk = '(?s)<p id="kpiSpkStatusSubtitle"[^>]*>.*?</p>'
$replacementSpk = '<p id="kpiSpkStatusSubtitle" class="text-[11px] text-gray-500 mt-0.5">Selesai: 94.4% • 32 Proses • 33 Outst.</p>'
if ($content -match $patternSpk) {
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, $patternSpk, $replacementSpk, 1)
    Write-Host "Updated kpiSpkStatusSubtitle in HTML"
}

# Replace kpiPrjSubtitle regex
$patternPrj = '(?s)<p id="kpiPrjSubtitle"[^>]*>.*?</p>'
$replacementPrj = '<p id="kpiPrjSubtitle" class="text-[11px] text-gray-500 mt-0.5">8 Selesai • 3 Proses • 1 Outst.</p>'
if ($content -match $patternPrj) {
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, $patternPrj, $replacementPrj, 1)
    Write-Host "Updated kpiPrjSubtitle in HTML"
}

# Update renderKpiCards in JS
$oldRender = @'
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

$newRender = @'
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

if ($content.Contains($oldRender)) {
    $content = $content.Replace($oldRender, $newRender)
    Write-Host "Updated renderKpiCards in JS"
} else {
    Write-Warning "oldRender not found"
}

# Update updateProjectModule kpiPrjSub
$oldPrjSubInModule = @'
            const kpiPrjSub = document.getElementById('kpiPrjSubtitle');
            if (kpiPrjSub) {
                kpiPrjSub.textContent = branch === 'ALL'
                    ? 'B1.a Proyek Tepat Waktu: 99.66% (Target ≥95%)'
                    : `Proyek Cabang ${branch}: ${totalCount} Terdaftar • ${doneCount} Selesai`;
            }
'@

$newPrjSubInModule = @'
            const kpiPrjSub = document.getElementById('kpiPrjSubtitle');
            if (kpiPrjSub) {
                kpiPrjSub.textContent = branch === 'ALL'
                    ? `${doneCount} Selesai • ${progCount} Proses • ${outCount} Outst.`
                    : `Proyek Cabang ${branch}: ${totalCount} Terdaftar • ${doneCount} Selesai`;
            }
'@

if ($content.Contains($oldPrjSubInModule)) {
    $content = $content.Replace($oldPrjSubInModule, $newPrjSubInModule)
    Write-Host "Updated kpiPrjSub in updateProjectModule"
}

[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Finished updating all top KPI card subtitles successfully!"
