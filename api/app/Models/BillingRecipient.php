<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Billing;

class BillingRecipient extends Model
{
    protected $fillable = [
        'name',
        'short',
        'attn',
        'hp',
        'tel',
        'fax',
        'addr'
    ];

    /**
     * Get the billings for the recipient.
     */
    public function billings(): HasMany
    {
        return $this->hasMany(Billing::class, 'recipient_id');
    }
}
