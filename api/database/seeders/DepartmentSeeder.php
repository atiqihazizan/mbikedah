<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    public function run()
    {
        $departments = [
            ['code' => 'AUD', 'name' => 'AUDIT DALAMAN, SEKRETARIAT ANAK SYARIKAT DAN PEMANTAUAN'],
            ['code' => 'IT', 'name' => 'KOMUNIKASI KORPORAT, MULTIMEDIA & IT'],
            ['code' => 'KPW', 'name' => 'KEWANGAN & PERAKAUNAN'],
            ['code' => 'LH', 'name' => 'LADANG HUTAN'],
            ['code' => 'LMBI', 'name' => 'LADANG MBI & ASAS TANI'],
            ['code' => 'PAP', 'name' => 'PENGURUSAN ASET & PELABURAN'],
            ['code' => 'PB', 'name' => 'PEMBALAKAN'],
            ['code' => 'PDO', 'name' => 'PERUNDANGAN & DOCUMENT CONTROL'],
            ['code' => 'PH', 'name' => 'PEMBANGUNAN HARTANAAH'],
            ['code' => 'PKP', 'name' => 'PEJABAT KETUA PEGAWAI EKSEKUTIF'],
            ['code' => 'PPP', 'name' => 'PEMBANGUNAN PERNIAGAAN, PENGURUSAN ASET & PELABURAN'],
            ['code' => 'SMP', 'name' => 'SUMBER MANUSIA & PENTADBIRAN'],
            ['code' => 'TT', 'name' => 'TENAGA & TENAGA DIPERBAHARUI'],
        ];

        foreach ($departments as $department) {
            DB::table('departments')->updateOrInsert(
                ['code' => $department['code']], // Check for existing department by code
                ['name' => $department['name'], 'code' => $department['code']] // Update name if exists
            );
        }

    }
}
