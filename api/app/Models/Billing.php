<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Billing extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'created_by',
        'status_id',
        'recipient_id',
        'issued_at',
        'approved_hod',
        'review_by',
        'verified_by',
        'approved_by',
        'paid_by',
        'total_amount',
        'payment_due',
        'running_no',
        'no_project',
        'description',
        'payment_method',
        'is_archived',
        'updated_by'
    ];
    
    protected $casts = [
        'issued_at' => 'date',
        'payment_due' => 'date',
        'total_amount' => 'decimal:2',
        'is_archived' => 'boolean'
    ];
    
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function recipient()
    {
        return $this->belongsTo(BillingRecipient::class);
    }
    
    public function details()
    {
        return $this->hasMany(BillingDetail::class);
    }
    
    public function histories()
    {
        return $this->hasMany(BillingHistory::class);
    }
    
    public function attachments()
    {
        return $this->hasMany(BillingAttachment::class);
    }
    
    public function recipients()
    {
        return $this->hasMany(BillingRecipient::class);
    }
    
    public function approvedHod()
    {
        return $this->belongsTo(User::class, 'approved_hod');
    }
    
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'review_by');
    }
    
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
    
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
    
    public function payer()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    /**
     * Check if the billing can transition to the given status.
     *
     * @param int $newStatus
     * @return bool
     */
    public function canTransitionTo($newStatus)
    {
        // // Define allowed status transitions
        // $allowedTransitions = [
        //     1 => [2], // Draft -> Pending
        //     2 => [3, 4], // Pending -> Approved or Rejected
        //     3 => [5], // Approved -> Paid
        //     4 => [], // Rejected -> No further transitions
        //     5 => [] // Paid -> No further transitions
        // ];

        $allowedTransitions = config('constants.BILLING_STEPS');

        // Check if current status exists in allowed transitions
        if (!isset($allowedTransitions[$this->status_id])) {
            return false;
        }

        // Check if new status is in allowed transitions for current status
        return in_array($newStatus, $allowedTransitions[$this->status_id]);
    }

    /**
     * Update the billing status.
     *
     * @param int $newStatus
     * @param int $userId
     * @param string|null $remarks
     * @return bool
     */
    public function updateStatus($newStatus, $userId, $remarks = null)
    {
        if (!$this->canTransitionTo($newStatus)) {
            throw new \Exception('Invalid status transition');
        }

        $this->status_id = $newStatus;
        $this->updated_by = $userId;
        
        // Update specific fields based on status
        switch ($newStatus) {
            case 2: // Pending
                $this->review_by = $userId;
                break;
            case 3: // Approved
                $this->approved_by = $userId;
                break;
            case 4: // Rejected
                // No specific field to update
                break;
            case 5: // Paid
                $this->paid_by = $userId;
                break;
        }

        return $this->save();
    }

    public function toggleArchive($id)
    {
        $billing = self::findOrFail($id);
        $billing->is_archived = !$billing->is_archived; // Toggle the archive status
        $billing->save();
    }
}
