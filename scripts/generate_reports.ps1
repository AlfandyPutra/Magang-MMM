# PowerShell generator for styled Excel (.xls) reports
$ErrorActionPreference = "Stop"

# Master Machines (24 Unit)
$masterMachines = @(
    [PSCustomObject]@{ code = "INJ-01"; unitName = "Mesin Injection EG-180T #01"; category = "Injection" },
    [PSCustomObject]@{ code = "INJ-02"; unitName = "Mesin Injection EG-380T #02"; category = "Injection" },
    [PSCustomObject]@{ code = "INJ-03"; unitName = "Mesin Injection LY-700T #03"; category = "Injection" },
    [PSCustomObject]@{ code = "INJ-04"; unitName = "Mesin Injection KSP-815 #04"; category = "Injection" },
    [PSCustomObject]@{ code = "INJ-05"; unitName = "Mesin Injection LY-600T #05"; category = "Injection" },
    [PSCustomObject]@{ code = "INJ-06"; unitName = "Mesin Injection EG-250T #06"; category = "Injection" },
    [PSCustomObject]@{ code = "INJ-07"; unitName = "Mesin Injection LY-305T #07"; category = "Injection" },
    [PSCustomObject]@{ code = "INJ-08"; unitName = "Mesin Injection K908H #08"; category = "Injection" },
    [PSCustomObject]@{ code = "PRT-01"; unitName = "Mesin Printing Offset 6-Color #01"; category = "Printing" },
    [PSCustomObject]@{ code = "PRT-02"; unitName = "Mesin Printing UV Curing #02"; category = "Printing" },
    [PSCustomObject]@{ code = "PRT-03"; unitName = "Mesin Printing Dry Offset Cup #03"; category = "Printing" },
    [PSCustomObject]@{ code = "PRT-04"; unitName = "Mesin Printing High-Speed Lid #04"; category = "Printing" },
    [PSCustomObject]@{ code = "CMP-01"; unitName = "Compressor Screw Atlas Copco #01"; category = "Utility" },
    [PSCustomObject]@{ code = "CMP-02"; unitName = "Compressor Booster High-Pressure #02"; category = "Utility" },
    [PSCustomObject]@{ code = "CHL-01"; unitName = "Chiller Water Cooling System #01"; category = "Utility" },
    [PSCustomObject]@{ code = "CHL-02"; unitName = "Chiller Mold Temperature Unit #02"; category = "Utility" },
    [PSCustomObject]@{ code = "MLD-01"; unitName = "Mold Cup 16oz Cavity-8 #01"; category = "Utility" },
    [PSCustomObject]@{ code = "MLD-02"; unitName = "Mold Bowl 500ml Cavity-4 #02"; category = "Utility" },
    [PSCustomObject]@{ code = "CNV-01"; unitName = "Conveyor Line Packing #01"; category = "Lain-lain" },
    [PSCustomObject]@{ code = "CNV-02"; unitName = "Conveyor Transfer Auto-Stacker #02"; category = "Lain-lain" },
    [PSCustomObject]@{ code = "MIX-01"; unitName = "Mixer Material & Pigment #01"; category = "Lain-lain" },
    [PSCustomObject]@{ code = "MIX-02"; unitName = "Mixer Auto-Dosing Resin #02"; category = "Lain-lain" },
    [PSCustomObject]@{ code = "CRS-01"; unitName = "Crusher Waste Plastic Heavy #01"; category = "Lain-lain" },
    [PSCustomObject]@{ code = "CRS-02"; unitName = "Crusher Inline Runner #02"; category = "Lain-lain" }
)

