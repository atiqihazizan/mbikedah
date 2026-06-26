<?php

namespace App\Http\Controllers;

use App\Models\FinanceAcc;
use App\Models\FinanceLedger;
use App\Models\Petition;
use Carbon\Carbon;
use Illuminate\Http\Request;

class FinanceLedgerController extends Controller
{
    public function index(){
        $yrmth = Carbon::now()->format('Ym');
        $mth = [
            ['id'=>YEAR_NOW.'01','name'=>'Jan'],
            ['id'=>YEAR_NOW.'02','name'=>'Feb'],
            ['id'=>YEAR_NOW.'03','name'=>'Mac'],
            ['id'=>YEAR_NOW.'04','name'=>'Apr'],
            ['id'=>YEAR_NOW.'05','name'=>'Mei'],
            ['id'=>YEAR_NOW.'06','name'=>'Jun'],
            ['id'=>YEAR_NOW.'07','name'=>'Jul'],
            ['id'=>YEAR_NOW.'08','name'=>'Ogo'],
            ['id'=>YEAR_NOW.'09','name'=>'Sep'],
            ['id'=>YEAR_NOW.'10','name'=>'Okt'],
            ['id'=>YEAR_NOW.'11','name'=>'Nov'],
            ['id'=>YEAR_NOW.'12','name'=>'Dis'],
        ];
        return view('reports.financeledger',[
            'title'=>'Lajer Perbelanjaan',
            'data' =>FinanceLedger::where('yrmth','like',YRMTH)
                ->orderBy('datetx','desc')->get(),
            'budget'=>FinanceAcc::all(),
            'project'=>Petition::where('ptype_id',1)->where('psts',3)->get(),
            'month'=>$mth,
        ]);
    }
    public function show($yrmth)
    {
        $data = FinanceLedger::where('yrmth',$yrmth)
            ->orderBy('datetx','desc')->get();
        return response()->json(['success'=>'ok','data'=>$data]);
    }
}
