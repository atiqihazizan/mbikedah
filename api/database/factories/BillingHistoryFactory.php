<?php

namespace Database\Factories;

use App\Models\BillingHistory;
use App\Models\Billing;
use App\Models\User;
use App\Constants\BillingStatus;
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
            BillingStatus::DRAFT,
            BillingStatus::HOD_APPROVAL,
            BillingStatus::FINANCE_REVIEW,
            BillingStatus::FINANCE_VERIFY,
            BillingStatus::FINANCE_APPROVAL,
            BillingStatus::PROCESSING_PAYMENT,
            BillingStatus::PAID,
            BillingStatus::COMPLETED,
            BillingStatus::REJECTED
        ];

        $oldStatus = $this->faker->randomElement($statuses);
        $newStatus = $this->faker->randomElement(array_diff($statuses, [$oldStatus]));

        return [
            'billing_id' => Billing::factory(),
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'remarks' => $this->faker->sentence,
            'created_by' => User::factory()
        ];
    }
}
