<?php

namespace Database\Seeders;

use App\Models\PosAllowance;
use Illuminate\Database\Seeder;

class PosAllowanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $arr = [
            // Ketua pegawai eksekutif
            [7,50,350,1],
            [8,100,800,1],
            [9,1000,3000,1],
            [10,50,20,1],
            [11,50,20,1],
            [12,50,20,1],
            [22,0,500,1],
            // ketua jabatan
            [7,50,250,2],
            [8,100,500,2],
            [9,1000,2000,2],
            [10,50,20,2],
            [11,50,20,2],
            [12,50,20,2],
            [22,0,400,2],
            // pengurus & pen pengurus
            [7,50,150,3],
            [8,100,300,3],
            [9,1000,1000,3],
            [10,50,20,3],
            [11,50,20,3],
            [12,50,20,3],
            [22,0,300,3],
            // non - eksekutif
            [7,50,100,4],
            [8,100,150,4],
            [9,1000,500,4],
            [10,50,20,4],
            [11,50,20,4],
            [12,50,20,4],
            [22,0,150,4],

        ];
        for($i=0;$i<count($arr);$i++){
            PosAllowance::create([
                'aid'=>$arr[$i][0],
                'distance'=>$arr[$i][1],
                'amt'=>$arr[$i][2],
                'alwcate'=>$arr[$i][3],
            ]);
        }
    }
}
