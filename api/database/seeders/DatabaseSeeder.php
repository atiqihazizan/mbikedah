<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            DepartmentSeeder::class, // Tambah ini
            BillingRecipientSeeder::class,
            // Tambah seeder lain jika perlu
        ]);
    }
}
