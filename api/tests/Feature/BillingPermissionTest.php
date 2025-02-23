<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Billing;
use App\Models\Department;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BillingPermissionTest extends TestCase
{
    use RefreshDatabase;

    protected $staff;
    protected $supervisor;
    protected $manager;
    protected $admin;
    protected $department;
    protected $staffToken;
    protected $supervisorToken;
    protected $managerToken;
    protected $adminToken;

    public function setUp(): void
    {
        parent::setUp();

        // Create a department
        $this->department = Department::factory()->create();

        // Create users with different roles
        $this->staff = User::factory()->create([
            'username' => 'staff',
            'password' => bcrypt('password'),
            'role_id' => 1, // Staff
            'department_id' => $this->department->id
        ]);

        $this->supervisor = User::factory()->create([
            'username' => 'supervisor',
            'password' => bcrypt('password'),
            'role_id' => 2, // Supervisor
            'department_id' => $this->department->id
        ]);

        $this->manager = User::factory()->create([
            'username' => 'manager',
            'password' => bcrypt('password'),
            'role_id' => 3, // Manager
            'department_id' => $this->department->id
        ]);

        $this->admin = User::factory()->create([
            'username' => 'admin',
            'password' => bcrypt('password'),
            'role_id' => 4, // Admin
            'department_id' => $this->department->id
        ]);

        // Get tokens for each user
        $this->staffToken = $this->getToken($this->staff);
        $this->supervisorToken = $this->getToken($this->supervisor);
        $this->managerToken = $this->getToken($this->manager);
        $this->adminToken = $this->getToken($this->admin);
    }

    private function getToken($user)
    {
        $response = $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'password'
        ]);

        return $response->json()['token'];
    }

    public function test_staff_can_view_billings()
    {
        $billing = Billing::factory()->create([
            'department_id' => $this->department->id,
            'created_by' => $this->staff->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->staffToken
        ])->getJson('/api/billings');

        $response->assertStatus(200);
    }

    public function test_staff_can_create_billing()
    {
        $billingData = [
            'description' => 'Test Billing',
            'total_amount' => 1000,
            'department_id' => $this->department->id,
            'payment_method' => 'online'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->staffToken
        ])->postJson('/api/billings', $billingData);

        $response->assertStatus(201);
    }

    public function test_staff_cannot_approve_billing()
    {
        $billing = Billing::factory()->create([
            'department_id' => $this->department->id,
            'created_by' => $this->staff->id,
            'status_id' => Billing::STATUS_VERIFIED
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->staffToken
        ])->postJson("/api/billings/{$billing->id}/approve");

        $response->assertStatus(403);
    }

    public function test_supervisor_can_approve_billing()
    {
        $billing = Billing::factory()->create([
            'department_id' => $this->department->id,
            'created_by' => $this->staff->id,
            'status_id' => Billing::STATUS_VERIFIED
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->supervisorToken
        ])->postJson("/api/billings/{$billing->id}/approve");

        $response->assertStatus(200);
    }

    public function test_manager_can_verify_billing()
    {
        $billing = Billing::factory()->create([
            'department_id' => $this->department->id,
            'created_by' => $this->staff->id,
            'status_id' => Billing::STATUS_CHECKED
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->managerToken
        ])->postJson("/api/billings/{$billing->id}/verify");

        $response->assertStatus(200);
    }

    public function test_admin_can_perform_all_actions()
    {
        $billing = Billing::factory()->create([
            'department_id' => $this->department->id,
            'created_by' => $this->staff->id,
            'status_id' => Billing::STATUS_DRAFT
        ]);

        $actions = ['check', 'verify', 'approve', 'reject', 'return'];

        foreach ($actions as $action) {
            $response = $this->withHeaders([
                'Authorization' => 'Bearer ' . $this->adminToken
            ])->postJson("/api/billings/{$billing->id}/{$action}");

            $response->assertStatus(200);
        }
    }

    public function test_unauthorized_user_cannot_access_billings()
    {
        $response = $this->getJson('/api/billings');
        $response->assertStatus(401);
    }
}
