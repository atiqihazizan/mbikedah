<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class BillingRecipient extends Model
{
    use HasFactory;
    protected $fillable = [
        'name', 
        'address', 
        'phone', 
        'email',
        'company_name',
        'company_registration_no',
    ];
}
