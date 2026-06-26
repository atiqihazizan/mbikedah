<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pettycash extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $hidden = ['created_at','updated_at'];

    public function staff(){
        return $this->belongsTo(Staff::class);
    }
    public function depart(){
        return $this->belongsTo(Depart::class);
    }
}
