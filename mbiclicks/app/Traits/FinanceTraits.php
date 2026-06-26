<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

trait FinanceTraits
{
    private function updateChain($id,$tablename,$mth,$amount){
//        DB::enableQueryLog();
//        $sql = $qry->toSql();
//        $bind = $qry->getBindings();
        $pid = $id;
        $loop = 0;
        while($pid>0){
            if($loop >= 10) break;
            $qry = 'UPDATE '. $tablename .' SET atotal='.$mth.'+'.$amount.','.$mth.'='.$mth.'+'.$amount.',updated_at=NOW() WHERE id = '.$pid;
            Log::info($qry);
            DB::statement($qry);
            $rw  = DB::table($tablename)->where('id',$pid)->first();
            $pid = $rw->pid;
            $loop++;
        }
    }
}
