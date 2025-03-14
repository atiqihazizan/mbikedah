<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillingActivitiesController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\BillingListController;
use App\Http\Controllers\BillingRecipientController;
use App\Http\Controllers\BudgetController;
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
    | Redis Test Routes
    |--------------------------------------------------------------------------
    */
  Route::prefix('redis-test')->group(function () {
    Route::get('/set', function () {
      Cache::put('test_key', 'Redis berjaya dipasang!', now()->addMinutes(5));
      return response()->json(['message' => 'Data telah disimpan dalam Redis']);
    });

    Route::get('/get', function () {
      $value = Cache::get('test_key', 'Tiada data dalam Redis');
      return response()->json(['message' => $value]);
    });
  });

  /*
    |--------------------------------------------------------------------------
    | Budget Routes
    |--------------------------------------------------------------------------
    */
  Route::prefix('budgets')->group(function () {
    Route::get('/', [BudgetController::class, 'index']);
    Route::post('/', [BudgetController::class, 'store']);
    Route::get('/{id}', [BudgetController::class, 'show']);
    Route::put('/{id}', [BudgetController::class, 'update']);
    Route::delete('/{id}', [BudgetController::class, 'destroy']);
  });

  /*
    |--------------------------------------------------------------------------
    | Dashboard Routes
    |--------------------------------------------------------------------------
    */
  Route::prefix('dashboard')->group(function () {
    // Route::get('/', [BillingController::class, 'getDashboardData']);
  });

  /*
    |--------------------------------------------------------------------------
    | Billing Routes
    |--------------------------------------------------------------------------
    */
  Route::prefix('billings')->group(function () {
    // Basic Resource Routes
    Route::post('/', [BillingController::class, 'store']);
    Route::put('/{billing}', [BillingController::class, 'update']);
    
    // Additional Custom Routes
    Route::get('/incomplete', [BillingListController::class, 'getIncomplete']);
    Route::get('/pending-hod', [BillingListController::class, 'getPendingHOD']);
    Route::get('/pending-finance', [BillingListController::class, 'getPendingFinance']);
    Route::get('/archive', [BillingListController::class, 'getArchive']);

    // Nested/Specific Routes
    Route::prefix('{billing}')->group(function () {
      // HOD Level
      Route::post('/hod-approve', [BillingActivitiesController::class, 'hodApprove']);

      // Finance Level
      Route::post('/finance-review', [BillingActivitiesController::class, 'financeReview']);
      Route::post('/finance-verify', [BillingActivitiesController::class, 'financeVerify']);
      Route::post('/finance-approve', [BillingActivitiesController::class, 'financeApprove']);

      // Payment Level
      Route::post('/process-payment', [BillingActivitiesController::class, 'processPayment']);
      Route::post('/paid-complete', [BillingActivitiesController::class, 'paidComplete']);

      // Other Actions
      Route::post('/cancel', [BillingActivitiesController::class, 'cancelBilling']);
      Route::post('/reject', [BillingActivitiesController::class, 'rejectBilling']);
      Route::post('/return', [BillingActivitiesController::class, 'returnBilling']);

      // History Route
      Route::get('/history', [BillingListController::class, 'getHistory']);

      // Edit Route
    });

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
    | Billing Recipient Routes
    |--------------------------------------------------------------------------
    */
  Route::prefix('billing-recipients')->group(function () {
    Route::get('/', [BillingRecipientController::class, 'index']);
    Route::post('/', [BillingRecipientController::class, 'store']);
    Route::get('/{id}', [BillingRecipientController::class, 'show']);
    Route::put('/{id}', [BillingRecipientController::class, 'update']);
    Route::delete('/{id}', [BillingRecipientController::class, 'destroy']);
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

    // Route untuk kemaskini abilities pengguna
    Route::put('/{id}/abilities', [UserController::class, 'updateAbilities']);
  });
});
