<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveEntitlement extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $casts = [
        'yr_up' => 'integer',
        'entitle' => 'integer',
        'maxbfwd' => 'integer',
        'maxbal' => 'integer',
    ];
    public function leave(){
        return $this->belongsTo(Leave::class,'idleave');
    }
}
