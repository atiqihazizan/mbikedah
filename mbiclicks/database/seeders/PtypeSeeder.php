<?php

namespace Database\Seeders;

use App\Models\Ptype;
use Illuminate\Database\Seeder;

class PtypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $arr = [
            [
                'Bayaran','Bayaran', 'bayaran',
                [PREPARED,ENDORSE_KJ,ENDORSE_PKW,ENDORSE_VFY,ENDORSE_PAY],
                [ENDORSE_KJ,ENDORSE_CEO,ENDORSE_PKW,ENDORSE_VFY,ENDORSE_PAY],
                1,0,1,NULL
            ],
            [
                'Permohonan Perjalanan','Perjalanan', 'perjalanan',
                [PREPARED,ENDORSE_KJ,ENDORSE_PHR,ENDORSE_KHR],
                [ENDORSE_KJ,ENDORSE_CEO,ENDORSE_PHR,ENDORSE_KHR],
                1,5,2,NULL
            ],
            [
                'Tuntutan Perjalanan','Tuntutan', 'tripclaim',
                [PREPARED,ENDORSE_KJ,ENDORSE_PHR,ENDORSE_KHR],
                [ENDORSE_KJ,ENDORSE_CEO,ENDORSE_PHR,ENDORSE_KHR],
                0,0,2,NULL
            ],
            [
                'Tuntutan Perubatan','Perubatan', 'medical',
                [PREPARED,ENDORSE_KJ,ENDORSE_PHR],
                [ENDORSE_KJ,ENDORSE_CEO,ENDORSE_PHR],
                1,0,2,[12]
            ],
            [
                'Tuntutan Faedah Kakitangan','Faedah', 'benefit',
                [PREPARED,ENDORSE_KJ,ENDORSE_PHR],
                [ENDORSE_KJ,ENDORSE_CEO,ENDORSE_PHR],
                1,0,2,[13]
            ],
        ];
        $preq = [
            [
//            [2=>["el"=>"nombor","name"=>"jumconfirm","unit"=>"RM","title"=>"Jumlah Bayaran","value"=>0,"class"=>"d-none"],8=>["urlpost"=>"payment"]],
            ],
            [2=>["title"=>"Bil. masa yang dibenarkan","el"=>"nombor","name"=>"jumconfirm","value"=>0,"urlpost"=>"hourconfirm","unit"=>"Jam"],3=>['limit'=>4]],
            [3=> ["el"=> "needs", "name"=> "needs"]],
            [3=>["el"=>"vehicle","name"=>"vehicle"]],
            [3=>["el"=> "claim", "name"=> "claim"] ],
            [2=>["title"=>"Bil. Hari Yang Dibenarkan","el"=>"nombor","name"=>"jumconfirm","value"=>"0","urlpost"=>"dayconfirm","unit"=>"Hari"],"lvsum"=>[2,6,9]],
            [2=> ["el"=> "currency","name"=> "jumconfirm","unit"=> "RM","title"=> "Amaunt yang dituntut","value"=> "0"]],
            [2=> ["el"=> "currency","name"=> "jumconfirm","unit"=> "RM","title"=> "Amaunt yang dituntut","value"=> "0"]],
        ];
        $temp = [
            [
                // bayaran
                // ['label'=>'Jenis Urusniaga/Belanja','field'=>['unkod','untext'],'type'=>''],
                ['label'=>'No Projek','field'=>'pno','type'=>''],
                ['label'=>'Nama Pembekal/Kontraktor/Penerima','field'=>'recepient','type'=>''],
                ['label'=>'Keterangan Bayaran','field'=>"perkara","type"=>''],
                ['label'=>'Jumlah (RM)','field'=>"total","type"=>''],
                ['label'=>'Butiran','field'=>null,'type'=>'table','column'=>'Kod Bajet|Item|No Rujukan|Bil/Unit|Harga|Jumlah|render',
                 'customClass'=>'2:text-nowrap|3:text-center|4,5:text-end|6:text-end w-10px',
                 'data'=>'budget.code|item|refe|unit|amnt|total|verified.code',
                 'format'=>'s,s,s,i,c,c,s'],
            ],
            [
                // time-off
                ['label'=>'Tarikh Dari','field'=>'date','type'=>'d'],
                ['label'=>'Waktu Keluar','field'=>'tout','type'=>''],
                ['label'=>'Waktu Masuk','field'=>'tin','type'=>''],
                ['label'=>'Bil. yang Dimohon','field'=>'num','unit'=>'Jam','type'=>''],
                ['label'=>'Alasan','field'=>'reason','type'=>''],
                ['label'=>'Lain-lain','field'=>'other','type'=>''],
                ['label'=>'Waktu yang dilulus','field'=>'tinconfirm','type'=>''],
                ['label'=>'Bil. yang dilulus','field'=>'jumconfirm','unit'=>'Jam','type'=>''],
            ],
            [
                // kenderaan
            ],
            [
                // perjalanan
                ['label'=>'Tarikh Bertolak','field'=>'dtout','type'=>'d'],
                ['label'=>'Tarikh Balik','field'=>'dtback','type'=>'d'],
                ['label'=>'Urusan','field'=>'urusan','type'=>''],
                ['label'=>'Bilangan Hari','field'=>'num','unit'=>'Hari','type'=>''],
                ['label'=>'Lokasi','field'=>'location','type'=>''],
                ['label'=>'Alamat dan Tempat Urusan','field'=>'addr','type'=>''],
                ['label'=>"Penggunaan Kenderaan",'field'=>"car.text",'type'=>'b'],
                ['label'=>"Keperluan Pemandu",'field'=>"car.driver_name",'type'=>'b'],
//                ['label'=>'Keperluan Kenderaan','field'=>'vehicle','type'=>'',"db"=>"assets","col"=>"id","fieldname"=>["model","regno"]],
                ["label"=>"Keperluan","field"=>null,"column"=>"Kategori|Item|Keterangan|render",
                 'customClass'=>'0:w-150px|1:w-250px|3:text-end w-200px',
                 "data"=>"cate|item|desc|verified",
                 "type"=>"table","format"=>"s,s,s,s"]
            ],
            [
                // tuntutan perjalanan
                ['label'=>'Jumlah (RM)','field'=>"total","type"=>'c'],
                ['label'=>'Butiran','field'=>null,'type'=>'table','column'=>'Kod Bajet|Item|No Rujukan|Bil/Unit|Harga|Jumlah|render',
                 'customClass'=>'2:text-nowrap|3:text-center|4,5:text-end|6:text-end w-100px',
                 'data'=>'budget.code|item|refe|unit|amnt|total|slug',
                 'format'=>'s,s,s,i,c,c,s'],
            ],
            [
                // cuti
                ['label'=>'Tarikh Dari','field'=>'dtout','type'=>'d'],
                ['label'=>'Hingga','field'=>'dtback','type'=>'d'],
                ['label'=>'Bilangan Hari','field'=>'num','type'=>'','unit'=>'Hari'],
                ['label'=>'Alasan','field'=>'reason','type'=>''],
                ['label'=>'Bilangan hari yang diluluskan','field'=>'jumconfirm','type'=>'','unit'=>'Hari'],
            ],
            [
                // medical
                ['label'=>'Dituntut Oleh','field'=>'claimant','type'=>''],
                ['label'=>'Hubungan','field'=>'relation','type'=>''],
                ['label'=>'Jumlah (RM)','field'=>'totalamt','type'=>'c'],
                ['label'=>'Butiran','field'=>null,'type'=>'table','column'=>'Kod Bajet|Item|No Rujukan|Bil/Unit|Harga|Jumlah|render',
                 'customClass'=>'2:text-nowrap|3:text-center|4,5:text-end|6:text-end w-100px',
                 'data'=>'budget.code|item|refe|unit|amnt|total|slug',
                 'format'=>'s,s,s,i,c,c,s'],
            ],
            [
                // benefit
                ['label'=>'Jenis Rawatan','field'=>'treatment','type'=>'','db'=>'leaves','col'=>'id','fieldname'=>['leave']],
                ['label'=>'Rawatan Diambil','field'=>'item','type'=>''],
                ['label'=>'Dituntut Oleh','field'=>'claimant','type'=>''],
                ['label'=>'Hubungan','field'=>'relation','type'=>''],
                ['label'=>'Jumlah (RM)','field'=>'totalamt','type'=>'c'],
                ['label'=>'Butiran','field'=>null,'type'=>'table','column'=>'Kod Bajet|Item|No Rujukan|Bil/Unit|Harga|Jumlah|render',
                 'customClass'=>'2:text-nowrap|3:text-center|4,5:text-end|6:text-end w-100px',
                 'data'=>'budget.code|item|refe|unit|amnt|total|slug',
                 'format'=>'s,s,s,i,c,c,s'],
            ]
        ];

        foreach($arr as $i => $a){
            Ptype::create ([
                'name'  => $a[0],
                'short' => $a[1],
                'code'  => $a[2],
                'seq1'  => $a[3],
                'seq2'  => $a[4],
                'shw'   => $a[5],
                'refid' => $a[6],
                'cate'  => $a[7],
                'lvtyp' => $a[8],
                'preq'  => $preq[$i] ?? [],
                'tmpl'  => $temp[$i] ?? [],
            ]);
        }
    }
}
