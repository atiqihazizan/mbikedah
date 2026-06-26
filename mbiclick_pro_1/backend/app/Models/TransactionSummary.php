<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionSummary extends Model
{
    protected $fillable = ['month', 'year', 'total_income', 'total_expense', 'net_amount'];
}
