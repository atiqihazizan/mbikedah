<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Allowance extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
    protected $hidden = ['created_at','updated_at'];

    public function posal(){return $this->hasMany(PosAllowance::class,'aid');}

}
