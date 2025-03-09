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
use App\Models\BillingSequence;
use App\Constants\BillingStatus;

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
    const STATUS_DRAFT = BillingStatus::DRAFT;
    const STATUS_HOD_APPROVAL = BillingStatus::HOD_APPROVAL;
    const STATUS_FINANCE_REVIEW = BillingStatus::FINANCE_REVIEW;
    const STATUS_FINANCE_VERIFY = BillingStatus::FINANCE_VERIFY;
    const STATUS_FINANCE_APPROVAL = BillingStatus::FINANCE_APPROVAL;
    const STATUS_PROCESSING_PAYMENT = BillingStatus::PROCESSING_PAYMENT;
    const STATUS_PAID = BillingStatus::PAID;
    const STATUS_COMPLETED = BillingStatus::COMPLETED;
    const STATUS_REJECTED = BillingStatus::REJECTED;
    const STATUS_RETURNED = BillingStatus::RETURNED;
    const STATUS_CANCELLED = BillingStatus::CANCELLED;

    // Payment method constants 
    const PAYMENT_CASH = 'cash';
    const PAYMENT_CHEQUE = 'cheque';
    const PAYMENT_ONLINE = 'online';

    /**
     * Get the creator of the billing.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Alias for creator relationship
     */
    public function user()
    {
        return $this->creator();
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
        return $this->belongsTo(BillingRecipient::class, 'recipient_id');
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

    public function getStatusName()
    {
        return BillingStatus::getStatusName($this->status_id);
    }

    /**
     * Boot function untuk auto-generate running number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($billing) {
            if (empty($billing->running_no)) {
                $billing->running_no = static::generateRunningNumber();
            }
        });
    }

    /**
     * Generate running number untuk billing baru
     */
    public static function generateRunningNumber(string $prefix = 'INV'): string
    {
        return BillingSequence::getNextNumber($prefix, now()->year);
    }

    /**
     * Set semula sequence untuk tahun tertentu
     */
    public static function resetRunningNumber(string $prefix = 'INV', int $year = null): void
    {
        BillingSequence::resetSequence($prefix, $year);
    }

    /**
     * Tukar prefix untuk running number
     */
    public static function updateRunningNumberPrefix(string $oldPrefix, string $newPrefix, int $year = null): void
    {
        BillingSequence::updatePrefix($oldPrefix, $newPrefix, $year);
    }

    /**
     * Tukar padding untuk running number
     */
    public static function updateRunningNumberPadding(string $prefix = 'INV', int $padding = 3, int $year = null): void
    {
        BillingSequence::updatePadding($prefix, $padding, $year);
    }
}
