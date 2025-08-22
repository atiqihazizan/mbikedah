# Endpoint: Budgets by Department

## Overview
Endpoint untuk mendapatkan senarai budget berdasarkan ID jabatan tertentu. Endpoint ini hanya mengembalikan budget yang boleh digunakan untuk billing (type = 1 atau 2) dan tidak mempunyai children (leaf nodes).

## Endpoint
```
GET /api/budgets/bydepartment/{departmentId}
```

## Parameters
- `departmentId` (integer, required): ID jabatan yang ingin diambil budgetnya

## Filters Applied
- **Type Filter**: Hanya budget dengan type = 1 (Revenue) atau type = 2 (Expenditure)
- **Leaf Node Filter**: Hanya budget tanpa children (child_count = 0)
- **Budget Amount Filter**: Hanya budget dengan bdgtotal > 0
- **Department Filter**: Budget untuk jabatan yang ditentukan sahaja

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "IT001",
      "name": "Budget Jabatan IT",
      "bdgtotal": 120000.00
    }
  ],
  "department_id": 1,
  "count": 1
}
```

### Error Response (400 - Invalid Department ID)
```json
{
  "success": false,
  "message": "ID Jabatan tidak sah",
  "error": "Invalid department ID parameter"
}
```

### Error Response (500 - Server Error)
```json
{
  "success": false,
  "message": "Ralat mendapatkan budget jabatan",
  "error": "Database connection error"
}
```

### Empty Response (200 - No Budgets Found)
```json
{
  "success": true,
  "data": [],
  "department_id": 999,
  "message": "Tiada budget ditemui untuk jabatan ini",
  "count": 0
}
```

## Features
- **Validation**: Memvalidasi ID jabatan yang diberikan
- **Filtering**: Hanya mengembalikan budget untuk jabatan yang ditentukan
- **Type Filter**: Hanya budget dengan type = 1 (Revenue) atau 2 (Expenditure)
- **Leaf Node Filter**: Hanya budget tanpa children (child_count = 0)
- **Budget Amount Filter**: Hanya budget dengan bdgtotal > 0
- **Ordering**: Budget diurutkan mengikut type, code, level, dan sort_order
- **Optimized Fields**: Hanya mengembalikan field yang diperlukan (id, code, name, bdgtotal)
- **Error Handling**: Comprehensive error handling dengan logging
- **Response Consistency**: Format response yang konsisten dengan endpoint lain

## Usage Examples

### Frontend Usage (React)
```javascript
// Get budgets for department ID 1
const fetchBudgetsByDepartment = async (departmentId) => {
  try {
    const response = await apiClient.get(`/budgets/bydepartment/${departmentId}`);
    if (response.data.success) {
      setBudgets(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching budgets:', error);
  }
};
```

### cURL Example
```bash
curl -X GET "http://localhost:8000/api/budgets/bydepartment/1" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

## Implementation Details

### Controller Method
```php
public function getByDepartment($departmentId)
{
    try {
        // Validate department ID
        if (!is_numeric($departmentId) || $departmentId < 1) {
            return response()->json([
                'success' => false,
                'message' => 'ID Jabatan tidak sah',
                'error' => 'Invalid department ID parameter'
            ], 400);
        }

        $departmentId = (int) $departmentId;

        // Get budgets for the specified department (only select specific fields)
        // Filter: type = 1 (Revenue) or 2 (Expenditure), child_count = 0, and bdgtotal > 0
        $budgets = Budget::select(['id', 'code', 'name', 'bdgtotal'])
            ->where('department_id', $departmentId)
            ->whereIn('type', [1, 2])  // type = 1 (Revenue) or 2 (Expenditure)
            ->where('child_count', 0)  // no children (leaf nodes)
            ->where('bdgtotal', '>', 0)  // budget total must be greater than 0
            ->orderBy('type', 'asc')
            ->orderBy('code', 'asc')
            ->orderBy('level', 'asc')
            ->orderBy('sort_order', 'asc')
            ->get();

        // Check if department exists and has budgets
        if ($budgets->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'department_id' => $departmentId,
                'message' => 'Tiada budget ditemui untuk jabatan ini',
                'count' => 0
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $budgets,
            'department_id' => $departmentId,
            'count' => $budgets->count()
        ]);

    } catch (\Exception $e) {
        Log::error('Error getting budget by department: ' . $e->getMessage(), [
            'department_id' => $departmentId,
            'file' => __FILE__,
            'line' => __LINE__
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Ralat mendapatkan budget jabatan',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

### Route Definition
```php
Route::get('/bydepartment/{departmentId}', [BudgetController::class, 'getByDepartment']);
```

## Security
- Endpoint dilindungi dengan middleware `auth:sanctum`
- Hanya pengguna yang authenticated boleh mengakses endpoint ini
- Validation input untuk mencegah injection attacks

## Performance
- Menggunakan `select()` untuk mengurangkan data yang diambil dari database
- Hanya mengambil field yang diperlukan (id, code, name, bdgtotal)
- Query dioptimasi dengan proper indexing pada `department_id`
- Response diurutkan untuk konsistensi data
- Mengurangkan memory usage dan network transfer

## Related Endpoints
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/year/{year}` - Get budgets by year
- `GET /api/budgets/reports/summary` - Get budget summary reports
