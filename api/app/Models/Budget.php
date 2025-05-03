<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\TransactionBudget;

class Budget extends Model
{
  use HasFactory;

  protected $fillable = [
    'department_id',
    'name',
    'code',
    'yearly',
    'type',
    'bdg1',
    'bdg2',
    'bdg3',
    'bdg4',
    'bdg5',
    'bdg6',
    'bdg7',
    'bdg8',
    'bdg9',
    'bdg10',
    'bdg11',
    'bdg12',
    'bdgtotal'
  ];

  public function department()
  {
    return $this->belongsTo(Department::class);
  }

  /**
   * Mengira jumlah bajet tahunan
   * 
   * @return float
   */
  public function getTotalBudget()
  {
    $total = 0;
    for ($i = 1; $i <= 12; $i++) {
      $field = 'bdg' . $i;
      $total += (float) $this->$field;
    }
    return $total;
  }

  /**
   * Mengira jumlah perbelanjaan
   * 
   * @return float
   */
  public function getTotalSpending()
  {
    // Dapatkan jumlah dari TransactionBudget
    return TransactionBudget::where('budget_id', $this->id)->sum('amount');
  }

  /**
   * Mengira baki bajet
   * 
   * @return float
   */
  public function getBalance()
  {
    // return $this->getTotalBudget() - $this->getTotalSpending();
    return $this->bdgtotal;
  }
}
