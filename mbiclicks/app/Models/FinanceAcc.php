<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinanceAcc extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
    protected $fillable = [ 'code','name','type','pid','btyp','acclvl','b1','b2','b3','b4','b5','b6','b7','b8','b9','b10','b11','b12','total'];
    protected $appends = ['atype','txn','enb'];

    public function getAtypeAttribute ( )
    {
        return $this->type == 1 ? '<span class="badge badge-info">Debit</span>' : '<span class="badge badge-danger">Credit</span>';
    }
    public function getTxnAttribute(){
        return '<span class="fa fa-check-circle text-' . ($this->btyp == 1 ? 'primary':'dark' ).'"></span>';
    }
    public function getEnbAttribute(){
        return '<span class="fa fa-star text-' . ($this->shw == 1 ? 'warning':'dark') .'"></span>';
    }

    public function parent(){
        return $this->belongsTo(static::class,'pid');
    }
    public function children(){
        return $this->hasMany(static::class,'pid')->orderBy('name','asc');
    }
}
