<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Traits\HasStatus;
use App\Models\BillingRecipient;
use App\Models\User;
use App\Models\Department;
use App\Models\BillingDetail;

class Billing extends Model
{
    use HasFactory, HasStatus;

    protected $fillable = [
        'description',
        'total_amount',
        'department_id',
        'created_by',
        'status_id',
        'payment_method',
        'issued_at',
        'payment_due',
        'no_project',
        'running_no',
        'is_archived',
        'recipient_id'
    ];

    protected $appends = ['status_name', 'is_active'];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'issued_at' => 'datetime',
        'payment_due' => 'datetime',
        'status_id' => 'integer',
        'is_archived' => 'boolean'
    ];

    // Status constants
    const STATUS_DRAFT = 1;
    const STATUS_RETURNED = 2;
    const STATUS_CHECKED = 3;
    const STATUS_VERIFIED = 4;
    const STATUS_APPROVED = 5;
    const STATUS_PROCESS_PAYMENT = 6;
    const STATUS_PAID = 7;
    const STATUS_REJECTED = 8;
    const STATUS_CANCELLED = 9;

    // Payment method constants 
    const PAYMENT_CASH = 'cash';
    const PAYMENT_CHEQUE = 'cheque';
    const PAYMENT_ONLINE = 'online';

    /**
     * Get the creator of the billing.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the department that owns the billing.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Get the recipient of the billing.
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(BillingRecipient::class);
    }

    /**
     * Get the billing details.
     */
    public function details(): HasMany
    {
        return $this->hasMany(BillingDetail::class);
    }

    /**
     * Get the billing history.
     */
    public function history(): HasMany
    {
        return $this->hasMany(BillingHistory::class);
    }
}
