<?php

namespace Database\Seeders;

use App\Models\Panel;
use Illuminate\Database\Seeder;

class PanelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $arr = [
            ['name'=>'Klinik Noriah','cate'=>1,'typ'=>1],
            ['name'=>'Klinik Daru Syifa','cate'=>1,'typ'=>1],
            ['name'=>'Poliklinik Tanjung','cate'=>1,'typ'=>1],
            ['name'=>'Klinik Haji Ayaz','cate'=>1,'typ'=>1],
            ['name'=>'Klinik Selvam','cate'=>1,'typ'=>1],
            ['name'=>'Poliklinik Pertama Sdn Bhd','cate'=>1,'typ'=>1],
            ['name'=>'Klinik Bersatu 16 Jam','cate'=>1,'typ'=>1],
            ['name'=>'Poliklinik Fajar','cate'=>1,'typ'=>1],
            ['name'=>'Poliklinik Mutiara','cate'=>1,'typ'=>1],
            ['name'=>'Poliklinik Dr Azhar & Rakan2','cate'=>1,'typ'=>1],
            ['name'=>'Maha Klinik','cate'=>1,'typ'=>1],

            ['name'=>'KMC','cate'=>2,'typ'=>1],
            ['name'=>'PMC','cate'=>2,'typ'=>1],
            ['name'=>'PANTAI HOSP SP','cate'=>2,'typ'=>1],

            ['name'=>'Poliklinik Darulaman','cate'=>1,'typ'=>2],
            ['name'=>'Klinik Wan Zohdi','cate'=>1,'typ'=>2],
            ['name'=>'Klinik Pakar Kanak-kanak Lee','cate'=>1,'typ'=>2],
            ['name'=>'Klinik Kulit Dr Venkat Sdn Bhd','cate'=>1,'typ'=>2],
            ['name'=>'POLIKLINIK KEDAH 23 JAM','cate'=>1,'typ'=>2],
            ['name'=>'Yeoh Klinik Pakar Kanak-kanak','cate'=>1,'typ'=>2],
            ['name'=>'Mega Kulim Farmasi','cate'=>1,'typ'=>2],
            ['name'=>'POLIKLINIK KEDAH 23 JAM','cate'=>1,'typ'=>2],
            ['name'=>'KLINIK MEDIVIRON, KL','cate'=>1,'typ'=>2],
            ['name'=>'Say Gee Pakar Mata','cate'=>1,'typ'=>2],
            ['name'=>'Klinik Dr Fauzi','cate'=>1,'typ'=>2],
            ['name'=>'Klinik Dr Asmah','cate'=>1,'typ'=>2],
            ['name'=>'HOSPITAL SULTANAH BAHIYAH','cate'=>1,'typ'=>2],
            ['name'=>'KLINIK DR. HJ OTHMAN, KODIANG','cate'=>1,'typ'=>2],
            ['name'=>'MEDIKLINIK RAKYAT ALOR SETAR 23 JAM','cate'=>1,'typ'=>2],
            ['name'=>'KLINIK SAKIT MATA SOCKA','cate'=>1,'typ'=>2],
            ['name'=>'KLINIK DR. LATIPAH','cate'=>1,'typ'=>2],
            ['name'=>'KLINIK PAKAR JANTUNG DR. RAHIM','cate'=>1,'typ'=>2],
            ['name'=>'KLINIK DR. AKMAL SALEH, MELAKA','cate'=>1,'typ'=>2],
            ['name'=>'KLINIK DR ASMAH CAW ALOR SETAR','cate'=>1,'typ'=>2],
            ['name'=>'LAIN-LAIN','cate'=>1,'typ'=>2],
        ];
        foreach ($arr as $a) Panel::create($a);
    }
}
