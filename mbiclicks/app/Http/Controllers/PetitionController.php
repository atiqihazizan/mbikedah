<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Depart;
use App\Models\Leave;
use App\Models\PetitionLog;
use App\Models\PosAllowance;
use App\Models\Staff;
use App\Traits\AllowanceTraits;
use App\Traits\PreviewTraits;
use Carbon\Carbon;
use Faker\Factory;
use App\Models\Ptype;
use App\Models\Petition;
use App\Models\Supplier;
// use App\Models\Urusniaga;
use App\Models\StaffLeave;
use Illuminate\Http\Request;
use App\Traits\PetitionsTraits;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PetitionController extends Controller
{
    use PetitionsTraits;
    use PreviewTraits;
    use AllowanceTraits;

    public function index()
    {
        $title='Permohonan';
        $titlebar='Permohonan';
        return view('application.index',compact('title'));
        /* $pty = Ptype::where('shw',1)->get(['name','code','lvtyp','name','id']);
        $menu = '';
        $pleave = [];
        foreach ($pty as $p){
            if($p->lvtyp != NULL) $pleave[$p->code] = $p;
            $menu .= '<div class="menu-item px-3"><a href="#" class="menu-link px-3" kt-button-new-action="'.$p->id.'">'.$p->name.'</a></div>';
        }
        $needclaim = Petition::where('created_id',auth()->id())
            ->orWhereJsonContains('grpstaff',auth()->id())
            ->where('needclaim',1)
            ->count();
        return view('application.index',compact('title','titlebar','pleave','menu','needclaim')); */
    }
    public function create(Request $request) {
        $ptype = Ptype::find($request->ptype);
        // $urusn = Urusniaga::all();
        $staff = auth()->user()->staff;

        $body = [];
        $petition = [];
        $plist = [];
        $vhcl = Asset::where('cate','kereta')->where('staff_id',0)->orWhere('staff_id',$staff->staff_id)->get();
        $data['html'] = view('application.modal._form',compact('ptype','body','petition','plist','vhcl'))->render();
        $data['type'] = $ptype;
        $data['js'] = $ptype->code;
        return response()->json($data);
    }
    public function store(Request $request){
        $body = $request->body;
        $auth = auth();
        $authid = $auth->id();
        $user = $auth->user();
        $ptyp = Ptype::find($request->ptype_id);
        $validator = Validator::make($request->all(), [
            'pdate' => 'required',
            'staff_id' => 'required',
            'ptype_id' => 'required'
        ], [
            'pdate.required' => 'Tarikh diperlukan',
            'staff_id.required' => 'Pemohon diperlukan',
            'ptype_id.required' => 'Jenis permohonan diperlukan',
        ]);

        $validator->after(function($v) use($request){
            $body = $request['body'];
            if(isset($body['vehicle'])){
                if(!isset($body['car']['id'])) $v->errors()->add('vehicle','Kenderaan diperlukan');
            }
        });


        if($validator->fails()) return response()->json(['error'=>$validator->errors()]);

        $staf = Staff::find($request->staff_id);
        $faker = Factory::create('ms_MY');
        $slug = bcrypt($faker->sentence(10));
        $slug = str_replace('/','',$slug);
        $newdata = $request->all();

        if(isset($request->typlv))$newdata['typlv'] = $request->typlv;
        if(isset($request->tamt)) {
            $newdata['tamt'] = $request->tamt;
            $body['total'] = number_format($request->tamt,2);
        }

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
        return response()->json(['success'=>'ok','id'=>$p->slug]);
    }
    public function show(Petition $petition)
    {
        $log = $petition->log;
        $template = $this->petitionView($petition);
        $data['html'] = view('approval.partial._indicator',compact('petition'));
        $data['html'] .= $template['html'];
        $data['html'] .= view('approval.partial._log',compact('log'));
        if($petition->stepnow == RETURN_CAR && $petition->psts == STS_PROCESS) {
            if(isset($petition->body->car)){
                $body = $petition->body;
                $car = $body->car;
                unset($body->car);
                $data['verify'] = view('approval.partial._return_car',compact('body','car'))->render();
                $data['html'] .= '<button type="button" class="btn btn-primary w-100 btn-return-car mb-3">Penyerahan Kunci Kenderaan</button>';
            }
        } else if($petition->needclaim && $petition->psts == STS_FINISH) $data['html'] .= '<button type="button" class="btn btn-primary w-100 btn-trip-claim mb-3">Tuntutan Perjalanan</button>';
        return response()->json($data);
    }
    public function edit(Petition $petition)
    {
        if($petition->created_id != auth()->id()) return redirect('/home');
        $ptype = $petition->ptype;
        $body = $petition->body;
        $plist = $petition->plist;

        $data = [ 'title'=>'Edit Permohonan', 'petition' => $petition->getAttributes(), ];
        $alwcate = $petition->position->alwcate;

        $d = PosAllowance::where('alwcate',$alwcate)->get();
        $data['byposition'] = aData($d,'aid');

        $t = Ptype::where('refid',$petition->ptype->id)->first();
        if($t){ // kalau data exist
            $id = $t->id;
            // cari petition yang belum lagi claim
            $p = Petition::where('ptype_id',$id)->where('psts',3)->where('claimid',0)->get();
            $data['trip'] = $p->toArray();
        }
        // permohonan bayaran
        $urusn = [];
        //
        $optclient = ['id'=>0,'name'=>''];
        if(isset($body->payto)){
            $client = Supplier::find($body->payto);
            $optclient = ['id'=>$client->id,'name'=>$client->name];
        }
        $vhcl = [];
        if(isset($body->car)) $vhcl = Asset::where('cate','kereta')->where('staff_id',0)->orWhere('staff_id',$petition->staff_id)->get();
        // tuntutan perjalanan
        $alwn = [];
        if($petition->ptype->id == 5) $alwn = $this->alwnList();
        $data['client'] = $optclient;
        $data['html'] = view('application.modal._form',compact('ptype','body','plist','petition','vhcl','alwn','optclient'))->render();
        $data['type'] = $ptype;
        $data['js'] = $ptype->code;
        $data['slug'] = $petition->slug;
        return response()->json($data);
    }
    public function update(Request $request, Petition $petition)
    {
        // avoid bila dh submit
        if(!in_array($petition->psts,[STS_APPLY,STS_RETURN])) return response()->json(['error'=>'Permohonan sudah dihantar, tidak boleh edit lagi','id'=>$petition->slug]);

        // proses untuk kemaskini dan submit
        $valid = Validator::make($request->all(), [],[]);
        $petition->pdate = $request->pdate;
        $petition->body = $request->body;
        $petition->plist = $request->plist;

        if(isset($request->tamt)) {
            $petition->tamt = $request->tamt;
            $body = $petition->body;
            $body->total = number_format($request->tamt,2);
            $petition->body = $body;
        }

        if($petition->pcate == 2 && !is_null($petition->ptype->lvtyp)){
            $valid->after(function($v) use ($petition,$request){
                if(!isset($request->typlv)) $v->errors()->add('typlv','Jenis pelepasan diperlukan');
            });
        }

        if ($valid->fails()) return response()->json(['error'=>$valid->errors()]);

        // jika leave type exist
        if(isset($request->typlv)){
            $petition->typlv = $request->typlv;
            $lv = Leave::find($request->typlv);
            if($lv){
                if($lv->count()>0){
                    $slv = StaffLeave::where([['staff_id',$petition->staff_id],['yr',YEAR_NOW],['leaves_id',$lv->id]])->first();
                    if($slv){
                        $rlv = StaffLeave::where([['staff_id',$petition->staff_id],['yr',YEAR_NOW],['leaves_id',$lv->refid]])->first();
                        $petition->slvid = $slv->id;
                        $petition->typlv = $lv->id;
                        if(!is_null($rlv)) $petition->lvref = $rlv->id;
                        $petition->lvsts = $lv->ctype;
                        if(isset($petition->body->num)) $petition->taken = $petition->body->num;
                        if(isset($petition->body->totalamt)) $petition->taken = $petition->body->totalamt;
                    }
                }
            }
        }

        $petition->save();
        return response()->json(['success'=>'Kemaskini berjaya','id'=>$petition->slug]);
    }
    public function destroy(Petition $petition)
    {
        $id = $petition->id;
        $petition->delete();
        PetitionLog::where('petition_id',$id)->delete();
        // release balik id yg dituntut
        Petition::where('claimid',$id)->update(['claimid'=>0]);
        return response()->json(['success'=>'ok']);
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
    public function submit(Petition $petition,Request $request){
        $valid = Validator::make([],[],[]);
            //        if(isset($request->body['taskdetail']) && isset($request->body['claim'])) $petition->body = $request->body;
            //        return response()->json(['error'=>404,'message'=>$petition->body]); // debug purpose only

            //        if(isset($request->plist)) $petition->plist = $request->plist;
        $this->validityForm($valid,$petition,$depart);
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
    public function claim(Petition $petition, Request $request){
        $auth = auth();
        $user = $auth->user();

        $faker = Factory::create('ms_MY');
        $slug = bcrypt($faker->sentence(10));
        $slug = str_replace('/','',$slug);

        $ptype = $petition->ptype;
        $ptyp = Ptype::find($ptype->refid);

        $newPett = $petition->replicate(['routestep','verified','remark','pcode','stepdt','claimid','needclaim']);
        $newPett->created_at = Carbon::now();
        $newPett->slug = $slug;
        $newPett->ptype_id = $ptyp->id;
        $newPett->pcate = $ptyp->cate;
        $newPett->psts = 1;
        $newPett->pdate = Carbon::now()->format('Y-m-d');
        $body = $newPett->body;
        $body->kepeluan = $newPett->plist; // data plist akan dimasukkan ke body menjadi sebagai properti 'keperluan'
        $newPett->plist = null; // clear balik field plist
        $newPett->body = $body;
        $newPett->claimid = $petition->id;

        $astep = $ptyp->seq1;
        if(in_array(2,$user->ustep)) $astep = $ptyp->seq2;
        $newPett->rulestep = $astep;
        $newPett->stepnow = $astep[0];
        $newPett->stepcnt = 1;
        $newPett->save();
        $this->PttLogApply($newPett,LOGSTS_APPLY,$newPett->rulestep[0]);

        $petition->needclaim = false;
        $petition->save();

        return redirect()->route('petition.edit',['petition'=>$slug]);
    }
    public function getall(Request $request){
        DB::enableQueryLog();

        $offset = $request->start??0;
        $limit = $request->length??7; // row display per pages
        $draw = $request->draw;
        $search = $request->search['value']??'';
        $filter = ['code','like',$search.'%'];

        $data = Petition::with('ptype:id,name,code','stepper')
            ->where('created_id',auth()->id())
            ->orWhereJsonContains('grpstaff',auth()->id())
            ->orderBy('pdate','desc')
            ->orderBy('psts','asc')
            ->orderBy('id','desc')
            ->offset($offset)->limit($limit)
            ->get(['id','pdate','stepdt','psts','pcate','tamt','typlv','ptype_id','stepnow','slug','plist','body','created_id','needclaim','claimid']);

        $totalRecords = $totalDisplay = count($data);
        $result = [
            'recordsTotal'    => $totalRecords,
            'recordsFiltered' => $totalDisplay,
            'data'            => $data,
        ];

        return response()->json($result);
    }
}
