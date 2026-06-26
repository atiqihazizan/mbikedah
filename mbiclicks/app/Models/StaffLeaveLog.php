<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffLeaveLog extends Model
{
    use HasFactory;
    protected $guarded = ['id'];

    public function staff(){return $this->belongsTo(Staff::class,'idstaff');}
    public function leave(){return $this->belongsTo(Leave::class,'idlv');}
    public function staffleave(){return $this->belongsTo(StaffLeave::class,'idslv');}
}
