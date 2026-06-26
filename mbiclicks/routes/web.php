<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AllowanceController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\DetailController;
use App\Http\Controllers\FinanceAccController;
use App\Http\Controllers\FinanceSumController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\NecessityController;
use App\Http\Controllers\PetitionTypController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\StaffEventController;
use App\Http\Controllers\StaffLeaveController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\applications\BayaranController;
use App\Http\Controllers\endorsements\FinanceController;
use App\Http\Controllers\endorsements\HeadOfDepartController;

Route::middleware(['prevent-back-history'])->group(function(){
    Route::get('/', [LoginController::class,'index'])->name('login')->middleware('guest');
    Route::match(['get','post'],'/login',[LoginController::class,'login'])->middleware('guest')->name('signin');
    Route::match(['get','post'],'/logout',[LoginController::class,'logout'])->middleware('auth')->name('logout');
});

Route::prefix('cms')->middleware(['auth','is_admin','prevent-back-history'])->group(function(){
    Route::get('/',function(){return view('cms.index',['title'=>'CMS Dashboard']);})->name('cms.home');
    Route::resource('/user',UserController::class);
    Route::get('/profile',[SystemController::class,'index'])->name('cms.profile');
    Route::put('/profile/{system}',[SystemController::class,'update'])->name('cms.profile.edit');
    Route::get('/inform',[SystemController::class,'inform'])->name('cms.inform');
    Route::put('/inform/{system}',[SystemController::class,'setinform'])->name('cms.inform.edit');
    Route::resource('/event',StaffEventController::class)->parameters(['event'=>'staffEvent']);
    Route::resource('/position',PositionController::class);
});

