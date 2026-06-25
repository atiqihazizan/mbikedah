<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class BudgetCollection extends ResourceCollection
{
    protected $searchCode;

    public function __construct($resource, $searchCode = '')
    {
        parent::__construct($resource);
        $this->searchCode = $searchCode;
    }

    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'success' => true,
            'message' => 'Budgets retrieved successfully',
            'data' => $this->collection,
            'pagination' => [
                'current_page' => $this->currentPage(),
                'last_page' => $this->lastPage(),
                'per_page' => $this->perPage(),
                'total' => $this->total(),
                'from' => $this->firstItem(),
                'to' => $this->lastItem(),
                'has_more_pages' => $this->hasMorePages(),
                'has_previous_page' => $this->onFirstPage() === false,
            ],
            'search' => [
                'code' => $this->searchCode,
                'applied' => !empty($this->searchCode)
            ],
            'meta' => [
                'total_records' => $this->total(),
                'current_page_records' => $this->count(),
                'per_page' => $this->perPage(),
                'total_pages' => $this->lastPage(),
            ]
        ];
    }
}
