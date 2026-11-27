<?php

use App\Http\Controllers\MaintenanceDashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MaintenanceDashboardController::class, 'index'])->name('maintenance.summary');
Route::get('/maintenance/summary', [MaintenanceDashboardController::class, 'index'])->name('maintenance.summary.alt');
Route::get('/api/maintenance/summary', [MaintenanceDashboardController::class, 'apiSummary'])->name('api.maintenance.summary');
