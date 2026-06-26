<?php

namespace App\Http\Controllers;

use App\Models\Petition;
use App\Models\Pettycash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PettycashController extends Controller
{
    public function index()
    {
        $data = Pettycash::with('staff','depart')
            ->whereYear('created_at','=',date('Y'))
            ->orderBy('id','DESC')->get();
        return view('pettycash.index',['title'=>'Overview Pettycash', 'data'=>$data]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $valid = Validator::make($request->all(),[
            'trandt'=>'required',
            'descrip'=>'required',
            'amt'=>'required',
        ],[
            'trandt.required'=>'Tarikh diperlukan',
            'descrip.required'=>'Perkara diperlukan',
            'amt.required'=>'Jumlah diperlukan',
        ]);
        if($valid->fails()) return response()->json(['error'=>'bad','message'=>$valid->errors()]);
        Pettycash::create($request->all());

        $data = Pettycash::where('petition_id',$request->petition_id)->get();
        $return = ['success'=>'ok','advance'=>$data];
        return response()->json($return);
    }

    public function show(Pettycash $pettycash)
    {
        //
    }

    public function edit(Pettycash $pettycash)
    {
        //
    }

    public function update(Request $request, Pettycash $pettycash)
    {
        //
    }

    public function destroy(Pettycash $pettycash)
    {
        $pid = $pettycash->petition_id;
        $pettycash->delete();
        $data = Pettycash::where('petition_id',$pid)->get();
        $return = ['success'=>'ok','advance'=>$data];
        return response()->json($return);
    }
}
