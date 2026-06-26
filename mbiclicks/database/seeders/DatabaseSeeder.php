<?php

namespace Database\Seeders;

use App\Models\PositionGroup;
use App\Models\System;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            UserSeeder::class,
            StepperSeeder::class,
            PtypeSeeder::class,
            UrusniagaSeeder::class,
            DepartSeeder::class,
            PositionSeeder::class,
            FinanceAccSeeder::class,
            StaffSeeder::class,
            SupplierSeeder::class,
            ItemSeeder::class,
            LeaveSeeder::class,
            AllowanceSeeder::class,
            PosAllowanceSeeder::class,
            AssetSeeder::class,
            NecessitySeeder::class,
            BankSeeder::class,
            PositionGroupSeeder::class,
            LeaveEntitlementSeeder::class,
            PanelSeeder::class
        ]);
        System::create([
            'yr' => date('Y'),
            'amtseq' => [10000, [7, 6]],//'[[6,0],[7,10000]]',
            'agency' => 'MENTERI BESAR KEDAH INCORPORATED',
            'address' =>'Aras 2 Blok A, Wisma Darulaman, 05503 Alor Setar, Kedah Darulaman',
            'tel' =>'04 - 730 2137 / 731 0122',
            'fax' =>'04 - 774 4076',
            'start_yr'=>0,
            'current_yr'=>0,
            'hajiumrah'=>[
                'maxhari'=>50,
                'maxrm'=>0
            ]
        ]);
    }
}
