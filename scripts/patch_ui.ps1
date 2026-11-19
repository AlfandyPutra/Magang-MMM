$ErrorActionPreference = "Stop"

# 1. Read the real data JS file
$realData = [System.IO.File]::ReadAllText('c:\Kuliah\AntiGravity\Magang MMM\mms_real_data.js', [System.Text.Encoding]::UTF8)

# 2. Read the existing HTML
$html = [System.IO.File]::ReadAllText('c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html', [System.Text.Encoding]::UTF8)

# Update Quick Date Presets Bar
$oldPresets = @'
            <!-- Quick Date Presets Bar -->
            <div class="flex flex-wrap items-center gap-2 pt-3.5 pb-1">
                <span class="text-xs font-semibold text-gray-500 mr-1">Pintasan Periode:</span>
                <button type="button" onclick="setDatePreset('2026-08-01', '2026-08-31', 'Agustus 2026')"
                    id="preset-aug"
                    class="preset-btn px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition cursor-pointer">
                    Agustus 2026
                </button>
                <button type="button" onclick="setDatePreset('2026-09-01', '2026-09-30', 'September 2026')"
                    id="preset-sep"
                    class="preset-btn px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition cursor-pointer">
                    September 2026
                </button>
                <button type="button" onclick="setDatePreset('2026-10-01', '2026-10-31', 'Oktober 2026')"
                    id="preset-oct"
                    class="preset-btn px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition cursor-pointer">
                    Oktober 2026
                </button>
                <button type="button" onclick="setDatePreset('2026-11-01', '2026-11-17', 'November 2026 (MtD)')"
                    id="preset-nov"
                    class="preset-btn px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-600 bg-blue-600 text-white transition cursor-pointer">
                    November 2026 (MtD)
                </button>
            </div>
'@

$newPresets = @'
            <!-- Quick Date Presets Bar -->
            <div class="flex flex-wrap items-center gap-2 pt-3.5 pb-1">
                <span class="text-xs font-semibold text-gray-500 mr-1">Pintasan Periode:</span>
                <button type="button" onclick="setDatePreset('2026-11-01', '2026-11-10', '01 - 10 Nov 2026 (Data Riil Tiket)')"
                    id="preset-nov-real"
                    class="preset-btn px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-600 bg-blue-600 text-white transition cursor-pointer">
                    ★ 01 - 10 Nov 2026 (Data Riil Tiket)
                </button>
                <button type="button" onclick="setDatePreset('2026-11-01', '2026-11-17', 'November 2026 (MtD Full)')"
                    id="preset-nov"
                    class="preset-btn px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition cursor-pointer">
                    November 2026 (MtD)
                </button>
                <button type="button" onclick="setDatePreset('2026-10-01', '2026-10-31', 'Oktober 2026')"
                    id="preset-oct"
                    class="preset-btn px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition cursor-pointer">
                    Oktober 2026
                </button>
                <button type="button" onclick="setDatePreset('2026-09-01', '2026-09-30', 'September 2026')"
                    id="preset-sep"
                    class="preset-btn px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition cursor-pointer">
                    September 2026
                </button>
            </div>
'@

$html = $html.Replace($oldPresets, $newPresets)

# Update Filter Inputs Grid: from 5 cols to 6 cols (adding Branch dropdown)
$oldFilterGrid = @'
            <!-- Filter Inputs Grid (5 Columns on Desktop) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-3 items-end">
                <!-- Start Date -->
                <div>
                    <label for="startDate" class="block text-xs font-semibold text-gray-700 mb-1.5">Start Date (Dari
                        Tanggal)</label>
                    <input type="date" id="startDate" value="2026-11-01" min="2026-08-01" max="2026-11-17"
                        onchange="clearActivePreset(); applyFilters();"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none">
                </div>

                <!-- End Date -->
                <div>
                    <label for="endDate" class="block text-xs font-semibold text-gray-700 mb-1.5">End Date (Sampai
                        Tanggal)</label>
                    <input type="date" id="endDate" value="2026-11-17" min="2026-08-01" max="2026-11-17"
                        onchange="clearActivePreset(); applyFilters();"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none">
                </div>

                <!-- Kategori Mesin -->
                <div>
                    <label for="filterCategory" class="block text-xs font-semibold text-gray-700 mb-1.5">Kategori Mesin
                        Utama</label>
                    <select id="filterCategory" onchange="updateMachineDropdown(); applyFilters();"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none">
                        <option value="ALL">Semua Kategori (24 Mesin)</option>
                        <option value="Injection">Injection (INJ)</option>
                        <option value="Printing">Printing (PRT)</option>
                        <option value="Utility">Utility (Compressor, Chiller, Mold)</option>
                        <option value="Lain-lain">Lain-lain (Conveyor, Mixing, Crushing)</option>
                    </select>
                </div>

                <!-- Filter Kode Mesin Spesifik -->
                <div>
                    <label for="filterMachineCode" class="block text-xs font-semibold text-gray-700 mb-1.5">Filter Kode
                        Mesin</label>
                    <select id="filterMachineCode" onchange="applyFilters()"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none">
                        <option value="ALL">Semua Kode Mesin</option>
                    </select>
                </div>

                <!-- Pencarian Cepat / Tombol Cari -->
                <div>
                    <label for="searchInput" class="block text-xs font-semibold text-gray-700 mb-1.5">Cari Kode /
                        Problem</label>
                    <div class="flex gap-2">
                        <input type="text" id="searchInput" onkeyup="applyFilters()" placeholder="INJ-01, Servo..."
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                        <button onclick="applyFilters()" title="Terapkan Filter"
                            class="bg-[#0088cc] hover:bg-[#0077b3] text-white px-3.5 py-2 rounded-lg flex items-center justify-center transition cursor-pointer shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
