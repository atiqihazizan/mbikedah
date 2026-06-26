<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinaceAccRequest;
use App\Http\Requests\UpdateFinaceAccRequest;
use App\Models\FinanceAcc;
use App\Models\System;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FinanceAccController extends Controller
{
    public function index(Request $request)
    {
        $filter = false;
        $title = 'Akaun Kewangan';
        $arr = new FinanceAcc;
        $field = ['id','code','name','type','pid','btyp','acclvl'];
        $qry = $arr;
        if($src=($request['search'] ?? false)) {
            $filter = true;
            $qry = $qry->where('code','like',$src)->orWhere('name','like','%'.$src.'%');
        }
        if(isset($request['tx'])){
            $filter = true;
            $qry = $qry->whereIn('btyp',$request['tx']);
        }
        if(isset($request['shw'])){
            $filter = true;
            $qry = $qry->whereIn('shw',$request['shw']);
        }
        if(isset($request['type'])){
            $filter = true;
            $qry = $qry->whereIn('type',$request['type']);
        }

        if($filter) {
            $finance = $qry->get($field);
        } else {
            $finance = $arr->orderBy('code')->get($field);
        }
        $rows = buildTree($finance);

        if(isset($request['json'])) {
//            $data = [];
//            foreach ($rows as $r){
//                $data[$r->id] = $r->children;
//            }
//            arsort($rows, function($a, $b) { //Sort the array using a user defined function
//                return $a->code > $b->code ? -1 : 1; //Compare the scores
//            });

            return response()->json($rows);
        }

        return view('account.index',compact('title','rows','filter'));
    }

    public function create() {}

    public function store(StoreFinaceAccRequest $request)
    {
        $fv = $request->validator;
        if(isset($request->validator) && $fv->fails()) return response()->json(['error'=>$fv->errors()->first()]);

        $data = $request->all();
        $curracc = isset($data['curracc'])?$data['curracc']:false;
        unset($data['_token']);
        unset($data['curracc']);

        $fna = FinanceAcc::create($data);

        if($curracc){
            $sys = System::first();
            $curr = $sys->current_yr;
            $table = PREFIX_ACC . $curr;
            if(!Schema::hasTable($table)) return redirect()->route('finance.index',['json'=>1]);
            $db = DB::table($table);
            $pid = $data['pid'];
            if($pid > 0 && $db->where('id',$pid)->exists()){
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                $db->insertGetId($data);
            }
        }

        return redirect()->route('finance.index',['json'=>1]);
    }

    public function show(FinanceAcc $financeAcc)
    {
        return response()->json($financeAcc,200);
    }

    public function edit(FinanceAcc $financeAcc)
    {
        return response()->json($financeAcc,200);
    }

    public function update(UpdateFinaceAccRequest $request, FinanceAcc $financeAcc)
    {
        $fv = $request->validator;
        if(isset($request->validator) && $fv->fails()) return response()->json(['error'=>$fv->errors()->first()]);

        $data = $request->all();
        $curracc = isset($data['curracc'])?$data['curracc']:false;
        unset($data['_method']);
        unset($data['_token']);
        unset($data['curracc']);

        $financeAcc->update($data);

        if($curracc){
            $sys = System::first();
            $curr = $sys->current_yr;
            $table = PREFIX_ACC . $curr;
            if(Schema::hasTable($table) == false || $curr == '0000') return redirect()->route('finance.index',['json'=>1]);
            $db = DB::table($table)->where('id',$financeAcc->id);
            if(!$db->exists()) return redirect()->route('finance.index',['json'=>1]);
            $db->update($data);
        }

        return redirect()->route('finance.index',['json'=>1]);
    }

    public function destroy(FinanceAcc $financeAcc)
    {
        $pid = $financeAcc->id;
        $child = FinanceAcc::where('pid',$pid)->count();

        if($child > 0) return response()->json(['error'=>'Akaun tidak berjaya dibuang']);
        $financeAcc->delete();

        $field = ['id','code','name','type','pid','btyp','acclvl'];
        $finance = FinanceAcc::orderBy('code')->get($field);
        $rows = buildTree($finance);
        return response()->json($rows);
//        return redirect()->route('finance.index',['json'=>1]);
    }

    public function getFinance(Request $request){
        $qry = FinanceAcc::query();
        $res = $qry;
        if(isset($request->searchTerm)) {
            $res = $qry
                ->where('code', 'like', '%' . $request->searchTerm . '%')
                ->orWhere('name', 'like', '%' . $request->searchTerm . '%');
        }
        $data = $res->get(['id',DB::raw("CONCAT(code,'-',name) as text"),'acclvl','pid','code']);
        return response()->json(['data'=>$data]);
    }
    public function enabled(FinanceAcc $financeAcc){
        $financeAcc->shw = !$financeAcc->shw;
        $financeAcc->save();
        return redirect()->route('finance.index',['json'=>1]);
    }
    public function transac(FinanceAcc $financeAcc){
        $financeAcc->btyp = !$financeAcc->btyp;
        $financeAcc->save();
        //
        $id = $financeAcc->id;
        $sys = System::first();
        $curr = $sys->current_yr;
        $table = PREFIX_ACC . $curr;
        if(!Schema::hasTable($table)) return redirect()->route('finance.index',['json'=>1]);
        $db = DB::table($table)->where('id',$id);

        if($db->exists()){
            $rw = $db->first();
            $data['btyp'] = !$rw->btyp;
            $data['updated_at'] = date('Y-m-d H:i:s');
            $db->update($data);
        }
        //
        return redirect()->route('finance.index',['json'=>1]);
    }

    public function getAll(){
        $master = FinanceAcc::all();
        $acc=[];
        foreach ($master as $f){
            if($f->type == 1)$acc['debit'][] = ['id'=>$f->id,'text'=>$f->code . ' - '. $f->name];
            if($f->type == 2 && $f->yr == YEAR_NOW)$acc['crdt'][] = ['id'=>$f->id,'text'=>$f->code . ' - '. $f->name];
        }
        return response()->json($acc);
    }
}
