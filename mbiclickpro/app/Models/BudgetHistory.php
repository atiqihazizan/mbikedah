<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudgetHistory extends Model
{
    use HasFactory;
    
    protected $fillable = ['parent_id', 'code', 'name', 'yearly', 'bdg1', 'bdg2', 'bdg3', 'bdg4', 'bdg5', 'bdg6', 'bdg7', 'bdg8', 'bdg9', 'bdg10', 'bdg11', 'bdg12', 'act1', 'act2', 'act3', 'act4', 'act5', 'act6', 'act7', 'act8', 'act9', 'act10', 'act11', 'act12'];
    
    public function budget()
    {
        return $this->belongsTo(Budget::class, 'parent_id');
    }
    
    public function changer()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
