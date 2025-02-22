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

// Route::apiResource('billings', BillingController::class);

// Route::post('/billings', [BillingController::class, 'createBilling'])
//     ->middleware(ValidateRequest::class)
//     ->middleware(CreateBillingRequest::class);
    
// Route::get('/billings', [BillingController::class, 'getBillings']);
//     ->middleware(ValidateRequest::class)
//     ->middleware(GetBillingsRequest::class);

// Route::get('/billings/{id}', [BillingController::class, 'getBillingById']);

//     ->middleware(ValidateRequest::class);
// Route::middleware(['verifyToken', 'billing.access'])->group(function () {
// });
