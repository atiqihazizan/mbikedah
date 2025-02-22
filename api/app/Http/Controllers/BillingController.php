<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Billing; // Tambahkan ini untuk menggunakan model Billing
use App\Models\BillingHistory; // Tambahkan ini untuk menggunakan model BillingHistory
use App\Models\BillingDetail; // Tambahkan ini untuk menggunakan model BillingDetail
use App\Models\User; // Tambahkan ini untuk menggunakan model User
use Exception; // Untuk menggunakan kelas Exception dari PHP
use Maatwebsite\Excel\Facades\Excel;
use PDF;

class BillingController extends Controller
{
	/**
	 * Display a listing of the resource.
	 */
	public function index()
	{
		//
	}

	/**
	 * Display the specified resource.
	 */
	public function show($id)
	{
		try {
			$billing = Billing::findOrFail($id);
			$details = BillingDetail::where('billing_id', $id)->get();
			return response()->json(['billing' => $billing, 'details' => $details], 200);
		} catch (Exception $error) {
			return response()->json(['message' => 'Billing not found'], 404);
		}
	}

	/**
	 * Update the specified resource in storage.
	 */
	public function update(Request $request, string $id)
	{
		//
	}

	/**
	 * Remove the specified resource from storage.
	 */
	public function destroy(string $id)
	{
		//
	}

	/**
	 * Create a new billing.
	 */
	public
	function createBilling(Request $request)
	{
		try {
			$validatedData = $request->validate([
				'description' => 'required|string',
				'no_project' => 'required|string',
				'recipient_id' => 'required|integer',
				'total' => 'required|numeric',
				'payment_method' => 'nullable|string',
				'department_id' => 'required|integer',
				'running_no' => 'nullable|string',
				'detail' => 'required|array',
				'detail.*.description' => 'required|string',
				'detail.*.budget_code' => 'required|string',
				'detail.*.budget_id' => 'required|integer',
				'detail.*.price' => 'required|numeric',
				'detail.*.quantity' => 'required|integer',
				'detail.*.unit' => 'required|string'
			]);

				// Buat billing
				$billing = Billing::create([
					'description' => $validatedData['description'],
					'no_project' => $validatedData['no_project'],
					'recipient_id' => $validatedData['recipient_id'],
					'total_amount' => $validatedData['total'],
					'payment_method' => $validatedData['payment_method'],
					'status_id' => 1, // Default status
					'department_id' => $validatedData['department_id'],
					'running_no' => $validatedData['running_no'] ?? uniqid('BILL-'),
					'created_by' => $request->user()->id,
					'issued_at' => now(),
					'payment_due' => now()->addDays(30)
				]);

				// Buat detail billing
				foreach ($validatedData['detail'] as $detail) {
					BillingDetail::create([
						'billing_id' => $billing->id,
						'description' => $detail['description'],
						'budget_code' => $detail['budget_code'],	
						'budget_id' => $detail['budget_id'],
						'price' => $detail['price'],
						'quantity' => $detail['quantity'],
						'unit' => $detail['unit'],
						'total' => bcmul($detail['price'], $detail['quantity'], 2) // Pastikan akurasi desimal
					]);
				}

				return response()->json(['message' => 'Billing created successfully', 'billing' => $billing], 201);
		} catch (\Exception $e) {
			return response()->json(['error' => 'Failed to create billing', 'message' => $e->getMessage()], 500);
		}
	}


	/**
	 * Get billings with filters and pagination
	 */
	public function getBillings(Request $request)
	{
		try {
			$query = Billing::query();
			
			// Filter by archive status
			$archived = $request->query('archived', false);
			$query->where('is_archived', $archived);
			
			// Filter by department if not admin
			if (!$request->user()->isAdmin()) {
				$query->where('department_id', $request->user()->department_id);
			}
			
			// Filter by status
			if ($request->has('status_id')) {
				$query->where('status_id', $request->status_id);
			}
			
			// Filter by date range
			if ($request->has('start_date') && $request->has('end_date')) {
				$query->whereBetween('issued_at', [$request->start_date, $request->end_date]);
			}
			
			// Sort
			$sortField = $request->query('sort_by', 'created_at');
			$sortOrder = $request->query('sort_order', 'desc');
			$query->orderBy($sortField, $sortOrder);
			
			// Eager load relationships
			$query->with(['department', 'creator', 'recipient', 'details']);
			
			// Paginate
			$perPage = $request->query('per_page', 10);
			$billings = $query->paginate($perPage);

			return response()->json([
				'success' => true,
				'data' => $billings
			]);
		} catch (Exception $error) {
			return response()->json([
				'success' => false,
				'message' => 'Error fetching billings',
				'error' => $error->getMessage()
			], 500);
		}
	}

	/**
	 * Export billings to Excel/PDF
	 */
	public function exportBillings(Request $request)
	{
		try {
			$format = $request->query('format', 'pdf');
			$billings = Billing::with(['department', 'creator', 'recipient', 'details'])
				->where('department_id', $request->user()->department_id)
				->get();

			if ($format === 'excel') {
				return Excel::download(new BillingsExport($billings), 'billings.xlsx');
			} else {
				$pdf = PDF::loadView('exports.billings', ['billings' => $billings]);
				return $pdf->download('billings.pdf');
			}
		} catch (Exception $error) {
			return response()->json([
				'success' => false,
				'message' => 'Error exporting billings',
				'error' => $error->getMessage()
			], 500);
		}
	}