Route::middleware(['auth','is_user','prevent-back-history'])->group(function(){
    Route::get('/change-password',[UserController::class,'password'])->name('password.form');
    Route::put('/change-password',[UserController::class,'change'])->name('password.change');

    Route::controller(HomeController::class)->group(function() {
        Route::get('/home', 'index')->name('home');
    });

    Route::prefix('petition')->group(function(){
        // Route::get('/',function(){return view('application.index',['title'=>'Permohonan']);})->name('petition.index');

        Route::prefix('/bayaran')->group(function(){
            Route::controller(BayaranController::class)->group(function(){
                Route::get('/getall','getall')->name('petition.bayaran.getall');
                Route::get('/history','history')->name('petition.bayaran.history');
                Route::post('/{petition}/submit','submit')->name('petition.bayaran.submit');
            });
        });
        Route::resource('/bayaran', BayaranController::class)->except(['create']);

        Route::controller(AttachmentController::class)->group(function(){
            Route::get('/{petition}/getattach','getattach')->name('petition.getattach');
            Route::post('/{petition}/addattach','addattach')->name('petition.addattach');
            Route::post('/{petition}/delattach','delattach')->name('petition.delattach');
        });
    });
    
    Route::prefix('activity')->middleware(['is_verifier'])->group(function(){
        
        Route::controller(ActivityController::class)->group(function(){
            Route::get('/','index')->name('activity.index');
            Route::get('/pending/count','countpending')->name('activity.pending.count');
            Route::put('/verify/{petition}','verify')->name('activity.verify');
            // Route::get('/warning','activitywarning')->name('activity.warning');
            // Route::get('/pending','pending')->name('activity.index');
            // Route::get('/pending/data','datapending')->name('activity.pending.data');
            // Route::get('/archive','archive')->name('activity.archive');
            // Route::get('/archive/data','dataarchive')->name('activity.archive.data');
            // Route::get('/archive/view/{petition}','viewarchive')->name('activity.archive.view');
            // Route::get('/{petition}','show')->name('activity.show');
        });
        
        // Head Of Department (ketua Jabatan)
        Route::prefix('/hod')->group(function(){
            Route::controller(HeadOfDepartController::class)->group(function(){
                Route::get('/pending','datapending')->name('activity.hod.pending');
                Route::get('/history','datahistory')->name('activity.hod.history');
                Route::get('/{petition}','show')->name('activity.hod.show');
                
            });
        });
        
        Route::prefix('/finance')->group(function(){
            Route::controller(FinanceController::class)->group(function(){
                // Route::get('/','index')->name('activity.finance.index');
                Route::get('/budgetremider','budgetremider')->name('activity.finance.budgetremider');
                Route::get('/pending','datapending')->name('activity.finance.pending');
                Route::get('/history','datahistory')->name('activity.finance.history');
                Route::put('/trans/credit/{petition}','addcredit')->name('activity.finance.addcredit');
                Route::put('/{petition}/plist','plistupdate')->name('activity.finance.plistupdate');
                Route::get('/{petition}','show')->name('activity.finance.show');
            });
        });
    });

    Route::get('/staff/{staff}/leave',[StaffLeaveController::class,'ownleave']);
    Route::get('/bank/credit',[\App\Http\Controllers\BankMasterController::class,'credit'])->name('bank.credit');
    Route::get('/finance/getdata',[\App\Http\Controllers\FinanceAccController::class,'getFinance'])->name('budget.getFinance');
    Route::get('/staff/getdata',[\App\Http\Controllers\StaffController::class,'getStaff'])->name('budget.getStaff');

    Route::resource('item',ItemController::class);
    Route::resource('supplier',SupplierController::class);
    Route::resource('booking',\App\Http\Controllers\BookingController::class); // khas untuk approval
    Route::resource('calendar',\App\Http\Controllers\EventCalController::class)->parameter('calendar','event_cal');
    Route::resource('ledgerbank',\App\Http\Controllers\BankLedgerController::class);

    Route::prefix('asset')->group(function(){
        Route::get('/available',[AssetController::class,'available'])->name('assets.available');
    });
    Route::resource('asset',AssetController::class);


    Route::prefix('finance')->group(function(){
        Route::get('/',function(){return redirect('/home');}); // avoid to page 404
        Route::get('/summary/{lay}/{type}/{yr}',[FinanceSumController::class,'index'])->name('finance.summary');
        Route::get('/graph/{yr}',[FinanceSumController::class,'graph'])->name('finance.graph');
        Route::get('/all',[FinanceAccController::class,'getAll'])->name('finance.alldata');
    });

    // Route::prefix('necessity')->group(function(){
    //     Route::get('/all',[NecessityController::class,'getItem'])->name('necessity.getitem');
    // });

    Route::prefix('conf')->group(function(){
        Route::get('/',function(){return redirect('/home'); });

        Route::get('/finance/{financeAcc}/enabled',[FinanceAccController::class,'enabled'])->name('finance.enabled');
        Route::get('/finance/{financeAcc}/transac',[FinanceAccController::class,'transac'])->name('finance.transac');
        Route::post('/finance/preparedsummary',[FinanceAccController::class,'preparedsummary'])->name('finance.preparedsummary');
        Route::resource('/finance',FinanceAccController::class)->parameters(['finance'=>'finance_acc']);
        Route::post('/budget/generate',[\App\Http\Controllers\FinanceBudgetController::class,'generate'])->name('budget.generate');
        Route::get('/budget/getbudget',[\App\Http\Controllers\FinanceBudgetController::class,'getBudget'])->name('budget.getBudget');
        Route::put('/budget/setbudget',[\App\Http\Controllers\FinanceBudgetController::class,'setbudget'])->name('budget.setbudget');
        Route::resource('/budget',\App\Http\Controllers\FinanceBudgetController::class);
        Route::resource('/bank',\App\Http\Controllers\BankMasterController::class)->parameters(['bank'=>'bank_master']);

        Route::resource('/staffleave',StaffLeaveController::class);
        Route::resource('/staff',StaffController::class);

        Route::put('/petitiontype/enabled/{ptype}',[PetitionTypController::class,'enabled'])->name('petitiontype.enabled');
        Route::resource('/petitiontype',PetitionTypController::class)->parameter('petitiontype','ptype');
        Route::get('/allowance/{allowance}/add',[AllowanceController::class,'addnew'])->name('allowance.add');
        Route::get('/levelallowance',[AllowanceController::class,'level'])->name('allowance.level');
        Route::get('/allowance/list',[AllowanceController::class,'list'])->name('allowance.list');
        Route::resource('/allowance',AllowanceController::class);

        Route::prefix('leave')->group(function(){
            Route::controller(LeaveController::class)->group(function(){
                Route::get('/yeartoup','yeartoup')->name('leave.yeartoup');
                Route::put('/yeartoup/{entitle}','entitleupdate')->name('leave.yeartoup.update');
            });
        });
        Route::resource('leave',LeaveController::class)->parameter('leave','leaveType');
    });
});