# Daily Logs
$rawLogs = @(
    # Nov 17
    [PSCustomObject]@{ date = "2026-11-17"; code = "PRT-01"; dtRepair = 3.5; pm = 1.5; costDt = 11500000; costPm = 350000; spkDt = 1; spkPm = 1; problem = "Motor Servo SEW error overload & tinta tidak rata"; sparepart = "Repair Motor Servo SEW CFM112L/KTY/VR 400VAC" },
    [PSCustomObject]@{ date = "2026-11-17"; code = "INJ-01"; dtRepair = 2.5; pm = 2.0; costDt = 450000; costPm = 300000; spkDt = 1; spkPm = 1; problem = "Oscilating no 6 macet, rol isolating fontain no 7 macet"; sparepart = "Swing Arm Roll Oscilating 20x115, Bearing 6009 2RS" },
    [PSCustomObject]@{ date = "2026-11-17"; code = "CMP-01"; dtRepair = 2.0; pm = 1.5; costDt = 850000; costPm = 450000; spkDt = 1; spkPm = 1; problem = "Tekanan angin drop pada jalur utama, solenoid valve bocor"; sparepart = "Solenoid Valve Angin 1/2 Inch & Seal Kit" },
    [PSCustomObject]@{ date = "2026-11-17"; code = "INJ-05"; dtRepair = 1.5; pm = 1.5; costDt = 620000; costPm = 250000; spkDt = 1; spkPm = 1; problem = "Heater nozzle putus & sensor thermocouple error"; sparepart = "Nozzle Heater Band 220V 800W & Thermocouple Type-K" },
    [PSCustomObject]@{ date = "2026-11-17"; code = "CHL-01"; dtRepair = 1.0; pm = 1.5; costDt = 380000; costPm = 200000; spkDt = 1; spkPm = 1; problem = "Suhu sirkulasi air naik ke 18 C, strainer kotor tersumbat"; sparepart = "Chemical Descaling & Filter Strainer" },
    [PSCustomObject]@{ date = "2026-11-17"; code = "CNV-01"; dtRepair = 0.8; pm = 1.0; costDt = 220000; costPm = 150000; spkDt = 1; spkPm = 1; problem = "Conveyor off mendadak, belt selip & roller aus"; sparepart = "V-Belt A-42 & Bearing Pillow Block" },
    [PSCustomObject]@{ date = "2026-11-17"; code = "MLD-02"; dtRepair = 0.5; pm = 1.5; costDt = 175000; costPm = 250000; spkDt = 1; spkPm = 1; problem = "Pin ejektor seret saat buka mold bowl"; sparepart = "Ejector Pin SKD61 & High-Temp Mold Grease" },

    # Nov 11-16
    [PSCustomObject]@{ date = "2026-11-15"; code = "INJ-02"; dtRepair = 3.0; pm = 3.5; costDt = 420000; costPm = 500000; spkDt = 2; spkPm = 3; problem = "Takeout error, baut takeout kendor & proximity sensor lepas"; sparepart = "Baut Verseng L 6x25, Baut L 5x25, Proximity Sensor Omron" },
    [PSCustomObject]@{ date = "2026-11-14"; code = "PRT-03"; dtRepair = 2.8; pm = 3.0; costDt = 2450000; costPm = 600000; spkDt = 1; spkPm = 3; problem = "Gearbox feeder cup aus dan mandrel tidak presisi"; sparepart = "Bevel Gear Set & Bearing Taper Roller" },
    [PSCustomObject]@{ date = "2026-11-13"; code = "INJ-06"; dtRepair = 2.2; pm = 3.0; costDt = 1350000; costPm = 450000; spkDt = 1; spkPm = 2; problem = "Kebocoran oli hidrolik pada cylinder clamping utama"; sparepart = "Hydraulic Piston Seal Kit & Oli Hidrolik ISO VG 46" },
    [PSCustomObject]@{ date = "2026-11-12"; code = "CRS-01"; dtRepair = 1.8; pm = 2.0; costDt = 950000; costPm = 300000; spkDt = 1; spkPm = 2; problem = "Pisau crusher patah terkena material keras, screen sobek"; sparepart = "Set Pisau Crusher SKD-11 & Mesh Screen 8mm" },
    [PSCustomObject]@{ date = "2026-11-11"; code = "CMP-02"; dtRepair = 1.5; pm = 3.0; costDt = 1120000; costPm = 700000; spkDt = 1; spkPm = 2; problem = "Unloader valve kompresor booster macet pada 28 Bar"; sparepart = "Unloader Valve Repair Kit & Filter Udara" },

    # Nov 01-10
    [PSCustomObject]@{ date = "2026-11-09"; code = "INJ-01"; dtRepair = 3.5; pm = 6.0; costDt = 1180000; costPm = 1200000; spkDt = 2; spkPm = 5; problem = "Proportional valve tekanan injeksi tidak stabil"; sparepart = "Proportional Pressure Valve Coil & O-Ring Viton" },
    [PSCustomObject]@{ date = "2026-11-08"; code = "INJ-03"; dtRepair = 3.0; pm = 5.5; costDt = 780000; costPm = 650000; spkDt = 2; spkPm = 4; problem = "Flamer mati mendadak, tarik dorong body macet"; sparepart = "Ignitor Busbar Flamer & Linear Bushing LM20" },
    [PSCustomObject]@{ date = "2026-11-07"; code = "PRT-02"; dtRepair = 2.5; pm = 5.0; costDt = 1850000; costPm = 550000; spkDt = 1; spkPm = 4; problem = "Lampu UV curing redup, ballast & reflektor diganti"; sparepart = "UV Lamp 400W High Intensity & Kabel Tahan Panas" },
    [PSCustomObject]@{ date = "2026-11-06"; code = "INJ-07"; dtRepair = 2.2; pm = 4.0; costDt = 540000; costPm = 480000; spkDt = 1; spkPm = 4; problem = "Water flow meter cooling tersumbat kerak"; sparepart = "Acrylic Flow Meter 4-Zone & Selang PU 12mm" },
    [PSCustomObject]@{ date = "2026-11-05"; code = "CHL-02"; dtRepair = 2.0; pm = 4.0; costDt = 920000; costPm = 500000; spkDt = 1; spkPm = 3; problem = "Kontaktor kompresor chiller trip & terbakar lonjakan arus"; sparepart = "Magnetic Contactor 3-Phase 40A & Thermal Overload" },
    [PSCustomObject]@{ date = "2026-11-04"; code = "INJ-04"; dtRepair = 1.8; pm = 4.5; costDt = 310000; costPm = 450000; spkDt = 1; spkPm = 4; problem = "Ejektor angin lemah saat pelepasan produk cup"; sparepart = "Air Jet Valve 12 & Quick Coupler" },
    [PSCustomObject]@{ date = "2026-11-03"; code = "MIX-01"; dtRepair = 1.5; pm = 3.5; costDt = 480000; costPm = 320000; spkDt = 1; spkPm = 3; problem = "Suara kasar pada gearbox pengaduk & seal as bocor"; sparepart = "Oli Gearbox SAE 90, Oil Seal TC & Bearing 6208" },
    [PSCustomObject]@{ date = "2026-11-03"; code = "PRT-04"; dtRepair = 1.4; pm = 3.5; costDt = 690000; costPm = 420000; spkDt = 1; spkPm = 3; problem = "Counter sensor stacker lid tidak menghitung akurat"; sparepart = "Fiber Optic Amplifier Sensor Omron" },
    [PSCustomObject]@{ date = "2026-11-02"; code = "INJ-08"; dtRepair = 1.2; pm = 3.5; costDt = 290000; costPm = 400000; spkDt = 1; spkPm = 3; problem = "Safety gate limit switch patah"; sparepart = "Interlock Safety Limit Switch" },
    [PSCustomObject]@{ date = "2026-11-02"; code = "MLD-01"; dtRepair = 1.0; pm = 4.0; costDt = 250000; costPm = 550000; spkDt = 1; spkPm = 3; problem = "Flashing tipis pada bibir cup, poles parting line"; sparepart = "Diamond Paste & O-Ring Viton Cooling Mold" },
    [PSCustomObject]@{ date = "2026-11-01"; code = "CNV-02"; dtRepair = 0.8; pm = 3.0; costDt = 195000; costPm = 280000; spkDt = 1; spkPm = 3; problem = "Motor stepper diverter stacker macet"; sparepart = "Coupling Flexible & Pulley Timing" },
    [PSCustomObject]@{ date = "2026-11-01"; code = "MIX-02"; dtRepair = 0.5; pm = 2.5; costDt = 160000; costPm = 240000; spkDt = 1; spkPm = 2; problem = "Hopper loader vacuum motor filter tersumbat debu resin"; sparepart = "Cartridge Filter Vacuum Loader" },
    [PSCustomObject]@{ date = "2026-11-01"; code = "CRS-02"; dtRepair = 0.4; pm = 2.5; costDt = 120000; costPm = 220000; spkDt = 1; spkPm = 2; problem = "V-belt penggerak crusher inline kendor"; sparepart = "V-Belt B-38 (2 pcs)" },

    # Okt 2026 (All 24 Mesin)
    [PSCustomObject]@{ date = "2026-10-25"; code = "INJ-02"; dtRepair = 6.5; pm = 11.0; costDt = 4200000; costPm = 1500000; spkDt = 4; spkPm = 12; problem = "Heater barrel zona 2 putus & kebocoran selang hidrolik"; sparepart = "Band Heater 220V 1500W (3 pcs), Hose Hidrolik High Pressure" },
    [PSCustomObject]@{ date = "2026-10-24"; code = "INJ-03"; dtRepair = 4.5; pm = 8.0; costDt = 2150000; costPm = 950000; spkDt = 2; spkPm = 8; problem = "Hydraulic motor charging lambat & filter oli kotor"; sparepart = "Cartridge Filter Hidrolik & Seal Kit Motor" },
    [PSCustomObject]@{ date = "2026-10-23"; code = "PRT-02"; dtRepair = 4.2; pm = 7.5; costDt = 2600000; costPm = 850000; spkDt = 2; spkPm = 8; problem = "Curing lamp transformer overheat & trip proteksi"; sparepart = "Trafo Step-Up UV Lamp 5kW & Kipas Blower" },
    [PSCustomObject]@{ date = "2026-10-22"; code = "CMP-01"; dtRepair = 5.5; pm = 9.5; costDt = 3800000; costPm = 1800000; spkDt = 3; spkPm = 10; problem = "Overheat kompresor saat beban puncak siang hari"; sparepart = "Thermostatic Valve Kit, Oil Cooler Flush & Air Filter" },
    [PSCustomObject]@{ date = "2026-10-20"; code = "INJ-04"; dtRepair = 3.8; pm = 7.5; costDt = 1850000; costPm = 800000; spkDt = 2; spkPm = 8; problem = "Suhu oli hidrolik tinggi, oil cooler tersumbat"; sparepart = "Chemical Cleaning Cooler & Thermostat Valve" },
    [PSCustomObject]@{ date = "2026-10-19"; code = "CMP-02"; dtRepair = 3.6; pm = 7.0; costDt = 1950000; costPm = 900000; spkDt = 2; spkPm = 8; problem = "Tekanan stage 2 drop, katup discharge berkerak"; sparepart = "Valve Plate Set & Gasket High-Pressure" },
    [PSCustomObject]@{ date = "2026-10-18"; code = "PRT-01"; dtRepair = 4.8; pm = 8.5; costDt = 2350000; costPm = 1200000; spkDt = 3; spkPm = 10; problem = "Roll blanket aus dan sensor feeder kertas error"; sparepart = "Printing Blanket Sheet & Photocell Sensor" },
    [PSCustomObject]@{ date = "2026-10-17"; code = "INJ-06"; dtRepair = 3.0; pm = 7.0; costDt = 1250000; costPm = 700000; spkDt = 2; spkPm = 7; problem = "Linear scale clamping kotor pembacaan stroke loncat"; sparepart = "Linear Ruler Sensor 600mm & Kabel Shield" },
    [PSCustomObject]@{ date = "2026-10-16"; code = "PRT-04"; dtRepair = 2.6; pm = 6.0; costDt = 980000; costPm = 650000; spkDt = 2; spkPm = 7; problem = "Mandrel suction cup pecah & vacuum tidak hisap"; sparepart = "Vacuum Suction Pad Silicone & Solenoid SMC" },
    [PSCustomObject]@{ date = "2026-10-15"; code = "INJ-01"; dtRepair = 4.0; pm = 10.0; costDt = 950000; costPm = 1400000; spkDt = 2; spkPm = 11; problem = "Level mesin bergeser (mesin goyang saat clamping)"; sparepart = "Leveling Pad Rubber Heavy Duty & Baut Angkur" },
    [PSCustomObject]@{ date = "2026-10-14"; code = "CRS-01"; dtRepair = 2.0; pm = 5.5; costDt = 850000; costPm = 500000; spkDt = 1; spkPm = 7; problem = "Pisau crusher tumpul & getaran body crusher berlebih"; sparepart = "Pisau Crusher Rotary & Fixed" },
    [PSCustomObject]@{ date = "2026-10-13"; code = "CHL-02"; dtRepair = 2.7; pm = 6.0; costDt = 1200000; costPm = 650000; spkDt = 1; spkPm = 7; problem = "Heater pemanas chiller mold bocor insulasi"; sparepart = "Tubular Immersion Heater 6kW & SSR Celduc" },
    [PSCustomObject]@{ date = "2026-10-12"; code = "CHL-01"; dtRepair = 3.5; pm = 8.0; costDt = 1450000; costPm = 950000; spkDt = 2; spkPm = 9; problem = "Mechanical seal pompa chiller aus rembes air"; sparepart = "Mechanical Seal & Bearing Pompa Grundfos" },
    [PSCustomObject]@{ date = "2026-10-11"; code = "INJ-08"; dtRepair = 2.2; pm = 5.5; costDt = 650000; costPm = 550000; spkDt = 1; spkPm = 7; problem = "Nozzle heater putus dan lelehan plastik di kabel"; sparepart = "Nozzle Brass Heater 220V 500W" },
    [PSCustomObject]@{ date = "2026-10-10"; code = "INJ-05"; dtRepair = 3.2; pm = 7.5; costDt = 1100000; costPm = 850000; spkDt = 2; spkPm = 9; problem = "Check ring aus, injection backflow saat injeksi"; sparepart = "Check Ring & Thrust Collar Set" },
    [PSCustomObject]@{ date = "2026-10-09"; code = "INJ-07"; dtRepair = 2.5; pm = 6.0; costDt = 780000; costPm = 600000; spkDt = 1; spkPm = 7; problem = "Directional valve hydraulic tersumbat gram kotoran"; sparepart = "Directional Valve Yuken 24VDC & O-Ring" },
    [PSCustomObject]@{ date = "2026-10-08"; code = "PRT-03"; dtRepair = 2.8; pm = 7.0; costDt = 890000; costPm = 750000; spkDt = 2; spkPm = 8; problem = "Ceramic electrode corona discharge pecah & berdebu"; sparepart = "Ceramic Electrode Tube & High Voltage Cable" },
    [PSCustomObject]@{ date = "2026-10-06"; code = "MIX-01"; dtRepair = 1.7; pm = 4.5; costDt = 580000; costPm = 400000; spkDt = 1; spkPm = 7; problem = "Bearing flange mixer aus mengeluarkan suara decit"; sparepart = "Flange Bearing UCF 208 & Grease Mobilith" },
    [PSCustomObject]@{ date = "2026-10-05"; code = "MLD-02"; dtRepair = 2.1; pm = 5.5; costDt = 820000; costPm = 700000; spkDt = 1; spkPm = 8; problem = "Parting line mold aus timbul flash keliling produk"; sparepart = "Touch-up Parting Line & Diamond Paste Polish" },
    [PSCustomObject]@{ date = "2026-10-04"; code = "MIX-02"; dtRepair = 1.1; pm = 4.0; costDt = 350000; costPm = 350000; spkDt = 1; spkPm = 5; problem = "Pulley timing belt dosing mixer aus kendor"; sparepart = "Pulley Timing Belt & Belt HTD-8M" },
    [PSCustomObject]@{ date = "2026-10-03"; code = "MLD-01"; dtRepair = 1.8; pm = 6.5; costDt = 550000; costPm = 800000; spkDt = 1; spkPm = 8; problem = "Ejector bushing aus dan baret saat siklus cepat"; sparepart = "Ejector Pin SKD61 & Copper Beryllium Bush" },
    [PSCustomObject]@{ date = "2026-10-02"; code = "CNV-01"; dtRepair = 1.2; pm = 5.0; costDt = 320000; costPm = 400000; spkDt = 1; spkPm = 6; problem = "Sambungan conveyor belt sobek & lepas"; sparepart = "Fastener Belt Stainless & Lem" },
    [PSCustomObject]@{ date = "2026-10-01"; code = "CRS-02"; dtRepair = 1.0; pm = 4.0; costDt = 280000; costPm = 300000; spkDt = 1; spkPm = 5; problem = "Baut pengikat pisau patah akibat getaran tinggi"; sparepart = "Asah Pisau Rotary & Baut Grade 10.9" },
    [PSCustomObject]@{ date = "2026-10-01"; code = "CNV-02"; dtRepair = 1.5; pm = 4.5; costDt = 420000; costPm = 450000; spkDt = 1; spkPm = 6; problem = "Sensor optik deteksi produk tumpuk kotor & tergeser"; sparepart = "Photoelectric Sensor Keyence & Bracket" }
)

