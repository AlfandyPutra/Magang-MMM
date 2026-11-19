$srcFile = "c:\Kuliah\AntiGravity\Magang MMM\backups\maintenancesummary-mtd.html.bak20"
$lines = [System.IO.File]::ReadAllLines($srcFile, [System.Text.Encoding]::UTF8)
Write-Host "Source read with UTF-8, total lines: $($lines.Length)"

# 1. css/style.css
$cssHeader = @"
/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Global Styles & Custom Components
 */

"@
$cssContent = $cssHeader + ($lines[13..47] -join "`r`n")
[System.IO.File]::WriteAllText("c:\Kuliah\AntiGravity\Magang MMM\css\style.css", $cssContent, [System.Text.Encoding]::UTF8)

# 2. js/data/machines-data.js
$mHeader = @"
/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Master Data Mesin Pabrik (248 Unit - 4 Cabang: MMS, MMN, MMG, MMM)
 */
"@
$mContent = $mHeader + "`r`n" + ($lines[2002..2251] -join "`r`n")
[System.IO.File]::WriteAllText("c:\Kuliah\AntiGravity\Magang MMM\js\data\machines-data.js", $mContent, [System.Text.Encoding]::UTF8)

# 3. js/data/daily-logs.js
$dHeader = @"
/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Log Pemeliharaan Realitas (Ticket Detail Periode 01 - 10 Nov 2026)
 */
"@
$dContent = $dHeader + "`r`n" + ($lines[2254..3434] -join "`r`n")
[System.IO.File]::WriteAllText("c:\Kuliah\AntiGravity\Magang MMM\js\data\daily-logs.js", $dContent, [System.Text.Encoding]::UTF8)

# 4. js/data/projects-data.js
$pHeader = @"
/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Data Proyek Strategis Maintenance & Upgrading (13 Proyek)
 */
"@
$pContent = $pHeader + "`r`n" + ($lines[3731..3746] -join "`r`n")
[System.IO.File]::WriteAllText("c:\Kuliah\AntiGravity\Magang MMM\js\data\projects-data.js", $pContent, [System.Text.Encoding]::UTF8)

# 5. js/modules/charts.js
$cHeader = @"
/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Chart.js Visualization Module (Monthly Downtime & Cost Charts)
 */

"@
$chartVars = ($lines[3714..3729] -join "`r`n")
$chartFuncs = ($lines[3850..4043] -join "`r`n")
$fullCharts = $cHeader + $chartVars + "`r`n`r`n" + $chartFuncs
[System.IO.File]::WriteAllText("c:\Kuliah\AntiGravity\Magang MMM\js\modules\charts.js", $fullCharts, [System.Text.Encoding]::UTF8)

# 6. js/modules/workflow-spk.js
$spkHeader = @"
/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * SPK Workflow Tracking Module (4-Stage Pipeline: OPEN, PROSES, OUTSTANDING, CLOSED)
 */

"@
# We copy lines 4190..4469, but update the filter element query in getFilteredWorkflowTickets
$spkLines = $lines[4190..4469]
for ($i = 0; $i -lt $spkLines.Length; $i++) {
    if ($spkLines[$i] -match 'function getFilteredWorkflowTickets\(status\)') {
        $spkLines[$i+1] = "            const branch = (document.getElementById('filterBranch'))?.value || 'ALL';"
        $spkLines[$i+2] = "            const startDate = (document.getElementById('startDate') || document.getElementById('filterStartDate'))?.value || '';"
        $spkLines[$i+3] = "            const endDate = (document.getElementById('endDate') || document.getElementById('filterEndDate'))?.value || '';"
        $spkLines[$i+4] = "            const category = (document.getElementById('filterCategory'))?.value || 'ALL';"
        $spkLines[$i+5] = "            const machineCode = (document.getElementById('filterMachineCode') || document.getElementById('filterMachine'))?.value || 'ALL';"
        break
    }
}
$fullSpk = $spkHeader + ($spkLines -join "`r`n")
[System.IO.File]::WriteAllText("c:\Kuliah\AntiGravity\Magang MMM\js\modules\workflow-spk.js", $fullSpk, [System.Text.Encoding]::UTF8)

# 7. js/modules/project-module.js
$prjHeader = @"
/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Strategic Project Maintenance & Upgrading Tracking Module
 */

