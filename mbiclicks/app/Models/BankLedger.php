<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankLedger extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $appends = ['amtDisp'];
    protected $casts = [
        'txdate'=>'date:d M Y'
    ];

    public function getAmtDispAttribute(){
        return number_format($this->txamt,2);
    }
}
