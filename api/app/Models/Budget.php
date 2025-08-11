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

    public function childrenWithCount()
    {
        return $this->hasMany(Budget::class, 'parent_id')
            ->orderBy('sort_order')
            ->withCount('children');
    }

    public function updateChildCount()
    {
        $this->child_count = $this->children()->count();
        $this->save();
        return $this;
    }

    public function incrementChildCount()
    {
        $this->increment('child_count');
        return $this;
    }

    public function decrementChildCount()
    {
        $this->decrement('child_count');
        return $this;
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

    public function getFormattedBudgetTypeAttribute()
    {
        return $this->getBudgetTypeLabel();
    }

    public function getFormattedBudgetMonthsAttribute()
    {
        if (!$this->budget_months) return 'Semua Bulan';
        $months = collect($this->budget_months)->map(function($month) {
            $monthNames = [
                1 => 'Januari', 2 => 'Februari', 3 => 'Mac', 4 => 'April',
                5 => 'Mei', 6 => 'Jun', 7 => 'Julai', 8 => 'Ogos',
                9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Disember'
            ];
            return $monthNames[$month] ?? $month;
        });
        return $months->implode(', ');
    }

    public function getFormattedChildCountAttribute()
    {
        return $this->child_count . ' sub-bajet';
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

    // New field helper methods
    public function getBudgetTypeLabel()
    {
        switch ($this->budget_type) {
            case 'monthly': return 'Bulanan';
            case 'quarterly': return 'Suku Tahunan';
            case 'yearly': return 'Tahunan';
            default: return 'Bulanan';
        }
    }

    public function isApplicantBudget()
    {
        return $this->is_applicant;
    }

    public function getBudgetMonthsArray()
    {
        return $this->budget_months ?? range(1, 12);
    }

    public function hasBudgetForMonth($month)
    {
        if (!$this->budget_months) return true; // Default to all months
        return in_array($month, $this->budget_months);
    }

    public function getBudgetDistribution()
    {
        if ($this->budget_type === 'yearly') {
            return ['total' => $this->bdgtotal];
        } elseif ($this->budget_type === 'quarterly') {
            $quarterly = [];
            for ($q = 1; $q <= 4; $q++) {
                $start = ($q - 1) * 3 + 1;
                $end = $q * 3;
                $total = 0;
                for ($m = $start; $m <= $end; $m++) {
                    $field = 'bdg' . $m;
                    $total += (float) $this->$field;
                }
                $quarterly["Q{$q}"] = $total;
            }
            return $quarterly;
        } else {
            // Monthly
            $monthly = [];
            for ($i = 1; $i <= 12; $i++) {
                $field = 'bdg' . $i;
                $monthly["month_{$i}"] = (float) $this->$field;
            }
            return $monthly;
        }
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

    // Validation and business logic methods
    public function validateBudgetMonths()
    {
        if (!$this->budget_months) return true;
        
        $validMonths = range(1, 12);
        $invalidMonths = array_diff($this->budget_months, $validMonths);
        
        return empty($invalidMonths);
    }

    public function getInvalidMonths()
    {
        if (!$this->budget_months) return [];
        
        $validMonths = range(1, 12);
        return array_diff($this->budget_months, $validMonths);
    }

    public function canHaveChildren()
    {
        return $this->is_group && $this->level < 5; // Assuming max 5 levels
    }

    public function canBeMovedTo($newParent)
    {
        if (!$newParent) return true;
        
        // Cannot move to itself or its descendants
        if ($newParent->id === $this->id || $newParent->descendants()->pluck('id')->contains($this->id)) {
            return false;
        }
        
        // Check level constraints
        return $newParent->level < $this->level;
    }

    public function getBudgetStatus()
    {
        if ($this->acttotal > $this->bdgtotal) {
            return 'over_budget';
        } elseif ($this->acttotal >= ($this->bdgtotal * 0.9)) {
            return 'near_limit';
        } elseif ($this->acttotal >= ($this->bdgtotal * 0.7)) {
            return 'moderate_usage';
        } else {
            return 'low_usage';
        }
    }

    public function getBudgetStatusLabel()
    {
        $status = $this->getBudgetStatus();
        $labels = [
            'over_budget' => 'Melebihi Bajet',
            'near_limit' => 'Hampir Had',
            'moderate_usage' => 'Penggunaan Sederhana',
            'low_usage' => 'Penggunaan Rendah'
        ];
        
        return $labels[$status] ?? 'Tidak Diketahui';
    }
}