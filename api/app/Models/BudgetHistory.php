<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudgetHistory extends Model
{
    use HasFactory;
    
    protected $fillable = ['budget_id', 'changed_by', 'amount_before', 'amount_after', 'changed_at'];
    
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }
    
    public function changer()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
