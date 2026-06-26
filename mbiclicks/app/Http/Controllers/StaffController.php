<?php

namespace App\Http\Controllers;

use App\Models\Depart;
use App\Models\Position;
use App\Models\PosLeave;
use App\Models\Staff;
use App\Models\StaffLeave;
use App\Traits\LeaveTraits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class StaffController extends Controller
{
    use LeaveTraits;

    private $formInput = [];
    private $formSelect = [];
    private $validator = [
        [
            'staffno' => 'required|unique:staff|min:3',
            'fullname' => 'required',
            'service_at'=>'required|date',
            'email'=>'required|email',
            'position_id'=>'required|integer',
            'depart_id'=>'required|integer',
        ],[
            'required' => ':attribute diperlukan',
            'integer'=>':attribute diperlukan',
            'min'=>':attribute diperlukan',
            'date'=>':attribute tidak sah',
            'email'=>':attribute tidak lengkap',
            'unique'=>':attribute sudah ada',
        ],[
            'staffno'=>'No Staff',
            'fullname'=>'Nama Staff',
            'service_at'=> 'Tarikh Mula khidmat',
            'depart_id'=>'Jabatan',
            'position_id'=>'Jawatan',
        ]
    ];

    public function __construct () {
        $this->formInput = [
            (object)['id'=>'fullname','label'=>'Nama','el'=>'text','col'=>12,'def'=>''],
            (object)['id'=>'staffno','label'=>'Staff No','el'=>'text','col'=>3,'def'=>''],
            (object)['id'=>'service_at','label'=>'Tarikh Mula Khidmat','el'=>'date','col'=>4,'def'=>''],
            (object)['id'=>'email','label'=>'Email','el'=>'email','col'=>5,'def'=>''],
        ];
        $this->formSelect = [
            (object)['id'=>'position_id','label'=>'Jawatan','col'=>6,'list'=>Position::all()],
            (object)['id'=>'depart_id','label'=>'Jabatan','col'=>6,'list'=>Depart::all()]
        ];
    }

    public function index(Request $request)
    {
        if(isset($request->json)) return response()->json(['data'=>$this->getAll()]);

        return view('staff.index',[
            'title' => 'Staff',
            'input' =>$this->formInput,
            'select' =>$this->formSelect
        ]);
    }

    public function create() {}
    public function store(Request $request)
    {
        $valid = Validator::make($request->all(),...$this->validator);

        if($valid->fails()) return response()->json(['error'=>404,'message'=>$valid->errors()->first()]);
        Staff::create($request->all());
        return response()->json(['success'=>200,'message'=>'Staff baru berjaya ditambah','data'=>$this->getAll()]);
    }

    public function show(Staff $staff)
    {
        return view('staff.overview',[
            'title'=>'Overview',
            'data'=>$staff,
            'leave' => $staff->leaveByYear,
            'input' =>$this->formInput,
            'select' =>$this->formSelect
        ]);
    }

    public function edit(Staff $staff){return redirect('/conf/staff');}

    public function update(Request $request, Staff $staff)
    {
        $oldpos = $staff->position_id;
        $newpos = $request->position_id;

        $data = $request->only($staff->getFillable());

        $valid = Validator::make($request->all(),[
            'staffno'=>'required',
            'fullname'=>'required',
            'depart_id'=>'required',
            'position_id'=>'required',
            'service_at'=>'required',
        ],[
            'fullname.required'=>'Nama staff diperlukan',
            'staffno.required'=>'No staff diperlukan',
            'depart_id.required'=>'Jabatan diperlukan',
            'position_id.required'=>'Jawatan diperlukan',
            'service_at.required'=>'Tarikh mula khidmat diperlukan',
        ]);

        if($valid->fails()) return redirect('/conf/staff/'.$staff->id)->withErrors($valid)->withInput();

        if($request->hasFile('avatar')) {
            $avatar="data:image/png;base64,".base64_encode(file_get_contents($request->file('avatar')));
            $data['avatar'] = $avatar;
        }
        $staff->update($data);

//        if($oldpos != $newpos){
//            $s = $staff;
//            // check staff leave if not exist
//            $slv = StaffLeave::where([['staff_id',$s->id],['yr',$s->lvyr]])->get();
//            if($slv->count()==0){
//                $this->newEntitlement($s);
//            } else {
//                $p = Position::find($newpos);
//                $srvc = $s->service_cnt;
//                $l = $p->lvsrvc1; // basic leave
//
//                if($srvc >= 5){
//                    $l = $p->lvsrvc3; // max leave
//                } else if($srvc >= 2){
//                    $l = $p->lvsrvc2; // middle leave
//                }
//                $plv = PosLeave::where('lvcate',$l)->get();
//                foreach($plv as $lv){
//                    $slv->where('leaves_id',$lv->leaves_id)->first()->update(['limit'=>$lv->counter]);
//                }
//            }
//        }
        return redirect('/conf/staff/' . $staff->id)->with('success','Successfull');
    }

    public function destroy(Staff $staff)
    {
        //
    }
    private function getAll(){
        return Staff::with('position','depart')->get();
    }

    public function getStaff(Request $request){
        $qry = Staff::query();
        $res = $qry;
        if(isset($request->searchTerm)) {
            $res = $qry->where('fullname', 'like', '%' . $request->searchTerm . '%');
        }
        $data = $res->get(['id',DB::raw("fullname as text")]);
        return response()->json(['data'=>$data]);
    }
}
