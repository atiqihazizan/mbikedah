<?php

namespace App\Http\Controllers;

use App\Models\BillingRecipient;
use App\Http\Requests\BillingRecipientRequest;
use Illuminate\Http\Request;

class BillingRecipientController extends Controller
{
    /**
     * Senarai semua billing recipients
     */
    public function index()
    {
        $recipients = BillingRecipient::with('billings')->get();
        return response()->json(['data' => $recipients]);
    }

    /**
     * Simpan billing recipient baru
     */
    public function store(BillingRecipientRequest $request)
    {
        $recipient = BillingRecipient::create($request->validated());
        return response()->json(['data' => $recipient], 201);
    }

    /**
     * Dapatkan billing recipient tertentu
     */
    public function show($id)
    {
        $recipient = BillingRecipient::with('billings')->find($id);
        
        if (!$recipient) {
            return response()->json(['message' => 'Billing recipient tidak dijumpai'], 404);
        }

        return response()->json(['data' => $recipient]);
    }

    /**
     * Kemaskini billing recipient
     */
    public function update(BillingRecipientRequest $request, $id)
    {
        $recipient = BillingRecipient::find($id);
        
        if (!$recipient) {
            return response()->json(['message' => 'Billing recipient tidak dijumpai'], 404);
        }

        $recipient->update($request->validated());
        return response()->json(['data' => $recipient]);
    }

    /**
     * Padam billing recipient
     */
    public function destroy($id)
    {
        $recipient = BillingRecipient::find($id);
        
        if (!$recipient) {
            return response()->json(['message' => 'Billing recipient tidak dijumpai'], 404);
        }

        $recipient->delete();
        return response()->json(['message' => 'Billing recipient berjaya dipadam']);
    }
}
