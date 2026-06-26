<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    public function run()
    {
        $departments = [
            ['1', 'AUD', 'AUDIT DALAMAN, SEKRETARIAT ANAK SYARIKAT DAN PEMANTAUAN'],
            ['2', 'KPW', 'KEWANGAN & PERAKAUNAN'],
            ['3', 'IT', 'KOMUNIKASI KORPORAT, MULTIMEDIA & IT'],
            ['4', 'LH', 'LADANG HUTAN'],
            ['5', 'LMBI', 'LADANG MBI & ASAS TANI'],
            ['6', 'PKP', 'PEJABAT KETUA PEGAWAI EKSEKUTIF'],
            ['7', 'PB', 'PEMBALAKAN'],
            ['8', 'PH', 'PEMBANGUNAN HARTANAAH'],
            ['9', 'PPP', 'PEMBANGUNAN PERNIAGAAN, PENGURUSAN ASET & PELABURAN'],
            ['10', 'PAP', 'PENGURUSAN ASET & PELABURAN'],
            ['11', 'PDO', 'PERUNDANGAN & DOCUMENT CONTROL'],
            ['12', 'SMP', 'SUMBER MANUSIA & PENTADBIRAN'],
            ['13', 'TT', 'TENAGA & TENAGA DIPERBAHARUI'],
        ];
        
        foreach ($departments as $department) {
            DB::table('departments')->updateOrInsert(
                ['code' => $department[1]], // Check for existing department by code
                ['id' => $department[0], 'name' => $department[2], 'code' => $department[1]] // Update name if exists
            );
        }

    }
}
