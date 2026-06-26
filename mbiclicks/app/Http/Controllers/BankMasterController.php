<?php

namespace App\Http\Controllers;

use App\Models\BankLedger;
use App\Models\BankMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BankMasterController extends Controller
{
    public function index(Request $request)
    {
        if(isset($request->json)){
            $offset = $request->start;
            $limit = $request->length; // row display per pages
            $draw = $request->draw;
            $search = $request->search['value']??'';
            $filter = ['name','like','%' .$search.'%'];
//            Log::info('draw',['start'=>$offset,'limit'=>$limit,'draw'=>$draw]);

            $recordTotal = BankMaster::count();
            $recordFilter = BankMaster::where('shw',1)->where(...$filter)->count();
            $data = BankMaster::where('shw',1)
                ->where(...$filter)
                ->orderBy('name')
                ->offset($offset)->limit($limit)->get();
            $result = [
                "recordsTotal"=> $recordTotal,
                "recordsFiltered"=> $recordFilter,
                "data" => $data,
            ];
            return response()->json($result);
        }
        $title = 'Bank';
        return view('bank.index',compact('title'));
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $valid = Validator::make($request->all(),[
           'name'=>'required',
//           'accno'=>'required|numeric|unique:bank_masters,accno',
           'amt'=>'required',
//           'accid'=>'required',
        ],[
            'required'=>':attribute diperlukan',
            'unique'=>':attribute sudah wujud'
        ],[
            'name'=>'Nama',
//            'accno'=>'No Bank',
            'amt'=>'Jumlah',
//            'accid'=>'Kod Akaun',
        ]);

        if($valid->fails()) return response()->json(['error'=>$valid->errors()->first()]);
        BankMaster::create($request->all());
        return response()->json(['success'=>'ok']);
    }

    public function show(BankMaster $bankMaster)
    {
        //
    }

    public function edit(BankMaster $bankMaster)
    {
        //
    }

    public function update(Request $request, BankMaster $bankMaster)
    {
        $valid = Validator::make($request->all(),[
            'name'=>'required',
//            'accno'=>'required|numeric|unique:bank_masters,accno,'.$bankMaster->id,
            'amt'=>'required',
//            'accid'=>'required',
        ],[
            'required'=>':attribute diperlukan',
            'unique'=>':attribute sudah wujud'
        ],[
            'name'=>'Nama',
//            'accno'=>'No Bank',
            'amt'=>'Jumlah',
//            'accid'=>'Kod Akaun',
        ]);

        if($valid->fails()) return response()->json(['error'=>$valid->errors()->first()]);
        $bankMaster->update($request->all());
        return response()->json(['success'=>'ok']);
    }

    public function destroy(BankMaster $bankMaster)
    {
        $bankMaster->update(['shw'=>0]);
        return response()->json(['success'=>'ok']);
    }
    public function credit(Request $request)
    {
        $data = BankMaster::select(['id',DB::raw("CONCAT(name,'-',accno) as text"),'amt'])
            ->where('shw',1)->orderBy('name','asc')->get();
        return response()->json(['data'=>$data]);
    }
}
