<?php

namespace App\Http\Controllers;

use App\Models\BankLedger;
use App\Models\BankMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BankLedgerController extends Controller
{
    public function index(Request $request)
    {
        $bank = BankMaster::find($request->idbank);
        return response()->json(['success'=>200,'data'=>$bank->transaction,'total'=>$bank->total_disp]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $valid = Validator::make($request->all(),[
            'txdate'=>'required',
            'description'=>'required',
            'txamt'=>'required',
//            'accid'=>'required',
            'txsts'=>'required',
            'txtype'=>'required',
        ],[
            'required'=>':attribute diperlukan',
            'unique'=>':attribute sudah wujud'
        ],[
            'txdate'=>'Tarikh Transaksi',
            'description'=>'Perkara',
            'txamt'=>'Jumlah',
//            'accid'=>'Kod Akaun',
            'txsts'=>'Status',
            'txtype'=>'Jenis',
        ]);

        if($valid->fails()) return response()->json(['error'=>$valid->errors()->first()]);

        if($request->txtype == TYPCREDIT) $request->txamt *= -1;
        $bankMaster = BankMaster::find($request->bankid);
        $bankMaster->amt += $request->txamt;
        $bankMaster->save();
        $txBank = [
            'bankid'=>$request->bankid,
            'txtype'=>$request->txtype, // kredit
            'txamt'=>$request->txamt,
//            'accid'=>$request->accid,
            'txsts'=>$request->txsts, // transaction status
            'balamt'=>$bankMaster->amt,
            'tx_by'=>Auth::id(),
            'txdate'=>date('Y-m-d'),
            'description'=>$request->description,
        ];
        BankLedger::create($txBank);
        return response()->json(['success'=>200,'message'=>'Transaksi baru berjaya dispmpan']);
    }

    public function show(BankLedger $bankLedger)
    {
        //
    }

    public function edit(BankLedger $bankLedger)
    {
        //
    }

    public function update(Request $request, BankLedger $bankLedger)
    {
        //
    }

    public function destroy(BankLedger $bankLedger)
    {
        //
    }
}
