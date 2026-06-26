<?php

namespace App\Http\View\Composers;

use App\Models\FinanceAcc;
use Illuminate\View\View;

class AccComposer
{
    public function compose(View $view){
        $view->with('acc',FinanceAcc::where('type',1)->get());
    }
}
