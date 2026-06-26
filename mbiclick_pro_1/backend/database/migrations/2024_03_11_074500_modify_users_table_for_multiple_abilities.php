<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Dapatkan semua user
        $users = DB::table('users')->get();

        // Update abilities untuk setiap user
        foreach ($users as $user) {
            // Jika abilities masih string, tukar ke array
            $currentAbility = $user->abilities;
            if (!is_null($currentAbility) && !is_array($currentAbility)) {
                // Cuba decode JSON, jika gagal anggap sebagai single ability
                try {
                    $abilities = json_decode($currentAbility);
                    if (!is_array($abilities)) {
                        $abilities = [(int)$currentAbility];
                    }
                } catch (\Exception $e) {
                    $abilities = [(int)$currentAbility];
                }

                // Update user dengan array abilities
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['abilities' => json_encode($abilities)]);
            }
        }

        // Set default ability untuk user yang tiada ability
        DB::table('users')
            ->whereNull('abilities')
            ->update(['abilities' => json_encode([2])]); // 2 = applicant
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Dapatkan semua user
        $users = DB::table('users')->get();

        // Tukar balik array abilities ke single ability
        foreach ($users as $user) {
            $abilities = json_decode($user->abilities);
            $singleAbility = is_array($abilities) ? ($abilities[0] ?? 2) : 2;

            DB::table('users')
                ->where('id', $user->id)
                ->update(['abilities' => $singleAbility]);
        }
    }
};
