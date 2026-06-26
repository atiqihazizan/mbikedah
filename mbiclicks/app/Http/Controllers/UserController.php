<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\Stepper;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return view('users.index',[
            'title'=>'Pengguna',
            'data' => User::with('staff')->where('is_admin',0)->orderBy('name')->get()
        ]);
    }

    public function create()
    {
        $stepper = Stepper::all();
        $staff = Staff::all();
        return view('users.create',[ 'title'=>'Tambah Pengguna', 'stepper'=>$stepper,'data'=>[],'staff'=>$staff ]);
    }

    public function store(Request $request)
    {
        $fv = Validator::make($request->all(),[
            'username' => ['required',Rule::unique('users')],
            'name' => 'required',
            'staff_id' => 'required',
            'ustep' => 'required',
        ], [
            'ustep.required'=>'Level is required',
        ]);

        $fv->after(function($v) use ($request){
            $sid = $request->staff_id;
            $user = User::where('staff_id',$sid)->first();
            if($user) $v->errors()->add('staff_id','Staff already exist');
        });
        if($fv->fails()) return redirect('/cms/user/create')->withErrors($fv)->withInput();

        $sid = $request->staff_id;
        $staff = Staff::find($sid);
        $data = $request->all();
        if($staff->staffno) $data['username'] = $staff->staffno;
        $data['depart_id'] = $staff->depart_id;
        // $data['ustep'] = array_sum($data['ustep']);
        $data['password'] = bcrypt(123456);
        User::create($data);
        return redirect('/cms/user')->with(['success','New user successfull']);
    }

    public function show(User $user){}

    public function edit(User $user)
    {
        $stepper = Stepper::all();
        return view('users.edit',[ 'title'=>'Edit Pengguna', 'data'=>$user, 'stepper'=>$stepper, ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->all();
        $fv = Validator::make($data,
            [
                //'username' => ['required',Rule::unique('users')->ignore($user->id)],
                'name' => 'required',
                //'staff_id' => 'required',
                'ustep' => 'required',
            ],
            ['ustep.required'=>'Level is required']
        );

        if($fv->fails()) return redirect()->route('user.edit',['user'=>$user])->withErrors($fv)->withInput();

        // $data['ustep'] = array_sum($data['ustep']);
        $user->update($data);
        return redirect()->route('user.index')->with(['success','Update successfull']);
    }

    public function destroy(User $user)
    {
        //
    }

    public function password(){
        return view('password',['title'=>'Ubah Katalaluan']);
    }

    public function change(Request $request){
        $valid = Validator::make($request->all(), [
                'oldpassword'=>'required',
                'newpassword'=>'required',
            ],[
                'oldpassword.required'=>'Katalaluan lama diperlukan',
                'newpassword.required'=>'Katalaluan baru diperlukan',
        ]);

        $valid->after(function($v) use ($request){
            if(!Hash::check($request->oldpassword,auth()->user()->password)) $v->errors()->add('oldpassword', 'Katalaluan lama tidak betul!');
        });

        if($valid->fails()) return back()->withErrors($valid)->withInput();

        User::whereId(auth()->id())->update(['password'=>Hash::make($request->newpassword)]);
        return redirect()->route('home');
    }
}
