<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Bank;

class BankSeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    $arr = [
      ['BANK MUAMALAT', '02010004544718'],
      ['MAYBANK ALOR SETAR', '552022021635'],
      ['MAYBANK MERGONG', '552095231479'],
      ['RHB', '25205500010292'],
      ['CIMB MERGONG', '8602892627'],
      ['CIMB GUAR CHEMPEDAK', '8602983896'],
      ['BANK AFFIN', '105230003688'],
      ['AMBANK', '8881010808630'],
      ['BANK ISLAM', '02011010118337'],
      ['MAYBANK LADANG MAHANG', '552022605570'],
      ['PANJAR KHAS - SUMBANGAN'],
      ['PANJAR WANG RUNCIT'],
      ['PANJAR KHAS - KENDERAAN'],
      ['PANJAR KHAS - PEJABAT KETUA PEGAWAI EKSEKUTIF'],
      ['PANJAR KHAS - TOUCH N GO KPE'],
      ['TUNAI'],
      ['PANJAR WANG KHAS'],
    ];
    foreach ($arr as $a) {
      $data = [
        'bank_name' => $a[0],
        'bank_account' => $a[1] ?? '',
        'amount' => 100000,
        'budget_id' => null
      ];
      Bank::create($data);
    }

    // Bank::create([
    //   'bank_name' => 'Bank B',
    //   'bank_account' => '0987654321',
    //   'account_type' => 'Savings',
    //   'swift_code' => 'BANKB123',
    //   'branch_name' => 'Secondary Branch',
    //   'budget_id' => 1
    // ]);
  }
}
