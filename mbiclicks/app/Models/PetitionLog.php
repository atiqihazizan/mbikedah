<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PetitionLog extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
//    protected $hidden = ['updated_at','petition_id','ptype_id','depart_id','user_id'];
    protected $casts = [
        'created_at' => 'datetime:d M Y h:i A',
    ];

    public function staff(){
        return $this->hasOneThrough(Staff::class,Petition::class,'id','id','petition_id','staff_id');
    }
    public function stepper(){return $this->belongsTo(Stepper::class,'step','id');}
    public function stepTo(){return $this->belongsTo(Stepper::class,'pass','id');}
    public function ptype(){return $this->belongsTo(Ptype::class,'ptype_id');}
    public function petition(){return $this->belongsTo(Petition::class);}
}
