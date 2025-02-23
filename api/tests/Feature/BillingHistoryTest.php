<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Billing;
use App\Models\Department;
use App\Models\BillingHistory;
use App\Constants\BillingStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

class BillingHistoryTest extends TestCase
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

        // Create and authenticate user
        $this->user = User::factory()->create([
            'department_id' => $this->department->id,
            'role_id' => 1 // Admin role
        ]);

        Auth::login($this->user);
    }

    public function test_create_history_when_status_updated()
    {
        $billing = Billing::factory()->create();
        $billing->updateStatus(BillingStatus::FINANCE_REVIEW);

        $history = BillingHistory::latest()->first();

        $this->assertEquals($billing->id, $history->billing_id);
        $this->assertEquals(BillingStatus::DRAFT, $history->old_status);
        $this->assertEquals(BillingStatus::FINANCE_REVIEW, $history->new_status);
    }

    public function test_multiple_status_updates_create_multiple_histories()
    {
        $billing = Billing::factory()->create();
        $billing->updateStatus(BillingStatus::FINANCE_REVIEW);
        $billing->updateStatus(BillingStatus::FINANCE_VERIFY);
        $billing->updateStatus(BillingStatus::FINANCE_APPROVAL);

        $histories = BillingHistory::where('billing_id', $billing->id)
            ->orderBy('created_at')
            ->get();

        $this->assertCount(3, $histories);

        // First transition: Draft -> Finance Review
        $this->assertEquals(BillingStatus::DRAFT, $histories[0]->old_status);
        $this->assertEquals(BillingStatus::FINANCE_REVIEW, $histories[0]->new_status);

        // Second transition: Finance Review -> Finance Verify
        $this->assertEquals(BillingStatus::FINANCE_REVIEW, $histories[1]->old_status);
        $this->assertEquals(BillingStatus::FINANCE_VERIFY, $histories[1]->new_status);

        // Third transition: Finance Verify -> Finance Approval
        $this->assertEquals(BillingStatus::FINANCE_VERIFY, $histories[2]->old_status);
        $this->assertEquals(BillingStatus::FINANCE_APPROVAL, $histories[2]->new_status);
    }

    public function test_billing_history_with_remarks()
    {
        // Create a billing
        $billing = Billing::factory()->create([
            'status_id' => BillingStatus::DRAFT,
            'created_by' => $this->user->id,
            'department_id' => $this->department->id
        ]);

        // Update status with remarks
        $remarks = 'Need additional verification';
        $billing->updateStatus(BillingStatus::RETURNED, Auth::id(), $remarks);

        // Assert history was created with remarks
        $history = BillingHistory::where('billing_id', $billing->id)->first();
        $this->assertEquals($remarks, $history->remarks);
    }

    public function test_billing_history_relationships()
    {
        // Create a billing
        $billing = Billing::factory()->create([
            'status_id' => BillingStatus::DRAFT,
            'created_by' => $this->user->id,
            'department_id' => $this->department->id
        ]);

        // Update status
        $billing->updateStatus(BillingStatus::FINANCE_REVIEW);

        // Get history
        $history = BillingHistory::where('billing_id', $billing->id)->first();

        // Assert relationships
        $this->assertEquals($billing->id, $history->billing->id);
        $this->assertEquals($this->user->id, $history->creator->id);
    }

    public function test_billing_history_status_names()
    {
        // Create a billing
        $billing = Billing::factory()->create([
            'status_id' => BillingStatus::DRAFT,
            'created_by' => $this->user->id,
            'department_id' => $this->department->id
        ]);

        // Update status
        $billing->updateStatus(BillingStatus::FINANCE_REVIEW);

        // Get history
        $history = BillingHistory::where('billing_id', $billing->id)->first();

        // Assert status names
        $this->assertEquals('Draft', $history->getOldStatusName());
        $this->assertEquals('Finance Review', $history->getNewStatusName());
    }
}
