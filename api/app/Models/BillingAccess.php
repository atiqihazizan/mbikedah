<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingAccess extends Model
{
    use HasFactory;
    
    protected $fillable = ['user_id', 'type_role_id', 'billing_id', 'permissions'];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function typeRole()
    {
        return $this->belongsTo(TypeRole::class);
    }
    
    public function billing()
    {
        return $this->belongsTo(Billing::class);
    }
}
