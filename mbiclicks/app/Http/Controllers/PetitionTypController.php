<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\Ptype;
use Illuminate\Http\Request;

class PetitionTypController extends Controller
{
    public function index()
    {
        $ptype = Ptype::where('cate',2)->get();
        $title = 'Jenis Permohonan';
        return view('petitionType.index',compact(['title','ptype']));
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

    public function show(Ptype $ptype)
    {
        //
    }

    public function edit(Ptype $ptype)
    {
        return redirect()->to(url('/conf/petitiontype'))->with(['id'=>$ptype->id,'data'=>$ptype]);
    }

    public function update(Request $request, Ptype $ptype)
    {
        $req=[];
        foreach($request->lvtyp??[] as $l)$req[] = (int)$l;
        if(count($req)==0)$req=null;
        $ptype->update(['lvtyp'=>$req]);
        return redirect()->to(url('/conf/petitiontype'))->with('success','Successfull');
        //return response()->json(['success'=>'Successfull']);
    }

    public function destroy(Ptype $ptype)
    {
        //
    }

    public function enabled(Request $request,Ptype $ptype){
        $shw = !$request->shw;
        $ptype->update(['shw'=>$shw]);
        return redirect('/conf/petitiontype')->with('success','Permohonan dibolehkah');
    }
}
