<?php

namespace Database\Seeders;

use App\Models\Leave;
use Illuminate\Database\Seeder;

class LeaveSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $arr = [
            ['Time Off',         'timeoff',    'Jam',  1, 1,2,8,1,0],
            ['Cuti Tahunan',     'annual',     'Hari', 2, 0,0,0,2,0],
            ['Cuti Sakit',       'mc',         'Hari', 3, 0,0,0,2,0],
            ['Cuti Ehsan',       'ehsan',      'Hari', 4, 0,0,0,2,3],
            ['Cuti Paternity',   'paternity',  'Hari', 5, 0,0,0,2,3],
            ['Cuti Bersalin',    'maternity',  'Hari', 6, 0,0,0,2,3],
            ['Cuti Tanpa Gaji',  'unpaid',     'Hari', 7, 1,0,0,2,0],
            ['Cuti Berkahwin',   'kahwin',     'Hari', 8, 0,0,0,2,3],
            ['Cuti Tanpa Rekod', 'unrecorded', 'Hari', 9, 1,0,0,2,0],
            ['Kursus/Seminar',   'bengkel',    'Hari', 10,1,0,0,2,0],
            ['Penghospitalan',   'ward',       'Hari', 11,0,0,0,2,60],
            ['Perubatan',        'medical',    'RM',   12,0,0,0,3,0],
            ['Faedah/Vits',      'faedah',     'RM',   13,0,0,0,3,800],
        ];
        foreach ($arr as $a){
            Leave::create([
                'leave'=>$a[0],
                //'fieldname'=>$a[1],
                'unit'=>$a[2],
                'sort'=>$a[3],
                'ctype'=>$a[4],
                'refid'=>$a[5],
                'limit'=>$a[6],
                'typ'=>$a[7],
                'def'=>$a[8],
            ]);
        }
    }
}
