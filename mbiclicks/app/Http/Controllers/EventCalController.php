<?php

namespace App\Http\Controllers;

use App\Models\EventCal;
use Illuminate\Http\Request;

class EventCalController extends Controller
{
    public function index() {
        return response()->json(['success'=>'ok','data'=>$this->reload()]);
    }
    public function create() {}
    public function store(Request $request)
    {
        $user = auth()->user();

        $evt = new EventCal();
        $evt->fill($request->all());
        $evt->uid = $user->id;
        $evt->deptid = $user->depart_id;
        $evt->save();
        return response()->json(['success'=>'ok','data'=>$this->reload()]);
    }

    public function show(EventCal $eventCal) {dd($eventCal->staff->fullname);}
    public function edit(EventCal $eventCal) {}
    public function update(Request $request, EventCal $eventCal)
    {
//        $data = $request->only($eventCal->fillable());
        $eventCal->fill($request->all());
        $eventCal->save();
        return response()->json(['success'=>'ok','data'=>$this->reload()]);
    }

    public function destroy(EventCal $eventCal)
    {
        if($eventCal->uid !== auth()->user()->id)return response()->json(['error'=>'Sila maklumkan kepada ' . $eventCal->staff->fullname . ' untuk memadam agenda tersebut']);
        $eventCal->delete();
        return response()->json(['success'=>'ok','data'=>$this->reload()]);
    }
    private function reload(){
        $data = EventCal::whereDate('created_at',DATENOW)->get();
        return $data;
    }
}
