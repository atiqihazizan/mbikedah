<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $hidden = ['created_at','updated_at'];

    public function asset(){
        return $this->belongsTo(Asset::class,'refid')->select(['id','cate','model','regno']);
    }
    public function staff(){
        return $this->belongsTo(Staff::class,'staff_id')->select(['id','fullname','staffno']);
    }
    public function depart(){
        return $this->belongsTo(Depart::class,'depart_id')->select(['id','name']);
    }
}
