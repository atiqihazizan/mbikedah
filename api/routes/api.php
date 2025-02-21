<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BillingController;

Route::middleware('billing.access')->group(function () {
    Route::apiResource('billings', BillingController::class);
});
