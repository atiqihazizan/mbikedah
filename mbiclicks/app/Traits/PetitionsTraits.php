<?php

namespace App\Traits;

use App\Models\Asset;
use App\Models\PetitionLog;
use App\Models\Supplier;
use App\Models\System;
// use App\Models\Urusniaga;

trait PetitionsTraits
{
    private function createLogApproval($petition){
        $user = auth()->user();
        $userstaff = $user->staff;
        $petition->stepdt = date('Y-m-d H:i:s');
        $verify = $petition->verified;
        $verify[] = [
            'date'=>date('d-m-Y'),
            'name'=>$userstaff->fullname,
            'unit'=>$petition->stepper->name,
            'step'=>$petition->stepcnt,
            'remark'=>$petition->remark,
            'datetime'=>date('Y-m-d H:i:s')
        ];
        return $verify;
    }
    private function PttLog($petition,$status=0){
//        DB::enableQueryLog();
//        $sql = $qry->toSql();
//        $bind = $qry->getBindings();
        $uid = auth()->id();
        $step = count($petition->routestep??[])-1;
        if($step<0)$step = 0;
        $log = [
            'user_id' => $uid,
            'step'=>$petition->rulestep[$step],
            'pass' => $petition->stepnow,
            'cnt' => $petition->stepcnt,
            'petition_id' => $petition->id,
            'depart_id' => $petition->depart_id,
            'ptype_id' => $petition->ptype_id,
            'psts' => $status,
//            'status'=>LOG_STATUS[$status],
            'remark' => $petition->remark,
            'submit_at'=>$petition->logLatest->created_at??date('Y-m-d H:i:s')
        ];
        PetitionLog::create($log);
    }
    private function PttLogApply($p,$status=0,$step){
        $uid = auth()->user()->id;
        $log = [
            'user_id' => $uid,
            'step'=>$step,//$p->rulestep[0],
            'pass' => 1,
            'cnt' => 1,
            'petition_id' => $p->id,
            'depart_id' => $p->depart_id,
            'ptype_id' => $p->ptype_id,
            'psts' => $status,
//            'status'=>LOG_STATUS[$status],
            'submit_at'=>$p->logLatest->created_at??date('Y-m-d H:i:s')
        ];
        if(isset($p->remark))$log['remark'] = $p->remark;
        PetitionLog::create($log);
    }
    private function submission($petition){
        if($petition->stepcnt >= count($petition->rulestep)){
            $petition->psts = STS_FINISH;
        } else {
            $petition->stepnow = $petition->rulestep[$petition->stepcnt];
            $petition->stepcnt += 1;
            $petition->psts = STS_PROCESS;
        }
        $petition->status = APP_STATUS[$petition->psts];
        $petition->save();
    }
    private function validityForm($valid,&$petition,&$depart){
        $rt = $petition->ptype->code;
        $oBody = $petition->body;
        $user = auth()->user();
        $userstaff = $user->staff;
        $petition->stepdt = date('Y-m-d H:i:s');
        $petition->verified = [ [ 'date'=>date('d-m-Y'), 'name'=>$userstaff->fullname, 'jawatan'=>$userstaff->position->name,'step'=>1 ] ];

        if($rt == 'bayaran') {
            if($supp = Supplier::find($oBody->payto??0)) $oBody->recepient = $supp->name;
            // if($un = Urusniaga::find($oBody->urusniaga??0)){
            //     $oBody->unkod = $un->code;
            //     $oBody->untext = $un->uitem;
            // }

            $valid->after(function($v) use ($petition,$oBody){
                if(!$oBody->payto??0)$v->errors()->add('payto','Pembekal diperlukan');
                // if(!$oBody->urusniaga??0)$v->errors()->add('urusniaga','Jenis Urusniaga diperlukan');
                if(!$petition->plist || $petition->plist == '[]') $v->errors()->add('details','Butiran diperlukan sekurang-kurangnya 1 rekod');
            });
            $petition->body = $oBody;
            $prule = $petition->rulestep;

            $sys = System::first();
            $sysrule = $sys->amtseq;

            /* $prule[3] = $sysrule[1][1]; // kurang dari pada 10k
            if($petition->tamt >= $sysrule[0]) {
                $prule[3] = $sysrule[1][0];
                array_splice($prule, 3, 0, ENDORSE_KKW);
            } */
            $petition->rulestep = $prule;
        }
        if($rt == 'timeoff') {
            $valid->after(function($v) use ($oBody) {
                $t1 = explode(':', $oBody->tout);
                $t2 = explode(':', $oBody->tin);
                $diff = (int)$t2[0] - (int)$t1[0];
                if($diff <= 0) $v->errors()->add('counthour','Jumlah waktu tidak boleh kosong');
            });
        }
        if($rt == 'cuti') {
            $valid->after(function($v) use ($oBody){
                $d1 = strtotime($oBody->dtout);
                $d2 = strtotime($oBody->dtback);
                $dys = $d2-$d1;
                if($dys == 0) $dys = 1;
                if($dys < 1) $v->errors()->add('num','Bilangan hari tidak boleh kosong');
            });
        }
        if($rt == 'tripclaim'){
            $valid->after(function($v) use ($oBody){
                if(!isset($oBody->taskdetail)) $v->errors()->add('chktaskdaily','Butiran kerja diperlukan');
                if(!isset($oBody->claim)) $v->errors()->add('chkclaimempty','Butiran tuntutan tidak lengkap');
                //if(!$oBody->totalamt) $v->errors()->add('totalamt','Jumlah diperlukan');
            });
        }
        if($rt == 'perjalanan'){
            $valid->after(function($v) use ($oBody){
               if(!$oBody->num) $v->errors()->add('countday','Bilangan hari tidak boleh kosong');
               if(!$oBody->location) $v->errors()->add('location','Lokasi diperlukan');
               if(!$oBody->addr) $v->errors()->add('addr','Alamat atau tempat berurusan diperlukan');
            });
            // default rule step
            $ptyp = $petition->ptype;
            $astep = $ptyp->seq1;
            if(in_array(ENDORSE_KJ,$user->ustep)) $astep = $ptyp->seq2;

            if(isset($oBody->vehicle)){
                // add rulestep bila request vehicle
                $pos = 2;
                array_splice($astep,$pos,0,ENDORSE_VHCL);
                $astep[] = RETURN_CAR;
                $astep[] = ENDORSE_VHCL;

                $carid = $oBody->car->id;
                $ast = Asset::find($carid);
                $oBody->car->model = $ast->model;
                $oBody->car->regno = $ast->regno;
                $oBody->car->text = $ast->model . '-' . $ast->regno;
                $petition->body = $oBody;
            }
            // set rule dalam petition
            $petition->rulestep = $astep;
        }
        if($rt == 'benefit'){
            $valid->after(function($v) use ($oBody) {
                if(!($oBody->treatment??false)) $v->errors()->add('treatment','Perlu pilih sekurangnya satu jenis');
            });
        }
    }

}
