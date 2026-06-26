<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudgetSum extends Model
{
    use HasFactory;
    protected $table = PREFIX_ACC . YEAR_NOW;
    protected $guarded = ['id'];
    protected $fillable = [ 'code','name','type','pid','btyp','acclvl','b1','b2','b3','b4','b5','b6','b7','b8','b9','b10','b11','b12','total'];

    public function parent(){
        return $this->belongsTo(static::class,'pid');
    }
    public function children(){
        return $this->hasMany(static::class,'pid')->orderBy('name','asc');
    }
}
