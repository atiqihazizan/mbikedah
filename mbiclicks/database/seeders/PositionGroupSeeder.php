<?php

namespace Database\Seeders;

use App\Models\PositionGroup;
use Illuminate\Database\Seeder;

class PositionGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $arr = ['HOD','Manager and Assistant Manager','Senior Executive and Executive','Penolong Executive dan kebawah'];
        foreach($arr as $a){
            PositionGroup::create(['name'=>$a]);
        }
    }
}
