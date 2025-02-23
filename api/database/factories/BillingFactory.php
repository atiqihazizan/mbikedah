<?php

namespace Database\Factories;

use App\Models\Billing;
use App\Models\User;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Billing>
 */
class BillingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Billing::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $department = Department::first() ?? Department::factory()->create();
        $user = User::first() ?? User::factory()->create(['department_id' => $department->id]);

        return [
            'description' => fake()->sentence(),
            'total_amount' => fake()->randomFloat(2, 100, 10000),
            'department_id' => $department->id,
            'created_by' => $user->id,
            'status_id' => Billing::STATUS_DRAFT,
            'payment_method' => fake()->randomElement(['cash', 'cheque', 'online']),
            'no_project' => fake()->word() ?? 'N/A',
            'running_no' => 'BILL-' . fake()->unique()->randomNumber(6),
            'issued_at' => now(),
            'payment_due' => now()->addDays(30),
            'is_archived' => false
        ];
    }

    /**
     * Indicate that the billing is in draft state.
     */
    public function draft(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status_id' => Billing::STATUS_DRAFT
            ];
        });
    }

    /**
     * Indicate that the billing is returned.
     */
    public function returned(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status_id' => Billing::STATUS_RETURNED
            ];
        });
    }

    /**
     * Indicate that the billing is checked.
     */
    public function checked(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status_id' => Billing::STATUS_CHECKED
            ];
        });
    }

    /**
     * Indicate that the billing is verified.
     */
    public function verified(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status_id' => Billing::STATUS_VERIFIED
            ];
        });
    }

    /**
     * Indicate that the billing is approved.
     */
    public function approved(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status_id' => Billing::STATUS_APPROVED
            ];
        });
    }

    /**
     * Indicate that the billing is in process payment.
     */
    public function processPayment(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status_id' => Billing::STATUS_PROCESS_PAYMENT
            ];
        });
    }

    /**
     * Indicate that the billing is paid.
     */
    public function paid(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status_id' => Billing::STATUS_PAID
            ];
        });
    }

    /**
     * Indicate that the billing is rejected.
     */
    public function rejected(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status_id' => Billing::STATUS_REJECTED
            ];
        });
    }

    /**
     * Indicate that the billing is cancelled.
     */
    public function cancelled(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status_id' => Billing::STATUS_CANCELLED
            ];
        });
    }
}
