<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingDetail extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'billing_id',
        'budget_id',
        'budget_code',
        'reference',
        'description',
        'price',
        'quantity',
        'total'
    ];
    
    public function billing()
    {
        return $this->belongsTo(Billing::class);
    }
    
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }
}
