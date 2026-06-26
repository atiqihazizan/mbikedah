<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\Petition;
use App\Models\PosLeave;
use App\Models\Staff;
use App\Models\StaffLeave;
use App\Models\System;
use App\Traits\LeaveTraits;
use Illuminate\Database\Eloquent\Casts\ArrayObject;
use Illuminate\Http\Request;

class StaffLeaveController extends Controller
{
    public function index(){}
    public function create(){}
    public function store(Request $request){
        $valid = $request->validate(['staffid'=>'required']);
        $staffid = (int)$request->staffid;
        $staff = Staff::with('posGroup')->where('id',$staffid)->first();
        $qry = $staff->posGroup->leaveEntitle;
        $srvc = $staff->service_cnt;
        $lvStaff = $staff->entitlement;
        $balentitle = $staff->hajiumrah;
        if($lvStaff == null) $lvStaff = new \stdClass();

        // entitlement ikut tahun berkhidmat
        if($srvc > 5)$rw = $qry->where('yr_up','>',5);
        else if($srvc > 2)$rw = $qry->where('yr_up',5);
        else $rw = $qry->where('yr_up',2);
        // entitlement tanpa tahun berkhidmat
        $rw = $rw->merge( $qry->where('yr_up',0));

        $entile = [];
        $except = [];
        foreach ($rw as $r){
            $lvid = $r->leave->id;
            $obj = $r->leave;
            $obj->def = $r->entitle;
            $obj->fwd = $r->maxbfwd;
            $obj->bal = $r->maxbal;
            $entile[] = $obj;//->toArray();
            $except[] = $lvid;
        }

        $entile = collect($entile);
        $lvMaster = Leave::whereNotIn('id',$except)->get();//->toArray();
        $data = $entile->merge($lvMaster);
        $staffLeave = [];
        foreach ($data as $a) {
            $staffLeave[] = [ 'yr' => YEAR_NOW, 'staff_id' => $staffid, 'leaves_id' => $a->id, 'typ' => $a->typ, 'limit' => $a->def,'basic'=>$a->def, 'ctype'=>$a->ctype];
            if(isset($lvStaff->{$a->id})){
                $lvs = $lvStaff->{$a->id};
                if(isset($lvs->basic_bfwd)){
                    $lvs->before = $lvs->now_entitle;
                    if($lvs->basic_bfwd > 0 && $lvs->now_entitle > $lvs->basic_bfwd) {
                        $balentitle += ($lvs->now_entitle - $lvs->basic_bfwd);
                        $lvs->now_entitle = $lvs->basic_bfwd + $lvs->basic_entitle;
                        $staffLeave['limit'] = $lvs->now_entitle;
                    } else {
                        $lvs->now_entitle = $lvs->basic_entitle;
                    }
                    $lvStaff->{$a->id} = $lvs;
                }
            } else {
                $lvs = (object)[ 'idlv'=>$a->id, 'basic_entitle'=>$a->def, 'now_entitle'=>$a->def];
                if(isset($a->fwd)) {
                    $lvs->before = 0;
                    $lvs->basic_bfwd = $a->fwd;
                }
                $lvStaff->{$a->id} = $lvs;
            }
//            StaffLeave::create($staffLeave);
        }
        
        uasort($staffLeave, fn($a,$b)=>$a['leaves_id']<=>$b['leaves_id']);
        StaffLeave::upsert($staffLeave, ['yr','staff_id','leaves_id','typ','limit','basic','ctype']);
        $sys = System::first();
        if($balentitle > $sys->hajiumrah->maxhari) $balentitle = $sys->hajiumrah->maxhari;
        $staff->hajiumrah = $balentitle;
        $staff->entitlement = $lvStaff;
        $staff->lvyr = YEAR_NOW;
        $staff->lvsts = 0;
        $staff->save();
        return redirect()->route('staff.show',['staff'=>$staff]);
    }
    public function show(StaffLeave $staffLeave,Request $request){}
    public function edit(StaffLeave $staffLeave){}
    public function update(Request $request, StaffLeave $staffLeave){
        if(isset($request->limit)==false && isset($request->taken)==false) return response('error',500);
        if(isset($request->limit)) $ar = ['limit'=>$request->limit];
        if(isset($request->taken)) $ar = ['taken'=>$request->taken];
        $staffLeave->update($ar);
        return response('success',200);
    }
    public function destroy(StaffLeave $staffLeave){}
    public function ownleave(Staff $staff){
        $all = $staff->staffleave;
        $only = [];
        foreach($all as $l){
            $only[$l->leaves_id] = $l;
        }
        return response()->json(compact('all','only'));
    }
    public function summary(Request $request){
        $petition = [];
        $sid = 0;
        $lvid = 0;

        $request->validate(
            [ 'staff'=>'required', 'type'=>'required' ],
            ['staff.required'=>'Staff diperlukan','type.required'=>'Jenis cuti diperlukan']
        );

        if(\request()->staff){
            $staff = Staff::where('staffno',request()->staff)->first();
            $sid = $staff->id;
        }
        if(\request()->type){
            $typ = request()->type;
            $lv = Leave::where('fieldname',$typ)->first();
            $lvid = $lv->id;
            $petis = Petition::where([ ['staff_id',$sid], ['psts',3] ])
                //->whereIn('ptype_id',$lvsid)
                ->get();
            foreach ($petis as $p){
                $ar = json_decode($p->verified,true);
                $aprv = $ar[2];
                if(!$aprv)continue;
                $arlv = $aprv['leaves'];
                if(!in_array($lvid, $arlv)) continue;
                $petition[] = $p;
            }
        }
        return view('leaves.summary',[
            'title'=>'Ringkasan Cuti Staff',
            'lvtype'=>Leave::all(),
            'petition' => $petition,
            'lvid' =>$lvid
        ]);
    }
}
