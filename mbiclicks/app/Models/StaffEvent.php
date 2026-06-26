<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffEvent extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function depart(){
        return $this->belongsTo(Depart::class);
    }
}
