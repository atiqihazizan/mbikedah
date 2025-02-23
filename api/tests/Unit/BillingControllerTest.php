<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Http\Controllers\BillingController;
use App\Models\Billing;
use App\Models\BillingDetail;
use App\Models\BillingHistory;
use App\Models\BillingRecipient;
use App\Models\Budget;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Mockery;
use App\Http\Requests\UpdateBillingStatusRequest;

class BillingControllerTest extends TestCase
{
  use RefreshDatabase;

  /**
   * Test createBilling function.
   */
  public function testCreateBilling()
  {
    try {
      // Mock request
      $request = Mockery::mock(Request::class);
      $validatedData = [
        'description' => 'Test Billing',
        'no_project' => 'PRJ001',
        'recipient_id' => 1,
        'total_amount' => 100.00,
        'payment_method' => 'online',
        'department_id' => 1,
        'running_no' => 'BILL-001',
        'status_id' => 1,
        'issued_at' => now()->format('Y-m-d'),
        'payment_due' => now()->addDays(30)->format('Y-m-d'),
        'detail' => [
          [
            'description' => 'Item 1',
            'budget_code' => 'BC001',
            'budget_id' => 1,
            'price' => 50.00,
            'quantity' => 1,
            'reference' => 'REF001'
          ],
          [
            'description' => 'Item 2',
            'budget_code' => 'BC002',
            'budget_id' => 1,
            'price' => 50.00,
            'quantity' => 1,
            'reference' => 'REF002'
          ]
        ]
      ];

      // Create test data
      $department = \App\Models\Department::create([
        'name' => 'Test Department',
        'code' => 'DEP001'
      ]);
      \Log::info('Department created:', ['department' => $department->toArray()]);

      $budget = \App\Models\Budget::create([
        'code' => 'BC001',
        'name' => 'Test Budget',
        'yearly' => now()->year,
        'type' => 0,
        'code' => 'BUD001',
        'bdg1' => 1000.00,
        'bdg2' => 1000.00,
        'bdg3' => 1000.00,
        'bdg4' => 1000.00,
        'bdg5' => 1000.00,
        'bdg6' => 1000.00,
        'bdg7' => 1000.00,
        'bdg8' => 1000.00,
        'bdg9' => 1000.00,
        'bdg10' => 1000.00,
        'bdg11' => 1000.00,
        'bdg12' => 1000.00
      ]);
      \Log::info('Budget created:', ['budget' => $budget->toArray()]);

      $recipient = \App\Models\BillingRecipient::create([
        'name' => 'Test Recipient',
        'short' => 'TR',
        'attn' => 'Mr. Test',
        'hp' => '0123456789',
        'tel' => '03-12345678',
        'addr' => 'Test Address'
      ]);
      \Log::info('Recipient created:', ['recipient' => $recipient->toArray()]);

      // Create test user
      $user = \App\Models\User::create([
        'name' => 'Test User',
        'username' => 'testuser',
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
        'department_id' => $department->id,
        'role_id' => 1
      ]);
      \Log::info('User created:', ['user' => $user->toArray()]);

      // Update validatedData with created test data
      $validatedData['department_id'] = $department->id;
      $validatedData['recipient_id'] = $recipient->id;
      $validatedData['detail'][0]['budget_id'] = $budget->id;
      $validatedData['detail'][1]['budget_id'] = $budget->id;

      $request->shouldReceive('validate')->andReturn($validatedData);
      $request->shouldReceive('user')->andReturn($user);

      // Create controller instance and call createBilling
      $controller = new \App\Http\Controllers\BillingController();
      $response = $controller->createBilling($request);
      $responseData = json_decode($response->getContent(), true);

      // Assert response
      $this->assertEquals(201, $response->getStatusCode());
      $this->assertArrayHasKey('billing', $responseData);
      $this->assertArrayHasKey('message', $responseData);

      \Log::info('Test createBilling completed');
    } catch (\Exception $e) {
      \Log::error('Test createBilling failed:', ['error' => $e->getMessage()]);
      throw $e;
    }
  }

  private function createUpdateStatusRequest($data = [], $user = null)
  {
    $request = UpdateBillingStatusRequest::create(
      '/api/billings/1/status',
      'PATCH',
      $data
    );

    if ($user) {
      $request->setUserResolver(function () use ($user) {
        return $user;
      });
    }

    return $request;
  }

  private function createTestDepartment()
  {
    return Department::create([
      'name' => 'Test Department',
      'code' => 'TEST'
    ]);
  }

