<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionBudget extends Model
{
    protected $fillable = ['transaction_id', 'budget_id', 'amount'];

    public function transaction() {
        return $this->belongsTo(Transaction::class);
    }

    public function budget() {
        return $this->belongsTo(Budget::class);
    }
}
