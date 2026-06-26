<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PanelLedger extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $casts = [
        'ldate'=>'date',
        'lamt'=>'float(10,2)',
    ];

}
