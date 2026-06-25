<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Carbon::setLocale('ms');
        date_default_timezone_set('Asia/Kuala_Lumpur');

        if(config('database.default') == 'mysql') {
            DB::statement("SET time_zone = '+08:00'");
        }
    }
}
