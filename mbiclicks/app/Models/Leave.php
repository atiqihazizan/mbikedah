<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $hidden = ['created_at','updated_at'];
    protected $casts = [
        'def' =>'integer',
        'typ' =>'integer',
    ];

    public function yearupto(){
        return $this->hasMany(LeaveEntitlement::class,'idleave');
    }
}
