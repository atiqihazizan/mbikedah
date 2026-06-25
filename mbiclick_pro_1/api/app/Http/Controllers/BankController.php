<?php
namespace App\Http\Controllers;

use App\Models\Bank;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class BankController extends Controller
{
    /**
     * Display a listing of the banks.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $banks = Bank::all();
        return response()->json($banks);
    }

    /**
     * Store a newly created bank in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'bank_name' => 'required|string',
            'bank_account' => 'required|string',
            'account_type' => 'nullable|string',
            'swift_code' => 'nullable|string',
            'branch_name' => 'nullable|string',
            'budget_id' => 'nullable|integer',
        ]);

        $bank = Bank::create($data);
        return response()->json($bank, 201);
    }

    /**
     * Display the specified bank.
     *
     * @param  \App\Models\Bank  $bank
     * @return \Illuminate\Http\Response
     */
    public function show(Bank $bank)
    {
        return response()->json($bank);
    }

    /**
     * Update the specified bank in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Bank  $bank
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Bank $bank)
    {
        $data = $request->validate([
            'bank_name' => 'sometimes|required|string',
            'bank_account' => 'sometimes|required|string',
            'account_type' => 'sometimes|nullable|string',
            'swift_code' => 'sometimes|nullable|string',
            'branch_name' => 'sometimes|nullable|string',
            'budget_id' => 'sometimes|nullable|integer',
        ]);

        $bank->update($data);
        return response()->json($bank);
    }

    /**
     * Remove the specified bank from storage.
     *
     * @param  \App\Models\Bank  $bank
     * @return \Illuminate\Http\Response
     */
    public function destroy(Bank $bank)
    {
        $bank->delete();
        return response()->json(null, 204);
    }
}
