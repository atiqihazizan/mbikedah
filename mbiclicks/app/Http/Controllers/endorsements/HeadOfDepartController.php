<?php

namespace App\Http\Controllers\endorsements;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Petition;
use App\Models\PetitionLog;
use App\Traits\PetitionsTraits;
use App\Traits\EndorsementTraits;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class HeadOfDepartController extends Controller
{
    use EndorsementTraits;
    use PetitionsTraits;

    public function datapending(){
        $data = [];
        $user = auth()->user();
        $ustep = $user->ustep;
        $ky = array_search(RETURN_CAR,$ustep);
        if($ky !== false)unset($ustep[$ky]);
        $arr = Petition::with('ptype:id,name','stepper:id,name','depart:id,name','staff:id,fullname')
            ->where('depart_id',$user->depart_id)
            ->whereIn('stepnow',$ustep)
            ->whereIn('psts',[2])
            ->get(['slug','stepnow','depart_id','stepdt','ptype_id','body','staff_id','psts']);
        foreach ($arr as $a){
            if($a->stepnow == 2 && $user->depart_id !== $a->depart_id) continue;
            $a->status = 0;
            $data[] = $a;
        }
        return response()->json(['data'=>$data]);
    }
    public function datahistory(){
        DB::enableQueryLog();
        $uid = auth()->id();
        $data = PetitionLog::with('staff:staff_id,fullname','ptype:id,name','petition')
            ->where('user_id',$uid)
            ->where('psts','>',LOGSTS_SUBMITED)
            ->orderByDesc('id')
            ->get()
            ->unique('petition_id');
       //$data = $data->toSql();
        $row = [];
        foreach ($data as $d) {
            $pt = $d->petition;
            if($d->psts == LOGSTS_RETURN && $pt->psts == 2) continue;
            $d->body = $pt->body;
            $d->pdt = $pt->pdt;
            $d->slug = $pt->slug;
            $d->status = -1;
            if($d->psts === LOGSTS_VERIFIED) $d->status = 1;
            if($d->psts === LOGSTS_REJECTED) $d->status = 2;
            if($d->psts === LOGSTS_RETURN) $d->status = 3;
            unset($d->petition);
            $row[] = $d;
        }
        return response()->json(['data' => $row ]);
    }
    public function show(Petition $petition){
        $stepper = $petition->stepper;
        $ptyp = $petition->ptype;
        $act = $stepper->act; // action 1:edit 2:del 3:approv/verify 4:return 5:reject 6:print and approve
        $body = $petition->body;
        $user = auth()->user();
        $uid = $user->id;
        
        $data = $this->petitionView($petition);
        $data['html']='';
        $data['title'] = $stepper->description;

        // prevent if not equal department
        if($petition->depart_id != $user->depart_id) return response()->json($data);
        
        // module untuk sign
        $all = [1,2,3,4,5];
        $view = array_intersect($act,$all);
        if(in_array($petition->stepnow,$user->ustep) && count($view) > 0) {
            $logsts = LOGSTS_DISP[$petition->pcate];
            $status = [ ['value'=>LOGSTS_VERIFIED,'text'=>$logsts[LOGSTS_VERIFIED]] ];
            $status[] = ['value'=>LOGSTS_REJECTED,'text'=>$logsts[LOGSTS_REJECTED]];
            $status[] = ['value'=>LOGSTS_RETURN,'text'=>$logsts[LOGSTS_RETURN]];
            $data['html'] = view('endorsement._signature',compact('stepper','ptyp','petition','status','body'))->render();
        }

        // Reject | Return
        if(in_array($petition->psts,[STS_REJECT,STS_RETURN])){
            $status = '';
            $ulasan = '';
            $logPt = PetitionLog::with('staff:staff_id,fullname','ptype:id,name','petition')
                ->where('user_id',$uid)
                ->where('petition_id',$petition->id)
                ->first();
            $ulasan = $logPt->remark;
            $step = $logPt->step;
            $credits = $body->credits??[];

            if($logPt->psts == LOGSTS_REJECTED) $status = '<span class="badge badge-danger badge-lg">PERMOHONAN DITOLAK</span>';
            if($logPt->psts == LOGSTS_RETURN) $status = '<span class="badge badge-info badge-lg">PERMOHONAN DIKEMBALIKAN</span>';
            $data['ptsts'] = $status;
            $data['html'] = view('endorsement._status',compact('ulasan','step','credits'))->render();
        } 
        // Verified | Approved | Checked
        else if (!in_array($petition->stepnow,$user->ustep)) {
            $status = '';
            $ulasan = '';
            $logPt = PetitionLog::with('staff:staff_id,fullname','ptype:id,name','petition')
                ->where('user_id',$uid)
                ->where('petition_id',$petition->id)
                ->first();
            $ulasan = $logPt->remark;
            $step = $logPt->step;
            $credits = $body->credits??[];

            if($logPt->psts == LOGSTS_VERIFIED) $status = '<span class="badge badge-primary badge-lg">PERMOHONAN DISAHKAN</span>';
            $data['ptsts'] = $status;
            $data['html'] = view('endorsement._status',compact('ulasan','step','credits'))->render();
        }

        $data['credits'] = $body->credits??[];
        return response()->json($data);
    }
    private function petitionView($petition,$view = 0){
        $body = $petition->body;
        $ptyp = $petition->ptype;
        $stepper = $petition->stepper;

        $data = [
            'staff'=>collect($petition->staff)->only('fullname','staffno','email','avatar')->all(),
            'ptype'=> collect($ptyp)->only('code','name')->all(),
            'stepper'=> collect($stepper)->only('id','code','name','todo')->all(),
        ];

        $data['attach'] = $petition->attachment;
        $data['staff']['position'] = $petition->position->name;
        $data['staff']['depart'] = $petition->depart->name;
        
        $body = $petition->body;
        $ptt = collect($body);
        $ptt['pdt'] = $petition->pdt;
        $data['data'] = $ptt;
        $data['list'] = $petition->plist;
        return $data;
    }
}
