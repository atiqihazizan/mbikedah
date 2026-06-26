<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffLeave extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
    protected $fillable = ['staff_id', 'yr', 'leaves_id', 'limit', 'type','ctype','basic'];
    protected $hidden = ['created_at','updated_at','staff_id','yr'];

    public function leaveType(){return $this->belongsTo(Leave::class,'leaves_id');}
    public function lstaff(){return $this->belongsTo(Staff::class,'staff_id');}

    public function getCurbalAttribute(){
        $limit = $this->attributes['limit'];
        $taken = $this->attributes['taken'];
        $typ = $this->attributes['ctype'];
        if($limit == 0) return $taken;
        return $limit - $taken;
    }
}
