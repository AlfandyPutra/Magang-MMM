<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use App\Models\MaintenanceProject;
use App\Models\MaintenanceTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class MaintenanceDashboardController extends Controller
{
    /**
     * Ambil seluruh dataset langsung dari MySQL (mmm_maintenance)
     * dalam format terstruktur untuk dashboard eksekutif.
     */
    private function buildDashboardPayload(): array
    {
        $machines = Machine::with('branch')
            ->orderBy('code')
            ->get()
            ->map(fn (Machine $m) => [
                'code' => $m->code,
                'unitName' => $m->unit_name,
                'category' => $m->category,
                'branch' => $m->branch?->code ?? 'MMM',
                'operationalStatus' => $m->operational_status,
            ])
            ->values()
            ->all();

        $statusReverseMap = [
            'OPEN' => 'OPEN',
            'ASSIGNMENT' => 'PROSES',
            'WAITING_TO_CLOSE' => 'OUTSTANDING',
            'CLOSED' => 'CLOSED',
        ];

        $tickets = MaintenanceTicket::with(['branch', 'machine'])
            ->orderByDesc('ticket_date')
            ->orderBy('id')
            ->get()
            ->map(function (MaintenanceTicket $t) use ($statusReverseMap) {
                $isPm = $t->type === 'PM';
                return [
                    'date' => $t->ticket_date?->format('Y-m-d') ?? '2026-11-10',
                    'code' => $t->machine?->code ?? '-',
                    'ticketCode' => $t->ticket_number,
                    'branch' => $t->branch?->code ?? 'MMM',
                    'dtRepair' => (float) $t->dt_hours,
                    'pmRegular' => (float) $t->pm_hours,
                    'pmDaily' => 0,
                    'costDt' => (float) $t->cost_dt,
                    'costPm' => (float) $t->cost_pm,
                    'spkDt' => $isPm ? 0 : 1,
                    'spkPm' => $isPm ? 1 : 0,
                    'problem' => $t->problem_description ?? '-',
                    'sparepart' => $t->sparepart_action ?? '-',
                    'ticketStatus' => $statusReverseMap[$t->status] ?? 'CLOSED',
                ];
            })
            ->values()
            ->all();

        $projects = MaintenanceProject::with('branch')
            ->orderBy('id')
            ->get()
            ->values()
            ->map(fn (MaintenanceProject $p, int $idx) => [
                'no' => $idx + 1,
                'code' => $p->project_code,
                'name' => $p->name,
                'branch' => $p->branch?->code ?? 'MMM',
                'category' => $p->category,
                'pic' => $p->pic_name,
                'progress' => (int) $p->progress_pct,
                'status' => $p->status,
                'target' => $p->target_date ?? '-',
                'desc' => $p->description ?? '-',
                'machine' => $p->machine_related ?? '-',
                'impact' => $p->efficiency_impact ?? '-',
            ])
            ->all();

        return [
            'masterMachines' => $machines,
            'dailyMaintenanceLogs' => $tickets,
            'maintenanceProjectsList' => $projects,
        ];
    }

    public function index(): View
    {
        return view('maintenance.summary', $this->buildDashboardPayload());
    }

    public function apiSummary(): JsonResponse
    {
        return response()->json($this->buildDashboardPayload());
    }
}
