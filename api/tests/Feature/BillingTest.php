<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Billing;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BillingTest extends TestCase
{
    use RefreshDatabase;

    protected $department;
    protected $user;

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

        $this->actingAs($this->user);
    }

    public function test_can_create_billing()
    {
        $billingData = [
            'description' => 'Test Billing',
            'total_amount' => 1000.50,
            'department_id' => $this->department->id,
            'payment_method' => 'online',
            'no_project' => 'TEST-001',
            'running_no' => 'BILL-' . uniqid(),
        ];

        $response = $this->postJson('/api/billings', $billingData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Billing created successfully',
                'data' => [
                    'description' => $billingData['description'],
                    'total_amount' => $billingData['total_amount'],
                    'department_id' => $billingData['department_id'],
                    'payment_method' => $billingData['payment_method'],
                    'status_id' => Billing::STATUS_DRAFT,
                    'created_by' => $this->user->id
                ]
            ]);

        $this->assertDatabaseHas('billings', [
            'description' => $billingData['description'],
            'total_amount' => $billingData['total_amount'],
            'department_id' => $billingData['department_id'],
            'payment_method' => $billingData['payment_method'],
            'status_id' => Billing::STATUS_DRAFT,
            'created_by' => $this->user->id
        ]);
    }

    public function test_cannot_create_billing_with_invalid_payment_method()
    {
        $billingData = [
            'description' => 'Test Billing',
            'total_amount' => 1000.50,
            'department_id' => $this->department->id,
            'payment_method' => 'invalid_method',
            'no_project' => 'TEST-001',
            'running_no' => 'BILL-' . uniqid(),
        ];

        $response = $this->postJson('/api/billings', $billingData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['payment_method']);
    }

    public function test_cannot_create_billing_without_required_fields()
    {
        $response = $this->postJson('/api/billings', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'description',
                'total_amount',
                'department_id',
                'payment_method'
            ]);
    }

    public function test_cannot_create_billing_with_invalid_total_amount()
    {
        $billingData = [
            'description' => 'Test Billing',
            'total_amount' => 'invalid_amount',
            'department_id' => $this->department->id,
            'payment_method' => 'online',
            'no_project' => 'TEST-001',
            'running_no' => 'BILL-' . uniqid(),
        ];

        $response = $this->postJson('/api/billings', $billingData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['total_amount']);
    }

    public function test_cannot_create_billing_with_invalid_department()
    {
        $billingData = [
            'description' => 'Test Billing',
            'total_amount' => 1000.50,
            'department_id' => 999999, // Non-existent department
            'payment_method' => 'online',
            'no_project' => 'TEST-001',
            'running_no' => 'BILL-' . uniqid(),
        ];

        $response = $this->postJson('/api/billings', $billingData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['department_id']);
    }

    public function test_billing_is_created_with_correct_initial_status()
    {
        $billingData = [
            'description' => 'Test Billing',
            'total_amount' => 1000.50,
            'department_id' => $this->department->id,
            'payment_method' => 'online',
            'no_project' => 'TEST-001',
            'running_no' => 'BILL-' . uniqid(),
        ];

        $response = $this->postJson('/api/billings', $billingData);

        $response->assertStatus(201);

        $billing = Billing::latest()->first();
        $this->assertEquals(Billing::STATUS_DRAFT, $billing->status_id);
    }

    public function test_billing_dates_are_set_correctly()
    {
        $billingData = [
            'description' => 'Test Billing',
            'total_amount' => 1000.50,
            'department_id' => $this->department->id,
            'payment_method' => 'online',
            'no_project' => 'TEST-001',
            'running_no' => 'BILL-' . uniqid(),
        ];

        $response = $this->postJson('/api/billings', $billingData);

        $response->assertStatus(201);

        $billing = Billing::latest()->first();
        
        // Check issued_at is set to today
        $this->assertEquals(now()->format('Y-m-d'), $billing->issued_at->format('Y-m-d'));
        
        // Check payment_due is set to 30 days from now
        $this->assertEquals(
            now()->addDays(30)->format('Y-m-d'),
            $billing->payment_due->format('Y-m-d')
        );
    }
}
