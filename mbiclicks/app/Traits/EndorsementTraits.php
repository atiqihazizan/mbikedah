<?php

namespace App\Traits;

use App\Models\Allowance;
use App\Models\Asset;
use App\Models\BankLedger;
use App\Models\BankMaster;
use App\Models\BankSummary;
use App\Models\Booking;
use App\Models\FinanceLedger;
use App\Models\Leave;
use App\Models\Supplier;
use App\Models\Urusniaga;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

trait EndorsementTraits
{
    private function txBank($bnkid,$mnow,$pttid,$amt,$type,$desc='permohonan',$paidto=0){
        $bankMaster = BankMaster::find($bnkid);
        $bankMaster->amt -= $amt;
        $bankMaster->save();
        $txBank = [
            'bankid'=>$bnkid,
            'pettid'=>$pttid,
            'txtype'=>$type, // kredit
            'txamt'=>$amt,
            'txsts'=>TRNSTS_TRANSACTION, // transaction status
            'balamt'=>$bankMaster->amt,
            'tx_by'=>Auth::id(),
            'txdate'=>date('Y-m-d'),
            'description'=>$desc,
            'paidto'=>$paidto,
        ];
        BankLedger::create($txBank);
        $banksum = BankSummary::where([['yr',YEAR_NOW],['bankid',$bnkid]])->first();
        if($banksum === null){
            $banksum = BankSummary::create([ 'yr'=>YEAR_NOW, 'm'.$mnow => $amt, 'bankid'=>$bnkid]);
        } else {
            $banksum->{'m'.$mnow} += $amt;
            $banksum->save();
        }
    }
    private function txFinance($pttid,$finid,$typ,$desc,$code,$name,$total,$tablename,$mth){
        $ledger = [
            'petition_id'=>$pttid,
            'finance_id'=>$finid,
            'type'=>$typ, // credit
            'datetx'=>date('Y-m-d'),
            'description'=>$desc,
            'amt'=>$total,
            'fcode'=>$code,
            'fname'=>$name,
        ];
        FinanceLedger::create($ledger);
        $this->updateChain($finid,$tablename,$mth,$total);
    }
    private function txCancel($petition){
        if(!isset($petition->body->trans)) return;
        $trans = $petition->body->trans;
        $bank = $trans->bank;
        $bank_desc = 'Pembatalan permohonan';
        $this->txBank($bank->bnkid,$bank->mnow,$bank->pttid,($bank->amt * -1),1,$bank_desc,$petition->body->payto);
        foreach($trans->budget as $b){$this->txFinance($b->pttid,$b->finid,1,$b->desc,$b->code,$b->name,($b->total*-1),$b->tablename,$b->mth);}
    }
    private function bookCancel($petition){
        $plist = $petition->plist;
        foreach ($plist??[] as $l){
            if(!isset($l->book_id)) continue;
            $bookid = $l->book_id;
            $booking = Booking::find($bookid);
            $idcar = $booking->refid;
            $booking->delete();
            $asset = Asset::find($idcar);
            $asset->staff_id = 0;
            $asset->book_id = 0;
            $asset->save();
        }
    }
    private function endorse_reject($petition,$request){
        if(strlen($request->remark)==0) return ['error'=>'bad','message'=>'Sila nyatakan sebab'];
        if($petition->pcate == ROLE_FINANCE && $petition->stepnow > ENDORSE_PKW) $this->txCancel($petition);
        if($petition->pcate == ROLE_HR && $petition->stepnow > ENDORSE_PHR) $this->bookCancel($petition);
        $petition->psts = STS_REJECT;
        $petition->status = 'TIDAK LULUS';
        $this->PttLog($petition,LOGSTS_REJECTED);
        $petition->save();
        return true;
    }
    private function endorse_return($petition,$request){
        $step = $petition->stepnow;

        if(strlen($request->remark)==0) return ['error'=>'bad','message'=>'Sila nyatakan sebab'];
        if($petition->pcate == ROLE_FINANCE && $step > ENDORSE_PKW) $this->txCancel($petition);
        if($petition->pcate == ROLE_HR && $step > ENDORSE_PHR) $this->bookCancel($petition);
        $petition->routestep = null;
        $petition->stepcnt = 1;
        $petition->stepnow = $petition->rulestep[0];
        $petition->verified = null;
        $petition->psts = STS_RETURN;
        $petition->status = 'DIKEMBALIKAN';
        $petition->needclaim = false;
        $petition->save();
        $this->PttLogApply($petition,LOGSTS_RETURN,$step);
        return true;
    }
    private function endorse_kj($petition,$request){
        $body = $petition->body;
        if($petition->pcate == ROLE_HR){
            $lv = Leave::find($petition->typlv);

            if($lv){
                if(isset($body->num)) { $msg = 'Bilangan ';$total = $body->num;}
                if(isset($body->totalamt)) { $msg = 'Amaun ';$total = $body->totalamt;}
                if(isset($lv->unit)) $msg .= Str::lower($lv->unit);
                if($request->jumconfirm > $total) return [ 'error' => 404, 'message' => $msg . ' telah melebihi dari permohonan' ];
                if($request->jumconfirm <= 0) return ['error'=>404,'message'=> $msg . ' tidak dimasukkan'];
                if(isset($body->tout)){
                    $time =  Carbon::parse($body->tout)->addHours($request->jumconfirm);
                    $body->tinconfirm = $time->format('h:i A');
                    $body->tout = Carbon::parse($body->tout)->format('h:i A');
                    $body->tin = Carbon::parse($body->tin)->format('h:i A');
                }
                if(isset($body->dtback)){
                    $date =  Carbon::parse($body->dtout)->addDays($request->jumconfirm);
                    $body->dtbackconfirm = $date->format('Y-m-d');
                }
                $petition->lvsts = $lv->ctype;
            }
            if(isset($request->jumconfirm)) $body->jumconfirm = $request->jumconfirm;
            $petition->body = $body;
        }
        return true;
    }
    private function endorse_phr($petition,$request){
        $body = $petition->body;
        $type = $petition->ptype;
        $staff = $petition->staff;
        $plist = $petition->plist;

        if($type->lvtyp){
            $slv = $staff->leaveByYear->where('leaves_id',$petition->typlv)->first();
            $lvMaster = $petition->lvtype;
            $entitle = $staff->entitlement->{$petition->typlv};
            if($slv->basic > 0) {
                $slv->limit -= $petition->taken;
                $entitle->now_entitle -= $petition->taken;
            } else {
                $slv->limit += $petition->taken;
                $entitle->now_entitle += $petition->taken;
            }

            // jika masa lebih dari 8jam akan berlaku penolakan dari cuti tahunan dan baki dibawa kehadapan
            if($type->code == 'timeoff' && $slv->taken > $lvMaster->limit) {
                $slv->limit -= $lvMaster->limit;
                $entitle->now_entitle -= $lvMaster->limit;
                $staff->entitlement->{$petition->typlv} = $entitle;

                // tolak cuti tahunan
                $lvAL = $staff->leaveByYear->where('leaves_id',$lvMaster->refid)->first();
                $lvAL->limit -= 1;
                $lvAL->save();
                $staff->entitlement->{$lvMaster->refid}->now_entitle -= 1;
            } else {
                $staff->entitlement->{$petition->typlv} = $entitle;
            }
            $slv->save();
            $staff->save();
            $petition->slvid = $slv->id;
        } else {
            if($type->code == 'perjalanan') {
            } else if($type->code == 'tripclaim') {
                if(!isset($request->perkara)) return ['error'=>404,'message'=>'Keterangan Bayarang diperlukan'];
                if(!isset($request->urusniaga)) return ['error'=>404,'message'=>'Jenis urusniaga diperlukan'];
                if(!isset($body->total) || $body->total == 0) return ['error'=>404,'message'=>'Butiran bayaran tidak lengkap'];

                $bistyp = Urusniaga::find($request->urusniaga);

                // cari pemohon dalam TABLE supplier
                //$p = Supplier::whereRaw('LOWER(`name`) LIKE ? ',[strtolower(trim('armiza')).'%'])->first();
                $p = Supplier::where('name','like','%'. $petition->staff->fullname.'%')->first();
                if(!$p) $p = Supplier::create(['name'=>Str::title($petition->staff->fullname)]); // if not exist
                $body->payto = $p->id;
                $body->recepient = $p->name;
                $body->pno = 'N/A';
                $body->perkara = $request->perkara;
                $body->urusniaga = $bistyp->id;
                $body->unkod = $bistyp->code;
                $body->untext = $bistyp->uitem;
                $petition->body = $body;
            }
        }
        return true;
    }
    private function endorse_khr($petition,$request){
        // needclaim disetkan bila ptype adalah permohonan perjalan dan kenderaan tidak request
        if($petition->ptype_id == 4 && !isset($petition->body->car)) $petition->needclaim = true;
        return true;
    }
    private function endorse_pkw($petition,$request){  
        $pdate = $petition->pdate;
        $yrnow = (int) date('Y',strtotime($pdate));
        $body = $petition->body;
        $credits = $request->body['credits'];
        $creditverified = $request->body['creditverified'];
        if(isset($request->body['credits'])) $body->credits = json_decode($credits,true);
        if(isset($request->body['creditverified'])) $body->creditverified = $creditverified;
        $petition->body = $body;
        $plist = $petition->plist; // get
        foreach ($plist as $l){
            if(!$l->verified) return ['error'=>404,'message'=>'Bajet dibutiran perlu disahkan dahulu'];
        }
        if((float)($body->creditverified??0) > $petition->tamt) return ['erro'=>404,'message'=>'Jumlah yang dikredit kurang dari jumlah permohonan'];
        if($petition->tamt == 0) return ['error'=>'Jumlah permohonan','message'=>'Permohonan tidak lengkap'];
        //
        $tablename = PREFIX_ACC.$yrnow;
        if(!Schema::hasTable($tablename)) return ['error'=>'Akaun tahunan tiada','message'=>'Semakan tidak berjaya dilakukan, sila pastikan akaun tahunan ' . $yrnow .' dibuka'];
        //
        return true;
    }
    private function endorse_approval($petition,$request){
        $pttid = $petition->id;
        $plist = $petition->plist;
        $pdate = $petition->pdate;
        $mnow = (int) date('m',strtotime($pdate));
        $yrnow = (int) date('Y',strtotime($pdate));
        $amount = (float)$petition->tamt;
        $body = $petition->body; // get
        $trans = new \stdClass();

        $tablename = PREFIX_ACC.$yrnow;
        if($request->data == NULL) return ['error'=>404,'message'=>'Rujukan bayaran diperlukan'];
        if(!Schema::hasTable($tablename)) return ['error'=>'Akaun tahunan tiada','message'=>'Akaun tahunan '.$yrnow .' tidak dijumpai'];

        // $body->payment->verify = $request->data->ref;
        $body->payment = [
            'refno' => $request->data['ref'],
            'verified' => $request->data['pdt']
        ];
        $petition->body = $body; // set
        return true;;
    }
    private function endorse_verified($petition,$request){
        $pttid = $petition->id;
        $plist = $petition->plist;
        $pdate = $petition->pdate;
        $mnow = (int) date('m',strtotime($pdate));
        $yrnow = (int) date('Y',strtotime($pdate));
        $amount = (float)$petition->tamt;
        $body = $petition->body; // get
        $trans = new \stdClass();

        $tablename = PREFIX_ACC.$yrnow;
        if(!Schema::hasTable($tablename)) return ['error'=>'Akaun tahunan tiada','message'=>'Akaun tahunan '.$yrnow .' tidak dijumpai'];

        $body->verified = date('d-m-Y');
        $petition->body = $body; // set
        
        // dapat layout preview
        $user = auth()->user()->staff;
        $pdata = (object) $petition->only('pcode','pdt','tamt');
        $staff = $petition->staff;
        $depart = $petition->depart;
        $verify = $petition->verified;
        $verify[] = (object)['name'=>$user->fullname,'date'=>date('d-m-Y')];
        $list = $petition->plist;
        $petition->preview = view('preview.bayaran', compact('pdata', 'staff', 'depart', 'body', 'verify', 'list'))->render();

        return true;
    }
    private function endorse_pay($petition,$request){
        $pttid = $petition->id;
        $body = $petition->body; // get
        $plist = $petition->plist;
        $pdate = $petition->pdate;
        $mnow = (int) date('m',strtotime($pdate));
        $yrnow = (int) date('Y',strtotime($pdate));
        $amount = (float)$petition->tamt;
        // $trans = new \stdClass();
        
        $tablename = PREFIX_ACC.$yrnow;
        // if($request->data == NULL) return ['error'=>404,'message'=>'Rujukan bayaran diperlukan'];
        if(!Schema::hasTable($tablename)) return ['error'=>'Akaun tahunan tiada','message'=>'Akaun tahunan '.$yrnow .' tidak dijumpai'];
        // $body->payment = [
        //     'refno' => $request->data['ref'],
        //     'verified' => $request->data['pdt']
        // ];

        // add transaksi
        if(isset($body->credits)){
            $credits = $body->credits;
            $supp = Supplier::find($body->payto??0);
            $desc_bank = 'Bayaran kepada '.$supp->name;
            foreach($credits as $credit){$this->txBank($credit->bankid,$mnow,$pttid,$credit->total,2,$desc_bank,$body->payto);}
        }

        // $trans->budget = [];
        foreach ($plist as $l){
            $budget = $l->verified;
            $id = (int)$budget->id;
            $ftotal = (float)$l->total;
            $amth = 'a'.$mnow;
            $desc = $budget->text;
            $code = $budget->code;
            $name = $budget->name;
            $this->txFinance($pttid,$id,2,$desc,$code,$name,$ftotal,$tablename,$amth);
        }
        // $petition->body = $body; // set
        return true;
    }
    private function vehicle_return($petition,$request){
        $body = $petition->body;
        if(!isset($body->car)) return true;
        $rule = [
            'dtreturn' => 'required',
            'milbefore' => 'required|numeric',
            'milafter' => 'required|numeric',
            'fuelkmbefore' => 'required|numeric',
            'fuelkmafter' => 'required|numeric',
            'tngtopup' => 'required|numeric',
            'tngbal' => 'required|numeric',
            'condition' => 'required',
        ];
        $message = [
            'required'=>':attribute diperlukan',
            'date_format'=>':attribute tidak sah',
            'numeric'=>':attribute hendaklah dalam nombor',
        ];
        $attribute = [
            'dtreturn' => 'Tarikh/Masa',
            'milbefore' => 'Mileage Sebelum',
            'milafter' => 'Mileage Selepas',
            'fuelkmbefore' => 'Pembelian Minyak/Kilometer',
            'fuelkmafter' => 'Baki Minyak/Kilometer',
            'tngtopup' => 'Pembelian TnG',
            'tngbal' => 'Baki TnG',
            'condition' => 'Keadaan Kereta',
        ];
        $valid = Validator::make($request->car_return,$rule,$message,$attribute);

        if($valid->fails()) return ['error'=>404,'message'=>$valid->errors()->first()];
        $body->car_return = $request->car_return;
        $petition->body = $body;
        return true;
    }
    private function endorse_vehicle($petition,$request){
        $body = $petition->body;
        if(!isset($body->car->bookid)){
            if(!isset($request->idcar)) return ['error'=>404,'message'=>'Kenderaan tidak pilih'];
            if(isset($body->car->driver) && !isset($request->driver_name)) return ['error'=>404,'message'=>'Nama pemandu diperlukan'];

            $idcar = $request->idcar;
            $ast = Asset::find($idcar);
            $textcar = $ast->model . '-' .$ast->regno;
            $book = [
                'refid'=>$idcar,
                'petition_id'=>$petition->id,
                'staff_id'=>$petition->staff_id,
                'depart_id'=>$petition->depart_id,
                'cate'=>1, // booking car
                'dtstart'=>$body->dtout,
                'dtuntil'=>$body->dtback,
                'descrip'=>$textcar,
            ];
            $booking = Booking::create($book);
            $ast->book_id = $booking->id;
            $ast->staff_id = $petition->staff_id;
            $ast->save();
            $body->car->confirm_id = $idcar;
            $body->car->confirm_model = $ast->model;
            $body->car->confirm_regno = $ast->regno;
            $body->car->confirm_text = $textcar;
            $body->car->bookid = $booking->id;
            if(isset($request->driver_name)) $body->car->driver_name = $request->driver_name;
        } else{
            $rule = [
                'dtreturn' => 'required',
                'milbefore' => 'required|numeric',
                'milafter' => 'required|numeric',
                'fuelkmbefore' => 'required|numeric',
                'fuelkmafter' => 'required|numeric',
                'tngtopup' => 'required|numeric',
                'tngbal' => 'required|numeric',
                'condition' => 'required',
            ];
            $message = [
                'required'=>':attribute diperlukan',
                'date_format'=>':attribute tidak sah',
                'numeric'=>':attribute hendaklah dalam nombor',
            ];
            $attribute = [
                'dtreturn' => 'Tarikh/Masa',
                'milbefore' => 'Mileage Sebelum',
                'milafter' => 'Mileage Selepas',
                'fuelkmbefore' => 'Pembelian Minyak/Kilometer',
                'fuelkmafter' => 'Baki Minyak/Kilometer',
                'tngtopup' => 'Pembelian TnG',
                'tngbal' => 'Baki TnG',
                'condition' => 'Keadaan Kereta',
            ];
            $valid = Validator::make($request->verified_return,$rule,$message,$attribute);
            if($valid->fails()) return ['error'=>404,'message'=>$valid->errors()->first()];

            $body->verified_return = $request->verified_return;
            $return_at = $request->verified_return['dtreturn'];
            $milbefore = $request->verified_return['milbefore'];
            $milafter = $request->verified_return['milafter'];
            $remark = $request->remark;
            $bookid = $body->car->bookid;
            $carid = $body->car->confirm_id;
            $body->verified_return['remark'] = $remark;
            $petition->needclaim = true;
            Booking::where('id',$bookid)->update(['dtreturn'=>$return_at,'odobefore'=>$milbefore,'odoafter'=>$milafter,'remark2'=>$remark]);
            Asset::where('id',$carid)->update(['dtreturn'=>$return_at,'staffidprev'=>DB::raw('staff_id'),'bookidprev'=>DB::raw('book_id'),'remark'=>$remark,'staff_id'=>0,'book_id'=>0]);
        }
        $petition->body = $body;
        return true;
    }
}
