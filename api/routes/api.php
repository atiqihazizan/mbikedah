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

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    // Public routes
    Route::post('/login', [AuthController::class, 'login']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'getMe']);
    });
});

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    /*
    |--------------------------------------------------------------------------
    | Dashboard Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [BillingController::class, 'getDashboardData']);

        // // User Dashboard
        // Route::get('/user-stats', [BillingController::class, 'getUserDashboardStats']);
        // Route::get('/user-tables', [BillingController::class, 'getUserDashboardTables']);
        
        // // Officer Dashboard
        // Route::get('/officer-stats', [BillingController::class, 'getOfficerDashboardStats']);
        // Route::get('/officer-tables', [BillingController::class, 'getOfficerDashboardTables']);
    });

    /*
    |--------------------------------------------------------------------------
    | Billing Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('billings')->group(function () {
        // Basic CRUD
        Route::get('/', [BillingController::class, 'getBillings']);
        Route::post('/', [BillingController::class, 'createBilling']);
        Route::post('/{id}/status', [BillingController::class, 'updateStatus']);
        
        // Approval Flow
        Route::prefix('{id}')->group(function () {
            // HOD Level
            Route::post('/hod-approve', [BillingController::class, 'hodApprove']);
            
            // Finance Level
            Route::post('/finance-review', [BillingController::class, 'financeReview']);
            Route::post('/finance-verify', [BillingController::class, 'financeVerify']);
            Route::post('/finance-approve', [BillingController::class, 'financeApprove']);
            
            // Payment Level
            Route::post('/process-payment', [BillingController::class, 'processPayment']);
            Route::post('/paid', [BillingController::class, 'paid']);
            Route::post('/complete', [BillingController::class, 'complete']);
            
            // Action Routes
            Route::post('/reject', [BillingController::class, 'reject']);
            Route::post('/return', [BillingController::class, 'return']);
            Route::post('/cancel', [BillingController::class, 'cancel']);
        });
        
        // Reporting Routes
        Route::get('/stats', [BillingController::class, 'getStats']);
        Route::get('/activities', [BillingController::class, 'getRecentActivities']);
        Route::get('/pending', [BillingController::class, 'getPendingItems']);
        Route::get('/export', [BillingController::class, 'exportBillings']);
        Route::get('/{id}', [BillingController::class, 'getBillingById']);
    });

    /*
    |--------------------------------------------------------------------------
    | Department Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('departments')->group(function () {
        Route::get('/', [DepartmentController::class, 'index']);
        Route::post('/', [DepartmentController::class, 'store']);
        Route::get('/{id}', [DepartmentController::class, 'show']);
        Route::put('/{id}', [DepartmentController::class, 'update']);
        Route::delete('/{id}', [DepartmentController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | User Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
    });
});