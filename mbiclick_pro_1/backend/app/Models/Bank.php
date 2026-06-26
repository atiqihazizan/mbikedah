<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bank extends Model
{
    protected $fillable = ['bank_name', 'bank_account', 'account_type', 'swift_code', 'branch_name', 'budget_id'];

    public function transactions() {
        return $this->hasMany(Transaction::class);
    }
}
