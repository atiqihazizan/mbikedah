<?php

namespace Database\Factories;

use App\Models\Billing;
use App\Models\User;
use App\Models\Department;
use App\Constants\BillingStatus;
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
      'status_id' => BillingStatus::FINANCE_REVIEW,
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
        'status_id' => BillingStatus::DRAFT
      ];
    });
  }

  /**
   * Indicate that the billing is hod approved.
   */
  public function hodApproved(): Factory
  {
    return $this->state(function (array $attributes) {
      return [
        'status_id' => BillingStatus::HOD_APPROVAL
      ];
    });
  }

  /**
   * Indicate that the billing is in finance review state.
   */
  public function financeReview(): Factory
  {
    return $this->state(function (array $attributes) {
      return [
        'status_id' => BillingStatus::FINANCE_REVIEW
      ];
    });
  }

  /**
   * Indicate that the billing is finance verified.
   */
  public function financeVerified(): Factory
  {
    return $this->state(function (array $attributes) {
      return [
        'status_id' => BillingStatus::FINANCE_VERIFY
      ];
    });
  }

  /**
   * Indicate that the billing is finance approved.
   */
  public function financeApproved(): Factory
  {
    return $this->state(function (array $attributes) {
      return [
        'status_id' => BillingStatus::FINANCE_APPROVAL
      ];
    });
  }

  /**
   * Indicate that the billing is processing payment.
   */
  public function processingPayment(): Factory
  {
    return $this->state(function (array $attributes) {
      return [
        'status_id' => BillingStatus::PROCESSING_PAYMENT
      ];
    });
  }

  // /**
  //  * Indicate that the billing is paid.
  //  */
  // public function paid(): Factory
  // {
  //     return $this->state(function (array $attributes) {
  //         return [
  //             'status_id' => BillingStatus::PAID
  //         ];
  //     });
  // }

  /**
   * Indicate that the billing is completed.
   */
  public function completed(): Factory
  {
    return $this->state(function (array $attributes) {
      return [
        'status_id' => BillingStatus::COMPLETED
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
        'status_id' => BillingStatus::REJECTED
      ];
    });
  }
}
