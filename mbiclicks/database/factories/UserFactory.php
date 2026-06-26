<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    private $created = 0;

    public function definition()
    {
        $this->created++;
        $uniq = $this->created;//faker->unique()->numberBetween(1,20);
        $sno = str_pad($uniq,4,0,STR_PAD_LEFT);
        $ar = [1,2,4,8,16,32,5,17];
        return [
            'name' => $this->faker->userName(),
            'username' => $sno,//$this->faker->name(),
            'staff_id'=> mt_rand(1,20),
            'ustep'=>$ar[array_rand($ar)],
            'password'=>bcrypt(123456),
            // 'email' => $this->faker->unique()->safeEmail(),
            // 'email_verified_at' => now(),
            // 'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            // 'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function unverified()
    {
        return $this->state(function (array $attributes) {
            return [
                'email_verified_at' => null,
            ];
        });
    }
}
