<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'getMe']);

    // Billing routes
    Route::get('/billings', [BillingController::class, 'getBillings']);
    Route::post('/billings', [BillingController::class, 'createBilling']);
    Route::get('/billings/{id}', [BillingController::class, 'getBillingById']);
    Route::post('/billings/{id}/status', [BillingController::class, 'updateStatus']);
    
    // Billing Status Routes
    Route::post('/billings/{id}/hod-approve', [BillingController::class, 'hodApprove']);
    Route::post('/billings/{id}/finance-review', [BillingController::class, 'financeReview']);
    Route::post('/billings/{id}/finance-verify', [BillingController::class, 'financeVerify']);
    Route::post('/billings/{id}/finance-approve', [BillingController::class, 'financeApprove']);
    Route::post('/billings/{id}/process-payment', [BillingController::class, 'processPayment']);
    Route::post('/billings/{id}/paid', [BillingController::class, 'paid']);
    Route::post('/billings/{id}/complete', [BillingController::class, 'complete']);
    
    // Action Routes
    Route::post('/billings/{id}/reject', [BillingController::class, 'reject']);
    Route::post('/billings/{id}/return', [BillingController::class, 'return']);
    Route::post('/billings/{id}/cancel', [BillingController::class, 'cancel']);
    
    // Reporting Routes
    Route::get('/billings/stats', [BillingController::class, 'getStats']);
    Route::get('/billings/activities', [BillingController::class, 'getRecentActivities']);
    Route::get('/billings/pending', [BillingController::class, 'getPendingItems']);

    // Department routes
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::post('/departments', [DepartmentController::class, 'store']);
    Route::get('/departments/{id}', [DepartmentController::class, 'show']);
    Route::put('/departments/{id}', [DepartmentController::class, 'update']);
    Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);

    // User routes
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});