<?php

namespace Database\Seeders;

use App\Models\Urusniaga;
use Illuminate\Database\Seeder;

class UrusniagaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Urusniaga::create(['code'=>'B.111', 'uitem'=>'Perbelanjaan dari peruntukan yang telah diluluskan dalam Belanjawan tahun semasa']);
        Urusniaga::create(['code'=>'B.112', 'uitem'=>'Perbelanjaan dari peruntukan tambahan yang telah diluluskan']);
        Urusniaga::create(['code'=>'B.113', 'uitem'=>'Perbelanjaan yang tiada peruntukan']);
        Urusniaga::create(['code'=>'B.114', 'uitem'=>'Perbelanjaan dari wang petty Cash']);
        Urusniaga::create(['code'=>'B.115', 'uitem'=>'Bayaran dibawah tajuk Derma, Tajaan dan Keraian DLL']);
        Urusniaga::create(['code'=>'B.116', 'uitem'=>'Bayaran Wajib dibawah Tajuk Belanja Pentadbiran']);
    }
}
