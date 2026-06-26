<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    // protected $fillable = [
    //     'name',
    //     'email',
    //     'password',
    // ];

    protected $guarded = ['id'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'ustep' => 'array',
    ];
    protected $attributes = [
        'ustep'=>'[]',
    ];

    public function staff(){return $this->belongsTo(Staff::class);}
    public function position(){return $this->hasOneThrough(Position::class,Staff::class,'id','id','staff_id','position_id');}
    public function depart(){
//        return $this->hasOneThrough(Depart::class,Staff::class,'id','id','staff_id','depart_id');
//        return $this->hasOneThrough(Depart::class,Staff::class,'depart_id','id','depart_id','depart_id');
        return $this->belongsTo(Depart::class);
    }

    public function setUstepAttribute($value){
//        $this->attributes['ustep'] = json_encode($value); // include double quote
        $this->attributes['ustep'] = '['.implode(',',$value).']'; // buang double quote
//        implode(',',array_map(fn($item)=> $item,$value));
//        array_map('intval',  $value);
    }

    public function AllowVerify(){
        $arr = $this->ustep;
        $isApproval = false;
        for($i=0;$i<count($arr);$i++){
            if(!in_array($arr[$i],[PREPARED,RETURN_CAR]))$isApproval = true;
        }
        return $isApproval;
    }

    public function getUserstepAttribute(){
        $ar = $this->ustep;
        $arr = Stepper::whereIn('id',$ar)->get()->pluck('code')->join(', ');
        return $arr;
    }

    public function getAbilityAttribute(){
        return ($this->attributes['uability']>0) ? '<span class="badge badge-success">Allow</span>' : '';
    }

    public function getTypeAttribute(){
        $typ = $this->attributes['utype'];
        if($typ == 0) return '<span class="badge badge-light">Normal</span>';
        if($typ == 1) return '<span class="badge badge-primary">Finance</span>';
        if($typ == 2) return '<span class="badge badge-info">Human Resource</span>';
    }

}
