<?php

namespace Database\Factories;

use App\Models\BillingHistory;
use App\Models\Billing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BillingHistoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = BillingHistory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = [
            Billing::STATUS_DRAFT,
            Billing::STATUS_RETURNED,
            Billing::STATUS_CHECKED,
            Billing::STATUS_VERIFIED,
            Billing::STATUS_APPROVED,
            Billing::STATUS_PROCESS_PAYMENT,
            Billing::STATUS_PAID,
            Billing::STATUS_REJECTED,
            Billing::STATUS_CANCELLED
        ];

        $oldStatus = fake()->randomElement($statuses);
        $newStatus = fake()->randomElement(array_diff($statuses, [$oldStatus]));

        return [
            'billing_id' => Billing::factory(),
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'created_by' => User::factory(),
            'remarks' => fake()->sentence(),
        ];
    }
}
