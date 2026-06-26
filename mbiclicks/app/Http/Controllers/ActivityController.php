<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\BankMaster;
use App\Models\Petition;
use App\Models\PetitionLog;
use App\Traits\AllowanceTraits;
use App\Traits\EndorsementTraits;
use App\Traits\FinanceTraits;
use App\Traits\PetitionsTraits;
use App\Traits\PreviewTraits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ActivityController extends Controller
{
    use PetitionsTraits;
    use PreviewTraits;
    use FinanceTraits;
    use EndorsementTraits;
    use AllowanceTraits;

    public function index()
    {
        $banks = BankMaster::get();
        return view('endorsement.index', ['title' => 'Aktiviti', 'banks' => $banks]);
    }
    public function activitywarning()
    {
        $usr = \auth()->user();
        $ustep = $usr->ustep;
        $msg = [];
        if (in_array(ENDORSE_PKW, $ustep)) {
            if (!Schema::hasTable(PREFIX_ACC . YEAR_NOW)) $msg[] = 'Bajet tahunan belum dibuka';
            if (BankMaster::where('amt', 0)->count() > 0) $msg[] = 'Maklumat jumlah bank tidak lengkap';
        }
        return response()->json(['count' => count($msg), 'message' => $msg]);
    }
    public function pending()
    {
        return view('approval.index', ['title' => 'Aktiviti']);
    }
    public function countpending()
    {
        $count = 0;
        $user = auth()->user();
        $ustep = $user->ustep;
        $ky = array_search(RETURN_CAR, $ustep);
        if ($ky !== false) unset($ustep[$ky]);
        $arr = Petition::whereIn('stepnow', $ustep)->whereIn('psts', [2])->get();
        foreach ($arr as $a) {
            if ($a->stepnow == 2 && $user->depart_id !== $a->depart_id) continue;
            $count += 1;
        }
        return response()->json(['count' => $count]);
    }
    public function archive()
    {
        return view('approval.approved', ['title' => 'Semakan']);
    }
    public function dataarchive()
    {
        DB::enableQueryLog();
        $uid = auth()->id();
        $data = PetitionLog::with('staff', 'ptype:id,name', 'petition')
            ->where('user_id', $uid)
            ->where('psts', '>', LOGSTS_SUBMITED)
            ->orderByDesc('id')
            ->get()
            ->unique('petition_id');
        //$data = $data->toSql();
        $row = [];
        foreach ($data as $d) {
            if ($d->psts == LOGSTS_RETURN && $d->petition->psts == 2) continue;
            $row[] = $d;
        }
        return response()->json(['data' => $row]);
    }
    public function viewarchive(Petition $petition)
    {
        $data = $this->petitionView($petition, 1);
        $staff = $petition->staff;
        $stepper = $petition->stepper;
        $act = $stepper->act;
        $logcur = $petition->logLatest;

        if (in_array(6, $act)) {
            if (in_array(ENDORSE_PAY, auth()->user()->ustep)) {
                $pdata = (object) $petition->only('pcode', 'pdt', 'tamt');
                $depart = $petition->depart;
                $body = $petition->body;
                $verify = $petition->verified;
                $list = $petition->plist;
                $data['preview'] = view('preview.bayaran', compact('pdata', 'staff', 'depart', 'body', 'verify', 'list'))->render();
            }
        }

        $lv = $petition->staff?->leaveByYear?->where('basic', '>', 0)->toArray() ?? [];
        $data['leave'] = array_values($lv);

        return response()->json($data);
    }
    public function verify(Petition $petition, Request $request)
    {

        $validator = true;
        $petition->remark = $request->remark ?? '';
        $currStep = $petition->stepnow;
        if (!isset($request->psts)) return response()->json(['error' => 'Pengesahan', 'message' => 'Status pengesahan tidak pilih']);

        // petition rejected
        if ($request->psts == LOGSTS_REJECTED) {
            $validator = $this->endorse_reject($petition, $request);
            if ($validator !== true) return response()->json($validator);
            return response()->json(['success' => 'ok', 'message' => 'Permohonan dibatalkan']);
        }
        // petition returned
        else if ($request->psts == LOGSTS_RETURN) {
            $validator = $this->endorse_return($petition, $request);
            if ($validator !== true) return response()->json($validator);
            return response()->json(['success' => 'ok', 'message' => 'Permohonan dikembalikan']);
        }

        // APPROVAL
        switch ($currStep) {
            case ENDORSE_KJ:
                $validator = $this->endorse_kj($petition, $request);
                break;
            case ENDORSE_PKW:
                $validator = $this->endorse_pkw($petition, $request);
                break;
            case ENDORSE_VFY:
                $validator = $this->endorse_verified($petition, $request);
                break;
            case ENDORSE_PAY:
                $validator = $this->endorse_pay($petition, $request);
                break;

            case ENDORSE_PHR:
                $validator = $this->endorse_phr($petition, $request);
                break;
            case ENDORSE_KHR:
                $validator = $this->endorse_khr($petition, $request);
                break;

            case RETURN_CAR:
                $validator = $this->vehicle_return($petition, $request);
                break;
            case ENDORSE_VHCL:
                $validator = $this->endorse_vehicle($petition, $request);
                break;
        }

        if ($validator !== true) return response()->json($validator);

        $arr = $petition->routestep;
        $arr[] = auth()->id();
        $petition->routestep = $arr;
        $petition->verified = $this->createLogApproval($petition);

        // return response()->json($petition); // debug purpose

        // untuk print form bayaran
        $preview = false;
        if (isset($petition->preview)) {
            $preview = $petition->preview;
            unset($petition->preview);
        }

        // petition pending or approved if step complete
        $this->submission($petition);
        $this->PttLog($petition, $request->psts);
        $data = ['success' => 'ok', 'message' => 'Permohonan telah disahkan'];
        if ($preview !== false) $data['preview'] = $preview;
        return response()->json($data);
    }
}
