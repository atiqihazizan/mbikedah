<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $hidden = ['created_at','updated_at'];
    protected $fillable = ['depart_id','position_id','staffunit_id','lvyr','service_at','service_cnt','lvsts','staffno','fullname','email','staff_unit','avatar'];
    protected $casts = [
        'lvyr'=>'integer',
        'entitlement'=>'object',
        'hajiumrah'=>'integer',
    ];
    public function depart(){return $this->belongsTo(Depart::class);}
    public function position(){return $this->belongsTo(Position::class);}
    public function posGroup(){return $this->hasOneThrough(PositionGroup::class, Position::class, 'id', 'id', 'position_id', 'idgrp')->with('leaveEntitle');}
    public function staffleave(){return $this->hasMany(StaffLeave::class);}
    public function leaveSummary(){return $this->hasMany(StaffLeave::class);}
    public function leaveByYear(){return $this->hasMany(StaffLeave::class)->with('leaveType')->where('yr',$this->lvyr);}
//    public function setEntitlementAttribute($value){$this->attributes['entitlement'] = $value;}
    public function setServiceAtAttribute($value){
        $this->attributes['service_at'] = $value;
//        $this->attributes['service_cnt'] = YEAR_NOW - date('Y',strtotime($value));
        $diff = time() - strtotime($value);
        $year = floor($diff / (365*60*60*24));
        $this->attributes['service_cnt'] = $year;
    }
}
