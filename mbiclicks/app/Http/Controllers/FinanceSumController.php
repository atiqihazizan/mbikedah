<?php

namespace App\Http\Controllers;

use App\Models\BudgetSum;
use App\Models\System;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FinanceSumController extends Controller
{

    public function index($lay,$type,$yr)
    {
        $table = PREFIX_ACC . $yr;

        $title = 'Ringkasan';
        $sys = System::first();
        $start = (int)$sys->start_yr;
        $curr = (int)$sys->current_yr;

        $yrs = [];
        for($i=$start; $i<$curr+1; $i++){
            if($i==0) break;
            $yrs[] = $i;
        }
        if(!$yrs) $yrs = [YEAR_NOW];

        $data = [];
        $exist = Schema::hasTable($table);
        if($type == 0 && $exist){
            $fnn = DB::table($table)->where('acclvl',1)->get();
            $data['debit'] = $fnn->where('type',1)->all();
            $data['credit'] = $fnn->where('type',2)->all();
        }
        if($lay == 1 && $exist){
            $fnn = DB::table($table)->whereIn('acclvl',[1,2])->where('type',$type)->get();
            $data = buildTree($fnn);
            if($type == 1) $title = 'PENERIMAAN HASIL';
            if($type == 2) $title = 'PERBELANJAAN';
        }
        if($lay == 2 && $exist){
            $fnn = DB::table($table)->where('type',$type)->get();
            $data = buildTree($fnn);
            if($type == 1) $title = 'PENERIMAAN HASIL';
            if($type == 2) $title = 'PERBELANJAAN';
        }

        $yr_selected = $yr;
        return view('account.summary',compact('title','yrs','yr_selected','data','lay','type'));
    }
    public function graph($yr){
        $table = PREFIX_ACC . $yr;
        $data = [];
        $title = 'Carta Pendapatan dan Perbelanjaan';
        $fnn = DB::table($table)->where('acclvl',1)->get();
//        $inc = $fnn->where('type',1)->all();
//        $exp = $fnn->where('type',2)->all();

//        $arr = [
//            ['',[]],
//            ['Sebenar Pendapatan',$inc],
//            ['Sebenar Perbelanjaan',$exp],
//            ['Bajet Pendapatan',[]],
//            ['Bajet Perbelanjaan',[]],
//        ];
//        foreach ($arr as $k => $v){
//            $data[$k] = collect($v[1])->reduce(function($month,$total) use ($v){
//                $month[0] = $v[0];
//                $month[1] += $total->a1;
//                $month[2] += $total->a2;
//                $month[3] += $total->a3;
//                $month[4] += $total->a4;
//                $month[5] += $total->a5;
//                $month[6] += $total->a6;
//                $month[7] += $total->a7;
//                $month[8] += $total->a8;
//                $month[9] += $total->a9;
//                $month[10] += $total->a10;
//                $month[11] += $total->a11;
//                $month[12] += $total->a12;
//                return $month;
//            },[$v[0],0,0,0,0,0,0,0,0,0,0,0,0]);
//        }

//        ['', 'Sebenar Pendapatan', 'Sebenar Perbelanjaan', 'Bajet Pendapatan', 'Bajet Perbelanjaan'],
//            ['JAN',0,0,0,0],

        $def = [
            ['','Sebenar Pendapatan', 'Sebenar Perbelanjaan', 'Bajet Pendapatan', 'Bajet Perbelanjaan'],
            ['JAN',0,0,0,0],
            ['FEB',0,0,0,0],
            ['MAC',0,0,0,0],
            ['APR',0,0,0,0],
            ['MEI',0,0,0,0],
            ['JUN',0,0,0,0],
            ['JUL',0,0,0,0],
            ['OGO',0,0,0,0],
            ['SEP',0,0,0,0],
            ['OKT',0,0,0,0],
            ['NOV',0,0,0,0],
            ['DIS',0,0,0,0],
        ];
        $data = [];
        $data[0] = $def[0];
        for($r = 1; $r<13;$r++){
            if($r > MONTH_NOW) break;
            $data[$r] = $def[$r];
            $data[$r][1] = $fnn->where('type',1)->sum('a'.$r);
            $data[$r][2] = $fnn->where('type',2)->sum('a'.$r);
            $data[$r][3] = $fnn->where('type',1)->sum('b'.$r);
            $data[$r][4] = $fnn->where('type',2)->sum('b'.$r);
        }
        return view('account.graph',compact('title','data'));
    }
}
