<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillingHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'billing_id',
        'old_status',
        'new_status',
        'created_by',
        'remarks'
    ];

    protected $casts = [
        'old_status' => 'integer',
        'new_status' => 'integer'
    ];

    /**
     * Get the billing that owns the history.
     */
    public function billing(): BelongsTo
    {
        return $this->belongsTo(Billing::class);
    }

    /**
     * Get the user who created the history.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get old status name
     */
    public function getOldStatusName(): string
    {
        return $this->billing->getStatusName($this->old_status);
    }

    /**
     * Get new status name
     */
    public function getNewStatusName(): string
    {
        return $this->billing->getStatusName($this->new_status);
    }
}
