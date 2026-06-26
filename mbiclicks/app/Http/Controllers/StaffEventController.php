<?php

namespace App\Http\Controllers;

use App\Models\Depart;
use App\Models\StaffEvent;
use Illuminate\Http\Request;

class StaffEventController extends Controller
{
    public function index()
    {
        $data = StaffEvent::orderBy('id','desc')->get();
        return view('cms.event.index',compact('data'));
    }

    public function create()
    {
        $dep = Depart::all();
        $data = [];
        return view('cms.event.create',compact('dep'));
    }

    public function store(Request $request)
    {
        StaffEvent::create($request->all());
        return redirect()->route('event.index');
    }

    public function show(StaffEvent $staffEvent)
    {
        //
    }

    public function edit(StaffEvent $staffEvent)
    {
        $dep = Depart::all();
        $data = $staffEvent;
        return view('cms.event.edit',compact('data','dep'));
    }

    public function update(Request $request, StaffEvent $staffEvent)
    {
        $staffEvent->update($request->all());
        return redirect()->route('event.index');
    }

    public function destroy(StaffEvent $staffEvent)
    {
        $staffEvent->delete();
        return redirect()->route('event.index');
    }
}
