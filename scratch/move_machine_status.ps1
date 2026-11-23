# move_machine_status.ps1
$path = "C:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html"
$html = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$html = $html -replace "`r`n", "`n"

$secStartStr = '        <!-- ====================================================================== -->
        <!-- REAL-TIME MACHINE STATUS PER PLANT (MMM, MMN, MMS, MMG) -->
        <!-- ====================================================================== -->
        <section id="sectionMachineStatus"'

$secEndStr = '        </section>

        <!-- ====================================================================== -->
        <!-- EXECUTIVE SPOTLIGHT PANEL (1 LAYAR - BERGANTI SESUAI KARTU AKTIF) -->'

$startPos = $html.IndexOf($secStartStr)
$endPos = $html.IndexOf($secEndStr)

Write-Output "startPos: $startPos, endPos: $endPos"

if ($startPos -ge 0 -and $endPos -gt $startPos) {
    $secMachineStatus = $html.Substring($startPos, ($endPos - $startPos) + 18) # includes </section>
    Write-Output "Extracted length: $($secMachineStatus.Length)"
    
    # Remove from original position
    $htmlWithout = $html.Substring(0, $startPos) + $html.Substring($endPos + 18)
    
    # Target insertion: right after </section> of panelView_dt
    $panelDtEndStr = '                    </div>
                </div>
            </div>
        </section>

        <!-- ==================== MODUL 2: SPOTLIGHT BIAYA'
        
    $dtEndPos = $htmlWithout.IndexOf($panelDtEndStr)
    Write-Output "dtEndPos: $dtEndPos"
    
    if ($dtEndPos -ge 0) {
        $insertPoint = $htmlWithout.IndexOf("        </section>`n`n        <!-- ==================== MODUL 2: SPOTLIGHT BIAYA", $dtEndPos)
        $insertPoint += 18 # after </section>
        
        $newHtml = $htmlWithout.Substring(0, $insertPoint) + "`n`n" + $secMachineStatus.Trim() + $htmlWithout.Substring($insertPoint)
        
        [System.IO.File]::WriteAllText($path, $newHtml, [System.Text.UTF8Encoding]::new($false))
        Write-Output "Successfully moved sectionMachineStatus below panelView_dt!"
    } else {
        Write-Output "panelDtEndStr not found"
    }
} else {
    Write-Output "Markers not found"
}
