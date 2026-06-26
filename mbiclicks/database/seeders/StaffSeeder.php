<?php

namespace Database\Seeders;

use App\Models\Staff;
use Illuminate\Database\Seeder;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $arr = [
            ['0003', 'WAN ZAINAH BINTI HASSAN', '', 11, 8],
            ['0006', 'AHMAD ZUHAIRI BIN ZUBIT', 'zuhairi@mbi.com', 2, 5],
            ['0007', 'MOHD SYARANI BIN ABDUL JALIL', 'syarani@mbi.com', 9, 3],
            ['0008', 'TUNKU AZILAH BINTI TUNKU ABDUL AZIZ', '', 2, 6],
            ['0009', 'NURUL AWANIS BT MD NOH', 'awanis@mbikedah.com.my', 12, 7],
            ['0016', 'ASMAWATI BINTI ABDUL RAMAN', '', 4, 6],
            ['0024', 'NUR AISHAH AFZAN BINTI BAKRI', 'aishah@mbi.com', 4, 14],
            ['0025', 'SHATHIRAH BINTI RABIAN', 'shathirah@mbi.com', 12, 6],
            ['0027', 'MOHD SAYUTHI BIN ABDUL RAZAK', '', 11, 15],
            ['0028', 'NOORUL HUSNA BINTI HARUN', 'husna@mbi.com', 2, 6],
            ['0029', 'NOR ARMIZA BINTI MOKHTAR', '', 12, 15],
            ['0030', 'MUHAMMAD TARMIZI BIN ABU HASSAN', '', 3, 7],
            ['0032', 'NOOR SALWANI BINTI KAMARUDIN', '', 1, 4],
            ['0035', 'NIDZAMUDDIN BIN MD MUKHTAR', '', 6, 2],
            ['0039', 'SITI NOR AIDA BINTI HARUN', '', 4, 7],
            ['0046', 'NURUL NADIAH BINTI WAHAB@AHMAD', '', 8, 7],
            ['0049', 'SAZLIZA BINTI ABDUL HALIM', '', 10, 8],
            ['0050', 'ERNA BINTI MAHMUD', '', 1, 7],
            ['0051', 'ROSLI BIN MOHAMAD JAMIL', '', 12, 10],
            ['0053', 'ZULKIFLI BIN HASSAN', '', 5, 7],
            ['0055', 'AZIMATULHANA BINTI ZUBIR', '', 5, 15],
            ['0057', 'SITI NATRATULNAIM BINTI ZAKARIA', '', 3, 8],
            ['0058', 'AZAHAR BIN AWANG', '', 12, 11],
            ['0060', 'NOR IZYANI BINTI AHMAD ZAKI', '', 6, 9],
            ['0061', 'MUHD HAFIZUDDIN BIN ABDUL MUTHALIB', '', 13, 8],
            ['0065', 'MUHAMMAD SYAUQI BIN ABU BAKAR', '', 3, 7],
            ['0072', 'SYAFIKA SOFEA BINTI ZANRI', '', 7, 7],
            ['0075', 'MOHAMMAD NAIM BIN AZUDDIN', '', 2, 7],
            ['0076', 'NUR AFIFAH BINTI MOHD NOOR', '', 1, 15],
            ['0077', 'MUHAFIY BIN MUKHTAR', '', 11, 6],
            ['0078', 'MUHAMMAD NAFIS BIN ABDUL RASID', '', 7, 8],
            ['0079', 'MOHD RIZAL BIN YUSOP', '', 12, 10],
            ['0080', 'MOHD RIZAL BIN ABDUL RAHIM', '', 12, 10],
            ['C0021', 'MOHAMAD HELMI BIN MOHAMAD KHALID', '', 3, 4],
            ['C0023', 'MUHAMAD SOBRI BIN OSMAN', 'sobri@mbi.com', 6, 1],
            ['C0024', 'NADRI BIN SHAFIE', '', 1, 15],
            ['C0026', 'NUR JAMILATUL HUSNA BINTI MOHD FADZULI', '', 12, 12],
            ['C0027', 'KHATIJAH BINTI MD ISA', '', 12, 13],
            ['C0028', 'MOHD NABIL BIN MOHD AZIZ', '', 12, 10],
        ];
        for($i=0;$i<count($arr);$i++){Staff::create([
            'staffno'=>$arr[$i][0],
            'fullname'=>$arr[$i][1],
            'email'=>$arr[$i][2],
            'depart_id'=>$arr[$i][3],
            'position_id'=>$arr[$i][4]
        ]);}
        //Staff::factory(20)->create();

    }
}
