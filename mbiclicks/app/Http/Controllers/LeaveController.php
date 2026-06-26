<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\LeaveEntitlement;
use App\Models\PositionGroup;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LeaveController extends Controller
{
    private $validator = [
        [
            'leave' => 'required',
            'typ' => 'required|integer|min:1',
            'def'=>'required|integer',
        ],[
            'required' => ':attribute diperlukan',
            'integer'=>'Nilai untuk :attribute tidak betul',
            'min'=>':attribute diperlukan',
        ],[
            'leave'=>'Nama',
            'typ'=>'Unit',
            'def'=>'Had'
        ]
    ];
    private $unit = '';

    public function index(Request $request)
    {
        if(isset($request->json)){
            $offset = $request->start??0;
            $limit = $request->length??6; // row display per pages
            $draw = $request->draw;
            $search = $request->search['value']??'';
            $filter = ['leave','like','%'.$search.'%'];
//            Log::info('draw',['start'=>$offset,'limit'=>$limit,'draw'=>$draw]);

            $recordTotal = Leave::all()->count();
            $leave = Leave::with('yearupto')->where(...$filter);
            $recordFilter = $leave->count();
            $data = $leave->orderBy('sort')->offset($offset)->limit($limit)->get();
            $result = [
                "recordsTotal"=> $recordTotal,
                "recordsFiltered"=> $recordFilter,
                "data" => $data,
            ];
            return response()->json($result);
        }
        return view('leaves.index',['title'=>'Cuti', ]);
    }
    public function create() {}
    public function store(Request $request)
    {
        $vl = Validator::make($request->all(),...$this->validator);
        if($vl->fails()) return response()->json(['error'=>'bad','message'=>$vl->errors()->first()]);
        if($request->typ == 1) $this->unit = 'Jam';
        if($request->typ == 2) $this->unit = 'Hari';
        if($request->typ == 3) $this->unit = 'RM';
        $arr = [
            'leave'=>$request->leave,
            'unit'=>$this->unit,
            'typ'=>$request->typ,
            'def'=>$request->def,
        ];
        Leave::create($arr);
        Staff::query()->update(['lvsts'=>1]);
        return response()->json(['success'=>'ok','message'=>'Tambah baru berjaya']);
    }

    public function show( Leave $leaveType) {}
    public function edit( Leave $leaveType) {return redirect()->to(url('/cms/leave'))->with(['id'=>$leaveType->id,'data'=>$leaveType]);}
    public function update( Request $request, Leave $leaveType)
    {
        $vl = Validator::make($request->all(),...$this->validator);

        if($vl->fails()) return response()->json(['error'=>'bad','message'=>$vl->errors()->first()]);
        if($request->typ == 1) $this->unit = 'Jam';
        if($request->typ == 2) $this->unit = 'Hari';
        if($request->typ == 3) $this->unit = 'RM';
        $arr = [
            'leave'=>$request->leave,
            'unit'=>$this->unit,
            'typ'=>$request->typ,
            'def'=>$request->def,
        ];
        $leaveType->update($arr);
        return response()->json(['success'=>'ok','message'=>'Kemaskini berjaya']);
    }
    public function destroy( Leave $leaveType) {
        $leaveType->delete();
        return response()->json(['success'=>'ok','message'=>'Buang berjaya']);
    }
    public function yeartoup(Request $request)
    {
        $group = PositionGroup::with('leaveEntitle')->get();
        return view('leaves.yeartoup',['title'=>'Kelayakan Tahunan Sehingga', ...compact('group')]);
    }
    public function entitleupdate(LeaveEntitlement $entitle,Request $request){
        $entitle->update($request->all());
        return response()->json(['success'=>200,'message'=>'Kemasmini berjaya']);
    }
}
