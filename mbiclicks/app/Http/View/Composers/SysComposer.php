<?php

namespace App\Http\View\Composers;

use App\Models\System;
use Illuminate\View\View;

class SysComposer
{
    public function compose(View $view){
        $view->with('sys',System::first());
    }
}
