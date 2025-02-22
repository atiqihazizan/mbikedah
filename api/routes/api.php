<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Laravel\Sanctum\Http\Middleware\VerifyCsrfToken;

use App\Http\Controllers\BillingController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\AuthController;
use App\Http\Requests\CreateBillingRequest;
use App\Http\Requests\GetBillingsRequest;
use Illuminate\Support\Facades\Validator;
use App\Http\Middleware\ValidateRequest;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {
    // Route API untuk autentikasi
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Gunakan Sanctum untuk proteksi route
    Route::middleware([EnsureFrontendRequestsAreStateful::class, 'auth:sanctum'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'getMe']);
    });
});

Route::middleware(['auth:sanctum'])->group(function () {
    // Billing Routes
    Route::prefix('billing')->group(function () {
        // CRUD Operations
        Route::post('/', [BillingController::class, 'createBilling']);
        Route::get('/', [BillingController::class, 'getBillings']);
        Route::get('/{id}', [BillingController::class, 'getBillingById']);
        Route::put('/{id}', [BillingController::class, 'updateBilling']);
        
        // Status Management
        Route::get('/status/{id}', [BillingController::class, 'getBillingStatus']);
        Route::post('/status/{id}', [BillingController::class, 'updateStatus']);
        Route::post('/approve/{id}', [BillingController::class, 'approveBilling']);
        Route::post('/reject/{id}', [BillingController::class, 'rejectBilling']);
        Route::post('/process/{id}', [BillingController::class, 'processBilling']);
        
        // Archive Management
        Route::post('/toggle-archive/{id}', [BillingController::class, 'toggleArchive']);
        
        // Reports and Statistics
        Route::get('/export', [BillingController::class, 'exportBillings']);
        Route::get('/stats/dashboard', [BillingController::class, 'getDashboardStats']);
        Route::get('/stats/general', [BillingController::class, 'getStats']);
        Route::get('/activities', [BillingController::class, 'getRecentActivities']);
        Route::get('/pending', [BillingController::class, 'getPendingItems']);
    });
});