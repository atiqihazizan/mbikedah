<?php

namespace App\Http\View\Composers;

use App\Models\FinanceAcc;
use Illuminate\View\View;

class ExpendComposer
{
    public function compose(View $view){
        $view->with('expand',FinanceAcc::where('shw',1)->where('type',2)->where('yr',YEAR_NOW)->get());
    }
}
