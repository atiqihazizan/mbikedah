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
    'issued_at',
    'payment_due',
    'no_project',
    'running_no',
    'is_archived',
    'recipient_id',
    'last_printed_at',
    'last_printed_by',
    'print_count',
    'hod_approved_at',
    'hod_approved_by',
    'reviewed_at',
    'reviewed_by',
    'verified_at',
    'verified_by',
    'approved_at',
    'approved_by',
    'paid_at',
    'paid_by',
    'ceo_approved',
    'payment_method'
  ];

  protected $appends = ['status_name', 'is_active'];

  protected $casts = [
    'total_amount' => 'decimal:2',
    'issued_at' => 'datetime',
    'payment_due' => 'datetime',
    'status_id' => 'integer',
    'is_archived' => 'boolean',
    'hod_approved_at' => 'datetime',
    'reviewed_at' => 'datetime',
    'verified_at' => 'datetime',
    'approved_at' => 'datetime',
    'paid_at' => 'datetime',
    'ceo_approved' => 'boolean',
    'payment_method' => 'string'
  ];

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

  public function transactions(): HasMany
  {
    return $this->hasMany(Transaction::class);
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

  /**
   * Get the user who last printed the billing.
   */
  public function lastPrintedBy()
  {
    return $this->belongsTo(User::class, 'last_printed_by');
  }
}
