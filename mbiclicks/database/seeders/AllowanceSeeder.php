<?php

namespace Database\Seeders;

use App\Models\Allowance;
use Illuminate\Database\Seeder;

class AllowanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $arr = [
            ['Elaun Harian/Tugasan Luar Negara','Hari',0,0,1],
            ['Elaun Makan','Hari',0,0,1],
            ['Mileage','KM',0,0,1],
            ['Pengangkutan Awam','',0,0,0],
            ['Penginapan','',0,0,1],
            ['Pelbagai','',0,0,0],
            ['Bermalam','Hari',0,1,1],
            ['Harian','Hari',0,1,1],
            ['Tugasan Luar','Hari',0,1,1],
            ['Pagi','Hari',20,2,1],
            ['Tengahari','Hari',20,2,1],
            ['Malam','Hari',20,2,1],
            ['Kereta','KM',1.20,3,1],
            ['Motosikal','KM',0.60,3,1],
            ['Teksi','RM',0,4,0],
            ['Keretapi','RM',0,4,0],
            ['Bas','RM',0,4,0],
            ['Feri','RM',0,4,0],
            ['Kapal Terbang','RM',0,4,0],
            ['Grab','RM',0,4,0],
            ['ERL','RM',0,4,0],
            ['Hotel','RM',0,5,0],
            ['Sendiri, Elaun Lojing','RM',0,5,1],
            ['Tol','RM',0,6,0],
            ['Petrol','RM',0,6,0],
            ['Sewa Kenderaan','RM',0,6,0],
            ['Tempat Letak Kenderaan','RM',0,6,0],
        ];

        for($i=0;$i<count($arr);$i++){
            Allowance::create([
                'name'=>$arr[$i][0],
                'unit'=>$arr[$i][1],
                'fixedcost'=>$arr[$i][2],
                'parent'=>$arr[$i][3],
                'stscost'=>$arr[$i][4],
            ]);
        }
    }
}
