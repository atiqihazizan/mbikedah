<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosLeave extends Model
{
    use HasFactory;
    protected $guarded = ['id'];

    public function type(){
        return $this->belongsTo(Leave::class,'leaves_id');
    }
    public function position(){
        return $this->belongsTo(Position::class);
    }
}
