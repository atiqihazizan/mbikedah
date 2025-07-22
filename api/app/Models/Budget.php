<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\TransactionBudget;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'department_id',
        'name',
        'code',
        'yearly',
        'type',
        'bdg1', 'bdg2', 'bdg3', 'bdg4', 'bdg5', 'bdg6',
        'bdg7', 'bdg8', 'bdg9', 'bdg10', 'bdg11', 'bdg12',
        'bdgtotal',
        'act1', 'act2', 'act3', 'act4', 'act5', 'act6',
        'act7', 'act8', 'act9', 'act10', 'act11', 'act12',
        'acttotal',
        'balance'
    ];

    protected $casts = [
        'yearly' => 'integer',
        'type' => 'integer',
        'parent_id' => 'integer',
        'department_id' => 'integer',
        'bdg1' => 'decimal:2', 'bdg2' => 'decimal:2', 'bdg3' => 'decimal:2',
        'bdg4' => 'decimal:2', 'bdg5' => 'decimal:2', 'bdg6' => 'decimal:2',
        'bdg7' => 'decimal:2', 'bdg8' => 'decimal:2', 'bdg9' => 'decimal:2',
        'bdg10' => 'decimal:2', 'bdg11' => 'decimal:2', 'bdg12' => 'decimal:2',
        'bdgtotal' => 'decimal:2',
        'act1' => 'decimal:2', 'act2' => 'decimal:2', 'act3' => 'decimal:2',
        'act4' => 'decimal:2', 'act5' => 'decimal:2', 'act6' => 'decimal:2',
        'act7' => 'decimal:2', 'act8' => 'decimal:2', 'act9' => 'decimal:2',
        'act10' => 'decimal:2', 'act11' => 'decimal:2', 'act12' => 'decimal:2',
        'acttotal' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    /**
     * Relationship dengan Department
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Relationship dengan parent budget (untuk hierarchical budgets)
     */
    public function parent()
    {
        return $this->belongsTo(Budget::class, 'parent_id');
    }

    /**
     * Relationship dengan child budgets
     */
    public function children()
    {
        return $this->hasMany(Budget::class, 'parent_id');
    }

    /**
     * Relationship dengan transaction budgets
     */
    public function transactions()
    {
        return $this->hasMany(TransactionBudget::class);
    }

    /**
     * Mengira jumlah budget tahunan dari monthly allocations
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
     * Mengira jumlah actual spending dari monthly actuals
     * 
     * @return float
     */
    public function getTotalActual()
    {
        $total = 0;
        for ($i = 1; $i <= 12; $i++) {
            $field = 'act' . $i;
            $total += (float) $this->$field;
        }
        return $total;
    }

    /**
     * Mengira jumlah perbelanjaan dari TransactionBudget
     * 
     * @return float
     */
    public function getTotalSpending()
    {
        if (class_exists(TransactionBudget::class)) {
            return TransactionBudget::where('budget_id', $this->id)->sum('amount');
        }
        
        // Fallback to actual total if TransactionBudget doesn't exist
        return $this->getTotalActual();
    }

    /**
     * Mengira baki budget
     * 
     * @return float
     */
    public function getBalance()
    {
        return $this->getTotalBudget() - $this->getTotalSpending();
    }

    /**
     * Update balance berdasarkan current spending
     */
    public function updateBalance()
    {
        $this->balance = $this->getBalance();
        $this->save();
    }

    /**
     * Get budget type label
     * 
     * @return string
     */
    public function getTypeLabel()
    {
        switch ($this->type) {
            case 1:
                return 'Debit';
            case 2:
                return 'Kredit';
            default:
                return 'Operasi';
        }
    }

    /**
     * Scope untuk filter by department
     */
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope untuk filter by year
     */
    public function scopeByYear($query, $year)
    {
        return $query->where('yearly', $year);
    }

    /**
     * Scope untuk filter by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Accessor untuk formatted budget total
     */
    public function getFormattedBudgetTotalAttribute()
    {
        return 'RM ' . number_format($this->bdgtotal, 2);
    }

    /**
     * Accessor untuk formatted balance
     */
    public function getFormattedBalanceAttribute()
    {
        return 'RM ' . number_format($this->balance, 2);
    }

    /**
     * Get percentage of budget utilized
     */
    public function getUtilizationPercentage()
    {
        if ($this->bdgtotal <= 0) {
            return 0;
        }
        
        $spent = $this->getTotalSpending();
        return ($spent / $this->bdgtotal) * 100;
    }

    /**
     * Check if budget is over-utilized
     */
    public function isOverBudget()
    {
        return $this->getTotalSpending() > $this->bdgtotal;
    }

    /**
     * Auto-update bdgtotal when monthly budgets change
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($budget) {
            // Auto-calculate total budget if not set
            if (!isset($budget->attributes['bdgtotal']) || $budget->isDirty(['bdg1', 'bdg2', 'bdg3', 'bdg4', 'bdg5', 'bdg6', 'bdg7', 'bdg8', 'bdg9', 'bdg10', 'bdg11', 'bdg12'])) {
                $budget->bdgtotal = $budget->getTotalBudget();
            }

            // Auto-calculate total actual if monthly actuals are set
            if ($budget->isDirty(['act1', 'act2', 'act3', 'act4', 'act5', 'act6', 'act7', 'act8', 'act9', 'act10', 'act11', 'act12'])) {
                $budget->acttotal = $budget->getTotalActual();
            }
        });
    }
}