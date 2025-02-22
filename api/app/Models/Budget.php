<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'department_id', 
        'name',
        'code',
        'yearly',
        'type',
        'bdg1',
        'bdg2',
        'bdg3',
        'bdg4',
        'bdg5',
        'bdg6',
        'bdg7',
        'bdg8',
        'bdg9',
        'bdg10',
        'bdg11',
        'bdg12'
    ];
    
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
