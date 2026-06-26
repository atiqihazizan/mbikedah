<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class StaffFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    private $counter = 1;

    public function definition()
    {
        try{
            $uniq = $this->counter++;//$this->faker->unique(true)->numberBetween(1,30);
            $sno = str_pad($uniq,4,0,STR_PAD_LEFT);
            return [
                'fullname'=>$this->faker->name(),
                'staffno'=>$sno,
                'email' => $this->faker->companyEmail(),
                'position_id'=>mt_rand(1,15),
                'depart_id'=>mt_rand(1,13),
            ];
        } catch(\OverflowException $e){

        }
    }
}
