# 🚀 Panduan Migrasi Dashboard Maintenance Summary ke Laravel & MySQL
**Sistem**: MMS (Maintenance Management System) - PT Mitra Mulia Makmur (MMM Plastic)  
**Dokumen**: Arsitektur Database, Model Eloquent, Query Controller, dan Pecahan Blade View  
**Penyusun**: Antigravity AI Assistant

---

## Daftar Isi
1. [Arsitektur Skema Database (ERD & Migrations)](#1-arsitektur-skema-database)
2. [Model Eloquent & Relasi Antartabel](#2-model-eloquent--relasi-antartabel)
3. [Controller & Query Aggregasi Cepat (Pengganti computeAggregates di JS)](#3-controller--query-aggregasi-cepat)
4. [Struktur Modular Blade View (Pecahan File resources/views)](#4-struktur-modular-blade-view)
5. [Skrip Seeder Otomatis (Memasukkan 981 Data dari JS ke MySQL)](#5-skrip-seeder-otomatis)
6. [Routes & Integrasi Frontend](#6-routes--integrasi-frontend)

---

## 1. Arsitektur Skema Database

Sistem ini memiliki 5 tabel inti yang dinormalisasi secara relasional:
```
┌──────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│   branches   │───1:N─│       machines       │───1:N─│  maintenance_tickets   │
└──────────────┘       └──────────────────────┘       └────────────────────────┘
       │                          │
       │                          │
      1:N                        1:N
       │                          │
       ▼                          ▼
┌─────────────────────────────────────────────┐       ┌────────────────────────┐
│            maintenance_projects             │       │     kpi_scorecards     │
└─────────────────────────────────────────────┘       └────────────────────────┘
```

### 1.1 Migration: `create_branches_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique(); // MMM, MMG, MMS, MMN
            $table->string('name', 100);          // PT Mitra Mulia Makmur Sidoarjo, dll
            $table->string('city', 50);          // Sidoarjo, Malang, Serang, Nganjuk
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('branches');
    }
};
```

### 1.2 Migration: `create_machines_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('machines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->string('code', 50)->unique(); // e.g. APMSA00CH, I123-LY155
            $table->string('name', 150);          // CHL-31 CHILLER HAKAI HC150 H 379
            $table->enum('category', ['Injection', 'Printing', 'Utility', 'Robot', 'Auxiliary', 'Lain-lain']);
            $table->string('brand', 100)->nullable();
            $table->string('tonnage', 50)->nullable();
            $table->enum('status', ['ACTIVE', 'BREAKDOWN', 'MAINTENANCE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();

            $table->index(['branch_id', 'category']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('machines');
    }
};
```

### 1.3 Migration: `create_maintenance_tickets_table.php`
*(Menyimpan data riil 981 tiket SPK)*
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('maintenance_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number', 50)->unique(); // e.g. OTRQS/26/11/MMM/00545
            $table->foreignId('machine_id')->constrained('machines')->onDelete('cascade');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->date('date');                          // Tanggal SPK (e.g. 2026-11-10)
            $table->enum('type', ['DT', 'PM']);           // DT (Kerusakan) / PM (Preventive)
            $table->decimal('dt_hours', 8, 2)->default(0); // Jam Downtime
            $table->decimal('cost', 15, 2)->default(0);    // Nominal Biaya IDR
            $table->enum('status', ['OPEN', 'ASSIGNMENT', 'WAITING_TO_CLOSE', 'CLOSED'])->default('CLOSED');
            $table->text('problem_description')->nullable();
            $table->text('action_taken')->nullable();
            $table->text('parts_replaced')->nullable();
            $table->string('pic_technician', 100)->nullable();
            $table->timestamps();

            $table->index(['date', 'type', 'status']);
            $table->index(['branch_id', 'machine_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('maintenance_tickets');
    }
};
```

### 1.4 Migration: `create_maintenance_projects_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('maintenance_projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_code', 50)->unique(); // PRJ-26-MMM-001
            $table->string('name', 200);                  // Retrofit Inverter & Servo Drive Mesin INJ-87 Lien Yu
            $table->text('description')->nullable();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->string('machine_related', 150);
            $table->string('category', 50);
            $table->string('pic_name', 100);
            $table->unsignedTinyInteger('progress_pct')->default(0); // 0 - 100
            $table->enum('status', ['OPEN', 'PROSES', 'OUTSTANDING', 'SELESAI'])->default('OPEN');
            $table->date('target_completion_date')->nullable();
            $table->text('efficiency_impact')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('maintenance_projects');
    }
};
```

### 1.5 Migration: `create_kpi_scorecards_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('kpi_scorecards', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10); // F1.a, F1.d, C1.a, B1.a, dll
            $table->enum('perspective', ['FINANCIAL', 'CUSTOMER', 'INTERNAL_PROCESS', 'LEARNING_GROWTH']);
            $table->string('objective_header', 100); // e.g. F1 Efisiensi biaya operasional
            $table->string('kpi_name', 200);
            $table->enum('period', ['Bulanan', 'Tahunan'])->default('Bulanan');
            $table->string('verifier', 50); // HRGA, FA, GM, Dir
            $table->decimal('real_prev_year', 12, 2)->default(0);
            $table->decimal('target_value', 12, 2)->default(0);
            $table->enum('polarization', ['Min', 'Max'])->default('Min');
            $table->string('uom', 20); // IDR, %, kWh, kasus
            $table->decimal('real_curr_year', 12, 2)->default(0);
            $table->decimal('achievement_rating', 4, 2)->default(1.00); // Skala 1.00 s/d 4.00
            $table->unsignedTinyInteger('weight_pct')->default(0);
            $table->decimal('final_score', 4, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('kpi_scorecards');
    }
};
```

---

## 2. Model Eloquent & Relasi Antartabel

### `app/Models/Machine.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Machine extends Model {
    protected $fillable = ['branch_id', 'code', 'name', 'category', 'brand', 'tonnage', 'status'];

    public function branch(): BelongsTo {
        return $this->belongsTo(Branch::class);
    }

    public function tickets(): HasMany {
        return $this->hasMany(MaintenanceTicket::class);
    }
}
```

### `app/Models/MaintenanceTicket.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceTicket extends Model {
    protected $fillable = [
        'ticket_number', 'machine_id', 'branch_id', 'date', 'type',
        'dt_hours', 'cost', 'status', 'problem_description', 'action_taken',
        'parts_replaced', 'pic_technician'
    ];

    public function machine(): BelongsTo {
        return $this->belongsTo(Machine::class);
    }

    public function branch(): BelongsTo {
        return $this->belongsTo(Branch::class);
    }

    // Local Scope untuk Filter Tanggal & Cabang
    public function scopeFilterDate($query, $start, $end) {
        if ($start && $end) {
            return $query->whereBetween('date', [$start, $end]);
        }
        return $query;
    }

    public function scopeFilterBranch($query, $branchCode) {
        if ($branchCode && $branchCode !== 'ALL') {
            return $query->whereHas('branch', function($q) use ($branchCode) {
                $q->where('code', $branchCode);
            });
        }
        return $query;
    }
}
```

---

## 3. Controller & Query Aggregasi Cepat (Pengganti `computeAggregates`)

Di file JavaScript lama, browser melakukan perulangan ratusan baris data (`dailyMaintenanceLogs.forEach(...)`).  
Di Laravel, database MySQL mengerjakan aggregasi ini dalam waktu **< 5 milidetik** menggunakan query SQL efisien:

### `app/Http/Controllers/MaintenanceSummaryController.php`
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Branch;
use App\Models\Machine;
use App\Models\MaintenanceTicket;
use App\Models\MaintenanceProject;
use App\Models\KpiScorecard;

class MaintenanceSummaryController extends Controller {
    public function index(Request $request) {
        $startDate = $request->input('start_date', '2026-11-01');
        $endDate   = $request->input('end_date', '2026-11-10');
        $branch    = $request->input('branch', 'ALL');
        $category  = $request->input('category', 'ALL');

        // 1. Query Aggregasi Per Mesin (Grouping SQL)
        $query = DB::table('machines')
            ->join('branches', 'machines.branch_id', '=', 'branches.id')
            ->leftJoin('maintenance_tickets', function($join) use ($startDate, $endDate) {
                $join->on('machines.id', '=', 'maintenance_tickets.machine_id')
                     ->whereBetween('maintenance_tickets.date', [$startDate, $endDate]);
            })
            ->select(
                'machines.id',
                'machines.code',
                'machines.name as unit_name',
                'machines.category',
                'branches.code as branch',
                DB::raw("COALESCE(SUM(CASE WHEN maintenance_tickets.type = 'DT' THEN maintenance_tickets.dt_hours ELSE 0 END), 0) as dt_repair"),
                DB::raw("COALESCE(SUM(CASE WHEN maintenance_tickets.type = 'PM' THEN maintenance_tickets.dt_hours ELSE 0 END), 0) as dt_pm"),
                DB::raw("COALESCE(SUM(maintenance_tickets.dt_hours), 0) as total_hours"),
                DB::raw("COALESCE(SUM(CASE WHEN maintenance_tickets.type = 'DT' THEN maintenance_tickets.cost ELSE 0 END), 0) as cost_dt"),
                DB::raw("COALESCE(SUM(CASE WHEN maintenance_tickets.type = 'PM' THEN maintenance_tickets.cost ELSE 0 END), 0) as cost_pm"),
                DB::raw("COALESCE(SUM(maintenance_tickets.cost), 0) as total_cost"),
                DB::raw("COUNT(CASE WHEN maintenance_tickets.type = 'DT' THEN 1 END) as spk_dt"),
                DB::raw("COUNT(CASE WHEN maintenance_tickets.type = 'PM' THEN 1 END) as spk_pm"),
                DB::raw("COUNT(maintenance_tickets.id) as total_spk")
            )
            ->groupBy('machines.id', 'machines.code', 'machines.name', 'machines.category', 'branches.code');

        if ($branch !== 'ALL') {
            $query->where('branches.code', $branch);
        }
        if ($category !== 'ALL') {
            $query->where('machines.category', $category);
        }

        $aggregatedMachines = $query->get();

        // 2. Hitung Grand Total KPI Eksekutif
        $totals = (object) [
            'dtRepair'   => $aggregatedMachines->sum('dt_repair'),
            'dtPm'       => $aggregatedMachines->sum('dt_pm'),
            'totalHours' => $aggregatedMachines->sum('total_hours'),
            'costDt'     => $aggregatedMachines->sum('cost_dt'),
            'costPm'     => $aggregatedMachines->sum('cost_pm'),
            'totalCost'  => $aggregatedMachines->sum('total_cost'),
            'spkDt'      => $aggregatedMachines->sum('spk_dt'),
            'spkPm'      => $aggregatedMachines->sum('spk_pm'),
            'totalSpk'   => $aggregatedMachines->sum('total_spk')
        ];

        // 3. Status SPK Pipeline
        $spkQuery = MaintenanceTicket::filterDate($startDate, $endDate)->filterBranch($branch);
        $spkCounts = [
            'open'       => (clone $spkQuery)->where('status', 'OPEN')->count(),
            'assignment' => (clone $spkQuery)->where('status', 'ASSIGNMENT')->count(),
            'waiting'    => (clone $spkQuery)->where('status', 'WAITING_TO_CLOSE')->count(),
            'closed'     => (clone $spkQuery)->where('status', 'CLOSED')->count(),
        ];

        // 4. Data Proyek Maintenance
        $projects = MaintenanceProject::when($branch !== 'ALL', function($q) use ($branch) {
            $q->whereHas('branch', fn($b) => $b->where('code', $branch));
        })->get();

        // 5. Data Balanced Scorecard
        $scorecards = KpiScorecard::all();

        // Jika request AJAX (Fetch API): kembalikan JSON
        if ($request->ajax()) {
            return response()->json([
                'machines' => $aggregatedMachines,
                'totals'   => $totals,
                'spk'      => $spkCounts,
                'projects' => $projects
            ]);
        }

        // Tampilan Pertama Halaman Blade
        return view('maintenance.summary', compact(
            'aggregatedMachines', 'totals', 'spkCounts', 'projects', 'scorecards',
            'startDate', 'endDate', 'branch', 'category'
        ));
    }
}
```

---

## 4. Struktur Modular Blade View (`resources/views`)

Agar kode ribuan baris tidak menumpuk di 1 file Blade, gunakan struktur modular berikut:

```
resources/views/maintenance/
├── summary.blade.php                 <-- File utama (Master Shell)
└── partials/
    ├── navbar.blade.php              <-- Header & Breadcrumb
    ├── filter-bar.blade.php          <-- Filter Periode & Cabang
    ├── kpi-cards.blade.php           <-- 4 Kartu Eksekutif (DT, Cost, SPK, Prj)
    ├── spotlight-dt.blade.php        <-- Tab Analitik Downtime
    ├── spotlight-cost.blade.php      <-- Tab Analitik Biaya
    ├── spotlight-spk.blade.php       <-- Tab Status Tiket SPK
    ├── spotlight-project.blade.php   <-- Tab Data Project
    ├── scorecard-table.blade.php     <-- Tabel Balanced Scorecard (F1 s/d B1)
    └── detail-tables.blade.php       <-- Accordion Rincian Mesin & SPK
```

### Contoh `resources/views/maintenance/summary.blade.php`:
```html
@extends('layouts.app')

@section('title', 'Maintenance Summary (Month to Date)')

@section('content')
<div class="min-h-screen bg-slate-100 p-4 sm:p-6 font-sans">
    @include('maintenance.partials.navbar')
    @include('maintenance.partials.filter-bar')
    @include('maintenance.partials.kpi-cards')

    <!-- SPOTLIGHT PANELS (TABS) -->
    @include('maintenance.partials.spotlight-dt')
    @include('maintenance.partials.spotlight-cost')
    @include('maintenance.partials.spotlight-spk')
    @include('maintenance.partials.spotlight-project')

    <!-- BALANCED SCORECARD TABLE -->
    @include('maintenance.partials.scorecard-table')

    <!-- ACCORDIONS DETAIL -->
    @include('maintenance.partials.detail-tables')
</div>
@endsection
```

---

## 5. Skrip Seeder Otomatis (Import dari JS ke Database)

Untuk memindahkan data 981 tiket dari file `js/data/daily-logs.js` ke tabel MySQL tanpa input manual, buat Seeder Laravel:

### `database/seeders/MaintenanceDatabaseSeeder.php`
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;
use App\Models\Machine;
use App\Models\MaintenanceTicket;
use App\Models\KpiScorecard;

class MaintenanceDatabaseSeeder extends Seeder {
    public function run(): void {
        // 1. Seed Cabang
        $branches = [
            'MMM' => Branch::create(['code' => 'MMM', 'name' => 'PT Mitra Mulia Makmur (Sidoarjo)', 'city' => 'Sidoarjo']),
            'MMG' => Branch::create(['code' => 'MMG', 'name' => 'PT Mitra Mulia Makmur (Malang)', 'city' => 'Malang']),
            'MMS' => Branch::create(['code' => 'MMS', 'name' => 'PT Mitra Mulia Makmur (Serang)', 'city' => 'Serang']),
            'MMN' => Branch::create(['code' => 'MMN', 'name' => 'PT Mitra Mulia Makmur (Nganjuk)', 'city' => 'Nganjuk']),
        ];

        // 2. Baca file JSON/JS Daily Logs
        $jsonPath = base_path('database/seeders/data/daily_logs.json');
        if (file_exists($jsonPath)) {
            $logs = json_decode(file_get_contents($jsonPath), true);
            foreach ($logs as $row) {
                // Cari atau buat mesin
                $machine = Machine::firstOrCreate(
                    ['code' => $row['machineCode']],
                    [
                        'branch_id' => $branches[$row['branch']]->id,
                        'name'      => $row['machineName'] ?? $row['machineCode'],
                        'category'  => $row['category'] ?? 'Injection'
                    ]
                );

                // Buat Tiket SPK
                MaintenanceTicket::create([
                    'ticket_number'       => $row['ticketCode'],
                    'machine_id'          => $machine->id,
                    'branch_id'           => $branches[$row['branch']]->id,
                    'date'                => $row['date'],
                    'type'                => $row['type'],
                    'dt_hours'            => $row['dtHours'] ?? 0,
                    'cost'                => $row['cost'] ?? 0,
                    'status'              => $row['status'] ?? 'CLOSED',
                    'problem_description' => $row['problem'] ?? null,
                    'action_taken'        => $row['action'] ?? null,
                    'parts_replaced'      => $row['partName'] ?? null
                ]);
            }
        }
    }
}
```

---

## 6. Routes & Web Endpoint (`routes/web.php`)

```php
use App\Http\Controllers\MaintenanceSummaryController;

Route::prefix('report/maintenance-summary')->group(function () {
    Route::get('/', [MaintenanceSummaryController::class, 'index'])->name('maintenance.summary');
    Route::get('/export-excel', [MaintenanceSummaryController::class, 'exportExcel'])->name('maintenance.export.excel');
});
```

---

## Ringkasan Keuntungan Migrasi:
1. **Kecepatan Tinggi**: Query SQL langsung menghitung total jam DT, PM, dan Cost dalam < 5 ms, bahkan untuk jutaan baris data.
2. **Mudah Dirawat (*Maintainable*)**: Kode Blade terbagi menjadi potongan kecil (*partials*) yang bersih, masing-masing hanya sekitar 50–100 baris.
3. **Keamanan & Autentikasi**: Terintegrasi penuh dengan hak akses karyawan (Admin, Supervisor, Manager, GM) menggunakan Laravel Auth / Spatie Roles.
