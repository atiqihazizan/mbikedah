<?php

namespace Database\Seeders;

use App\Models\Asset;
use Illuminate\Database\Seeder;

class AssetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $arr = [
            ['kereta','Toyota Hilux','KDW 9977'],
            ['kereta','Toyota Hilux','KDB 6043'],
            ['kereta','Toyota Hilux','KCV 4455'],
            ['kereta','Proton Preve','KEK 7700'],
            ['kereta','Toyota Camry','KFJ 787'],
            ['kereta','Xtrail','KEQ 9900'],
            ['kereta','Pajero','KDS 9900'],
            ['kereta','Starex','KDS 9000'],
            ['kereta','X70','KER 9800'],
            ['kereta','Outlander','KER 7900'],
        ];

        for ($i=0; $i<count($arr); $i++){
            Asset::create([
                'cate'=>$arr[$i][0],
                'model'=>$arr[$i][1],
                'regno'=>$arr[$i][2],
            ]);
        }
    }
}
