<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Billing;
use App\Models\Department;
use App\Models\BillingHistory;
use Illuminate\Foundation\Testing\RefreshDatabase;

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

        // Create user
        $this->user = User::factory()->create([
            'department_id' => $this->department->id
        ]);

        $this->actingAs($this->user);
    }

    public function test_billing_history_is_created_when_status_changes()
    {
        // Create a billing
        $billing = Billing::factory()->create([
            'status_id' => Billing::STATUS_DRAFT,
            'created_by' => $this->user->id,
            'department_id' => $this->department->id
        ]);

        // Update billing status
        $billing->updateStatus(Billing::STATUS_CHECKED);

        // Assert history was created
        $history = BillingHistory::where('billing_id', $billing->id)->first();
        $this->assertNotNull($history);
        $this->assertEquals(Billing::STATUS_DRAFT, $history->old_status);
        $this->assertEquals(Billing::STATUS_CHECKED, $history->new_status);
        $this->assertEquals($this->user->id, $history->created_by);
    }

    public function test_billing_history_tracks_multiple_status_changes()
    {
        // Create a billing
        $billing = Billing::factory()->create([
            'status_id' => Billing::STATUS_DRAFT,
            'created_by' => $this->user->id,
            'department_id' => $this->department->id
        ]);

        // Update status multiple times
        $billing->updateStatus(Billing::STATUS_CHECKED);
        $billing->updateStatus(Billing::STATUS_VERIFIED);
        $billing->updateStatus(Billing::STATUS_APPROVED);

        // Assert all history entries were created
        $histories = BillingHistory::where('billing_id', $billing->id)->get();
        $this->assertCount(3, $histories);

        // Assert the sequence of status changes
        $this->assertEquals(Billing::STATUS_DRAFT, $histories[0]->old_status);
        $this->assertEquals(Billing::STATUS_CHECKED, $histories[0]->new_status);

        $this->assertEquals(Billing::STATUS_CHECKED, $histories[1]->old_status);
        $this->assertEquals(Billing::STATUS_VERIFIED, $histories[1]->new_status);

        $this->assertEquals(Billing::STATUS_VERIFIED, $histories[2]->old_status);
        $this->assertEquals(Billing::STATUS_APPROVED, $histories[2]->new_status);
    }

    public function test_billing_history_with_remarks()
    {
        // Create a billing
        $billing = Billing::factory()->create([
            'status_id' => Billing::STATUS_DRAFT,
            'created_by' => $this->user->id,
            'department_id' => $this->department->id
        ]);

        // Update status with remarks
        $remarks = 'Need additional verification';
        $billing->updateStatus(Billing::STATUS_RETURNED, null, $remarks);

        // Assert history was created with remarks
        $history = BillingHistory::where('billing_id', $billing->id)->first();
        $this->assertNotNull($history);
        $this->assertEquals($remarks, $history->remarks);
    }

    public function test_billing_history_relationships()
    {
        // Create a billing
        $billing = Billing::factory()->create([
            'status_id' => Billing::STATUS_DRAFT,
            'created_by' => $this->user->id,
            'department_id' => $this->department->id
        ]);

        // Update status
        $billing->updateStatus(Billing::STATUS_CHECKED);

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
            'status_id' => Billing::STATUS_DRAFT,
            'created_by' => $this->user->id,
            'department_id' => $this->department->id
        ]);

        // Update status
        $billing->updateStatus(Billing::STATUS_CHECKED);

        // Get history
        $history = BillingHistory::where('billing_id', $billing->id)->first();

        // Assert status names
        $this->assertEquals('Draft', $history->getOldStatusName());
        $this->assertEquals('Checked', $history->getNewStatusName());
    }
}