'@

$newFilterGrid = @'
            <!-- Filter Inputs Grid (6 Columns on Desktop) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-3 items-end">
                <!-- Cabang / Plant -->
                <div>
                    <label for="filterBranch" class="block text-xs font-semibold text-gray-700 mb-1.5">Cabang / Plant</label>
                    <select id="filterBranch" onchange="updateMachineDropdown(); applyFilters();"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none font-medium">
                        <option value="ALL">Semua Cabang (4 Plant)</option>
                        <option value="MMM">MMM — Sidoarjo (Pusat)</option>
                        <option value="MMN">MMN — Nganjuk</option>
                        <option value="MMS">MMS — Serang</option>
                        <option value="MMG">MMG — Gresik</option>
                    </select>
                </div>

                <!-- Kategori Mesin -->
                <div>
                    <label for="filterCategory" class="block text-xs font-semibold text-gray-700 mb-1.5">Kategori Mesin</label>
                    <select id="filterCategory" onchange="updateMachineDropdown(); applyFilters();"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none">
                        <option value="ALL">Semua Kategori</option>
                        <option value="Injection">Injection Moulding</option>
                        <option value="Printing">Printing (Kaze, Kase, Offset)</option>
                        <option value="Utility">Utility (Chiller, Comp, Pump, CLT)</option>
                        <option value="Robot">Robot & Automation (Tenso, Beck)</option>
                        <option value="Auxiliary">Auxiliary (Dryer, Motan, Crusher)</option>
                        <option value="Lain-lain">Lain-lain</option>
                    </select>
                </div>

                <!-- Start Date -->
                <div>
                    <label for="startDate" class="block text-xs font-semibold text-gray-700 mb-1.5">Start Date (Dari)</label>
                    <input type="date" id="startDate" value="2026-11-01" min="2026-08-01" max="2026-11-30"
                        onchange="clearActivePreset(); applyFilters();"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none">
                </div>

                <!-- End Date -->
                <div>
                    <label for="endDate" class="block text-xs font-semibold text-gray-700 mb-1.5">End Date (Sampai)</label>
                    <input type="date" id="endDate" value="2026-11-10" min="2026-08-01" max="2026-11-30"
                        onchange="clearActivePreset(); applyFilters();"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none">
                </div>

                <!-- Filter Kode Mesin Spesifik -->
                <div>
                    <label for="filterMachineCode" class="block text-xs font-semibold text-gray-700 mb-1.5">Filter Unit Mesin</label>
                    <select id="filterMachineCode" onchange="applyFilters()"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none">
                        <option value="ALL">Semua Unit Mesin</option>
                    </select>
                </div>

                <!-- Pencarian Cepat / Tombol Cari -->
                <div>
                    <label for="searchInput" class="block text-xs font-semibold text-gray-700 mb-1.5">Cari Mesin / Problem</label>
                    <div class="flex gap-2">
                        <input type="text" id="searchInput" onkeyup="applyFilters()" placeholder="Kode, problem, part..."
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                        <button onclick="applyFilters()" title="Terapkan Filter"
                            class="bg-[#0088cc] hover:bg-[#0077b3] text-white px-3.5 py-2 rounded-lg flex items-center justify-center transition cursor-pointer shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
'@

$html = $html.Replace($oldFilterGrid, $newFilterGrid)

# Write updated HTML
[System.IO.File]::WriteAllText('c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html', $html, [System.Text.Encoding]::UTF8)
Write-Host "Part 1 (UI Presets & Filter Grid) replaced successfully."
