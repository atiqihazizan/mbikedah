<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = ['bank_id', 'budget_id', 'billing_id', 'amount', 'transaction_type', 'date', 'description', 'paid_date', 'paid_ref'];

    protected $casts = [
        'date' => 'date',
        'paid_date' => 'date',
    ];

    public function bank() {
        return $this->belongsTo(Bank::class);
    }

    public function budget() {
        return $this->belongsTo(Budget::class);
    }

    public function billing() {
        return $this->belongsTo(Billing::class);
    }
}
