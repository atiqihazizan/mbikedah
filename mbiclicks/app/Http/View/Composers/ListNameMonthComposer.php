<?php

namespace App\Http\View\Composers;

use Illuminate\View\View;

class ListNameMonthComposer
{
    public function compose(View $view){
        $month = [
            ['id'=>YEAR_NOW.'01','name'=>'Jan'],
            ['id'=>YEAR_NOW.'02','name'=>'Feb'],
            ['id'=>YEAR_NOW.'03','name'=>'Mac'],
            ['id'=>YEAR_NOW.'04','name'=>'Apr'],
            ['id'=>YEAR_NOW.'05','name'=>'Mei'],
            ['id'=>YEAR_NOW.'06','name'=>'Jun'],
            ['id'=>YEAR_NOW.'07','name'=>'Jul'],
            ['id'=>YEAR_NOW.'08','name'=>'Ogo'],
            ['id'=>YEAR_NOW.'09','name'=>'Sep'],
            ['id'=>YEAR_NOW.'10','name'=>'Okt'],
            ['id'=>YEAR_NOW.'11','name'=>'Nov'],
            ['id'=>YEAR_NOW.'12','name'=>'Dis'],
        ];
        $view->with('monthlist',$month);
    }
}
