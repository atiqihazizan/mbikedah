<?php

namespace Database\Seeders;

use App\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $arr = [
            ['KETUA PEGAWAI EKSEKUTIF', 1, 3, 1, 2, 3, 1, 1],
            ['PEGAWAI KHAS KEPADA KPE', 1, 4, 10, 11, 12, 4, 2],
            ['PENGURUS BESAR', 1, 7, 10, 11, 12, 4, 2],
            ['PENGURUS', 2, 4, 4, 5, 6, 2, 2],
            ['PENGURUS KANAN', 2, 4, 4, 5, 6, 2, 2],
            ['PENOLONG PENGURUS', 2, 2, 4, 5, 6, 2, 3],
            ['EKSEKUTIF', 3, 2, 7, 8, 9, 3, 4],
            ['EKSEKUTIF KANAN', 3, 2, 7, 8, 9, 3, 4],
            ['SETIAUSAHA', 3, 1, 10, 11, 12, 4, 4],
            ['PEMANDU', 4, 5, 10, 11, 12, 4, 4],
            ['PEMBANTU AM', 4, 5, 10, 11, 12, 4, 4],
            ['PEMBANTU KHAS YAB MB', 4, 6, 10, 11, 12, 4, 4],
            ['PEMBANTU RENDAH AM', 4, 6, 10, 11, 12, 4, 4],
            ['PEMBANTU TADBIR', 4, 5, 10, 11, 12, 4, 4],
            ['PENOLONG EKSEKUTIF', 4, 5, 10, 11, 12, 4, 2],
        ];
        foreach($arr as $a){
            Position::create([
                'name'=>$a[0],
                'idgrp'=>$a[1],

                'lvcate'=>$a[2],
                'lvsrvc1'=>$a[3],
                'lvsrvc2'=>$a[4],
                'lvsrvc3'=>$a[5],
                'grpcate'=>$a[6],
                'alwcate'=>$a[7],
            ]);
        }
    }
}