  public function testUpdateStatus()
  {
    $department = $this->createTestDepartment();
    $user = User::factory()->create(['department_id' => $department->id]);
    $billing = Billing::factory()->create(['status_id' => 1]);

    $request = $this->createUpdateStatusRequest([
      'status_id' => 2
    ], $user);

    $controller = new BillingController();
    $response = $controller->updateStatus($billing->id, $request);
    $responseData = json_decode($response->getContent(), true);

    $this->assertEquals(200, $response->getStatusCode());
    $this->assertArrayHasKey('success', $responseData);
    $this->assertTrue($responseData['success']);
  }

  public function testUpdateStatusSuccess()
  {
    $department = $this->createTestDepartment();
    $user = User::factory()->create(['department_id' => $department->id]);
    $billing = Billing::factory()->create(['status_id' => 1]);

    $request = $this->createUpdateStatusRequest([
      'status_id' => 2,
      'remarks' => 'Test remarks'
    ], $user);

    $controller = new BillingController();
    $response = $controller->updateStatus($billing->id, $request);
    $responseData = json_decode($response->getContent(), true);

    $this->assertEquals(200, $response->getStatusCode());
    $this->assertArrayHasKey('success', $responseData);
    $this->assertTrue($responseData['success']);
    $this->assertEquals(2, $responseData['billing']['status']['id']);
  }

  public function testUpdateStatusInvalidTransition()
  {
    $department = $this->createTestDepartment();
    $user = User::factory()->create(['department_id' => $department->id]);
    $billing = Billing::factory()->create(['status_id' => 1]);

    $request = $this->createUpdateStatusRequest([
      'status_id' => 5
    ], $user);

    $controller = new BillingController();
    $response = $controller->updateStatus($billing->id, $request);
    $responseData = json_decode($response->getContent(), true);

    $this->assertEquals(400, $response->getStatusCode());
    $this->assertArrayHasKey('success', $responseData);
    $this->assertFalse($responseData['success']);
  }

  public function testUpdateStatusBillingNotFound()
  {
    $department = $this->createTestDepartment();
    $user = User::factory()->create(['department_id' => $department->id]);

    $request = $this->createUpdateStatusRequest([
      'status_id' => 2
    ], $user);

    $controller = new BillingController();
    $response = $controller->updateStatus(999, $request);
    $responseData = json_decode($response->getContent(), true);

    $this->assertEquals(404, $response->getStatusCode());
    $this->assertArrayHasKey('success', $responseData);
    $this->assertFalse($responseData['success']);
  }

  /**
   * Test createBilling function with user token.
   */
  public function testCreateBillingWithUserToken()
  {
    try {
      // Create a department first
      $department = $this->createTestDepartment();

      // Create a user
      $user = User::create([
        'name' => 'Test User',
        'username' => 'testuser',
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
        'department_id' => $department->id,
        'role_id' => 1
      ]);

      // Create a recipient
      $recipient = BillingRecipient::create([
        'name' => 'Test Recipient',
        'short' => 'TR',
        'attn' => 'Mr. Test',
        'hp' => '0123456789',
        'tel' => '03-12345678',
        'addr' => 'Test Address'
      ]);

      // Create a budget
      $budget = Budget::create([
        'code' => 'BC001',
        'name' => 'Test Budget',
        'yearly' => 2025,
        'type' => 1
      ]);

      // Create request data
      $requestData = [
        'description' => 'Test Billing',
        'no_project' => 'PRJ001',
        'recipient_id' => $recipient->id,
        'total_amount' => 100.00,
        'payment_method' => 'online',
        'department_id' => $department->id,
        'status_id' => 1,
        'issued_at' => now()->format('Y-m-d'),
        'payment_due' => now()->addDays(30)->format('Y-m-d'),
        'detail' => [
          [
            'description' => 'Item 1',
            'budget_code' => $budget->code,
            'budget_id' => $budget->id,
            'price' => 50.00,
            'quantity' => 1,
            'reference' => 'REF001'
          ],
          [
            'description' => 'Item 2',
            'budget_code' => $budget->code,
            'budget_id' => $budget->id,
            'price' => 50.00,
            'quantity' => 1,
            'reference' => 'REF002'
          ]
        ]
      ];

      $request = new Request($requestData);

      // Set authenticated user
      $user = User::find($user->id);
      $request->setUserResolver(function () use ($user) {
        return $user;
      });

      $controller = new BillingController();
      $response = $controller->createBilling($request);
      $responseData = json_decode($response->getContent(), true);

      // Assert response
      $this->assertEquals(201, $response->getStatusCode());
      $this->assertArrayHasKey('billing', $responseData);
      $this->assertEquals($user->id, $responseData['billing']['created_by']);
      $this->assertArrayHasKey('message', $responseData);

      \Log::info('Test createBillingWithUserToken completed');
    } catch (\Exception $e) {
      \Log::error('Test createBillingWithUserToken failed:', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }
}