function Generate-ExcelReport($startDate, $endDate, $labelPeriode, $outputFilename) {
    # Agregasi data per mesin
    $aggList = @()
    foreach ($m in $masterMachines) {
        $mLogs = $rawLogs | Where-Object { $_.code -eq $m.code -and $_.date -ge $startDate -and $_.date -le $endDate }
        
        $dtRepair = ($mLogs | Measure-Object -Property dtRepair -Sum).Sum
        if ($null -eq $dtRepair) { $dtRepair = 0.0 }
        
        $dtPm = ($mLogs | Measure-Object -Property pm -Sum).Sum
        if ($null -eq $dtPm) { $dtPm = 0.0 }
        
        $totalHours = [Math]::Round(($dtRepair + $dtPm), 1)
        
        $costDt = ($mLogs | Measure-Object -Property costDt -Sum).Sum
        if ($null -eq $costDt) { $costDt = 0 }
        
        $costPm = ($mLogs | Measure-Object -Property costPm -Sum).Sum
        if ($null -eq $costPm) { $costPm = 0 }
        
        $totalCost = $costDt + $costPm
        
        $spkDt = ($mLogs | Measure-Object -Property spkDt -Sum).Sum
        if ($null -eq $spkDt) { $spkDt = 0 }
        
        $spkPm = ($mLogs | Measure-Object -Property spkPm -Sum).Sum
        if ($null -eq $spkPm) { $spkPm = 0 }
        
        $totalSpk = $spkDt + $spkPm
        
        $prob = "-"
        $sp = "-"
        $logArr = @($mLogs)
        if ($logArr.Count -gt 0) {
            $prob = ($logArr | ForEach-Object { "[$($_.date.Substring(8,2))/$($_.date.Substring(5,2))] $($_.problem)" }) -join "; "
            $sp = ($logArr | ForEach-Object { $_.sparepart }) -join "; "
        }
        
        $aggList += [PSCustomObject]@{
            code = $m.code
            unitName = $m.unitName
            category = $m.category
            dtRepair = [Math]::Round($dtRepair, 1)
            dtPm = [Math]::Round($dtPm, 1)
            totalHours = $totalHours
            costDt = $costDt
            costPm = $costPm
            totalCost = $totalCost
            spkDt = $spkDt
            spkPm = $spkPm
            totalSpk = $totalSpk
            problemSummary = $prob
            sparepartSummary = $sp
        }
    }
    
    # Sort descending total downtime
    $sorted = $aggList | Sort-Object -Property totalHours -Descending
    $top5 = $sorted | Select-Object -First 5
    
    $totalDtRepair = ($sorted | Measure-Object -Property dtRepair -Sum).Sum
    $totalDtPm = ($sorted | Measure-Object -Property dtPm -Sum).Sum
    $totalHoursAll = [Math]::Round(($totalDtRepair + $totalDtPm), 1)
    $totalCostDt = ($sorted | Measure-Object -Property costDt -Sum).Sum
    $totalCostPm = ($sorted | Measure-Object -Property costPm -Sum).Sum
    $totalCostAll = $totalCostDt + $totalCostPm
    $totalSpkDt = ($sorted | Measure-Object -Property spkDt -Sum).Sum
    $totalSpkPm = ($sorted | Measure-Object -Property spkPm -Sum).Sum
    $totalSpkAll = $totalSpkDt + $totalSpkPm
    
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine('<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">')
    [void]$sb.AppendLine('<head>')
    [void]$sb.AppendLine('<meta http-equiv="Content-Type" content="text/html; charset=utf-8">')
    [void]$sb.AppendLine('<!--[if gte mso 9]>')
    [void]$sb.AppendLine('<xml>')
    [void]$sb.AppendLine(' <x:ExcelWorkbook>')
    [void]$sb.AppendLine('  <x:ExcelWorksheets>')
    [void]$sb.AppendLine('   <x:ExcelWorksheet>')
    [void]$sb.AppendLine('    <x:Name>Maintenance Summary</x:Name>')
    [void]$sb.AppendLine('    <x:WorksheetOptions>')
    [void]$sb.AppendLine('     <x:DisplayGridlines/>')
    [void]$sb.AppendLine('     <x:Print><x:Orientation>Landscape</x:Orientation></x:Print>')
    [void]$sb.AppendLine('    </x:WorksheetOptions>')
    [void]$sb.AppendLine('   </x:ExcelWorksheet>')
    [void]$sb.AppendLine('  </x:ExcelWorksheets>')
    [void]$sb.AppendLine(' </x:ExcelWorkbook>')
    [void]$sb.AppendLine('</xml>')
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
    
    # Cols width
    [void]$sb.AppendLine('<col width="45"><col width="85"><col width="230"><col width="105"><col width="125"><col width="120"><col width="130"><col width="150"><col width="150"><col width="165"><col width="80"><col width="80"><col width="90"><col width="340"><col width="320">')
    
    # Title
    [void]$sb.AppendLine('<tr><td colspan="15" class="banner-company">PT MITRA MULIA MAKMUR (MMM PLASTIC)</td></tr>')
    [void]$sb.AppendLine('<tr><td colspan="15" class="banner-subtitle">LAPORAN SUMMARY MAINTENANCE (MONTH TO DATE)</td></tr>')
    [void]$sb.AppendLine('<tr><td colspan="15" style="height: 6px;"></td></tr>')
    
    # Meta
    [void]$sb.AppendLine("<tr><td colspan='3' class='meta-title'>Periode Laporan:</td><td colspan='4' class='meta-val'><strong>$labelPeriode</strong></td><td colspan='3' class='meta-title'>Filter Terpasang:</td><td colspan='5' class='meta-val'>Semua Kategori (24 Mesin) | Semua Unit</td></tr>")
    [void]$sb.AppendLine("<tr><td colspan='3' class='meta-title'>Tanggal & Jam Unduh:</td><td colspan='4' class='meta-val'>$(Get-Date -Format 'dd MMMM yyyy, HH:mm:ss')</td><td colspan='3' class='meta-title'>Total Unit Terekam:</td><td colspan='5' class='meta-val'><strong>$($sorted.Count) Mesin</strong></td></tr>")
    [void]$sb.AppendLine('<tr><td colspan="15" style="height: 10px;"></td></tr>')
    
    # KPI Cards
    $costAllFormatted = $totalCostAll.ToString('N0', [System.Globalization.CultureInfo]::GetCultureInfo('id-ID'))
    $costDtFormatted = $totalCostDt.ToString('N0', [System.Globalization.CultureInfo]::GetCultureInfo('id-ID'))
    $costPmFormatted = $totalCostPm.ToString('N0', [System.Globalization.CultureInfo]::GetCultureInfo('id-ID'))
    
    [void]$sb.AppendLine('<tr>')
    [void]$sb.AppendLine("  <td colspan='3' style='background-color: #fee2e2; border: 1.5pt solid #ef4444; padding: 10px; text-align: center;'><span style='font-size: 8.5pt; color: #991b1b; font-weight: bold;'>TOTAL DT PERBAIKAN</span><br><span style='font-size: 16pt; color: #dc2626; font-weight: bold;'>$([Math]::Round($totalDtRepair, 1)) Jam</span><br><span style='font-size: 8pt; color: #7f1d1d;'>Akumulasi breakdown mesin</span></td>")
    [void]$sb.AppendLine("  <td style='border: none;'></td>")
    [void]$sb.AppendLine("  <td colspan='3' style='background-color: #dbeafe; border: 1.5pt solid #3b82f6; padding: 10px; text-align: center;'><span style='font-size: 8.5pt; color: #1e40af; font-weight: bold;'>TOTAL PREVENTIVE (PM)</span><br><span style='font-size: 16pt; color: #2563eb; font-weight: bold;'>$([Math]::Round($totalDtPm, 1)) Jam</span><br><span style='font-size: 8pt; color: #1e3a8a;'>Akumulasi jadwal PM rutin</span></td>")
    [void]$sb.AppendLine("  <td style='border: none;'></td>")
    [void]$sb.AppendLine("  <td colspan='3' style='background-color: #fef3c7; border: 1.5pt solid #f59e0b; padding: 10px; text-align: center;'><span style='font-size: 8.5pt; color: #92400e; font-weight: bold;'>TOTAL BIAYA MAINTENANCE</span><br><span style='font-size: 15pt; color: #b45309; font-weight: bold;'>Rp $costAllFormatted</span><br><span style='font-size: 8pt; color: #78350f;'>DT: Rp $costDtFormatted | PM: Rp $costPmFormatted</span></td>")
    [void]$sb.AppendLine("  <td style='border: none;'></td>")
    [void]$sb.AppendLine("  <td colspan='3' style='background-color: #d1fae5; border: 1.5pt solid #10b981; padding: 10px; text-align: center;'><span style='font-size: 8.5pt; color: #065f46; font-weight: bold;'>TOTAL REALISASI SPK</span><br><span style='font-size: 16pt; color: #059669; font-weight: bold;'>$totalSpkAll SPK</span><br><span style='font-size: 8pt; color: #064e3b;'>DT: $totalSpkDt SPK | PM: $totalSpkPm SPK</span></td>")
    [void]$sb.AppendLine('</tr>')
    [void]$sb.AppendLine('<tr><td colspan="15" style="height: 14px;"></td></tr>')
    
    # Bagian 1: Top 5 Pareto
    [void]$sb.AppendLine('<tr><td colspan="15" class="section-header">BAGIAN 1: TOP 5 DOWNTIME TERBESAR & DETAIL PROBLEM UTAMA (PARETO)</td></tr>')
    [void]$sb.AppendLine('<tr>')
    [void]$sb.AppendLine('  <th class="th-accent" style="width: 45px;">Rank</th>')
    [void]$sb.AppendLine('  <th class="th-accent" style="width: 85px;">Kode Mesin</th>')
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
        $catStyle = switch ($item.category) {
            "Injection" { "background-color: #e0e7ff; color: #3730a3; border: 0.5pt solid #c7d2fe;" }
            "Printing"  { "background-color: #f3e8ff; color: #6b21a8; border: 0.5pt solid #e9d5ff;" }
            "Utility"   { "background-color: #fef3c7; color: #92400e; border: 0.5pt solid #fde68a;" }
            Default     { "background-color: #ccfbf1; color: #115e59; border: 0.5pt solid #99f6e4;" }
        }
        
        [void]$sb.AppendLine('<tr>')
        [void]$sb.AppendLine("  <td class='td-c' style='$badgeStyle'>#$rank</td>")
        [void]$sb.AppendLine("  <td class='td-c' style='font-weight: bold; mso-number-format: ""\@""'>$($item.code)</td>")
        [void]$sb.AppendLine("  <td class='td-l' colspan='2' style='font-weight: bold;'>$($item.unitName)</td>")
        [void]$sb.AppendLine("  <td class='td-c'><span style='display:inline-block; padding: 2px 8px; font-size: 8.5pt; font-weight: bold; $catStyle'>$($item.category)</span></td>")
        [void]$sb.AppendLine("  <td class='num-dec' style='color: #dc2626; font-weight: bold; font-size: 10.5pt;'>$($item.dtRepair)</td>")
        [void]$sb.AppendLine("  <td class='num-dec' style='color: #2563eb;'>$($item.dtPm)</td>")
        [void]$sb.AppendLine("  <td class='num-dec' style='font-weight: bold; background-color: #fee2e2; font-size: 10.5pt;'>$($item.totalHours)</td>")
        [void]$sb.AppendLine("  <td class='num-curr' colspan='2' style='font-weight: bold;'>$($item.totalCost)</td>")
        [void]$sb.AppendLine("  <td class='num-int'>$($item.totalSpk)</td>")
        [void]$sb.AppendLine("  <td class='td-l' colspan='4' style='font-size: 8.5pt; white-space: normal;'><strong>Problem:</strong> $($item.problemSummary)<br><strong>Sparepart:</strong> $($item.sparepartSummary)</td>")
        [void]$sb.AppendLine('</tr>')
        $rank++
    }
    
    [void]$sb.AppendLine('<tr><td colspan="15" style="height: 14px;"></td></tr>')
    
    # Bagian 2: Rekap 24 Mesin
    [void]$sb.AppendLine('<tr><td colspan="15" class="section-header">BAGIAN 2: REKAPITULASI DETAIL SELURUH MESIN (DOWNTIME, BIAYA & SPK)</td></tr>')
    [void]$sb.AppendLine('<tr>')
    [void]$sb.AppendLine('  <th class="th-blue">No</th>')
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
    [void]$sb.AppendLine('  <th class="th-blue">Sparepart Terpakai</th>')
    [void]$sb.AppendLine('</tr>')
    
    $no = 1
    foreach ($item in $sorted) {
        $zebra = if ($no % 2 -eq 0) { "style='background-color: #f8fafc;'" } else { "style='background-color: #ffffff;'" }
        $catStyle = switch ($item.category) {
            "Injection" { "background-color: #e0e7ff; color: #3730a3; border: 0.5pt solid #c7d2fe;" }
            "Printing"  { "background-color: #f3e8ff; color: #6b21a8; border: 0.5pt solid #e9d5ff;" }
            "Utility"   { "background-color: #fef3c7; color: #92400e; border: 0.5pt solid #fde68a;" }
            Default     { "background-color: #ccfbf1; color: #115e59; border: 0.5pt solid #99f6e4;" }
        }
        
        [void]$sb.AppendLine("<tr $zebra>")
        [void]$sb.AppendLine("  <td class='td-c'>$no</td>")
        [void]$sb.AppendLine("  <td class='td-c' style='font-weight: bold; mso-number-format: ""\@""'>$($item.code)</td>")
        [void]$sb.AppendLine("  <td class='td-l' style='font-weight: 500;'>$($item.unitName)</td>")
        [void]$sb.AppendLine("  <td class='td-c'><span style='display:inline-block; padding: 2px 8px; font-size: 8.5pt; font-weight: bold; $catStyle'>$($item.category)</span></td>")
        [void]$sb.AppendLine("  <td class='num-dec' style='color: #dc2626; font-weight: 600;'>$($item.dtRepair)</td>")
        [void]$sb.AppendLine("  <td class='num-dec' style='color: #2563eb;'>$($item.dtPm)</td>")
        [void]$sb.AppendLine("  <td class='num-dec' style='font-weight: bold; background-color: #f1f5f9;'>$($item.totalHours)</td>")
        [void]$sb.AppendLine("  <td class='num-curr'>$($item.costDt)</td>")
        [void]$sb.AppendLine("  <td class='num-curr'>$($item.costPm)</td>")
        [void]$sb.AppendLine("  <td class='num-curr' style='font-weight: bold; background-color: #fef3c7;'>$($item.totalCost)</td>")
        [void]$sb.AppendLine("  <td class='num-int'>$($item.spkDt)</td>")
        [void]$sb.AppendLine("  <td class='num-int'>$($item.spkPm)</td>")
        [void]$sb.AppendLine("  <td class='num-int' style='font-weight: bold; background-color: #d1fae5;'>$($item.totalSpk)</td>")
        [void]$sb.AppendLine("  <td class='td-l' style='font-size: 8.5pt; white-space: normal;'>$($item.problemSummary)</td>")
        [void]$sb.AppendLine("  <td class='td-l' style='font-size: 8.5pt; white-space: normal;'>$($item.sparepartSummary)</td>")
        [void]$sb.AppendLine('</tr>')
        $no++
    }
    
    # Total row
    [void]$sb.AppendLine('<tr class="total-row">')
    [void]$sb.AppendLine('  <td colspan="4" class="td-r" style="font-size: 9.5pt; padding-right: 12px;">TOTAL KESELURUHAN</td>')
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
    
    [System.IO.File]::WriteAllText($outputFilename, $sb.ToString(), [System.Text.Encoding]::UTF8)
    Write-Host "Success generating $outputFilename : $($sorted.Count) machines included."
}

# Generate October 2026
Generate-ExcelReport -startDate "2026-10-01" -endDate "2026-10-31" -labelPeriode "01 Okt 2026 s/d 31 Okt 2026" -outputFilename "c:\Kuliah\AntiGravity\Magang MMM\Maintenance_Summary_2026-10-01_sd_2026-10-31.xls"

# Generate November 2026 MtD
Generate-ExcelReport -startDate "2026-11-01" -endDate "2026-11-17" -labelPeriode "01 Nov 2026 s/d 17 Nov 2026" -outputFilename "c:\Kuliah\AntiGravity\Magang MMM\Maintenance_Summary_2026-11-01_sd_2026-11-17.xls"
