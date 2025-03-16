<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillingDetail extends Model
{
  protected $fillable = [
    'billing_id',
    'description',
    'budget_code',
    'budget_id',
    'old_budget_id',
    'old_budget_code',
    'price',
    'quantity',
    'reference'
  ];

  protected $casts = [
    'price' => 'decimal:2',
    'quantity' => 'integer',
    'budget_id' => 'integer'
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
}
