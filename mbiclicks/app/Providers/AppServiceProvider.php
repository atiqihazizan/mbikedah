<?php

namespace App\Providers;

use App\Http\View\Composers\AccComposer;
//use App\Http\View\Composers\AccHeadComposer;
use App\Http\View\Composers\ExpendComposer;
use App\Http\View\Composers\ListNameMonthComposer;
use App\Http\View\Composers\SysComposer;
use App\Http\View\Composers\TypePetitionComposer;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Paginator::useBootstrap();
        date_default_timezone_set('Asia/Kuala_Lumpur');

        View::share('master',master());
        View::composer(['approval.show'], AccComposer::class);
        View::composer(['approval.show'], ExpendComposer::class);
        View::composer(['preview.tools.letterhead'], SysComposer::class);
//        View::composer('application.index',TypePetitionComposer::class);
//        View::composer(['account.index'],AccHeadComposer::class);
        View::composer('reports.financeledger',ListNameMonthComposer::class);

        // log all query
//        DB::listen(function($query) {
//            Log::info(
//                $query->sql,
//                [
//                    'bindings' => $query->bindings,
//                    'time' => $query->time
//                ]
//            );
//        });
    }
}