	/**
	 * Get billing statistics by status
	 */
	public function getStats()
	{
		try {
			$stats = Billing::where('department_id', request()->user()->department_id)
				->selectRaw('status_id, COUNT(*) as count, SUM(total_amount) as total')
				->groupBy('status_id')
				->get();

			return response()->json([
				'success' => true,
				'data' => $stats
			]);
		} catch (Exception $error) {
			return response()->json([
				'success' => false,
				'message' => 'Error fetching statistics',
				'error' => $error->getMessage()
			], 500);
		}
	}

	/**
	 * Get single billing by ID.
	 */
	public function getBillingById($id)
	{
		try {
			$billing = Billing::findOrFail($id);
			$details = BillingDetail::where('billing_id', $billing->id)->get();

			return response()->json([
				'success' => true,
				'data' => ['billing' => $billing, 'detail' => $details]
			]);
		} catch (Exception $error) {
			return response()->json([
				'success' => false,
				'message' => 'Billing not found',
				'error' => $error->getMessage()
			], 404);
		}
	}

	/**
	 * Update the status of a billing.
	 */
	public function updateBilling(Request $request, $id)
	{
		$billing = Billing::findOrFail($id);
		$billing->update($request->all());
		return response()->json($billing);
	}

	/**
	 * Approve a billing.
	 */
	public function approveBilling($id)
	{
		$billing = Billing::findOrFail($id);

		if (!$billing->canTransitionTo(6)) { // 6 = Process Payment
			return response()->json(['message' => 'Invalid approval transition'], 400);
		}

		$billing->status = 6;
		$billing->save();

		return response()->json($billing);
	}

	/**
	 * Reject a billing.
	 */
	public function rejectBilling($id)
	{
		$billing = Billing::findOrFail($id);

		if (!$billing->canTransitionTo(8)) { // 8 = Rejected
			return response()->json(['message' => 'Invalid rejection transition'], 400);
		}

		$billing->status = 8;
		$billing->save();

		return response()->json($billing);
	}
	/**
	 * Get the status of a billing.
	 */
	public function getBillingStatus($id)
	{
		$billing = Billing::findOrFail($id);
		return response()->json(['status' => $billing->status]);
	}

	/**
	 * Process billing from draft to paid.
	 */
	public function processBilling($id)
	{
		$billing = Billing::findOrFail($id);
		$currentStatus = $billing->status;
		$steps = config('constants.BILLING_STEPS');
		if (!isset($steps[$currentStatus])) {
			return response()->json(['message' => 'Invalid current status'], 400);
		}

		$nextSteps = $steps[$currentStatus];

		if (empty($nextSteps)) {
			return response()->json(['message' => 'No valid transition available'], 400);
		}

		// Update status ke langkah pertama dari kemungkinan status berikutnya
		$billing->status = $nextSteps[0];
		$billing->save();
		$status = config('constants.BILLING_STATUS');
		return response()->json([
			'message' => 'Billing status updated to ' . $status[$billing->status]
		], 200);
	}


	/**
	 * Reject billing request.
	 */
	public function rejectBillingRequest($id)
	{
		$billing = Billing::findOrFail($id);
		$billing->status = 'rejected';
		$billing->save();
		return response()->json(['message' => 'Billing request rejected successfully'], 200);
	}

	/**
	 * Update status billing.
	 */
	public function updateStatus($id, Request $request)
	{
		try {
			$billingId = (int) $id;
			$status = $request->input('status');
			$remarks = $request->input('remarks');
			$userId = $request->user()->id;

			if (!$status) {
				return response()->json([
					'success' => false,
					'message' => 'Status is required'
				], 400);
			}

			try {
				$billing = Billing::findOrFail($billingId);

				// Check if the status transition is allowed
				if (!$billing->canTransitionTo($status)) {
					return response()->json([
						'success' => false,
						'message' => 'Invalid status transition'
					], 400);
				}

				$billing->updateStatus($status, $userId, $remarks);
				$updatedBilling = Billing::findOrFail($billingId);
				return response()->json([
					'success' => true,
					'message' => 'Billing status updated successfully',
					'data' => $updatedBilling
				]);
			} catch (Exception $error) {
				if ($error->getMessage() === 'Billing not found') {
					return response()->json([
						'success' => false,
						'message' => 'Billing not found'
					], 404);
				} else if ($error->getMessage() === 'Invalid status transition') {
					return response()->json([
						'success' => false,
						'message' => 'Invalid status transition. Please check the allowed status transitions.'
					], 400);
				} else {
					throw $error;
				}
			}
		} catch (Exception $error) {
			return response()->json([
				'success' => false,
				'message' => 'Error updating billing status',
				'error' => $error->getMessage()
			], 500);
		}
	}

