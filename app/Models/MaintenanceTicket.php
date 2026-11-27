<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceTicket extends Model
{
    protected $table = 'maintenance_tickets';

    protected $fillable = [
        'ticket_number',
        'branch_id',
        'machine_id',
        'ticket_date',
        'type',
        'dt_hours',
        'pm_hours',
        'cost_dt',
        'cost_pm',
        'status',
        'problem_description',
        'sparepart_action',
        'pic_technician',
    ];

    protected $casts = [
        'ticket_date' => 'date:Y-m-d',
        'dt_hours' => 'float',
        'pm_hours' => 'float',
        'cost_dt' => 'float',
        'cost_pm' => 'float',
        'total_cost' => 'float',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }
}
