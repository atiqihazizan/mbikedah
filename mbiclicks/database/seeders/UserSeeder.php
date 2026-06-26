<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //User::factory(20)->create();

        $arr = [
            ['admin', 'superadmin', 0, 0, 0, 0, [1, 2, 3, 4, 5, 6, 7, 8,9,10,11]],
            ['zainah', '0003', 1, 0, 0, 11, [1,11]],
            ['zuhairi', '0006', 2, 0, 1, 2, [2, 6]],
            ['syarani', '0007', 3, 0, 0, 9, [1,11]],
            ['azilah', '0008', 4, 1, 1, 2, [5]],
            ['awanis', '0009', 5, 1, 2, 12, [1, 3]],
            ['asmawati', '0016', 6, 0, 0, 4, [1,11]],
            ['aishah', '0024', 7, 0, 0, 4, [1,11]],
            ['shathirah', '0025', 8, 1, 2, 12, [1, 2, 4]],
            ['sayuthi', '0027', 9, 0, 0, 11, [1,11]],
            ['husna', '0028', 10, 1, 1, 2, [9]],
            ['armiza', '0029', 11, 1, 2, 12, [10]],
            ['tarmizi', '0030', 12, 0, 0, 3, [1,11]],
            ['salwani', '0032', 13, 0, 0, 1, [1,11]],
            ['nidzamuddin', '0035', 14, 0, 0, 6, [1,11]],
            ['aida', '0039', 15, 0, 0, 4, [1,11]],
            ['nadiah', '0046', 16, 0, 0, 8, [1,11]],
            ['sazliza', '0049', 17, 0, 0, 10, [1,11]],
            ['erna', '0050', 18, 0, 0, 1, [1,11]],
            ['rosli', '0051', 19, 0, 0, 12, [1,11]],
            ['zulkifli', '0053', 20, 0, 0, 5, [1,11]],
            ['azimatulhana', '0055', 21, 0, 0, 5, [1,11]],
            ['natratulnaim', '0057', 22, 0, 0, 3, [1,11]],
            ['azahar', '0058', 23, 0, 0, 12, [1,11]],
            ['izyani', '0060', 24, 0, 0, 6, [1,11]],
            ['hafizuddin', '0061', 25, 0, 0, 13, [1,11]],
            ['syauqi', '0065', 26, 0, 0, 3, [1,11]],
            ['syafika', '0072', 27, 0, 0, 7, [1,11]],
            ['naim', '0075', 28, 0, 1, 2, [8]],
            ['afifah', '0076', 29, 0, 0, 1, [1,11]],
            ['muhafiy', '0077', 30, 0, 0, 11, [1,11]],
            ['nafis', '0078', 31, 0, 0, 7, [1,11]],
            ['rizalyusop', '0079', 32, 0, 0, 12, [1,11]],
            ['rizalrahim', '0080', 33, 0, 0, 12, [1,11]],
            ['helmi', 'C0021', 34, 0, 0, 3, [2]],
            ['sobri', 'C0023', 35, 0, 0, 6, [7]],
            ['nadri', 'C0024', 36, 0, 0, 1, [1,11]],
            ['jamilatul', 'C0026', 37, 0, 0, 12, [1,11]],
            ['khatijah', 'C0027', 38, 0, 0, 12, [1,11]],
            ['nabil', 'C0028', 39, 0, 0, 12, [1,11]],
        ];

        for($i=0;$i<count($arr);$i++){
            $user = [
                'name'=>strtolower($arr[$i][0]),
                'username'=>$arr[$i][1],
                'staff_id'=>$arr[$i][2],
                'uability'=>$arr[$i][3],
                'utype'=>$arr[$i][4],   // 1:finance 2:HR
                'ustep'=>$arr[$i][6],
                'password'=>bcrypt('123456'),
            ];
            if($i == 0) {
                $user['password'] = bcrypt('superadmin2022');
                $user['priority_page'] = 'cms';
                $user['is_admin'] = 1;
            } else {
                $user['depart_id'] = $arr[$i][5];
            }
            User::create($user);
        }
    }
}


