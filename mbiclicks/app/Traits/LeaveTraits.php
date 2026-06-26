<?php

namespace App\Traits;

use App\Models\PosLeave;
use App\Models\StaffLeave;

trait LeaveTraits
{
    /*private function newEntitlement($s){
        $p = $s->position;
        $l = $p->lvsrvc1; // basic leave
        $id = $s->id;
        $srvc = $s->service_cnt;

        if($srvc >= 5){
            $l = $p->lvsrvc3; // max leave
        } else if($srvc >= 2){
            $l = $p->lvsrvc2; // middle leave
        }

        $plv = PosLeave::with('type')->where('lvcate',$l)->get();
        $slv = [];
        foreach($plv as $lv){
            $slv[] = [
                'staff_id' => $id,
                'yr' => YEAR_NOW,
                'leaves_id' => $lv->type->id,
                'limit' => $lv->counter,
                'ctype' => $lv->type->ctype,
                'refid' => $lv->type->refid,
                'typ' => $lv->type->typ,
            ];
        }
        if(count($slv)>0) {
            StaffLeave::upsert($slv, [ 'staff_id', 'yr', 'leaves_id', 'limit', 'type' ]);
            $s->lvyr = YEAR_NOW;
            $s->lvsts = 0;
            $s->save();
        }
        return $s;
    }*/
}
