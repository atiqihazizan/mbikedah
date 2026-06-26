<?php

namespace App\Http\Controllers\endorsements;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Petition;
use App\Models\PetitionLog;
use App\Models\BankMaster;
use App\Models\Supplier;
use App\Traits\PetitionsTraits;
use App\Traits\EndorsementTraits;

class FinanceController extends Controller
{
    use EndorsementTraits;
    use PetitionsTraits;

    public function budgetremider(){
        $usr = \auth()->user();
        $ustep = $usr->ustep;
        $msg = [];
        if(in_array(ENDORSE_PKW,$ustep)){
            if(!Schema::hasTable(PREFIX_ACC.YEAR_NOW)) $msg[] ='Bajet tahunan belum dibuka';
            if(BankMaster::where('amt',0)->count() > 0) $msg[] ='Maklumat jumlah bank tidak lengkap';
        }
        return response()->json(['count'=>count($msg),'message'=>$msg]);
    }
    public function plistupdate(Request $request,Petition $petition){
        $petition->plist = $request->plist;
        if(isset($request->payment)){
            $body = $petition->body;
            $plist = json_decode($request->plist);
            $total = 0;
            foreach ($plist as $l){
                $total += $l->total;
            }
            unset($body->totalamt);
            $body->total = $total;
            $petition->tamt = $total;
            $petition->body = $body;
        }
        $petition->save();
        return response()->json(['success'=>'ok','list'=>$petition->plist,'stepper'=>$petition->stepper],200);
    }
    public function datapending(){
        $data = [];
        $user = auth()->user();
        $ustep = $user->ustep;
        $ky = array_search(RETURN_CAR,$ustep);
        if($ky !== false)unset($ustep[$ky]);
        $arr = Petition::with('ptype:id,name','stepper:id,name','depart:id,name')
            ->whereIn('stepnow',$ustep)
            ->whereIn('psts',[2])
            ->get(['slug','stepnow','depart_id','stepdt','ptype_id','body','tamt']);
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
            
        $row = [];
        foreach ($data as $d) {
            $pt = $d->petition;
            if($d->psts == LOGSTS_RETURN && $pt->psts == 2) continue;
            $d->body = $pt->body;
            $d->pdt = $pt->pdt;
            $d->slug = $pt->slug;
            $d->stepdt = $pt->stepdt;
            $d->tamt = $pt->tamt;
            $d->status = -1;
            if($d->psts === LOGSTS_VERIFIED) $d->status = 1;
            if($d->psts === LOGSTS_REJECTED) $d->status = 2;
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
        
        // if($petition->stepnow === ENDORSE_PKW) $data['finacecheck'] = view('endorsement.financecheck',compact('petition','body'))->render();
        if($petition->psts == 2 && in_array($petition->stepnow,$user->ustep)) {
            $data['html']='';
            $data['title'] = $stepper->description;
            $data = $this->petitionView($petition);
    
            $logsts = LOGSTS_DISP[$petition->pcate];
            $status = [ ['value'=>LOGSTS_VERIFIED,'text'=>$logsts[LOGSTS_VERIFIED]] ];
            $status[] = ['value'=>LOGSTS_REJECTED,'text'=>$logsts[LOGSTS_REJECTED]];
            // $status[] = ['value'=>LOGSTS_RETURN,'text'=>$logsts[LOGSTS_RETURN]];
    
            if(in_array($petition->stepnow, [ENDORSE_PKW]) ) $status[0] = ['value' => LOGSTS_CHECKED, 'text' => $logsts[LOGSTS_CHECKED] ];
            if(in_array($petition->stepnow, [ENDORSE_KKW,ENDORSE_CEO]) ) $status[0] = ['value' => LOGSTS_APPROVED, 'text' => $logsts[LOGSTS_APPROVED] ];
            if(in_array($petition->stepnow, [ENDORSE_PAY])) $status = [['value' => LOGSTS_COMPLETED, 'text' => 'Pengesahan Bayaran' ]];


            $data['html'] = view('endorsement._signature',compact('stepper','ptyp','petition','status','body'))->render();

            if($petition->pcate == 1 && $petition->stepnow == ENDORSE_PKW){
                if(!Schema::hasTable(PREFIX_ACC.YEAR_NOW)) return response()->json(['error'=>404,'message'=>'Bajet tahunan belum dibuka']);
            }
            $data['credits'] = $body->credits??[];
        } else {
            $data['data'] = $petition;

            $pdata = (object) $petition->only('pcode','pdt','tamt');
            $staff = $petition->staff;
            $depart = $petition->depart;
            $verify = $petition->verified;
            $list = $petition->plist;
            $data['preview'] = view('preview.bayaran', compact('pdata', 'staff', 'depart', 'body', 'verify', 'list'))->render();
        }
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

        $data['staff']['position'] = $petition->position->name;
        $data['staff']['depart'] = $petition->depart->name;
        
        $body = $petition->body;
        $ptt = collect($body);
        $ptt['pdt'] = $petition->pdt;
        $data['data'] = $ptt;
        $data['list'] = $petition->plist;
        $data['attach'] = $petition->attachment;

        // $temp = $this->templateView($ptyp->tmpl,$petition,$view);

        // $aPett[] = (object)['label'=>'Tarikh Permohonan','value'=>$ptt->pdt];
        // if($ptt->typlv>0) $aPett[] = (object)['label'=>'Jenis Pelepasan/Cuti','value'=>$petition->lvtype->leave];
        // $pett = array_merge($aPett,$temp['html']);
        // $data['html'] = view('approval.partial._petition',compact('ptyp','ptt','body','pett','alwn'))->render();

        $finance_auth = [ENDORSE_PKW,ENDORSE_KKW,ENDORSE_PAY,ENDORSE_CEO,ENDORSE_VFY];
        $finance_allow = false;
        foreach ($finance_auth as $a){if(in_array($a,auth()->user()->ustep)) $finance_allow = true;}

        return $data;
    }
    public function addcredit(Petition $petition, Request $request){
        $amtreq = $petition->tamt;
        $body = $petition->body;
        $idbank = (int)$request->idbank;
        $amount = (float)$request->amt;
        $bank = BankMaster::find($idbank);
        $text = $bank->name;
        $credits = collect();

        if($bank->accno) $text .= ' - '.$bank->accno;
        if(isset($body->credits)) {
            $credits = collect($body->credits);
            $isExist = $credits->contains('bankid', $idbank);
            if ( $isExist ) return response()->json([ 'error' => 404, 'message' => 'Akaun kredit sudah digunakan' ]);
        }

        $credits->push([ 'text'=>$text, 'bankid'=>$idbank, 'currbal'=>$bank->amt, 'total'=>$amount]);
        $sum = $credits->pluck('total')->sum();
        if($sum > $amtreq) return response()->json(['error'=>404,'message'=>'Jumlah telah melebihi']);

        $body->credits = $credits->all();
        $body->creditverified = $sum;
        // $petition->body = $body;
        // $petition->save();
        return response()->json(['success'=>200,'data'=>$credits->first()]);
    }
}
