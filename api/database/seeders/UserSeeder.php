<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
	public function run()
	{
		// Check if the admin user already exists
		if (!User::where('email', 'admin@mbikedah.com.my')->exists()) {
			User::create([
				'name' => 'Administrator',
				'username' => 'admin',
				'email' => 'admin@mbikedah.com.my',
				'password' => Hash::make('123456'),
				'role_id' => 1	
			]);
		}

		$users = [
			['username' => 'zainah', 'name' => 'WAN ZAINAH BINTI HASSAN', 'department_id' => 11],
			['username' => 'zuhairi', 'name' => 'AHMAD ZUHAIRI BIN ZUBIT', 'department_id' => 2],
			['username' => 'syarani', 'name' => 'MOHD SYARANI BIN ABDUL JALIL', 'department_id' => 9],
			['username' => 'azilah', 'name' => 'TUNKU AZILAH BINTI TUNKU ABDUL AZIZ', 'department_id' => 2],
			['username' => 'awanis', 'name' => 'NURUL AWANIS BT MD NOH', 'department_id' => 12],
			['username' => 'asmawati', 'name' => 'ASMAWATI BINTI ABDUL RAMAN', 'department_id' => 4],
			['username' => 'aishah', 'name' => 'NUR AISHAH AFZAN BINTI BAKRI', 'department_id' => 4],
			['username' => 'shathirah', 'name' => 'SHATHIRAH BINTI RABIAN', 'department_id' => 12],
			['username' => 'sayuthi', 'name' => 'MOHD SAYUTHI BIN ABDUL RAZAK', 'department_id' => 11],
			['username' => 'husna', 'name' => 'NOORUL HUSNA BINTI HARUN', 'department_id' => 2],
			['username' => 'armiza', 'name' => 'NOR ARMIZA BINTI MOKHTAR', 'department_id' => 12],
			['username' => 'tarmizi', 'name' => 'MUHAMMAD TARMIZI BIN ABU HASSAN', 'department_id' => 3],
			['username' => 'salwani', 'name' => 'NOOR SALWANI BINTI KAMARUDIN', 'department_id' => 1],
			['username' => 'nidzamuddin', 'name' => 'NIDZAMUDDIN BIN MD MUKHTAR', 'department_id' => 6],
			['username' => 'aida', 'name' => 'SITI NOR AIDA BINTI HARUN', 'department_id' => 4],
			['username' => 'nadiah', 'name' => 'NURUL NADIAH BINTI WAHAB@AHMAD', 'department_id' => 8],
			['username' => 'sazliza', 'name' => 'SAZLIZA BINTI ABDUL HALIM', 'department_id' => 10],
			['username' => 'erna', 'name' => 'ERNA BINTI MAHMUD', 'department_id' => 1],
			['username' => 'rosli', 'name' => 'ROSLI BIN MOHAMAD JAMIL', 'department_id' => 12],
			['username' => 'zulkifli', 'name' => 'ZULKIFLI BIN HASSAN', 'department_id' => 5],
			['username' => 'azimatulhana', 'name' => 'AZIMATULHANA BINTI ZUBIR', 'department_id' => 5],
			['username' => 'natratulnaim', 'name' => 'SITI NATRATULNAIM BINTI ZAKARIA', 'department_id' => 3],
			['username' => 'azahar', 'name' => 'AZAHAR BIN AWANG', 'department_id' => 12],
			['username' => 'izyani', 'name' => 'NOR IZYANI BINTI AHMAD ZAKI', 'department_id' => 6],
			['username' => 'hafizuddin', 'name' => 'MUHD HAFIZUDDIN BIN ABDUL MUTHALIB', 'department_id' => 13],
			['username' => 'syauqi', 'name' => 'MUHAMMAD SYAUQI BIN ABU BAKAR', 'department_id' => 3],
			['username' => 'syafika', 'name' => 'SYAFIKA SOFEA BINTI ZANRI', 'department_id' => 7],
			['username' => 'naim', 'name' => 'MOHAMMAD NAIM BIN AZUDDIN', 'department_id' => 2],
			['username' => 'afifah', 'name' => 'NUR AFIFAH BINTI MOHD NOOR', 'department_id' => 1],
			['username' => 'muhafiy', 'name' => 'MUHAFIY BIN MUKHTAR', 'department_id' => 11],
			['username' => 'nafis', 'name' => 'MUHAMMAD NAFIS BIN ABDUL RASID', 'department_id' => 7],
			['username' => 'rizalyusop', 'name' => 'MOHD RIZAL BIN YUSOP', 'department_id' => 12],
			['username' => 'rizalrahim', 'name' => 'MOHD RIZAL BIN ABDUL RAHIM', 'department_id' => 12],
			['username' => 'helmi', 'name' => 'MOHAMAD HELMI BIN MOHAMAD KHALID', 'department_id' => 3],
			['username' => 'sobri', 'name' => 'MUHAMAD SOBRI BIN OSMAN', 'department_id' => 6],
			['username' => 'nadri', 'name' => 'NADRI BIN SHAFIE', 'department_id' => 1],
			['username' => 'jamilatul', 'name' => 'NUR JAMILATUL HUSNA BINTI MOHD FADZULI', 'department_id' => 12],
			['username' => 'khatijah', 'name' => 'KHATIJAH BINTI MD ISA', 'department_id' => 12],
			['username' => 'nabil', 'name' => 'MOHD NABIL BIN MOHD AZIZ', 'department_id' => 12]
		];

		$lastUserId = User::max('id') ?? 0;
		
		for ($i = 0; $i < count($users); $i++) {
			$userData = $users[$i];
			// Check if the department exists
			if (Department::where('id', $userData['department_id'])->exists()) {
				// Check if the user already exists
				if (!User::where('username', $userData['username'])->exists()) {
					User::create([
						'id' => $lastUserId + $i + 1,
						'name' => $userData['name'],
						'username' => $userData['username'],
						'email' => $userData['username'] . '@mbikedah.com.my', // Assuming email format
						'password' => Hash::make('123456'),
						'department_id' => $userData['department_id']
					]);
				}
			}
		}
	}
}
