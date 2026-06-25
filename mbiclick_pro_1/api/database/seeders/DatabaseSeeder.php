<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
  /**
   * Seed the application's database.
   */
  public function run(): void
  {
    $this->call([
      DepartmentSeeder::class, // Tambah ini
      UserSeeder::class,
      BillingRecipientSeeder::class,
      // BudgetSeeder::class,
      BankSeeder::class,
      PositionSeeder::class
    ]);
  }
}
