<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingAccess extends Model
{
    use HasFactory;
    
    protected $fillable = ['user_id', 'type_ability_id', 'billing_id', 'permissions'];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Get the type ability that owns the billing access.
     */
    public function typeAbility()
    {
        return $this->belongsTo(TypeAbility::class);
    }
    
    public function billing()
    {
        return $this->belongsTo(Billing::class);
    }
}
