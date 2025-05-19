<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillingDetail extends Model
{
  protected $fillable = [
    'billing_id',
    'description',
    'purpose',
    'budget_code',
    'budget_id',
    'price',
    'quantity',
    'reference',
    'unit',
    'total',
    'accept',
    'approve',
    'reviewed_by'
  ];

  protected $casts = [
    'price' => 'decimal:2',
    'quantity' => 'integer',
    'budget_id' => 'integer',
    'accept' => 'boolean',
    'approve' => 'boolean',
    'reviewed_by' => 'integer',
    'total' => 'decimal:2'
  ];

  /**
   * Get the billing that owns the detail.
   */
  public function billing(): BelongsTo
  {
    return $this->belongsTo(Billing::class);
  }

  /**
   * Get the budget associated with the detail.
   */
  public function budget(): BelongsTo
  {
    return $this->belongsTo(Budget::class);
  }
  

  public function reviewer(): BelongsTo
  {
      return $this->belongsTo(User::class, 'reviewed_by');
  }

  public function scopeAccepted($query)
  {
      return $query->where('accept', true);
  }

  public function scopeApproved($query)
  {
      return $query->where('approve', true);
  }

  public function scopeReviewed($query)
  {
      return $query->whereNotNull('reviewed_by');
  }
}
