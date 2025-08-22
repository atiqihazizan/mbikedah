# User Status Toggle Backend Implementation

## Overview
Backend implementation untuk user status toggle functionality telah selesai. Endpoint ini membolehkan admin untuk activate/deactivate users dengan mudah.

## Implementation Details

### 1. **UserController Method**
**File:** `api/app/Http/Controllers/UserController.php`

```php
/**
 * Toggle user active status
 */
public function toggleStatus(Request $request, $id)
{
    try {
        $user = User::findOrFail($id);
        
        // Check if user is trying to deactivate themselves
        if ($user->id === Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own account'
            ], 400);
        }

        // Toggle the status
        $newStatus = !$user->is_active;
        $user->is_active = $newStatus;
        $user->save();

        $action = $newStatus ? 'activated' : 'deactivated';
        
        return response()->json([
            'success' => true,
            'message' => "User '{$user->name}' has been {$action} successfully",
            'data' => [
                'id' => $user->id,
                'is_active' => $user->is_active,
                'name' => $user->name
            ]
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    } catch (\Exception $e) {
        Log::error('Error toggling user status: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to update user status'
        ], 500);
    }
}
```

### 2. **API Route**
**File:** `api/routes/api.php`

```php
// Route untuk toggle status active/inactive pengguna
Route::put('/{id}/toggle-status', [UserController::class, 'toggleStatus']);
```

**Full Route Path:** `PUT /api/users/{id}/toggle-status`

### 3. **Security Features**

#### Self-Deactivation Prevention
```php
// Check if user is trying to deactivate themselves
if ($user->id === Auth::id()) {
    return response()->json([
        'success' => false,
        'message' => 'You cannot deactivate your own account'
    ], 400);
}
```

#### Authentication Required
- Route dilindungi dengan `auth:sanctum` middleware
- Hanya authenticated users yang boleh access

### 4. **Error Handling**

#### User Not Found (404)
```php
catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
    return response()->json([
        'success' => false,
        'message' => 'User not found'
    ], 404);
}
```

#### General Errors (500)
```php
catch (\Exception $e) {
    Log::error('Error toggling user status: ' . $e->getMessage());
    
    return response()->json([
        'success' => false,
        'message' => 'Failed to update user status'
    ], 500);
}
```

### 5. **Response Format**

#### Success Response
```json
{
    "success": true,
    "message": "User 'John Doe' has been activated successfully",
    "data": {
        "id": 1,
        "is_active": true,
        "name": "John Doe"
    }
}
```

#### Error Response (400 - Self Deactivation)
```json
{
    "success": false,
    "message": "You cannot deactivate your own account"
}
```

#### Error Response (404 - User Not Found)
```json
{
    "success": false,
    "message": "User not found"
}
```

#### Error Response (500 - Server Error)
```json
{
    "success": false,
    "message": "Failed to update user status"
}
```

## API Usage

### Frontend Call
```javascript
const response = await apiClient.put(`/users/${user.id}/toggle-status`, { 
    is_active: newStatus 
});
```

### cURL Example
```bash
curl -X PUT \
  http://localhost:8000/api/users/1/toggle-status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

## Database Changes

### Required Fields
- `users.is_active` - Boolean field untuk user status
- Field ini sudah wujud dalam migration `0001_01_01_000000_create_users_table.php`

### Model Updates
- User model sudah ada `is_active` dalam `$fillable` array
- Field ini akan diupdate secara automatik

## Testing

### Test Cases

#### 1. **Successful Activation**
- **Input:** User ID yang inactive
- **Expected:** User menjadi active, success response

#### 2. **Successful Deactivation**
- **Input:** User ID yang active
- **Expected:** User menjadi inactive, success response

#### 3. **Self-Deactivation Prevention**
- **Input:** Current user ID
- **Expected:** Error 400, "You cannot deactivate your own account"

#### 4. **User Not Found**
- **Input:** Invalid user ID
- **Expected:** Error 404, "User not found"

#### 5. **Unauthorized Access**
- **Input:** Request tanpa authentication
- **Expected:** Error 401, "Unauthenticated"

## Frontend Integration

### Status Update
Frontend akan update local state immediately untuk better UX:

```javascript
if (response.success) {
    // Update local state immediately for better UX
    setUsers(prevUsers => 
        prevUsers.map(u => 
            u.id === user.id ? { ...u, is_active: newStatus } : u
        )
    );
}
```

### Error Handling
Frontend handle semua error responses:
- 400: Show error message
- 404: Show "User not found" message
- 500: Show generic error message

## Benefits

### 1. **Security**
- Self-deactivation prevention
- Authentication required
- Proper error handling

### 2. **User Experience**
- Immediate status toggle
- Clear success/error messages
- Frontend state sync

### 3. **Maintainability**
- Clean, focused method
- Proper logging
- Consistent response format

### 4. **Scalability**
- Easy to extend with additional logic
- Proper exception handling
- Logging for debugging

## Status: ✅ IMPLEMENTATION COMPLETE

**Backend implementation untuk user status toggle telah selesai dan sedia untuk digunakan.**

### Files Updated:
- ✅ `api/app/Http/Controllers/UserController.php` - Added toggleStatus method
- ✅ `api/routes/api.php` - Added toggle-status route

### Next Steps:
1. Test endpoint dengan Postman/cURL
2. Verify frontend integration works
3. Test error scenarios
4. Monitor logs untuk any issues

### API Endpoint Ready:
```http
PUT /api/users/{id}/toggle-status
```

**Frontend sekarang boleh menggunakan endpoint ini untuk toggle user status!**
