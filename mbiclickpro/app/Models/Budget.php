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
        'level',
        'is_group',
        'group_type',
        'sort_order',
        'budget_months',
        'budget_type',
        'budget_month_count',
        'is_applicant',
        'child_count',
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
        'level' => 'integer',
        'sort_order' => 'integer',
        'is_group' => 'boolean',
        'parent_id' => 'integer',
        'department_id' => 'integer',
        'budget_months' => 'array',
        'budget_type' => 'string',
        'budget_month_count' => 'integer',
        'is_applicant' => 'boolean',
        'child_count' => 'integer',
        'bdg1' => 'decimal:4', 'bdg2' => 'decimal:4', 'bdg3' => 'decimal:4',
        'bdg4' => 'decimal:4', 'bdg5' => 'decimal:4', 'bdg6' => 'decimal:4',
        'bdg7' => 'decimal:4', 'bdg8' => 'decimal:4', 'bdg9' => 'decimal:4',
        'bdg10' => 'decimal:4', 'bdg11' => 'decimal:4', 'bdg12' => 'decimal:4',
        'bdgtotal' => 'decimal:4',
        'act1' => 'decimal:4', 'act2' => 'decimal:4', 'act3' => 'decimal:4',
        'act4' => 'decimal:4', 'act5' => 'decimal:4', 'act6' => 'decimal:4',
        'act7' => 'decimal:4', 'act8' => 'decimal:4', 'act9' => 'decimal:4',
        'act10' => 'decimal:4', 'act11' => 'decimal:4', 'act12' => 'decimal:4',
        'acttotal' => 'decimal:4',
        'balance' => 'decimal:4',
    ];

    // Relationships
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function parent()
    {
        return $this->belongsTo(Budget::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Budget::class, 'parent_id')->orderBy('sort_order');
    }

    public function childrenWithCount()
    {
        return $this->hasMany(Budget::class, 'parent_id')
            ->orderBy('sort_order')
            ->withCount('children');
    }

    public function transactions()
    {
        return $this->hasMany(TransactionBudget::class);
    }

    public function budgetHistory()
    {
        return $this->hasMany(BudgetHistory::class, 'parent_id');
    }

    // Scopes
    public function scopeGroups($query)
    {
        return $query->where('is_group', true);
    }

    public function scopeItems($query)
    {
        return $query->where('is_group', false);
    }

    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    public function scopeByYear($query, $year)
    {
        return $query->where('yearly', $year);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByBudgetType($query, $budgetType)
    {
        return $query->where('budget_type', $budgetType);
    }

    public function scopeApplicantBudgets($query)
    {
        return $query->where('is_applicant', true);
    }

    public function scopeNonApplicantBudgets($query)
    {
        return $query->where('is_applicant', false);
    }

    public function scopeByMonthCount($query, $monthCount)
    {
        return $query->where('budget_month_count', $monthCount);
    }

    public function scopeWithChildren($query)
    {
        return $query->where('child_count', '>', 0);
    }

    public function scopeWithoutChildren($query)
    {
        return $query->where('child_count', 0);
    }

    // Budget Calculations
    public function calculateBudgetTotal()
    {
        $total = 0;
        for ($i = 1; $i <= 12; $i++) {
            $field = 'bdg' . $i;
            $total += (float) $this->$field;
        }
        return $total;
    }

    public function calculateActualTotal()
    {
        $total = 0;
        for ($i = 1; $i <= 12; $i++) {
            $field = 'act' . $i;
            $total += (float) $this->$field;
        }
        return $total;
    }

    public function calculateBalance()
    {
        return $this->bdgtotal - $this->acttotal;
    }

    // Legacy methods (keep for compatibility)
    public function getTotalBudget()
    {
        return $this->calculateBudgetTotal();
    }

    public function getTotalActual()
    {
        return $this->calculateActualTotal();
    }

    public function getTotalSpending()
    {
        if (class_exists(TransactionBudget::class)) {
            return TransactionBudget::where('budget_id', $this->id)->sum('amount');
        }
        return $this->getTotalActual();
    }

    public function getBalance()
    {
        return $this->calculateBalance();
    }

    // Other methods
    public function getTypeLabel()
    {
        switch ($this->type) {
            case 1: return 'Debit';
            case 2: return 'Kredit';
            default: return 'Operasi';
        }
    }

    public function getFormattedBudgetTotalAttribute()
    {
        return 'RM ' . number_format($this->bdgtotal, 2);
    }

    public function getFormattedBalanceAttribute()
    {
        return 'RM ' . number_format($this->balance, 2);
    }

    public function getUtilizationPercentage()
    {
        if ($this->bdgtotal <= 0) return 0;
        return ($this->acttotal / $this->bdgtotal) * 100;
    }

    public function isOverBudget()
    {
        return $this->acttotal > $this->bdgtotal;
    }

    /**
     * Get breadcrumb path from root to this budget
     */
    public function getBreadcrumb()
    {
        $breadcrumb = collect();
        $current = $this;
        
        while ($current) {
            $breadcrumb->prepend($current);
            $current = $current->parent;
        }
        
        return $breadcrumb;
    }
    
    /**
     * Check if this budget can be parent of another budget
     */
    public function canBeParentOf($childLevel)
    {
        return $this->level < $childLevel;
    }
    
    /**
     * Get full hierarchical path
     */
    public function getFullPath()
    {
        return $this->getBreadcrumb()->pluck('code')->implode(' → ');
    }
}