<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
    protected $hidden = ['created_at','updated_at','petition_id'];

    public function petition(){
        return $this->belongsTo(Petition::class);
    }
}
