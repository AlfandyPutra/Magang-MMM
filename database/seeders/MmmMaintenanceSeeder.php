<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Machine;
use App\Models\MaintenanceProject;
use App\Models\MaintenanceTicket;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MmmMaintenanceSeeder extends Seeder
{
    /**
     * Parse JS array-of-objects literal (single-quoted values, unquoted keys)
     * from our existing js/data/*.js files into PHP associative arrays.
     */
    private function parseJsObjectLines(string $filePath): array
    {
        if (!file_exists($filePath)) {
            $this->command?->warn("File tidak ditemukan: {$filePath}");
            return [];
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $records = [];

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (!str_contains($trimmed, '{') || !str_contains($trimmed, '}')) {
                continue;
            }

            $start = strpos($trimmed, '{');
            $end = strrpos($trimmed, '}');
            if ($start === false || $end === false || $end <= $start) {
                continue;
            }

            $body = substr($trimmed, $start + 1, $end - $start - 1);
            $record = [];

            // Match key: 'string' OR key: number
            preg_match_all(
                "/(\w+)\s*:\s*(?:'((?:\\\\'|[^'])*)'|(-?\d+(?:\.\d+)?))/",
                $body,
                $matches,
                PREG_SET_ORDER
            );

            foreach ($matches as $m) {
                $key = $m[1];
                if (isset($m[3]) && $m[3] !== '') {
                    $record[$key] = str_contains($m[3], '.') ? (float) $m[3] : (int) $m[3];
                } else {
                    $val = str_replace(["\\'", '\\\\'], ["'", '\\'], $m[2] ?? '');
                    $record[$key] = html_entity_decode($val, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                }
            }

            if (!empty($record)) {
                $records[] = $record;
            }
        }

        return $records;
    }

    public function run(): void
    {
        $dataDir = database_path('seeders/data');

        // 1. Pastikan 4 cabang utama tersedia
        $branchesData = [
            ['code' => 'MMM', 'name' => 'PT Mitra Mulia Makmur — Sidoarjo', 'city' => 'Sidoarjo'],
            ['code' => 'MMN', 'name' => 'PT Mitra Mulia Makmur — Nganjuk', 'city' => 'Nganjuk'],
            ['code' => 'MMS', 'name' => 'PT Mitra Mulia Makmur — Serang', 'city' => 'Serang'],
            ['code' => 'MMG', 'name' => 'PT Mitra Mulia Makmur — Malang', 'city' => 'Malang'],
        ];

        $branchMap = [];
        foreach ($branchesData as $b) {
            $branch = Branch::updateOrCreate(['code' => $b['code']], $b);
            $branchMap[$branch->code] = $branch->id;
        }

        // 2. Seed Master Mesin (machines-data.js)
        $machinesRaw = $this->parseJsObjectLines($dataDir . '/machines-data.js');
        $allowedCategories = ['Injection', 'Printing', 'Blowing', 'Utility', 'Robot', 'Auxiliary', 'Lain-lain'];
        $machineMap = [];

        foreach ($machinesRaw as $m) {
            if (empty($m['code'])) {
                continue;
            }
            $bCode = $m['branch'] ?? 'MMM';
            $branchId = $branchMap[$bCode] ?? $branchMap['MMM'];
            $cat = in_array($m['category'] ?? '', $allowedCategories, true) ? $m['category'] : 'Lain-lain';

            $machine = Machine::updateOrCreate(
                ['code' => $m['code']],
                [
                    'branch_id' => $branchId,
                    'unit_name' => $m['unitName'] ?? $m['code'],
                    'category' => $cat,
                    'operational_status' => 'No Order',
                ]
            );
            $machineMap[$machine->code] = $machine->id;
        }
        $this->command?->info('Seeded machines: ' . count($machineMap));

        // 3. Seed Tiket SPK Harian (daily-logs.js)
        $logsRaw = $this->parseJsObjectLines($dataDir . '/daily-logs.js');
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        MaintenanceTicket::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $statusMap = [
            'OPEN' => 'OPEN',
            'PROSES' => 'ASSIGNMENT',
            'ASSIGNMENT' => 'ASSIGNMENT',
            'OUTSTANDING' => 'WAITING_TO_CLOSE',
            'WAITING_TO_CLOSE' => 'WAITING_TO_CLOSE',
            'CLOSED' => 'CLOSED',
            'SELESAI' => 'CLOSED',
        ];

        $ticketBatch = [];
        $now = now();

        foreach ($logsRaw as $idx => $l) {
            $mCode = $l['code'] ?? null;
            if (!$mCode) {
                continue;
            }
            $bCode = $l['branch'] ?? 'MMM';
            $branchId = $branchMap[$bCode] ?? $branchMap['MMM'];

            // Pastikan mesin ada di master jika muncul di log
            if (!isset($machineMap[$mCode])) {
                $newM = Machine::firstOrCreate(
                    ['code' => $mCode],
                    [
                        'branch_id' => $branchId,
                        'unit_name' => $mCode,
                        'category' => 'Lain-lain',
                        'operational_status' => 'No Order',
                    ]
                );
                $machineMap[$mCode] = $newM->id;
            }

            $isPm = ((int) ($l['spkPm'] ?? 0) === 1 && (int) ($l['spkDt'] ?? 0) === 0);
            $rawStatus = strtoupper((string) ($l['ticketStatus'] ?? 'CLOSED'));
            $mappedStatus = $statusMap[$rawStatus] ?? 'CLOSED';

            $ticketBatch[] = [
                'ticket_number' => $l['ticketCode'] ?? ('SPK-' . ($idx + 1)),
                'branch_id' => $branchId,
                'machine_id' => $machineMap[$mCode],
                'ticket_date' => $l['date'] ?? '2026-11-10',
                'type' => $isPm ? 'PM' : 'DT',
                'dt_hours' => (float) ($l['dtRepair'] ?? 0),
                'pm_hours' => (float) (($l['pmRegular'] ?? 0) + ($l['pmDaily'] ?? 0)),
                'cost_dt' => (float) ($l['costDt'] ?? 0),
                'cost_pm' => (float) ($l['costPm'] ?? 0),
                'status' => $mappedStatus,
                'problem_description' => $l['problem'] ?? '-',
                'sparepart_action' => $l['sparepart'] ?? '-',
                'pic_technician' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($ticketBatch) >= 200) {
                MaintenanceTicket::insert($ticketBatch);
                $ticketBatch = [];
            }
        }

        if (!empty($ticketBatch)) {
            MaintenanceTicket::insert($ticketBatch);
        }
        $this->command?->info('Seeded maintenance_tickets: ' . MaintenanceTicket::count());

        // 4. Seed Data Project Maintenance (projects-data.js)
        $projectsRaw = $this->parseJsObjectLines($dataDir . '/projects-data.js');
        foreach ($projectsRaw as $p) {
            if (empty($p['code'])) {
                continue;
            }
            $bCode = $p['branch'] ?? 'MMM';
            $branchId = $branchMap[$bCode] ?? $branchMap['MMM'];

            MaintenanceProject::updateOrCreate(
                ['project_code' => $p['code']],
                [
                    'branch_id' => $branchId,
                    'name' => $p['name'] ?? '-',
                    'description' => $p['desc'] ?? null,
                    'machine_related' => $p['machine'] ?? null,
                    'category' => $p['category'] ?? 'Injection',
                    'pic_name' => $p['pic'] ?? '-',
                    'progress_pct' => (int) ($p['progress'] ?? 0),
                    'status' => in_array($p['status'] ?? '', ['OPEN', 'PROSES', 'OUTSTANDING', 'SELESAI'], true)
                        ? $p['status']
                        : 'OPEN',
                    'target_date' => $p['target'] ?? null,
                    'efficiency_impact' => $p['impact'] ?? null,
                ]
            );
        }
        $this->command?->info('Seeded maintenance_projects: ' . MaintenanceProject::count());
    }
}
