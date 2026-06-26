<?php

namespace App\Http\View\Composers;

use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class UserLoginComposer
{
    public function compose(View $view){
        $user = Auth::user();
//        $userlogin = $user->staffinfo();
        $staff = $user->staff;
        $userlogin = (object) [
          'nickname' => $user->name,
          'fullname' => $staff->fullname,
          'depart' => $staff->depart->name,
        ];
        $view->with('userlogin',$userlogin);
    }
}
