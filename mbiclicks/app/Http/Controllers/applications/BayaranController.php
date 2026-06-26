<?php

namespace App\Http\Controllers\applications;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Traits\PreviewTraits;
use App\Traits\PetitionsTraits;
use App\Models\Petition;
use App\Models\Supplier;
use App\Models\BudgetSum;
use App\Models\FinanceAcc;
use App\Models\PetitionLog;
use App\Models\Stepper;
use App\Models\System;
use App\Models\Depart;
use App\Models\Ptype;
use App\Models\Staff;
use Carbon\Carbon;
use Faker\Factory;

class BayaranController extends Controller
{
    use PetitionsTraits;
    use PreviewTraits;

    public function index(){
        $sup = Supplier::select(['id','name as text'])->get();
        if(Schema::hasTable(PREFIX_ACC.YEAR_NOW)) {
            $budYr = BudgetSum::with('children');
        } else {
            $budYr = FinanceAcc::with('children');
        }
        $bud = $budYr->where('pid','>',0)->orderBy('code','asc')->get(['id',DB::raw("CONCAT(code,'-',name) as text"),'name','code']);
        return view('application.bayaran.index',['title'=>'Permohonan Bayaran','suppliers'=>$sup,'budgets'=>$bud]);
    }

    public function create(){}

    public function store(Request $request){
        $body = $request->body;
        $auth = auth();
        $authid = $auth->id();
        $user = $auth->user();
        $staffId = $user->staff_id;
        $ptypeId = 1;
        $ptyp = Ptype::find($ptypeId);
        $validator = Validator::make($request->all(), [
            'pdate' => 'required',
        ], [
            'pdate.required' => 'Tarikh diperlukan',
        ]);

        if($validator->fails()) return response()->json(['error'=>$validator->errors()]);

        $staf = Staff::find($staffId);
        $faker = Factory::create('ms_MY');
        $slug = bcrypt($faker->sentence(10));
        $slug = str_replace('/','',$slug);
        $newdata = $request->all();

        if(isset($request->tamt)) {
            $newdata['tamt'] = $request->tamt;
            $body['total'] = number_format($request->tamt,2);
        }

        $newdata['staff_id'] = $staffId;
        $newdata['ptype_id'] = $ptypeId;//bayaran
        $newdata['created_id'] = $authid;// $auth->staff_id;
        $newdata['depart_id'] = $staf->depart_id;// $auth->staff_id;
        $newdata['slug'] = $slug;
        $newdata['pcate'] = (int)$ptyp->cate;
        $newdata['psts'] = 1;
        $newdata['pdate'] = Carbon::parse($request->pdate)->format('Y-m-d');
        $newdata['body'] = $body;
        $newdata['plist'] = $request->plist;
        $newdata['routestep'] = [];

        // create array stepper
        $astep = $ptyp->seq1;
        if(in_array(ENDORSE_KJ,$user->ustep)) $astep = $ptyp->seq2;
        $newdata['rulestep'] = $astep;
        $newdata['stepnow'] = $astep[0];
        $newdata['stepcnt'] = 1;
        $p = Petition::create($newdata);

        $this->PttLogApply($p,LOGSTS_APPLY,$p->rulestep[0]);
        return response()->json(['success'=>'ok','slug'=>$p->slug]);
    }

    public function show(Petition $bayaran){
        $auth = auth();
        $authid = $auth->id();
        $data = [ 'title'=>'Papar Permohonan' ];
        $data['status'] = Stepper::find($bayaran->stepnow)->name;
        $data['attach'] = $bayaran->attachment;
        $data['petition'] = $bayaran->getAttributes();
        $log = PetitionLog::with('petition:id,pcate','stepper')
            ->where('petition_id',$bayaran->id)
            ->get(['id','user_id','petition_id','depart_id','ptype_id','step','pass','cnt','psts','remark','status','created_at']);
        /* $log[] = [
            'id'=>0,
            'user_id'=>$authid,
            'petition_id'=>0,
            'created_at'=>null,
        ]; */
        $dataLog = [];
        foreach($log as $k=>$l){
            if($k === 0) continue;
            $typ = 0;
            $stepdesc = $l->stepper->description;
            if($l->psts == LOGSTS_REJECTED) {
                $typ = LOGSTS_REJECTED;
                $stepdesc = $l->stepTo->name;
            }
            $dataLog[] = (object)[
                'status'=>LOG_STATUS[$l->psts],
                'stepper'=>$stepdesc,
                'date'=>\Carbon\Carbon::parse($l->created_at)->format('d M Y h:i A'),
                'remark'=>$l->remark,
                'type'=>$typ
            ];
        }
        
        if($bayaran->psts == STS_PROCESS){
            $dataLog[] = (object)[
                'status'=> 'SEDANG DIPROSESS',
                'stepper'=> Stepper::find($bayaran->stepnow)->name,
                'date'=>'',
                'remark'=>'',
                'type'=>1
            ];
        }
        // return response()->json($dataLog);

        $data['log'] = view('application.bayaran._timeline',compact('dataLog'))->render();
        return response()->json($data);
    }

