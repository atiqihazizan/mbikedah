<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class System extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $casts = [
        'yr_finance'=>'array',
        'start_yr'=>'integer',
        'current_yr'=>'integer',
        'hajiumrah'=>'object',
        'amtseq'=>'array',
    ];

}
