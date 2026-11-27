<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $table = 'branches';

    protected $fillable = [
        'code',
        'name',
        'city',
    ];

    public function machines(): HasMany
    {
        return $this->hasMany(Machine::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(MaintenanceTicket::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(MaintenanceProject::class);
    }
}