	/**
	 * Toggle archive billing.
	 */
	public function toggleArchive($id)
	{
		try {
			$billing = Billing::findOrFail($id);
			$billing->toggleArchive();

			return response()->json([
				'success' => true,
				'message' => 'Billing archive status toggled successfully'
			]);
		} catch (Exception $error) {
			return response()->json([
				'success' => false,
				'message' => $error->getMessage()
			], 500);
		}
	}

    /**
     * Get recent activities with pagination and filtering
     */
    public function getRecentActivities(Request $request)
    {
        try {
            $query = Billing::with(['creator', 'department'])
                ->select('billings.*')
                ->join('billing_histories', 'billings.id', '=', 'billing_histories.billing_id')
                ->where('billings.department_id', $request->user()->department_id)
                ->orderBy('billing_histories.created_at', 'DESC');

            // Filter by date range
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('billing_histories.created_at', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            // Filter by status
            if ($request->has('status_id')) {
                $query->where('billings.status_id', $request->status_id);
            }

            $activities = $query->paginate($request->query('per_page', 10));

            return response()->json([
                'success' => true,
                'data' => $activities->map(function ($billing) {
                    return [
                        'id' => $billing->id,
                        'description' => $billing->description,
                        'amount' => $billing->total_amount,
                        'status' => $billing->status_id,
                        'department' => $billing->department->name,
                        'created_by' => $billing->creator->name,
                        'created_at' => $billing->created_at
                    ];
                })
            ]);
        } catch (Exception $error) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching activities',
                'error' => $error->getMessage()
            ], 500);
        }
    }

    /**
     * Get pending items with detailed information
     */
    public function getPendingItems(Request $request)
    {
        try {
            $query = Billing::with(['creator', 'department', 'recipient'])
                ->whereIn('status_id', [1, 2, 3]) // Pending, Review, Approval
                ->where('department_id', $request->user()->department_id);

            // Filter by status if specified
            if ($request->has('status_id')) {
                $query->where('status_id', $request->status_id);
            }

            $items = $query->get()->groupBy('status_id');

            $summary = [];
            foreach ($items as $status => $billings) {
                $summary[] = [
                    'status_id' => $status,
                    'status_name' => $this->getStatusName($status),
                    'count' => $billings->count(),
                    'total_amount' => $billings->sum('total_amount'),
                    'items' => $billings->map(function ($billing) {
                        return [
                            'id' => $billing->id,
                            'running_no' => $billing->running_no,
                            'description' => $billing->description,
                            'amount' => $billing->total_amount,
                            'created_by' => $billing->creator->name,
                            'recipient' => $billing->recipient->name,
                            'department' => $billing->department->name,
                            'created_at' => $billing->created_at
                        ];
                    })
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $summary
            ]);
        } catch (Exception $error) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching pending items',
                'error' => $error->getMessage()
            ], 500);
        }
    }

    /**
     * Get billing dashboard statistics
     */
    public function getDashboardStats(Request $request)
    {
        try {
            $department_id = $request->user()->department_id;
            
            // Get total amount for current month
            $currentMonth = now()->startOfMonth();
            $lastMonth = now()->subMonth()->startOfMonth();
            
            $currentMonthTotal = Billing::where('department_id', $department_id)
                ->where('created_at', '>=', $currentMonth)
                ->sum('total_amount');
                
            $lastMonthTotal = Billing::where('department_id', $department_id)
                ->whereBetween('created_at', [$lastMonth, $currentMonth])
                ->sum('total_amount');
            
            // Calculate growth
            $growth = $lastMonthTotal > 0 
                ? (($currentMonthTotal - $lastMonthTotal) / $lastMonthTotal) * 100 
                : 100;
            
            // Get counts by status
            $statusCounts = Billing::where('department_id', $department_id)
                ->selectRaw('status_id, COUNT(*) as count, SUM(total_amount) as total')
                ->groupBy('status_id')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [$item->status_id => [
                        'count' => $item->count,
                        'total' => $item->total
                    ]];
                });
            
            return response()->json([
                'success' => true,
                'data' => [
                    'current_month' => [
                        'total' => $currentMonthTotal,
                        'growth' => round($growth, 2)
                    ],
                    'status_summary' => $statusCounts,
                    'pending_count' => $statusCounts[1]['count'] ?? 0,
                    'approved_count' => $statusCounts[6]['count'] ?? 0,
                    'rejected_count' => $statusCounts[8]['count'] ?? 0
                ]
            ]);
        } catch (Exception $error) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching dashboard statistics',
                'error' => $error->getMessage()
            ], 500);
        }
    }

    /**
     * Helper function to get status name
     */
    private function getStatusName($status_id)
    {
        $statuses = [
            1 => 'Dalam Proses',
            2 => 'Perlu Semakan',
            3 => 'Perlu Kelulusan',
            4 => 'Diluluskan',
            5 => 'Dalam Proses Bayaran',
            6 => 'Selesai',
            7 => 'Dibatalkan',
            8 => 'Ditolak'
        ];

        return $statuses[$status_id] ?? 'Unknown Status';
    }
}
