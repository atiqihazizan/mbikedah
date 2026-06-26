<?php

namespace Database\Seeders;

use App\Models\Depart;
use Illuminate\Database\Seeder;

class DepartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $depart = [
            ['AUD','AUDIT DALAMAN, SEKRETARIAT ANAK SYARIKAT DAN PEMANTAUAN',''],
            ['KPW','KEWANGAN & PERAKAUNAN','KPW'],
            ['IT','KOMUNIKASI KORPORAT, MULTIMEDIA & IT',''],
            ['LH','LADANG HUTAN',''],
            ['LMBI','LADANG MBI & ASAS TANI',''],
            ['PKP','PEJABAT KETUA PEGAWAI EKSEKUTIF',''],
            ['PB','PEMBALAKAN',''],
            ['PH','PEMBANGUNAN HARTANAAH',''],
            ['PPP','PEMBANGUNAN PERNIAGAAN, PENGURUSAN ASET & PELABURAN',''],
            ['PAP','PENGURUSAN ASET & PELABURAN',''],
            ['PDO','PERUNDANGAN & DOCUMENT CONTROL',''],
            ['SMP','SUMBER MANUSIA & PENTADBIRAN',''],
            ['TT','TENAGA & TENAGA DIPERBAHARUI',''],
        ];
        for($i=0;$i<count($depart);$i++){Depart::create(['dcode'=>$depart[$i][0],'name'=>$depart[$i][1],'fhead'=>$depart[$i][2]]);}
    }
}
