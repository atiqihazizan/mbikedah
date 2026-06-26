<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stepper extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
    protected $hidden = ['created_at','updated_at'];
    protected $casts = [
        'act'=>'array',
    ];
    protected $attributes = [
        'act'=>'[]'
    ];

    public function log(){return $this->hasMany(PetitionLog::class,'step');}
    public function logLatest(){return $this->hasOne(PetitionLog::class,'step')->orderByDesc('id');}

}
