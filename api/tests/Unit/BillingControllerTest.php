<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Http\Controllers\BillingController;
use Illuminate\Http\Request;
use App\Models\Billing;
use App\Models\BillingDetail;
use Mockery;

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
                        'reference' => 'REF001'
                    ],
                    [
                        'description' => 'Item 2',
                        'budget_code' => 'BC002',
                        'budget_id' => 1,
                        'price' => 50.00,
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
            $this->assertEquals(200, $response->getStatusCode());
            $this->assertTrue($responseData['success']);
            $this->assertArrayHasKey('billing', $responseData);

            \Log::info('Test createBilling completed');

        } catch (\Exception $e) {
            \Log::error('Test createBilling failed:', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Test updateStatus function.
     */
    public function testUpdateStatus()
    {
        try {
            // Create test data
            $department = \App\Models\Department::create([
                'name' => 'Test Department',
                'code' => 'DEP001'
            ]);
            \Log::info('Department created:', ['department' => $department->toArray()]);

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
                'username' => 'testuser2',
                'email' => 'test2@example.com',
                'password' => bcrypt('password'),
                'department_id' => $department->id,
                'role_id' => 1
            ]);
            \Log::info('User created:', ['user' => $user->toArray()]);
            
            // Create a billing entry
            $billing = \App\Models\Billing::create([
                'description' => 'Test Billing',
                'no_project' => 'PRJ001',
                'recipient_id' => $recipient->id,
                'total_amount' => 100.00,
                'payment_method' => 'online',
                'department_id' => $department->id,
                'running_no' => 'BILL-001',
                'status_id' => 1, // Draft status
                'created_by' => $user->id,
                'issued_at' => now()->format('Y-m-d'),
                'payment_due' => now()->addDays(30)->format('Y-m-d')
            ]);
            \Log::info('Billing created:', ['billing' => $billing->toArray()]);

            // Create mock request with status update data
            $request = new \Illuminate\Http\Request();
            $request->merge([
                'billing_status_id' => 2, // Pending status
                'remarks' => 'Status updated to pending'
            ]);

            // Set user for request
            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            // Create controller instance
            $controller = new \App\Http\Controllers\BillingController();

            // Call updateStatus
            $response = $controller->updateStatus($billing->id, $request);
            $responseData = json_decode($response->getContent(), true);

            // Assert response
            $this->assertEquals(200, $response->getStatusCode());
            $this->assertTrue($responseData['success']);
            $this->assertEquals(2, $responseData['billing']['status_id']);

            \Log::info('Test updateStatus completed');

        } catch (\Exception $e) {
            \Log::error('Test updateStatus failed:', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Test updateStatus function - successful update
     */
    public function testUpdateStatusSuccess()
    {
        try {
            // Create test data
            $department = \App\Models\Department::create([
                'name' => 'Test Department',
                'code' => 'DEP001'
            ]);
            \Log::info('Department created:', ['department' => $department->toArray()]);

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
                'username' => 'testuser3',
                'email' => 'test3@example.com',
                'password' => bcrypt('password'),
                'department_id' => $department->id,
                'role_id' => 1
            ]);
            \Log::info('User created:', ['user' => $user->toArray()]);
            
            // Create a billing entry
            $billing = \App\Models\Billing::create([
                'description' => 'Test Billing',
                'no_project' => 'PRJ001',
                'recipient_id' => $recipient->id,
                'total_amount' => 100.00,
                'payment_method' => 'online',
                'department_id' => $department->id,
                'running_no' => 'BILL-001',
                'status_id' => 1, // Draft status
                'created_by' => $user->id,
                'issued_at' => now()->format('Y-m-d'),
                'payment_due' => now()->addDays(30)->format('Y-m-d')
            ]);
            \Log::info('Billing created:', ['billing' => $billing->toArray()]);

            // Create mock request with status update data
            $request = new \Illuminate\Http\Request();
            $request->merge([
                'billing_status_id' => 2, // Pending status
                'remarks' => 'Status updated to pending'
            ]);

            // Set user for request
            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            // Create controller instance
            $controller = new \App\Http\Controllers\BillingController();

            // Call updateStatus
            $response = $controller->updateStatus($billing->id, $request);
            $responseData = json_decode($response->getContent(), true);

            // Assert response
            $this->assertEquals(200, $response->getStatusCode());
            $this->assertTrue($responseData['success']);
            $this->assertEquals(2, $responseData['billing']['status_id']);

            \Log::info('Test updateStatus success completed');

        } catch (\Exception $e) {
            \Log::error('Test updateStatus failed:', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Test updateStatus function - invalid status transition
     */
    public function testUpdateStatusInvalidTransition()
    {
        try {
            // Create test data
            $department = \App\Models\Department::create([
                'name' => 'Test Department',
                'code' => 'DEP001'
            ]);

            $recipient = \App\Models\BillingRecipient::create([
                'name' => 'Test Recipient',
                'short' => 'TR',
                'attn' => 'Mr. Test',
                'hp' => '0123456789',
                'tel' => '03-12345678',
                'addr' => 'Test Address'
            ]);
            
            // Create test user
            $user = \App\Models\User::create([
                'name' => 'Test User',
                'username' => 'testuser4',
                'email' => 'test4@example.com',
                'password' => bcrypt('password'),
                'department_id' => $department->id,
                'role_id' => 1
            ]);
            \Log::info('User created:', ['user' => $user->toArray()]);
            
            // Create a billing entry with status 'approved'
            $billing = \App\Models\Billing::create([
                'description' => 'Test Billing',
                'no_project' => 'PRJ001',
                'recipient_id' => $recipient->id,
                'total_amount' => 100.00,
                'payment_method' => 'online',
                'department_id' => $department->id,
                'running_no' => 'BILL-001',
                'status_id' => 3, // Approved status
                'created_by' => $user->id,
                'issued_at' => now()->format('Y-m-d'),
                'payment_due' => now()->addDays(30)->format('Y-m-d')
            ]);

            // Create mock request with invalid status transition
            $request = new \Illuminate\Http\Request();
            $request->merge([
                'billing_status_id' => 2, // Try to change to pending (invalid transition)
                'remarks' => 'Invalid status transition'
            ]);

            // Set user for request
            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            // Create controller instance
            $controller = new \App\Http\Controllers\BillingController();

            // Call updateStatus
            $response = $controller->updateStatus($billing->id, $request);
            $responseData = json_decode($response->getContent(), true);

            // Assert response
            $this->assertEquals(400, $response->getStatusCode());
            $this->assertFalse($responseData['success']);
            $this->assertStringContainsString('Invalid status transition', $responseData['message']);

            \Log::info('Test updateStatus invalid transition completed');

        } catch (\Exception $e) {
            \Log::error('Test updateStatus invalid transition failed:', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Test updateStatus function - billing not found
     */
    public function testUpdateStatusBillingNotFound()
    {
        try {
            // Create test data
            $department = \App\Models\Department::create([
                'name' => 'Test Department',
                'code' => 'DEP001'
            ]);
            \Log::info('Department created:', ['department' => $department->toArray()]);

            // Create test user
            $user = \App\Models\User::create([
                'name' => 'Test User',
                'username' => 'testuser5',
                'email' => 'test5@example.com',
                'password' => bcrypt('password'),
                'department_id' => $department->id,
                'role_id' => 1
            ]);
            \Log::info('User created:', ['user' => $user->toArray()]);

            // Create mock request
            $request = new \Illuminate\Http\Request();
            $request->merge([
                'billing_status_id' => 2,
                'remarks' => 'Status update test'
            ]);

            // Set user for request
            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            // Create controller instance
            $controller = new \App\Http\Controllers\BillingController();

            // Call updateStatus with non-existent ID
            $response = $controller->updateStatus(99999, $request);
            $responseData = json_decode($response->getContent(), true);

            // Assert response
            $this->assertEquals(404, $response->getStatusCode());
            $this->assertFalse($responseData['success']);
            $this->assertStringContainsString('Billing not found', $responseData['message']);

            \Log::info('Test updateStatus billing not found completed');

        } catch (\Exception $e) {
            \Log::error('Test updateStatus billing not found failed:', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
