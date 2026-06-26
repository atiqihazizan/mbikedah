<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $hidden = ['created_at','updated_at'];

    public function booking(){
        return $this->belongsTo(Booking::class,'book_id');
    }
    public function staff(){
        return $this->belongsTo(Staff::class,'staff_id')->select(['id','fullname','staffno']);
    }
    public function depart(){
        return $this->hasOneThrough(Depart::class,Staff::class,'depart_id','id','staff_id','id');
//        return $this->belongsTo(Depart::class,'departs_id')->select(['id','name']);
    }
}
