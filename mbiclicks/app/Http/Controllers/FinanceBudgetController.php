<?php

namespace App\Http\Controllers;

use App\Models\BudgetSum;
use App\Models\FinanceAcc;
use App\Models\System;
use App\Traits\FinanceTraits;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class FinanceBudgetController extends Controller
{
    use FinanceTraits;

    public function index(Request $request){
        $title = 'Bajet';
        $needopen = false;
        $opentitle = 'Buka Akaun ' . YEAR_NOW;
        
        if(isset($request['json'])) {
            $offset = $request->start;
            $limit = $request->length; // row display per pages
            $draw = $request->draw;
            $search = $request->search['value']??'';
            $filter = ['code','like',$search.'%'];
            $data = [];
            $year = $request['json'];

            if($year == 0) {
                $qry = FinanceAcc::query();

                $recordTotal = $qry->count();
                $recordFilter = $qry
                    ->where(...$filter)
                    ->orWhere('name','like','%'.$search.'%')
                    ->count();
                $data = $qry
                    ->where(...$filter)
                    ->orWhere('name','like','%'.$search.'%')
                    ->orderBy('code')->offset($offset)->limit($limit)->get();
            } else {
                $tablename = PREFIX_ACC . $year;
                if(Schema::hasTable($tablename)) {
                    $qry = DB::table($tablename);
                    $recordTotal = $qry->count();
                    $recordFilter = $qry
                        ->where(...$filter)
                        ->orWhere('name','like','%'.$search.'%')
                        ->count();
                    $data = $qry
                        ->where(...$filter)
                        ->orWhere('name','like','%'.$search.'%')
                        ->orderBy('code')->offset($offset)->limit($limit)->get();
                }
            }
//            Log::info('draw',['start'=>$offset,'limit'=>$limit,'draw'=>$draw]);
            $result = [
                "recordsTotal"=> $recordTotal,
                "recordsFiltered"=> $recordFilter,
                "data" => $data,
            ];
            return response()->json($result);
        }

        $d = $this->listOfYear();
        $years = $d[0];
        $needopen = $d[1];
        return view('account.budget',compact('title','years','needopen','opentitle'));
    }
    public function edit(FinanceSum $budget)
    {
        return response()->json($budget,200);
    }
    public function getBudget(Request $request){

        if(Schema::hasTable(PREFIX_ACC.YEAR_NOW)) {
            $db = BudgetSum::with('children');
        } else {
            $db = FinanceAcc::with('children');
        }

        $field = ['id',DB::raw("CONCAT(code,'-',name) as text"),'name','code'];
        $rs = $db->get($field);//where('pid',0)->orderBy('code','asc')->get();
        if(isset($request->searchTerm)) {
            $rs = $db
                ->where('code', 'like', '%' . $request->searchTerm . '%')
                ->orWhere('name', 'like', '%' . $request->searchTerm . '%')
                ->get($field);
        }

        $data = [];
        foreach ($rs as $r){
            if(count($r->children)>0) continue;
            unset($r->children);
            $data[] = $r;
        }
        return response()->json(['data'=>$data]);
    }
//    public function getBudget1(){
//        if(Schema::hasTable(PREFIX_ACC.YEAR_NOW)) {
//            $db = new BudgetSum;
//        } else {
//            $db = new FinanceAcc;
//        }
//        $data = $db->where('btyp',1)->get(['id',DB::raw("CONCAT(code,'-',name) as text")]);
//        return response()->json($data);
//    }
    public function setbudget(Request $request){
        $id = $request->id;
        $yr = $request->yr;
        $data = $request->data;
        // $field = array_keys($data)[0];
        $fields = array_keys($data);
        if(!isset($request->data)) return response()->json(['error'=>'Data tidak dijumpai']);
        if($yr == 0) {
            $table = 'finance_accs';
        } else {
            $table = PREFIX_ACC . $yr;
        }
        $db = DB::table($table)->where('id',$id);
        $db->update($data);
        $rw = $db->first();
        $pid = $rw->pid;

        
        $loop = 0;
        while($pid>0){
            if($loop >= 10) break;
            $sum = array();
            foreach ($fields as $key => $value) {
                $sum[$value] = DB::table($table)->where('pid',$pid)->sum($value);
            }
            // $sum[$field] = DB::table($table)->where('pid',$pid)->sum($field);
            $rs = tap(DB::table($table)->where('id',$pid))->update($sum)->first();
            $pid = $rs->pid;
            $loop++;
        }

        return response()->json(['success'=>'ok']);

    }
    public function generate(Request $request){
        $sys = System::first();
        $cur = $sys->current_yr;
        $createYr = YEAR_NOW;
        if($cur > 0) $createYr = $cur + 1 ;
        $this->createSummary($createYr);

        $d = $this->listOfYear();
        $years = $d[0];

        return response()->json(['success'=>'ok','years'=>$years,'buildyear'=>$createYr]);
    }

    private function createSummary($year = 0){
        if($year == 0) return false;
        $tablename = PREFIX_ACC . $year;
        if(Schema::hasTable($tablename)) Schema::table($tablename,function (Blueprint $table){$table->dropIfExists();});
        Schema::create($tablename,function(Blueprint $table){
            $table->id();
            $table->foreignId('pid')->default(0)->comment('parent id');
            $table->tinyInteger('acclvl')->default(0)->comment('Level Account');
            $table->boolean('shw')->default(1)->comment('1:active 2:deactivate');
            $table->boolean('type')->default(0)->comment('1:debit 2:credit');
            $table->boolean('btyp')->default(0)->comment('bajet type');
            $table->boolean('rtyp')->default(3)->comment('1:finanece 2:budjet 3:both report type');
            for($i=1;$i<13;$i++){
                $table->decimal('a'.$i,15,2)->default(0)->comment('actual amount');
                $table->decimal('b'.$i,15,2)->default(0)->comment('budget amount');
            }
            $table->decimal('atotal',15,2)->default(0)->comment('actual total');
            $table->decimal('btotal',15,2)->default(0)->comment('budget total');
            $table->string('code',15);
            $table->string('name',100);
            $table->timestamps();
        });
        $sys = System::first();
        if($sys->start_yr == 0) $sys->start_yr = $year;
        $sys->current_yr = $year;
        $sys->save();

//        $field = ['btyp','type','acclvl','pid','code','name','btotal'];
//        for($i=1;$i<13;$i++){$field[] = 'b'.$i;}

        $data = FinanceAcc::all();
//        DB::table($tablename)->truncate(); // if table already exist
        foreach ($data as $a){
            $newdata = [
                "id" => $a->id,
                "pid" => $a->pid,
                "acclvl" => $a->acclvl,
                "shw" => $a->shw,
                "type" => $a->type,
                "btyp" => $a->btyp,
                "rtyp" => $a->rtyp,
                "b1" => $a->b1,
                "b2" => $a->b2,
                "b3" => $a->b3,
                "b4" => $a->b4,
                "b5" => $a->b5,
                "b6" => $a->b6,
                "b7" => $a->b7,
                "b8" => $a->b8,
                "b9" => $a->b9,
                "b10" => $a->b10,
                "b11" => $a->b11,
                "b12" => $a->b12,
                "btotal" => $a->btotal,
                "code" => $a->code,
                "name" => $a->name,
            ];
            DB::table($tablename)->insert($newdata);
//            $newdata = $a->replicate();
//            $newdata->setTable($tablename);
//            $newdata->save();
        }
        // clear all data from master
//        DB::statement("UPDATE Finance SET  m1=0,m2=0");
        $field = [];
        for($i=1;$i<13;$i++)$field['b'.$i] = 0;
        FinanceAcc::query()->update($field);
        return true;
    }
    private function listOfYear(){
        $needopen = false;
        $sys = System::first();
        $start = $sys->start_yr;
        $cur = $sys->current_yr;
        $yrtext = YEAR_NOW;
        if($start > 0) $yrtext = $cur + 1;
        $years[] = ['value'=>0,'text'=>'Pra-Bajet ' . $yrtext];
        for($i=$start; $i<=$sys->current_yr; $i++){ if($i>0)$years[] = ['value'=>$i,'text'=>'Bajet ' .$i]; }

        if($cur != YEAR_NOW)$needopen = true;

        return [$years,$needopen];
    }
}
