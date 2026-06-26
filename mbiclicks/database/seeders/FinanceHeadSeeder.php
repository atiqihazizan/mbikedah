<?php

namespace Database\Seeders;

use App\Models\FinanceHead;
use Illuminate\Database\Seeder;

class FinanceHeadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        FinanceHead::create(['name'=>'CAPITAL']);
        FinanceHead::create(['name'=>'RETAINED EARNING']);
        FinanceHead::create(['name'=>'FIXED ASSETS']);
        FinanceHead::create(['name'=>'CURRENT ASSETS']);
        FinanceHead::create(['name'=>'CURRENT LIABILITIES']);
        FinanceHead::create(['name'=>'LONG TERM LIABILITIES']);
        FinanceHead::create(['name'=>'SALES']);
        FinanceHead::create(['name'=>'OTHER INCOMES']);
        FinanceHead::create(['name'=>'EXPENSES']);
    }
}
