<?php

namespace App\Http\View\Composers;

use App\Models\Ptype;
use Illuminate\View\View;

class TypePetitionComposer
{
    public function compose(View $view){
//        $view->with('types',Ptype::where('shw',1)->get());
    }
}
