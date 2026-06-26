<?php

namespace Database\Seeders;

use App\Models\BankMaster;
use Illuminate\Database\Seeder;

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
          ['BANK MUAMALAT','02010004544718'],
          ['MAYBANK ALOR SETAR','552022021635'],
          ['MAYBANK MERGONG','552095231479'],
          ['RHB','25205500010292'],
          ['CIMB MERGONG','8602892627'],
          ['CIMB GUAR CHEMPEDAK','8602983896'],
          ['BANK AFFIN','105230003688'],
          ['AMBANK','8881010808630'],
          ['BANK ISLAM','02011010118337'],
          ['MAYBANK LADANG MAHANG','552022605570'],
          ['PANJAR KHAS - SUMBANGAN'],
          ['PANJAR WANG RUNCIT'],
          ['PANJAR KHAS - KENDERAAN'],
          ['PANJAR KHAS - PEJABAT KETUA PEGAWAI EKSEKUTIF'],
          ['PANJAR KHAS - TOUCH N GO KPE'],
          ['TUNAI'],
          ['PANJAR WANG KHAS'],
        ];
        foreach ($arr as $a){
            $data = [
                'name'=>$a[0],
                'accno'=>$a[1]??'',
                'amt'=>100000,
            ];
            BankMaster::create($data);
        }
    }
}
