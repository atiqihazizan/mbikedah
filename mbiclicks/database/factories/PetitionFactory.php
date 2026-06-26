<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PetitionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $ar = [1,2,4,8,16,32];
        $title = $this->faker->sentence(mt_rand(7,7));
        $psts = 1;//mt_rand(1,4);
        $stpdt = null;
        $apprv = 0;
        $rand = 1;
        if($psts != 1){
            $stpdt = date('Y-m-d', mt_rand(strtotime("-2 months"),time()));
            $apprv = 0;//mt_rand(1,7);
            $rand = 2;//$ar[mt_rand(1,5)];//$ar[array_rand($ar)];
        }
        $creater = mt_rand(4,5);
        if($creater == 4) $arrd = 2;
        if($creater == 5) $arrd = 12;
//        $arrd = [2,12];
        return [
            'ptitle'=>$title,
            'slug'=>md5($title),
            'pdate'=>date('Y-m-d', mt_rand(strtotime("-5 months"),time())),//$this->faker->date(),
            'staff_id'=>$creater,
            'ptype_id'=>1,//mt_rand(1,8),
            'created_id'=>$creater,
            'u_by'=>$apprv,
            'depart_id'=> $arrd,//$arrd[array_rand($arrd)], //mt_rand(2,12),
            'stepnow'=> $rand,//gmp_strval($rad),//16,//gmp_random_bits(6)
            'psts'=>$psts,
            'stepdt'=>$stpdt,
            //'pdesc'=>$this->faker->sentence(mt_rand(3,10)),
            'body' => '{"urusniaga":"2","pno":"N\/A","budget":"175","perkara":"test","supplier":"1","suppliertext":"Kedah Communication & Events Sdn. Bhd.","unkod":"B.112","untext":"Perbelanjaan dari peruntukan tambahan yang telah diluluskan","bgtkod":"2001\/000","bgttext":"TANAH DAN PEMBAIKAN TANAH","bgtamt":"5000000.00","bgtbal":"3273754.00"}',
            'plist' => '[{"item":"Pembeli Saham dalam Paka Utama Holdings Sdn. Bhd.","refe":null,"unit":"500","amnt":"2.00","total":"1,000.00","curr":1000},{"item":"Kerja-kerja menyiapkan tapak expo berhadapan The Giant , Sungai Petani","refe":null,"unit":"10","amnt":"500.00","total":"5,000.00","curr":5000}]',
            'tamt'=> 6000.00
        ];
    }
}