    public function edit(Petition $bayaran){
        // if($bayaran->created_id != auth()->id()) return redirect('/home');
        // $ptype = $bayaran->ptype;
        // $body = $bayaran->body;
        // $plist = $bayaran->plist;
        $data = [ 'title'=>'Edit Permohonan', 'petition' => $bayaran->getAttributes(), ];
        return response()->json($data);
    }

    public function update(Request $request, Petition $bayaran){
        // proses untuk kemaskini dan submit
        $valid = Validator::make($request->all(), [],[]);
        $bayaran->pdate = $request->pdate;
        $bayaran->body = $request->body;
        $bayaran->plist = $request->plist;

        if(isset($request->tamt)) {
            $bayaran->tamt = $request->tamt;
            $body = $bayaran->body;
            $body->total = number_format($request->tamt,2);
            $bayaran->body = $body;
        }

        if ($valid->fails()) return response()->json(['error'=>$valid->errors()]);
        $bayaran->save();
        return response()->json(['success'=>'Kemaskini berjaya','slug'=>$bayaran->slug]);
    }

    public function destroy(Petition $bayaran)
    {
        $id = $bayaran->id;
        PetitionLog::where('petition_id',$id)->delete();
        $bayaran->delete();
        return response()->json(['success'=>'ok']);
    }

    public function getall(Request $request){
        DB::enableQueryLog();

        $offset = $request->start??0;
        $limit = $request->length??7; // row display per pages
        $draw = $request->draw;
        $search = $request->search['value']??'';
        $filter = ['code','like',$search.'%'];

        $peti = Petition::with('ptype:id,name,code','stepper')
            ->where('created_id',auth()->id())
            ->whereIn('psts',[STS_APPLY,STS_PROCESS,STS_RETURN])
            ->orWhereJsonContains('grpstaff',auth()->id())
            ->orderBy('pdate','desc')
            ->orderBy('psts','asc')
            ->orderBy('id','desc')
            ->offset($offset)->limit($limit)
            ->get(['id','pdate','stepdt','psts','tamt','stepnow','slug','plist','body','created_id','remark']);

        $data = [];
        // re-array untuk custom kes yang rumit
        foreach ($peti as $a){
            $data[] = $a;
        }

        $totalRecords = $totalDisplay = count($data);
        $result = [
            'recordsTotal'    => $totalRecords,
            'recordsFiltered' => $totalDisplay,
            'data'            => $data,
        ];

        return response()->json($result);
    }
    public function history(Request $request){
        DB::enableQueryLog();

        $offset = $request->start??0;
        $limit = $request->length??7; // row display per pages
        $draw = $request->draw;
        $search = $request->search['value']??'';
        $filter = ['code','like',$search.'%'];

        $data = Petition::with('ptype:id,name,code')
            ->where('created_id',auth()->id())
            ->whereNotIn('psts',[STS_APPLY,STS_PROCESS,STS_RETURN])
            ->orWhereJsonContains('grpstaff',auth()->id())
            ->orderBy('pdate','desc')
            ->orderBy('psts','asc')
            ->orderBy('id','desc')
            ->offset($offset)->limit($limit)
            ->get(['id','pdate','stepdt','psts','tamt','stepnow','slug','plist','body','created_id','remark']);

        $totalRecords = $totalDisplay = count($data);
        $result = [
            'recordsTotal'    => $totalRecords,
            'recordsFiltered' => $totalDisplay,
            'data'            => $data,
        ];

        return response()->json($result);
    }

    public function submit(Petition $petition,Request $request){
        $valid = Validator::make([],[],[]);
        // validation parts
        $oBody = $petition->body;
        $user = auth()->user();
        $userstaff = $user->staff;
        $petition->stepdt = date('Y-m-d H:i:s');
        $petition->verified = [ [ 'date'=>date('d-m-Y'), 'name'=>$userstaff->fullname, 'jawatan'=>$userstaff->position->name,'step'=>1 ] ];

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
        // end validation parts
        if ($valid->fails()) return response()->json(['error'=>$valid->errors()]);
        try {
            // petition code
            $oBody = $petition->body;
            $depart = Depart::find($petition->depart_id);
            if($petition->pcate == 1){
                $cnt = $depart->fseq + 1;
                $depart->fseq = $cnt;
                $runno = $depart->fhead;
            } else {
                $cnt = $depart->hseq + 1;
                $depart->hseq = $cnt;
                $runno = $depart->hhead;
            }
            $depart->save();
            $oBody->siri = $runno.str_pad($cnt,4,0,STR_PAD_LEFT);;
            $petition->body = $oBody;
            $petition->pcode = $oBody->siri;
            $petition->psts = STS_PROCESS;

            $arr = $petition->routestep;
            $arr[] = auth()->user()->id;;
            $petition->routestep = $arr;
            $petition->remark = '';

            $this->submission($petition);
            $this->PttLog($petition,LOGSTS_SUBMITED);
            return response()->json(['success'=>'ok','message'=>'Penyerahan permohonan berjaya']);
        } catch (\Exception $e){
            return response()->json(['error'=>'submission failed','message'=>$e->getMessage()]);
        }
    }
}
