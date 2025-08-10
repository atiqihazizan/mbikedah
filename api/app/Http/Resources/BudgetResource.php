<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'department_id' => $this->department_id,
            'name' => $this->name,
            'code' => $this->code,
            'yearly' => $this->yearly,
            'type' => $this->type,
            'type_label' => $this->getTypeLabel(),
            'level' => $this->level,
            'is_group' => $this->is_group,
            'group_type' => $this->group_type,
            'sort_order' => $this->sort_order,
            
            // Budget amounts (monthly)
            'budget_monthly' => [
                'bdg1' => (float) $this->bdg1,
                'bdg2' => (float) $this->bdg2,
                'bdg3' => (float) $this->bdg3,
                'bdg4' => (float) $this->bdg4,
                'bdg5' => (float) $this->bdg5,
                'bdg6' => (float) $this->bdg6,
                'bdg7' => (float) $this->bdg7,
                'bdg8' => (float) $this->bdg8,
                'bdg9' => (float) $this->bdg9,
                'bdg10' => (float) $this->bdg10,
                'bdg11' => (float) $this->bdg11,
                'bdg12' => (float) $this->bdg12,
            ],
            'bdgtotal' => (float) $this->bdgtotal,
            'bdgtotal_formatted' => $this->getFormattedBudgetTotalAttribute(),
            
            // Actual amounts (monthly)
            'actual_monthly' => [
                'act1' => (float) $this->act1,
                'act2' => (float) $this->act2,
                'act3' => (float) $this->act3,
                'act4' => (float) $this->act4,
                'act5' => (float) $this->act5,
                'act6' => (float) $this->act6,
                'act7' => (float) $this->act7,
                'act8' => (float) $this->act8,
                'act9' => (float) $this->act9,
                'act10' => (float) $this->act10,
                'act11' => (float) $this->act11,
                'act12' => (float) $this->act12,
            ],
            'acttotal' => (float) $this->acttotal,
            
            // Balance and calculations
            'balance' => (float) $this->balance,
            'balance_formatted' => $this->getFormattedBalanceAttribute(),
            'utilization_percentage' => $this->getUtilizationPercentage(),
            'is_over_budget' => $this->isOverBudget(),
            
            // Relationships
            'department' => $this->whenLoaded('department', function () {
                return [
                    'id' => $this->department->id,
                    'name' => $this->department->name,
                    'code' => $this->department->code,
                ];
            }),
            
            'parent' => $this->whenLoaded('parent', function () {
                return [
                    'id' => $this->parent->id,
                    'name' => $this->parent->name,
                    'code' => $this->parent->code,
                ];
            }),
            
            'children' => $this->whenLoaded('children', function () {
                return $this->children->map(function ($child) {
                    return [
                        'id' => $child->id,
                        'name' => $child->name,
                        'code' => $child->code,
                        'level' => $child->level,
                    ];
                });
            }),
            
            'budget_history' => $this->whenLoaded('budgetHistory', function () {
                return $this->budgetHistory->map(function ($history) {
                    return [
                        'id' => $history->id,
                        'code' => $history->code,
                        'name' => $history->name,
                        'yearly' => $history->yearly,
                        'created_at' => $history->created_at,
                    ];
                });
            }),
            
            // Computed properties
            'can_have_children' => $this->canBeParentOf($this->level + 1),
            'children_count' => $this->whenLoaded('children', function () {
                return $this->children->count();
            }, 0),
            
            // Breadcrumb and hierarchy
            'breadcrumb' => $this->getBreadcrumb()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'code' => $item->code,
                ];
            }),
            
            'full_path' => $this->getFullPath(),
            
            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
