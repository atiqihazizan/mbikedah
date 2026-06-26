<?php

namespace Database\Seeders;

use App\Models\Stepper;
use Illuminate\Database\Seeder;

class StepperSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $arr = [
            ['code'=>'PGW','name'=>'Pemohon','description'=>'Pemohon','act'=>[1,2]],
            ['code'=>'KJ','name'=>'Ketua Jabatan','description'=>'Pengesahan Ketua Jabatan','act'=>[3,4,5]],
            ['code'=>'PHR','name'=>'Pegawai Sumber Manusia','description'=>'Semakan Pegawai Sumber Manusia','act'=>[3,4,5]],
            ['code'=>'KHR','name'=>'Ketua Pewagai Sumber Manusia','description'=>'Kelulusan Ketua Pegawai Sumber Manusia','act'=>[3,4,5]],
            ['code'=>'PKW','name'=>'Pegawai Semakan Kewangan','description'=>'Semakan Kewangan','act'=>[3,4,5]],
            ['code'=>'KKW','name'=>'Ketua Jabatan Kewangan','description'=>'Kelulusan Ketua Pegawai Kewangan','act'=>[3,4,5]],
            ['code'=>'KPE','name'=>'Ketua Pegawai Eksekutif','description'=>'Kelulusan Pegawai Eksekutif','act'=>[3,4,5]],
            ['code'=>'BKW','name'=>'Pegawai Proses Bayaran','description'=>'Proses bayaran','act'=>[6]],
            ['code'=>'SKW','name'=>'Pegawai Sahkan Kewangan','description'=>'Pengesahan Kewangan','act'=>[6]],
            ['code'=>'PPK','name'=>'Pegawai Pengesahan Kenderaan','description'=>'Pengesahan Kenderaan','act'=>[3,4,5]],
            ['code'=>'TNT','name'=>'Pemohon','description'=>'Tuntutan Permohonan','act'=>[1,2]],
        ];
        for ($i=0; $i<count($arr); $i++){Stepper::create($arr[$i]);}
    }
}
