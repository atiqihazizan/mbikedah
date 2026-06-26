<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventCal extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $fillable = ['typ','title','start','end','uid','deptid'];

    public function staff(){
        return $this->hasOneThrough(Staff::class,User::class,'id','id','uid','staff_id');
    }

}
