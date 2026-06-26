<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Booking;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $data = Booking::with('staff','depart')->whereYear('created_at','=',date('Y'));
        $refid = $request->cate??0; // untuk helah field sahaja dari client ke server
        if($refid>0){
            $res = $data->where([['cate',1],['refid',$refid]])->orderBy('id','DESC')->get();
            return response()->json($res);
        }
        $res = $data->where('cate',2)->orderBy('id','DESC')->get();
        return view('booking.index',['title'=>'Lojing Hotel', 'data'=>$res]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
//        $data = Validator::make($request->all(),[
//            'dtstart'=>'required',
//            'dtuntil'=>'required',
//            'odobefore'=>'required',
//            'refid'=>'required',
//        ],[
//            'dtstart.required'=>'Tarikh dari diperlukan',
//            'dtuntil.required'=>'Tarikh hingga diperlukan',
//            'odobefore.required'=>'Odo meter diperlukan',
//            'refid.required'=>'Kenderaan diperlukan',
//        ]);
//        if($data->fails()) return response()->json(['error'=>'bad','message'=>$data->errors()]);

        if(!isset($request->cate)) return response()->json(['message'=>'Page missing']);
        $staff = Staff::find($request->staff_id);
        $data = $request->all();
        $data['depart_id'] = $staff->depart_id;
        $ret = Booking::create($data);
        return response()->json($this->recall($request->cate,$request->petition_id,$ret->refid,$ret->id,$ret->staff_id));

    }

    public function show(Booking $booking)
    {
        //
    }

    public function edit(Booking $booking)
    {
        //
    }

    public function update(Request $request, Booking $booking)
    {
        //
    }

    public function destroy(Booking $booking)
    {
        $pid = $booking->petition_id;
        $cate = $booking->cate;
        $refid = $booking->refid;
        $booking->delete();
        return response()->json($this->recall($cate,$pid,$refid,0,0));
    }
    private function recall($cate,$pid,$refid,$bid,$staffid){
        $key = 'booking';
        if($cate == 1) Asset::where('id',$refid)->update(['book_id'=>$bid,'staff_id'=>$staffid]);
        if($cate == 2) $key = 'lojing';
        $return = ['success'=>'ok'];
        $return[$key] = Booking::with('asset')->where([['petition_id',$pid],'cate'=>$cate])->get();
        return $return;
    }
}
