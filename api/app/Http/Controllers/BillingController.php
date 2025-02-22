<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Billing; // Tambahkan ini untuk menggunakan model Billing
use App\Models\BillingHistory; // Tambahkan ini untuk menggunakan model BillingHistory
use App\Models\BillingDetail; // Tambahkan ini untuk menggunakan model BillingDetail
use App\Models\User; // Tambahkan ini untuk menggunakan model User
use Exception; // Untuk menggunakan kelas Exception dari PHP


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
	public function createBilling(Request $request)
	{
		try {
			// Validate request data
			$validatedData = $request->validate([
				'title' => 'required|string',
				'issue_desc' => 'required|string',
				'issue_to' => 'required|string',
				'no_project' => 'required|string',
				'total' => 'required|numeric',
				'payment_type_id' => 'required|integer',
				'status' => 'integer|nullable',
				'department_id' => 'required|integer',
				'running_no' => 'string|nullable',
				'detail' => 'array|nullable'
			]);

			// Create billing with validated data
			$billingData = [
				'title' => $validatedData['title'],
				'issue_desc' => $validatedData['issue_desc'],
				'issue_to' => $validatedData['issue_to'],
				'no_project' => $validatedData['no_project'],
				'total' => $validatedData['total'],
				'payment_type_id' => $validatedData['payment_type_id'],
				'status' => $validatedData['status'] ?? 1,
				'department_id' => $validatedData['department_id'],
				'running_no' => $validatedData['running_no'],
				'created_by' => $request->user()->id
			];

			$billing = Billing::create($billingData);

			// Handle billing details if provided
			if (isset($validatedData['detail']) && count($validatedData['detail']) > 0) {
				foreach ($validatedData['detail'] as $detail) {
					BillingDetail::create([
						'billing_id' => $billing->id,
						'detail' => $detail
					]);
				}
			}

			return response()->json([
				'success' => true,
				'message' => 'Billing created successfully',
				'data' => ['id' => $billing->id, 'running_no' => $billing->running_no]
			]);
		} catch (Exception $error) {
			return response()->json([
				'success' => false,
				'message' => 'Error creating billing',
				'error' => $error->getMessage()
			], 500);
		}
	}

	/**
	 * Get all billings.
	 */
	public function getBillings(Request $request)
	{
		try {
			$archived = $request->query('archived', false);
			$billings = Billing::where('department_id', $request->user()->department_id)
				->where('is_archived', $archived)
				->get();

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
	 * Get statistics of billing.
	 */
	public function getStats()
	{
		try {
			// Get total amount of all bills
			$totalAmount = Billing::sum('amount');

			// Get count of pending bills
			$pendingCount = Billing::whereIn('status', ['PENDING', 'REVIEW', 'APPROVAL'])->count();

			// Get total number of users
			$userCount = User::count();

			// Calculate monthly growth
			$today = now();
			$thisMonth = $today->copy()->startOfMonth();
			$lastMonth = $today->copy()->subMonth()->startOfMonth();

			$thisMonthTotal = Billing::where('created_at', '>=', $thisMonth)->sum('amount');
			$lastMonthTotal = Billing::where('created_at', '>=', $lastMonth)->where('created_at', '<', $thisMonth)->sum('amount');

			$growthRate = $lastMonthTotal ?
				(($thisMonthTotal - $lastMonthTotal) / $lastMonthTotal * 100) :
				0;

			return response()->json([
				'totalAmount' => $totalAmount,
				'pendingCount' => $pendingCount,
				'userCount' => $userCount,
				'growthRate' => round($growthRate, 1)
			]);
		} catch (Exception $error) {
			return response()->json([
				'status' => 'error',
				'error' => $error->getMessage()
			], 500);
		}
	}

	/**
	 * Get pending bills.
	 */
	public function getPendingItems()
	{
		try {
			$pendingItems = Billing::select('status')
				->selectRaw('COUNT(id) as count')
				->selectRaw('SUM(amount) as totalAmount')
				->whereIn('status', ['PENDING', 'REVIEW', 'APPROVAL'])
				->groupBy('status')
				->get();

			$statusDescriptions = [
				'PENDING' => 'Perlu Semakan',
				'REVIEW' => 'Dalam Semakan',
				'APPROVAL' => 'Perlu Kelulusan'
			];

			$items = $pendingItems->map(function ($item, $index) use ($statusDescriptions) {
				return [
					'id' => $index + 1,
					'status' => $statusDescriptions[$item->status] ?? $item->status,
					'count' => $item->count,
					'amount' => $item->totalAmount,
					'statusDescription' => $statusDescriptions[$item->status] ?? $item->status,
					'department' => 'Jabatan Kewangan'
				];
			});

			return response()->json(['items' => $items]);
		} catch (Exception $error) {
			return response()->json([
				'status' => 'error',
				'error' => $error->getMessage()
			], 500);
		}
	}

	/**
	 * Get recent activities.
	 */
	public function getRecentActivities()
	{
		try {
			$recentBills = Billing::with('user')
				->orderBy('created_at', 'DESC')
				->limit(10)
				->get();

			$activities = $recentBills->map(function ($bill) {
				return [
					'id' => $bill->id,
					'type' => 'payment',
					'description' => 'Permohonan bayaran: ' . ($bill->description ?? 'Tiada keterangan'),
					'amount' => $bill->amount,
					'status' => $bill->status,
					'createdAt' => $bill->created_at
				];
			});

			return response()->json(['activities' => $activities]);
		} catch (Exception $error) {
			return response()->json([
				'status' => 'error',
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
}
