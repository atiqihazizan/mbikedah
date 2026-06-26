<?php

namespace Database\Seeders;

use App\Models\Necessity;
use Illuminate\Database\Seeder;

class NecessitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $arr = [];
        $arr[] = ['Kenderaan',1,0,1,'assets',0];
        $arr[] = ['Pengangkutan Awam',2,0,0,'',1];
        $arr[] = ['Penginapan',2,0,0,'',1];
        $arr[] = ['Pelbagai',3,0,0,'',1];
        $arr[] = ['Grab',2,2,0,'',1];
        $arr[] = ['Teksi',2,2,0,'',1];
        $arr[] = ['Bas',2,2,0,'',1];
        $arr[] = ['Feri',2,2,0,'',1];
        $arr[] = ['Kapal Terbang',2,2,0,'',1];
        $arr[] = ['Hotel',2,3,0,'',1];
        $arr[] = ['Tol',3,4,0,'',1];
        $arr[] = ['Petrol',3,4,0,'',1];
        $arr[] = ['Sewa Kenderaan',3,4,0,'',1];
        $arr[] = ['Tempat Letak Kenderaan',3,4,0,'',1];
        foreach ($arr as $a){
            Necessity::create([
                'item'=>$a[0],
                'ntyp'=>$a[1],
                'parent'=>$a[2],
                'db'=>$a[3]??0,
                'dbname'=>$a[4]??0,
                'actv'=>$a[5],
            ]);
        }
    }
}
