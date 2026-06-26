<?php

namespace App\Http\Controllers;

use App\Models\System;
use Illuminate\Http\Request;

class SystemController extends Controller
{
    public function index()
    {
        $sys = System::first();
        return view('cms.profile',compact('sys'));
    }
    public function inform()
    {
        $sys = System::first();
        return view('cms.inform',compact('sys'));
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }
    public function show(System $system)
    {
        //
    }

    public function edit(System $system)
    {
        //
    }

    public function update(Request $request, System $system)
    {
        $system->update($request->all());
        return redirect()->route('cms.profile');
    }

    public function setinform(Request $request, System $system)
    {
        $system->update($request->all());
        return redirect()->route('cms.inform');
    }

    public function destroy(System $system)
    {
        //
    }
}
