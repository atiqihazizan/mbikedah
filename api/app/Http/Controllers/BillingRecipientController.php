<?php

namespace App\Http\Controllers;

use App\Models\BillingRecipient;
use App\Http\Requests\BillingRecipientRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BillingRecipientController extends Controller
{
    /**
     * Senarai semua billing recipients
     */
    public function index()
    {
        $recipients = Cache::tags(['penerima'])->remember('senarai_penerima', now()->addMinutes(30), function () {
            return BillingRecipient::with('billings')->orderBy('name')->get();
        });
        return response()->json(['data' => $recipients]);
    }

    /**
     * Simpan billing recipient baru
     */
    public function store(BillingRecipientRequest $request)
    {
        $recipient = BillingRecipient::create($request->validated());
        Cache::tags(['penerima'])->forget('senarai_penerima');
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
        Cache::tags(['penerima'])->forget('senarai_penerima');
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
        Cache::tags(['penerima'])->forget('senarai_penerima');
        return response()->json(['message' => 'Billing recipient berjaya dipadam']);
    }
}
