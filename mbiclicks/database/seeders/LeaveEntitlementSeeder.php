<?php

namespace Database\Seeders;

use App\Models\LeaveEntitlement;
use Illuminate\Database\Seeder;

class LeaveEntitlementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $arr = [
            [1, 2, 2, 26, 7, 26],
            [1, 2, 5, 28, 7, 28],
            [1, 2, 99, 35, 7, 60],
            [1, 3, 2, 14, 0, 14],
            [1, 3, 5, 18, 0, 18],
            [1, 3, 99, 22, 0, 22],
            [1, 12, 0, 2500, 0, 2500],

            [2, 2, 2, 24, 7, 24],
            [2, 2, 5, 26, 7, 26],
            [2, 2, 99, 30, 7, 30],
            [2, 3, 2, 14, 0, 14],
            [2, 3, 5, 18, 0, 18],
            [2, 3, 99, 22, 0, 22],
            [2, 12, 0, 2500, 0, 2500],

            [3, 2, 2, 18, 7, 18],
            [3, 2, 5, 24, 7, 24],
            [3, 2, 99, 26, 7, 26],
            [3, 3, 2, 14, 0, 14],
            [3, 3, 5, 18, 0, 18],
            [3, 3, 99, 22, 0, 22],
            [3, 12, 0, 2500, 0, 2500],

            [4, 2, 2, 14, 7, 14],
            [4, 2, 5, 22, 7, 22],
            [4, 2, 99, 24, 7, 24],
            [4, 3, 2, 14, 0, 14],
            [4, 3, 5, 18, 0, 18],
            [4, 3, 99, 22, 0, 22],
            [4, 12, 0, 2000, 0, 2000],
        ];
        foreach($arr as $a){
            LeaveEntitlement::create([
                'idgrp' => $a[0],
                'idleave' => $a[1],
                'yr_up' => $a[2],
                'entitle' => $a[3],
                'maxbfwd' => $a[4],
                'maxbal' => $a[5],
            ]);
        }
    }
}
