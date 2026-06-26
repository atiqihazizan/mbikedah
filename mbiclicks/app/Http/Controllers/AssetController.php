<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Booking;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        //dd($request->all());
        $data = Asset::with('booking','staff','depart')->get();
        if($request->datajson??false)return response()->json(['data'=>$data]);
        $staff = Staff::all();
        return view('asset.index',['title'=>'Car Booking', 'data'=>$data,'staff'=>$staff]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
//        Asset::create($request->all());

    }

    public function show(Asset $asset)
    {
        //
    }

    public function edit(Asset $asset)
    {
        //
    }

    public function update(Request $request, Asset $asset)
    {
        if($request->type??false){
            $asset->update(['model'=>$request->model,'regno'=>$request->regno]);
            return response()->json(['success'=>'ok']);
        } else {
            $book = Booking::find($asset->book_id);
            if(!isset($request->odoafter)) return response()->json(['error'=>'bad','message'=>'Data not found']);
            $book->update(['odoafter'=>$request->odoafter,'remark'=>$request->remark??'']);
            $asset->update(['staff_id'=>0,'book_id'=>0]);
            $data = Asset::with('booking','staff','depart')->get();
            return response()->json(['success'=>'ok','data'=>$data]);
        }
        return abort(404);
    }

    public function destroy(Asset $asset)
    {
        //
    }

    public function available(Request $request){
        $data = Asset::select(['id', DB::raw("CONCAT(model,'-',regno) as text")])->where([['staff_id',0],['cate','kereta']]);
        if(isset($request->staffid)) $data->orWhere('staff_id',$request->staffid);
        return response()->json(['data'=>$data->get()]);
    }
}
