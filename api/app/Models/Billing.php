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

    public function canTransitionTo($newStatus)
    {
        $steps = config('constants.BILLING_STEPS');
        $allowedTransitions = $steps[$this->status_id] ?? [];
        return in_array($newStatus, $allowedTransitions);
    }

    public function updateStatus($status_id, $updated_by, $remarks = null)
    {
        $currentStatus = $this->status;

        // Semak jika peralihan status dibenarkan
        if (!$this->canTransitionTo($status_id)) {
            throw new \Exception('Invalid status transition');
        }

        // Kemas kini status billing
        $this->status = $status_id;
        $this->updated_by = $updated_by;
        $this->save();

        // Tambah sejarah status
        BillingHistory::create([
            'billing_id' => $this->id,
            'status_id' => $status_id,
            'remarks' => $remarks,
            'created_by' => $updated_by
        ]);

        return $this;
    }

    public function toggleArchive($id)
    {
        $billing = self::findOrFail($id);
        $billing->is_archived = !$billing->is_archived; // Toggle the archive status
        $billing->save();
    }
}
