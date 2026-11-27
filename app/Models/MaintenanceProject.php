<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceProject extends Model
{
    protected $table = 'maintenance_projects';

    protected $fillable = [
        'project_code',
        'branch_id',
        'name',
        'description',
        'machine_related',
        'category',
        'pic_name',
        'progress_pct',
        'status',
        'target_date',
        'efficiency_impact',
    ];

    protected $casts = [
        'progress_pct' => 'integer',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
