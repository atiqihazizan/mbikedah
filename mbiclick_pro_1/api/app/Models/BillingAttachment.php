<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingAttachment extends Model
{
    use HasFactory;

    protected $fillable = ['billing_id', 'created_by', 'file_path', 'file_name', 'uploaded_at'];
    
    public function billing()
    {
        return $this->belongsTo(Billing::class);
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
