$ErrorActionPreference = "Stop"

# 1. Parse Sheet 2: Spareparts map
Add-Type -AssemblyName 'System.IO.Compression.FileSystem'
$xlsxPath = 'c:\Kuliah\AntiGravity\Magang MMM\Ticket_Detail_Source.xlsx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($xlsxPath)

$ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
$sr = New-Object System.IO.StreamReader($ssEntry.Open())
$ssXml = $sr.ReadToEnd()
$sr.Close()

$siMatches = [regex]::Matches($ssXml, '<si>(.*?)</si>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$sharedStrings = New-Object System.Collections.ArrayList
foreach ($si in $siMatches) {
    $tMatches = [regex]::Matches($si.Groups[1].Value, '<t[^>]*>([^<]*)</t>')
    $val = ''
    foreach ($t in $tMatches) { $val += $t.Groups[1].Value }
    [void]$sharedStrings.Add($val)
}

function GetCellVal($rc, $col, $rn) {
    $ref = "$col$rn"
    $cm = [regex]::Match($rc, "<c\s+r=`"$ref`"[^>]*>")
    if (-not $cm.Success) { return '' }
    $si = $cm.Index
    $ei = $rc.IndexOf('</c>', $si)
    if ($ei -lt 0) { return '' }
    $blk = $rc.Substring($si, $ei - $si + 4)
    $isSS = $blk -match 't="s"'
    $vm = [regex]::Match($blk, '<v>([^<]*)</v>')
    if (-not $vm.Success) { return '' }
    $rv = $vm.Groups[1].Value
    if ($isSS -and $rv -ne '') {
        $idx = [int]$rv
        if ($idx -lt $sharedStrings.Count) { return $sharedStrings[$idx] }
    }
    return $rv
}

$sheet2Entry = $zip.GetEntry('xl/worksheets/sheet2.xml')
$sr2 = New-Object System.IO.StreamReader($sheet2Entry.Open())
$sheet2Xml = $sr2.ReadToEnd()
$sr2.Close()

$rowMatches2 = [regex]::Matches($sheet2Xml, '<row\s+r="(\d+)"[^>]*>(.*?)</row>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$ticketPartsMap = @{}
$currentTicketCode = ''

foreach ($rm in $rowMatches2) {
    $rn = [int]$rm.Groups[1].Value
    if ($rn -lt 5) { continue }
    $rc = $rm.Groups[2].Value
    $codeCol = (GetCellVal $rc 'B' $rn).Trim()
    if ($codeCol -match '^OTRQS') { $currentTicketCode = $codeCol }
    $itemName = (GetCellVal $rc 'V' $rn).Trim()
    $qty = (GetCellVal $rc 'W' $rn).Trim()
    $subtotal = (GetCellVal $rc 'Y' $rn).Trim()
    if ($itemName -ne '' -and $itemName -ne '-' -and $currentTicketCode -ne '') {
        if (-not $ticketPartsMap.ContainsKey($currentTicketCode)) {
            $ticketPartsMap[$currentTicketCode] = New-Object System.Collections.ArrayList
        }
        $subNum = 0.0
        try { $subNum = [double]$subtotal } catch {}
        $costStr = if ($subNum -gt 0) { " (Rp $([Math]::Round($subNum,0).ToString('N0', [System.Globalization.CultureInfo]::GetCultureInfo('id-ID'))))" } else { "" }
        [void]$ticketPartsMap[$currentTicketCode].Add("$itemName x$qty$costStr")
    }
}

# 2. Parse Sheet 1
$sheet1Entry = $zip.GetEntry('xl/worksheets/sheet1.xml')
$sr1 = New-Object System.IO.StreamReader($sheet1Entry.Open())
$sheet1Xml = $sr1.ReadToEnd()
$sr1.Close()
$zip.Dispose()

$rowMatches1 = [regex]::Matches($sheet1Xml, '<row\s+r="(\d+)"[^>]*>(.*?)</row>', [System.Text.RegularExpressions.RegexOptions]::Singleline)

$assetMap = @{}

foreach ($rm in $rowMatches1) {
    $rn = [int]$rm.Groups[1].Value
    if ($rn -lt 5) { continue }
    $rc = $rm.Groups[2].Value
    
    $branch      = (GetCellVal $rc 'C' $rn).Trim()
    $reqDate     = (GetCellVal $rc 'D' $rn).Trim()
    $assetCode   = (GetCellVal $rc 'G' $rn).Trim()
    $assetName   = (GetCellVal $rc 'H' $rn).Trim()
    $probSummary = (GetCellVal $rc 'I' $rn).Trim()
    $probDetail  = (GetCellVal $rc 'J' $rn).Trim()
    $taskName    = (GetCellVal $rc 'M' $rn).Trim()
    $totalTime   = (GetCellVal $rc 'V' $rn).Trim()
    $note        = (GetCellVal $rc 'W' $rn).Trim()
    $totalCost   = (GetCellVal $rc 'X' $rn).Trim()
    $ticketCode  = (GetCellVal $rc 'B' $rn).Trim()
    
    if ($assetCode -eq '' -or $assetCode -eq '-' -or $assetCode -eq '0' -or $branch -eq '' -or $branch -eq '0') { continue }
    
    $cat = 'Lain-lain'
    if ($assetName -match 'INJ|INJECTION|MOULDING|LIEN YU|HWAMDA|ENGEL|VICTOR|AOKI|BORCHE|LESHAN') { $cat = 'Injection' }
    elseif ($assetName -match 'PRT|PRINT|PRINTER|KAZE|KASE|OFFSET|NYLO') { $cat = 'Printing' }
    elseif ($assetName -match 'CHL|CHILLER|COMPRESSOR|COMP|COOLING|TOWER|CLT|PPA|POMPA|GENSET|GST') { $cat = 'Utility' }
    elseif ($assetName -match 'ROBOT|RBT|PALLETIZER|PTZ') { $cat = 'Robot' }
    elseif ($assetName -match 'CONVEYOR|CNV|MIXER|MIX|CRUSHER|CRS|HOPPER|DRYER|AIR DRY|ADR|MOTAN|MOT|VACCUM') { $cat = 'Auxiliary' }
    
    $key = "$branch|$assetCode"
    if (-not $assetMap.ContainsKey($key)) {
        $assetMap[$key] = @{
            branch = $branch
            code = $assetCode
            unitName = $assetName
            category = $cat
            dtRepair = 0.0
            dtPm = 0.0
            costDt = 0.0
            costPm = 0.0
            spkDt = 0
            spkPm = 0
            problems = New-Object System.Collections.ArrayList
            spareparts = New-Object System.Collections.ArrayList
        }
    }
    
    $tt = 0.0
    $tc = 0.0
    if ($totalTime -ne '' -and $totalTime -ne '-') { try { $tt = [double]$totalTime } catch {} }
    if ($totalCost -ne '' -and $totalCost -ne '-') { try { $tc = [double]$totalCost } catch {} }
    
    $isPM = ($probSummary -match 'PERAWATAN REGULAR|PERAWATAN HARIAN') -or ($taskName -match 'PERAWATAN|REGULAR|HARIAN')
    
    if ($isPM) {
        $assetMap[$key].dtPm += $tt
        $assetMap[$key].costPm += $tc
        $assetMap[$key].spkPm++
    } else {
        $assetMap[$key].dtRepair += $tt
        $assetMap[$key].costDt += $tc
        $assetMap[$key].spkDt++
    }
    
    $cleanProb = ($probSummary -replace "`r`n|`n|`t", ' ').Trim()
    if ($cleanProb -ne '' -and $cleanProb -ne '-' -and -not $assetMap[$key].problems.Contains($cleanProb)) {
        [void]$assetMap[$key].problems.Add($cleanProb)
    }
    
    if ($ticketPartsMap.ContainsKey($ticketCode)) {
        foreach ($p in $ticketPartsMap[$ticketCode]) {
            if (-not $assetMap[$key].spareparts.Contains($p)) {
                [void]$assetMap[$key].spareparts.Add($p)
            }
        }
    } elseif ($note -ne '' -and $note -ne '-' -and -not $assetMap[$key].spareparts.Contains($note)) {
        [void]$assetMap[$key].spareparts.Add($note)
    }
}

# Aggregate list
$aggList = @()
foreach ($a in $assetMap.Values) {
    $totalHours = [Math]::Round(($a.dtRepair + $a.dtPm), 2)
    $totalCost = [Math]::Round(($a.costDt + $a.costPm), 0)
    $totalSpk = $a.spkDt + $a.spkPm
    $probStr = if ($a.problems.Count -gt 0) { ($a.problems | Select-Object -First 3) -join '; ' } else { '-' }
    $partStr = if ($a.spareparts.Count -gt 0) { ($a.spareparts | Select-Object -First 3) -join '; ' } else { '-' }
    
    $aggList += [PSCustomObject]@{
        branch = $a.branch
        code = $a.code
        unitName = $a.unitName
        category = $a.category
        dtRepair = [Math]::Round($a.dtRepair, 2)
        dtPm = [Math]::Round($a.dtPm, 2)
        totalHours = $totalHours
        costDt = [Math]::Round($a.costDt, 0)
        costPm = [Math]::Round($a.costPm, 0)
        totalCost = $totalCost
        spkDt = $a.spkDt
        spkPm = $a.spkPm
        totalSpk = $totalSpk
        problems = $probStr
        spareparts = $partStr
    }
}

$sorted = $aggList | Sort-Object -Property totalHours -Descending
$top5 = $sorted | Select-Object -First 5

$totalDtRepair = ($sorted | Measure-Object -Property dtRepair -Sum).Sum
$totalDtPm = ($sorted | Measure-Object -Property dtPm -Sum).Sum
$totalHoursAll = [Math]::Round(($totalDtRepair + $totalDtPm), 2)
$totalCostDt = ($sorted | Measure-Object -Property costDt -Sum).Sum
$totalCostPm = ($sorted | Measure-Object -Property costPm -Sum).Sum
$totalCostAll = $totalCostDt + $totalCostPm
$totalSpkDt = ($sorted | Measure-Object -Property spkDt -Sum).Sum
$totalSpkPm = ($sorted | Measure-Object -Property spkPm -Sum).Sum
$totalSpkAll = $totalSpkDt + $totalSpkPm

Write-Host "Aggregated: $($sorted.Count) assets, Total Hours: $totalHoursAll, Total Cost: $totalCostAll, Total SPK: $totalSpkAll"

# Build HTML Spreadsheet (.xls)
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">')
[void]$sb.AppendLine('<head>')
[void]$sb.AppendLine('<meta http-equiv="Content-Type" content="text/html; charset=utf-8">')
[void]$sb.AppendLine('<!--[if gte mso 9]>')
[void]$sb.AppendLine('<xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Maintenance Summary Real</x:Name><x:WorksheetOptions><x:DisplayGridlines/><x:Print><x:Orientation>Landscape</x:Orientation></x:Print></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>')
[void]$sb.AppendLine('<![endif]-->')
[void]$sb.AppendLine('<style>')
[void]$sb.AppendLine('  body, table, td, th { font-family: "Segoe UI", Calibri, Arial, sans-serif; font-size: 9.5pt; color: #1e293b; }')
[void]$sb.AppendLine('  .banner-company { background-color: #1e3a8a; color: #ffffff; font-size: 15pt; font-weight: bold; text-align: center; padding: 12px; }')
[void]$sb.AppendLine('  .banner-subtitle { background-color: #dbeafe; color: #1e3a8a; font-size: 11pt; font-weight: bold; text-align: center; padding: 7px; border-bottom: 2pt solid #2563eb; }')
[void]$sb.AppendLine('  .section-header { background-color: #1e40af; color: #ffffff; font-size: 10.5pt; font-weight: bold; padding: 8px 12px; border: 1pt solid #1e3a8a; text-transform: uppercase; }')
[void]$sb.AppendLine('  .meta-title { font-size: 9pt; color: #475569; font-weight: bold; padding: 5px 8px; border: 0.5pt solid #cbd5e1; background-color: #f1f5f9; }')
[void]$sb.AppendLine('  .meta-val { font-size: 9pt; color: #0f172a; padding: 5px 8px; border: 0.5pt solid #cbd5e1; }')
[void]$sb.AppendLine('  .th-blue { background-color: #2563eb; color: #ffffff; font-weight: bold; text-align: center; border: 1pt solid #1d4ed8; padding: 8px 6px; font-size: 9pt; }')
[void]$sb.AppendLine('  .th-accent { background-color: #1d4ed8; color: #ffffff; font-weight: bold; text-align: center; border: 1pt solid #172554; padding: 8px 6px; font-size: 9pt; }')
[void]$sb.AppendLine('  .td-c { border: 0.5pt solid #cbd5e1; padding: 6px; text-align: center; vertical-align: middle; }')
[void]$sb.AppendLine('  .td-l { border: 0.5pt solid #cbd5e1; padding: 6px; text-align: left; vertical-align: middle; }')
[void]$sb.AppendLine('  .td-r { border: 0.5pt solid #cbd5e1; padding: 6px; text-align: right; vertical-align: middle; }')
[void]$sb.AppendLine('  .num-dec { border: 0.5pt solid #cbd5e1; padding: 6px; text-align: right; vertical-align: middle; mso-number-format: "0\.0"; }')
[void]$sb.AppendLine('  .num-curr { border: 0.5pt solid #cbd5e1; padding: 6px; text-align: right; vertical-align: middle; mso-number-format: "\"Rp \"\#\,\#\#0"; }')
[void]$sb.AppendLine('  .num-int { border: 0.5pt solid #cbd5e1; padding: 6px; text-align: center; vertical-align: middle; mso-number-format: "\#\,\#\#0"; }')
[void]$sb.AppendLine('  .total-row { background-color: #e2e8f0; font-weight: bold; border-top: 2pt solid #334155; border-bottom: 3pt double #334155; }')
[void]$sb.AppendLine('</style>')
[void]$sb.AppendLine('</head>')
[void]$sb.AppendLine('<body>')
[void]$sb.AppendLine('<table border="0" cellpadding="0" cellspacing="0">')
[void]$sb.AppendLine('<col width="45"><col width="65"><col width="110"><col width="240"><col width="105"><col width="125"><col width="120"><col width="130"><col width="150"><col width="150"><col width="165"><col width="80"><col width="80"><col width="90"><col width="340"><col width="320">')
[void]$sb.AppendLine('<tr><td colspan="16" class="banner-company">PT MITRA MULIA MAKMUR (MMM PLASTIC)</td></tr>')
[void]$sb.AppendLine('<tr><td colspan="16" class="banner-subtitle">LAPORAN SUMMARY MAINTENANCE (01 - 10 NOVEMBER 2026 - 4 CABANG)</td></tr>')
[void]$sb.AppendLine('<tr><td colspan="16" style="height: 6px;"></td></tr>')
[void]$sb.AppendLine("<tr><td colspan='3' class='meta-title'>Periode Laporan:</td><td colspan='5' class='meta-val'><strong>01 Nov 2026 s/d 10 Nov 2026 (Data Riil Tiket)</strong></td><td colspan='3' class='meta-title'>Filter Terpasang:</td><td colspan='5' class='meta-val'>Semua Cabang (MMM, MMN, MMS, MMG) | Semua Kategori</td></tr>")
[void]$sb.AppendLine("<tr><td colspan='3' class='meta-title'>Tanggal & Jam Unduh:</td><td colspan='5' class='meta-val'>$(Get-Date -Format 'dd MMMM yyyy, HH:mm:ss')</td><td colspan='3' class='meta-title'>Total Unit Terekam:</td><td colspan='5' class='meta-val'><strong>$($sorted.Count) Mesin ($totalSpkAll Tiket Teragregasi)</strong></td></tr>")
[void]$sb.AppendLine('<tr><td colspan="16" style="height: 10px;"></td></tr>')

# KPI Cards
$costAllFormatted = $totalCostAll.ToString('N0', [System.Globalization.CultureInfo]::GetCultureInfo('id-ID'))
$costDtFormatted = $totalCostDt.ToString('N0', [System.Globalization.CultureInfo]::GetCultureInfo('id-ID'))
$costPmFormatted = $totalCostPm.ToString('N0', [System.Globalization.CultureInfo]::GetCultureInfo('id-ID'))

[void]$sb.AppendLine('<tr>')
[void]$sb.AppendLine("  <td colspan='4' style='background-color: #fee2e2; border: 1.5pt solid #ef4444; padding: 10px; text-align: center;'><span style='font-size: 8.5pt; color: #991b1b; font-weight: bold;'>TOTAL DT PERBAIKAN</span><br><span style='font-size: 16pt; color: #dc2626; font-weight: bold;'>$([Math]::Round($totalDtRepair, 1)) Jam</span><br><span style='font-size: 8pt; color: #7f1d1d;'>Akumulasi breakdown mesin</span></td>")
[void]$sb.AppendLine("  <td colspan='4' style='background-color: #dbeafe; border: 1.5pt solid #3b82f6; padding: 10px; text-align: center;'><span style='font-size: 8.5pt; color: #1e40af; font-weight: bold;'>TOTAL PREVENTIVE (PM)</span><br><span style='font-size: 16pt; color: #2563eb; font-weight: bold;'>$([Math]::Round($totalDtPm, 1)) Jam</span><br><span style='font-size: 8pt; color: #1e3a8a;'>Akumulasi jadwal PM rutin</span></td>")
[void]$sb.AppendLine("  <td colspan='4' style='background-color: #fef3c7; border: 1.5pt solid #f59e0b; padding: 10px; text-align: center;'><span style='font-size: 8.5pt; color: #92400e; font-weight: bold;'>TOTAL BIAYA MAINTENANCE</span><br><span style='font-size: 15pt; color: #b45309; font-weight: bold;'>Rp $costAllFormatted</span><br><span style='font-size: 8pt; color: #78350f;'>DT: Rp $costDtFormatted | PM: Rp $costPmFormatted</span></td>")
[void]$sb.AppendLine("  <td colspan='4' style='background-color: #d1fae5; border: 1.5pt solid #10b981; padding: 10px; text-align: center;'><span style='font-size: 8.5pt; color: #065f46; font-weight: bold;'>TOTAL REALISASI SPK</span><br><span style='font-size: 16pt; color: #059669; font-weight: bold;'>$totalSpkAll SPK</span><br><span style='font-size: 8pt; color: #064e3b;'>DT: $totalSpkDt SPK | PM: $totalSpkPm SPK</span></td>")
[void]$sb.AppendLine('</tr>')
[void]$sb.AppendLine('<tr><td colspan="16" style="height: 14px;"></td></tr>')

# Top 5 Table
[void]$sb.AppendLine('<tr><td colspan="16" class="section-header">BAGIAN 1: TOP 5 DOWNTIME TERBESAR & DETAIL PROBLEM UTAMA (PARETO ANALYSIS)</td></tr>')
[void]$sb.AppendLine('<tr>')
[void]$sb.AppendLine('  <th class="th-accent" style="width: 45px;">Rank</th>')
[void]$sb.AppendLine('  <th class="th-accent" style="width: 65px;">Cabang</th>')
[void]$sb.AppendLine('  <th class="th-accent" style="width: 110px;">Kode Mesin</th>')
[void]$sb.AppendLine('  <th class="th-accent" colspan="2" style="width: 335px;">Nama / Spesifikasi Unit</th>')
[void]$sb.AppendLine('  <th class="th-accent" style="width: 105px;">Kategori</th>')
[void]$sb.AppendLine('  <th class="th-accent" style="width: 125px;">DT Perbaikan (Jam)</th>')
[void]$sb.AppendLine('  <th class="th-accent" style="width: 120px;">PM (Jam)</th>')
[void]$sb.AppendLine('  <th class="th-accent" style="width: 130px; background-color: #991b1b;">Total DT+PM</th>')
[void]$sb.AppendLine('  <th class="th-accent" colspan="2" style="width: 300px;">Total Biaya (IDR)</th>')
[void]$sb.AppendLine('  <th class="th-accent" style="width: 80px;">Total SPK</th>')
[void]$sb.AppendLine('  <th class="th-accent" colspan="4">Detail Problem Terbesar & Sparepart Terpakai</th>')
[void]$sb.AppendLine('</tr>')

$rank = 1
foreach ($item in $top5) {
    $badgeStyle = if ($rank -eq 1) { 'background-color: #fee2e2; color: #b91c1c; font-weight: bold; border: 1pt solid #f87171;' } else { 'background-color: #fef3c7; color: #92400e; font-weight: bold; border: 1pt solid #fbbf24;' }
    [void]$sb.AppendLine('<tr>')
    [void]$sb.AppendLine("  <td class='td-c' style='$badgeStyle'>#$rank</td>")
    [void]$sb.AppendLine("  <td class='td-c' style='font-weight: bold;'>$($item.branch)</td>")
    [void]$sb.AppendLine("  <td class='td-c' style='font-weight: bold; mso-number-format: ""\@""'>$($item.code)</td>")
    [void]$sb.AppendLine("  <td class='td-l' colspan='2' style='font-weight: bold;'>$($item.unitName)</td>")
    [void]$sb.AppendLine("  <td class='td-c'>$($item.category)</td>")
    [void]$sb.AppendLine("  <td class='num-dec' style='color: #dc2626; font-weight: bold; font-size: 10.5pt;'>$($item.dtRepair)</td>")
    [void]$sb.AppendLine("  <td class='num-dec' style='color: #2563eb;'>$($item.dtPm)</td>")
    [void]$sb.AppendLine("  <td class='num-dec' style='font-weight: bold; background-color: #fee2e2; font-size: 10.5pt;'>$($item.totalHours)</td>")
    [void]$sb.AppendLine("  <td class='num-curr' colspan='2' style='font-weight: bold;'>$($item.totalCost)</td>")
    [void]$sb.AppendLine("  <td class='num-int'>$($item.totalSpk)</td>")
    [void]$sb.AppendLine("  <td class='td-l' colspan='4' style='font-size: 8.5pt; white-space: normal;'><strong>Problem:</strong> $($item.problems)<br><strong>Part:</strong> $($item.spareparts)</td>")
    [void]$sb.AppendLine('</tr>')
    $rank++
}

[void]$sb.AppendLine('<tr><td colspan="16" style="height: 14px;"></td></tr>')

# Full Table
[void]$sb.AppendLine('<tr><td colspan="16" class="section-header">BAGIAN 2: REKAPITULASI DETAIL SELURUH MESIN (DOWNTIME, BIAYA & SPK)</td></tr>')
[void]$sb.AppendLine('<tr>')
[void]$sb.AppendLine('  <th class="th-blue">No</th>')
[void]$sb.AppendLine('  <th class="th-blue">Cabang</th>')
[void]$sb.AppendLine('  <th class="th-blue">Kode Mesin</th>')
[void]$sb.AppendLine('  <th class="th-blue">Nama / Spesifikasi Unit</th>')
[void]$sb.AppendLine('  <th class="th-blue">Kategori</th>')
[void]$sb.AppendLine('  <th class="th-blue">DT Perbaikan (Jam)</th>')
[void]$sb.AppendLine('  <th class="th-blue">PM (Jam)</th>')
[void]$sb.AppendLine('  <th class="th-accent">Total Jam</th>')
[void]$sb.AppendLine('  <th class="th-blue">Cost DT (IDR)</th>')
[void]$sb.AppendLine('  <th class="th-blue">Cost PM (IDR)</th>')
[void]$sb.AppendLine('  <th class="th-accent">Total Cost (IDR)</th>')
[void]$sb.AppendLine('  <th class="th-blue">SPK DT</th>')
[void]$sb.AppendLine('  <th class="th-blue">SPK PM</th>')
[void]$sb.AppendLine('  <th class="th-accent">Total SPK</th>')
[void]$sb.AppendLine('  <th class="th-blue">Detail Problem Perbaikan</th>')
[void]$sb.AppendLine('  <th class="th-blue">Sparepart / Tindakan</th>')
[void]$sb.AppendLine('</tr>')

$no = 1
foreach ($item in $sorted) {
    $zebra = if ($no % 2 -eq 0) { "style='background-color: #f8fafc;'" } else { "style='background-color: #ffffff;'" }
    [void]$sb.AppendLine("<tr $zebra>")
    [void]$sb.AppendLine("  <td class='td-c'>$no</td>")
    [void]$sb.AppendLine("  <td class='td-c' style='font-weight: bold;'>$($item.branch)</td>")
    [void]$sb.AppendLine("  <td class='td-c' style='font-weight: bold; mso-number-format: ""\@""'>$($item.code)</td>")
    [void]$sb.AppendLine("  <td class='td-l' style='font-weight: 500;'>$($item.unitName)</td>")
    [void]$sb.AppendLine("  <td class='td-c'>$($item.category)</td>")
    [void]$sb.AppendLine("  <td class='num-dec' style='color: #dc2626; font-weight: 600;'>$($item.dtRepair)</td>")
    [void]$sb.AppendLine("  <td class='num-dec' style='color: #2563eb;'>$($item.dtPm)</td>")
    [void]$sb.AppendLine("  <td class='num-dec' style='font-weight: bold; background-color: #f1f5f9;'>$($item.totalHours)</td>")
    [void]$sb.AppendLine("  <td class='num-curr'>$($item.costDt)</td>")
    [void]$sb.AppendLine("  <td class='num-curr'>$($item.costPm)</td>")
    [void]$sb.AppendLine("  <td class='num-curr' style='font-weight: bold; background-color: #fef3c7;'>$($item.totalCost)</td>")
    [void]$sb.AppendLine("  <td class='num-int'>$($item.spkDt)</td>")
    [void]$sb.AppendLine("  <td class='num-int'>$($item.spkPm)</td>")
    [void]$sb.AppendLine("  <td class='num-int' style='font-weight: bold; background-color: #d1fae5;'>$($item.totalSpk)</td>")
    [void]$sb.AppendLine("  <td class='td-l' style='font-size: 8.5pt; white-space: normal;'>$($item.problems)</td>")
    [void]$sb.AppendLine("  <td class='td-l' style='font-size: 8.5pt; white-space: normal;'>$($item.spareparts)</td>")
    [void]$sb.AppendLine('</tr>')
    $no++
}

# Total row
[void]$sb.AppendLine('<tr class="total-row">')
[void]$sb.AppendLine('  <td colspan="5" class="td-r" style="font-size: 9.5pt; padding-right: 12px;">TOTAL KESELURUHAN</td>')
[void]$sb.AppendLine("  <td class='num-dec' style='color: #dc2626;'>$([Math]::Round($totalDtRepair, 1))</td>")
[void]$sb.AppendLine("  <td class='num-dec' style='color: #2563eb;'>$([Math]::Round($totalDtPm, 1))</td>")
[void]$sb.AppendLine("  <td class='num-dec' style='background-color: #cbd5e1;'>$totalHoursAll</td>")
[void]$sb.AppendLine("  <td class='num-curr' style='color: #dc2626;'>$totalCostDt</td>")
[void]$sb.AppendLine("  <td class='num-curr' style='color: #2563eb;'>$totalCostPm</td>")
[void]$sb.AppendLine("  <td class='num-curr' style='background-color: #cbd5e1;'>$totalCostAll</td>")
[void]$sb.AppendLine("  <td class='num-int' style='color: #dc2626;'>$totalSpkDt</td>")
[void]$sb.AppendLine("  <td class='num-int' style='color: #2563eb;'>$totalSpkPm</td>")
[void]$sb.AppendLine("  <td class='num-int' style='background-color: #cbd5e1;'>$totalSpkAll</td>")
[void]$sb.AppendLine("  <td colspan='2' class='td-l' style='font-size: 8.5pt; color: #475569;'>Akumulasi Seluruh Unit Terfilter ($($sorted.Count) Mesin)</td>")
[void]$sb.AppendLine('</tr>')
[void]$sb.AppendLine('</table>')
[void]$sb.AppendLine('</body>')
[void]$sb.AppendLine('</html>')

$outputXls = "c:\Kuliah\AntiGravity\Magang MMM\Maintenance_Summary_Real_2026-11-01_sd_2026-11-10.xls"
[System.IO.File]::WriteAllText($outputXls, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "Excel report successfully created: $outputXls"
