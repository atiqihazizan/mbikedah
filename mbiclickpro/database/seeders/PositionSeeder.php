<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Position;

class PositionSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $positions = [
      'KETUA PEGAWAI EKSEKUTIF',
      'PEGAWAI KHAS KEPADA KPE',
      'PENGURUS BESAR',
      'PENGURUS',
      'PENGURUS KANAN',
      'PENOLONG PENGURUS',
      'EKSEKUTIF',
      'EKSEKUTIF KANAN',
      'SETIAUSAHA',
      'PEMANDU',
      'PEMBANTU AM',
      'PEMBANTU KHAS YAB MB',
      'PEMBANTU RENDAH AM',
      'PEMBANTU TADBIR',
      'PENOLONG EKSEKUTIF',
    ];

    foreach ($positions as $name) {
      Position::create(['name' => $name]);
    }
  }
}