"@
$fullPrj = $prjHeader + ($lines[4473..4934] -join "`r`n")
[System.IO.File]::WriteAllText("c:\Kuliah\AntiGravity\Magang MMM\js\modules\project-module.js", $fullPrj, [System.Text.Encoding]::UTF8)

# 8. js/modules/export-tools.js
$expHeader = @"
/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Data Export Module (Executive-Grade Styled Excel .XLS, CSV, & Print)
 */

"@
# In exportToExcel, we hoist escapeHTML and getCategoryStyle before branchProjects.forEach to avoid TDZ
$expRaw = ($lines[5319..5859] -join "`r`n")

# Extract escapeHTML and getCategoryStyle from the bottom of exportToExcel and put before branchProjects.forEach
$helpers = @"
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

"@

# Remove duplicate from bottom and insert at top before getProjectStatusBadge
$targetInsert = "            const getProjectStatusBadge = (status) => {"
$idxInsert = $expRaw.IndexOf($targetInsert)
if ($idxInsert -gt 0) {
    $expRaw = $expRaw.Substring(0, $idxInsert) + $helpers + $expRaw.Substring($idxInsert)
}

# Remove the original declaration after branchProjects.forEach
$idxLoop = $expRaw.IndexOf("branchProjects.forEach")
$idxOrig = $expRaw.IndexOf("const escapeHTML", $idxLoop)
if ($idxOrig -gt 0) {
    $idxNext = $expRaw.IndexOf("let tableRowsHtml", $idxOrig)
    $expRaw = $expRaw.Substring(0, $idxOrig) + $expRaw.Substring($idxNext)
}

$printFunc = @"


function printKpiTable() {
    window.print();
}
"@
$fullExp = $expHeader + $expRaw + $printFunc
[System.IO.File]::WriteAllText("c:\Kuliah\AntiGravity\Magang MMM\js\modules\export-tools.js", $fullExp, [System.Text.Encoding]::UTF8)

# 9. js/app.js
$appHeader = @"
/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Main Application Controller (State, Calculations, Filter Orchestration, Renderers)
 */

"@
$b1 = ($lines[3436..3713] -join "`r`n")
$b2 = ($lines[3747..3847] -join "`r`n")
$b3 = ($lines[4045..4187] -join "`r`n")
$b4 = ($lines[4935..5317] -join "`r`n")

$b5 = @"

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
};
"@

$fullApp = $appHeader + $b1 + "`r`n`r`n" + $b2 + "`r`n`r`n" + $b3 + "`r`n`r`n" + $b4 + "`r`n`r`n" + $b5
[System.IO.File]::WriteAllText("c:\Kuliah\AntiGravity\Magang MMM\js\app.js", $fullApp, [System.Text.Encoding]::UTF8)

# 10. maintenancesummary-mtd.html
$pHead = $lines[0..11] -join "`r`n"
$pCss = "    <!-- MMS Custom Stylesheet -->`r`n    <link rel=" + '"stylesheet" href="css/style.css">'
$pBody = $lines[49..1991] -join "`r`n"
$pPrjModal = $lines[5879..5978] -join "`r`n"
$pScripts = @"

    <!-- ==================== JAVASCRIPT DATA & LOGIC MODULES ==================== -->
    <!-- 1. Master Data Sets -->
    <script src="js/data/machines-data.js"></script>
    <script src="js/data/daily-logs.js"></script>
    <script src="js/data/projects-data.js"></script>

    <!-- 2. Feature & Visualization Modules -->
    <script src="js/modules/charts.js"></script>
    <script src="js/modules/workflow-spk.js"></script>
    <script src="js/modules/project-module.js"></script>
    <script src="js/modules/export-tools.js"></script>

    <!-- 3. Core Dashboard Controller -->
    <script src="js/app.js"></script>
</body>

</html>
"@

$cleanHtml = $pHead + "`r`n" + $pCss + "`r`n" + $pBody + "`r`n`r`n" + $pPrjModal + "`r`n" + $pScripts
[System.IO.File]::WriteAllText("c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html", $cleanHtml, [System.Text.Encoding]::UTF8)

Write-Host "All files rebuilt with clean UTF-8 encoding!"