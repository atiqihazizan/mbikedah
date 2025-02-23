<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Billing;
use App\Models\Department;
use App\Models\BillingRecipient;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CreateBillingTest extends TestCase
{
  use RefreshDatabase;

  protected $user;
  protected $department;
  protected $recipient;

  protected function setUp(): void
  {
    parent::setUp();

    // Create department
    $this->department = Department::create([
      'name' => 'Test Department',
      'code' => 'TEST'
    ]);

    // Create user
    $this->user = User::factory()->create([
      'department_id' => $this->department->id
    ]);

    // Create recipient
    $this->recipient = BillingRecipient::create([
      'name' => 'Test Recipient',
      'short' => 'TEST',
      'attn' => 'Attn: Test Person',
      'hp' => '0123456789',
      'tel' => '03-12345678',
      'fax' => '03-87654321',
      'addr' => 'Test Address, 12345 Test City'
    ]);

    $this->actingAs($this->user);
  }

  public function test_can_create_billing_with_single_detail()
  {
    $billingData = [
      'description' => 'Test Billing Description',
      'no_project' => 'TEST-001',
      'recipient_id' => $this->recipient->id,
      'total_amount' => 1000.50,
      'department_id' => $this->department->id,
      // 'payment_method' => 'online',
      'issued_at' => now()->format('Y-m-d'),
      'payment_due' => now()->addDays(30)->format('Y-m-d'),
      'detail' => [
        [
          'description' => 'Test Item Description',
          'budget_code' => 'BUDGET-001',
          'budget_id' => 1,
          'price' => 1000.50,
          'quantity' => 1,
          'reference' => 'REF-001'
        ]
      ]
    ];

    $response = $this->postJson('/api/billings', $billingData);

    $response->assertStatus(201)
      ->assertJson([
        'success' => true,
        'message' => 'Billing created successfully'
      ])
      ->assertJsonStructure([
        'success',
        'message',
        'data' => [
          'id',
          'description',
          'no_project',
          'recipient_id',
          'total_amount',
          'department_id',
          'payment_method',
          'status_id',
          'running_no',
          'issued_at',
          'payment_due',
          'created_by'
        ]
      ]);

    // Check database
    $this->assertDatabaseHas('billings', [
      'description' => 'Test Billing Description',
      'no_project' => 'TEST-001',
      'recipient_id' => $this->recipient->id,
      'total_amount' => 1000.50,
      'department_id' => $this->department->id,
      // 'payment_method' => 'online',
      'status_id' => Billing::STATUS_DRAFT,
      'created_by' => $this->user->id
    ]);

    // Check billing detail
    $billing = Billing::latest()->first();
    $this->assertDatabaseHas('billing_details', [
      'billing_id' => $billing->id,
      'description' => 'Test Item Description',
      'budget_code' => 'BUDGET-001',
      'budget_id' => 1,
      'price' => 1000.50,
      'quantity' => 1,
      'reference' => 'REF-001'
    ]);
  }

  public function qtest_can_create_billing_with_multiple_details()
  {
    $billingData = [
      'description' => 'Test Billing Description',
      'no_project' => 'TEST-002',
      'recipient_id' => $this->recipient->id,
      'total_amount' => 2500.00,
      'department_id' => $this->department->id,
      // 'payment_method' => 'cheque',
      'issued_at' => now()->format('Y-m-d'),
      'payment_due' => now()->addDays(30)->format('Y-m-d'),
      'detail' => [
        [
          'description' => 'Item 1',
          'budget_code' => 'BUDGET-001',
          'budget_id' => 1,
          'price' => 1000.00,
          'quantity' => 2,
          'reference' => 'REF-001'
        ],
        [
          'description' => 'Item 2',
          'budget_code' => 'BUDGET-002',
          'budget_id' => 2,
          'price' => 500.00,
          'quantity' => 1,
          'reference' => 'REF-002'
        ]
      ]
    ];

    $response = $this->postJson('/api/billings', $billingData);

    $response->assertStatus(201);

    // Check billing details
    $billing = Billing::latest()->first();
    $this->assertCount(2, $billing->details);
  }

  public function qtest_cannot_create_billing_without_required_fields()
  {
    $response = $this->postJson('/api/billings', [
      'description' => 'Test Billing'
      // Missing other required fields
    ]);

    $response->assertStatus(422)
      ->assertJsonValidationErrors([
        'no_project',
        'recipient_id',
        'total_amount',
        'department_id',
        'issued_at',
        'payment_due',
        'detail'
      ]);
  }

  public function qtest_cannot_create_billing_with_invalid_payment_method()
  {
    $billingData = [
      'description' => 'Test Billing Description',
      'no_project' => 'TEST-003',
      'recipient_id' => $this->recipient->id,
      'total_amount' => 1000.00,
      'department_id' => $this->department->id,
      // 'payment_method' => 'invalid_method', // Invalid payment method
      'issued_at' => now()->format('Y-m-d'),
      'payment_due' => now()->addDays(30)->format('Y-m-d'),
      'detail' => [
        [
          'description' => 'Test Item',
          'budget_code' => 'BUDGET-001',
          'budget_id' => 1,
          'price' => 1000.00,
          'quantity' => 1
        ]
      ]
    ];

    $response = $this->postJson('/api/billings', $billingData);

    $response->assertStatus(422)
      ->assertJsonValidationErrors(['payment_method']);
  }

  public function qtest_billing_is_created_with_correct_initial_status()
  {
    $billingData = [
      'description' => 'Test Billing Description',
      'no_project' => 'TEST-004',
      'recipient_id' => $this->recipient->id,
      'total_amount' => 1000.00,
      'department_id' => $this->department->id,
      // 'payment_method' => 'online',
      'issued_at' => now()->format('Y-m-d'),
      'payment_due' => now()->addDays(30)->format('Y-m-d'),
      'detail' => [
        [
          'description' => 'Test Item',
          'budget_code' => 'BUDGET-001',
          'budget_id' => 1,
          'price' => 1000.00,
          'quantity' => 1
        ]
      ]
    ];

    $response = $this->postJson('/api/billings', $billingData);

    $response->assertStatus(201);

    $billing = Billing::latest()->first();
    $this->assertEquals(Billing::STATUS_DRAFT, $billing->status_id);
  }
}
