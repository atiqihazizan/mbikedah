<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

defined('STATUS_TRANSITIONS', [
    1 => [2],   
    2 => [3, 8,9,10],
    3 => [4],
    4 => [5],
    5 => [6, 8,9,10],
    6 => [7],
    7 => [],
]);
defined('STEPS', [
    'Draft',                                // 1
    'Waiting for HOD Approval',             // 2
    'Waiting for Finance Review',           // 3
    'Waiting for Finance Verification',     // 4
    'Waiting for Finance Approval',         // 5
    'Process Payment',                      // 6
    'Paid',                                 // 7
    'Rejected',                             // 8
    'Returned',                             // 9
    'Cancelled',                            // 10
]);

// Status transition rules
// {
//     1: [2],           // Draft -> Approval HOD
//     2: [3, 8],        // Approval HOD -> Checking Finance, Rejected
//     3: [4],           // Checking Finance -> Approval Finance
//     4: [5, 8],        // Verify Finance -> Verified, Rejected
//     5: [6, 8],        // Approval Finance[6, 8],        // Approval Finance -> Approved, Rejected] -> Approved, Rejected
//     6: [7],           // Approved -> Paid[6, 8],        // Approval Finance -> Approved, Rejected]
//     7: [],            // Paid -> (no further transitions)[6, 8],        // Approval Finance -> Approved, Rejected]
//     8: []             // Rejected -> (no further transitions)
//   };
  
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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
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
}
