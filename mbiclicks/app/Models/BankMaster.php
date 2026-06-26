<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankMaster extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $fillable = ['name','accno','amt','code'];
    protected $casts = [
        'amt' => 'float',
    ];

    public function transaction(){
        return $this->hasMany(BankLedger::class,'bankid');
    }
    public function getTotalDispAttribute(){
        return number_format($this->amt,2);
    }
}
