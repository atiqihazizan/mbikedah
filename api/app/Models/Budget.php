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

    // Update Methods
    public function updateBudgetTotal()
    {
        $this->bdgtotal = $this->calculateBudgetTotal();
        $this->balance = $this->calculateBalance();
        $this->save();
        return $this;
    }

    public function updateActualTotal()
    {
        $this->acttotal = $this->calculateActualTotal();
        $this->balance = $this->calculateBalance();
        $this->save();
        return $this;
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
     * Get all ancestors (parents, grandparents, etc.)
     */
    public function ancestors()
    {
        $ancestors = collect();
        $parent = $this->parent;
        
        while ($parent) {
            $ancestors->push($parent);
            $parent = $parent->parent;
        }
        
        return $ancestors;
    }
    
    /**
     * Get all descendants (children, grandchildren, etc.)
     */
    public function descendants()
    {
        return $this->children()->with('descendants');
    }
    
    /**
     * Get breadcrumb path from root to this budget
     */
    public function getBreadcrumb()
    {
        return $this->ancestors()->reverse()->push($this);
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