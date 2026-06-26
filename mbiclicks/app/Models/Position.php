<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;
    protected $guarded=['id'];
    protected $hidden = ['updated_at','created_at'];

    public function leave(){
        return $this->hasMany(PosLeave::class,'lvcate','lvcate');
    }

//    public function setGrpcateAttribute($value){
//        $this->attributes['grpcate'] = $value;
//        $this->attributes['lvsrvc1'] = MAN_SERVICE[$value][0];
//        $this->attributes['lvsrvc2'] = MAN_SERVICE[$value][1];
//        $this->attributes['lvsrvc3'] = MAN_SERVICE[$value][2];
//    }

}
