# Custom React Hooks

This directory contains custom React hooks for the MBIClicks application.

## useBudgetArchive Hook

A custom hook that manages all the state and business logic for the Budget Archive functionality.

### Features

- **State Management**: Manages years, budgets, selected year, archive year, and processing states
- **API Integration**: Handles loading years and budgets from the backend
- **Archive Operations**: Manages budget archiving process with validation
- **Dialog Management**: Controls budget allocation dialog state
- **Data Refresh**: Provides manual and automatic data refresh capabilities

### Usage

```jsx
import { useBudgetArchive } from '../hooks/useBudgetArchive';

function BudgetArchiveComponent() {
  const {
    // State
    years,
    currentYear,
    selectedYear,
    archiveYear,
    isProcessing,
    budgets,
    filteredBudgets,
    showAllocationDialog,
    selectedBudget,
    
    // Actions
    handleManualRefresh,
    handleAllocationBudget,
    handleAllocationDialogClose,
    handleSaveBudgetAllocation,
    handleArchive,
    handleYearChange,
    handleArchiveYearChange,
    formatYearForDisplay,
    
    // Setters
    setShowAllocationDialog,
    setSelectedBudget,
  } = useBudgetArchive();

  // Use the hook's state and functions in your component
  return (
    <div>
      <select value={selectedYear} onChange={(e) => handleYearChange(e.target.value)}>
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      
      <button onClick={handleArchive} disabled={isProcessing}>
        Archive Budget
      </button>
      
      {/* Your component JSX */}
    </div>
  );
}
```

### Return Values

#### State
- `years`: Array of available years
- `currentYear`: Current year
- `selectedYear`: Currently selected year for viewing budgets
- `archiveYear`: Year selected for archiving
- `isProcessing`: Loading state for archive operations
- `budgets`: Raw budget data
- `filteredBudgets`: Processed budget data
- `showAllocationDialog`: Boolean to control allocation dialog visibility
- `selectedBudget`: Currently selected budget for allocation

#### Actions
- `handleManualRefresh()`: Manually refresh budget data
- `handleAllocationBudget(budget)`: Open allocation dialog for a budget
- `handleAllocationDialogClose()`: Close allocation dialog
- `handleSaveBudgetAllocation()`: Handle budget allocation save
- `handleArchive()`: Execute archive operation
- `handleYearChange(year)`: Change selected year
- `handleArchiveYearChange(year)`: Change archive year with validation
- `formatYearForDisplay(year)`: Format year for display

#### Setters
- `setShowAllocationDialog(boolean)`: Control dialog visibility
- `setSelectedBudget(budget)`: Set selected budget

### Dependencies

- React (useState, useEffect, useMemo)
- react-toastify (for notifications)
- apiClient (axios instance for API calls)

### API Endpoints Used

- `GET /budgets/years` - Fetch available years
- `GET /budgets/year/{year}` - Fetch budgets for specific year
- `POST /budgets/archive` - Archive budgets for a specific year

### Error Handling

The hook includes comprehensive error handling with user-friendly toast notifications for:
- API failures
- Validation errors
- Archive operation failures
- Year selection constraints
