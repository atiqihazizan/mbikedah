<?php

namespace App\Http\Controllers;

use App\Models\Allowance;
use App\Models\PosAllowance;
use App\Traits\AllowanceTraits;
use Illuminate\Http\Request;

class AllowanceController extends Controller
{
    use AllowanceTraits;

    public function index()
    {
        $rws = Allowance::orderBy('parent')->orderBy('id')->get()->toArray();
        $list = [];
        foreach ($rws as $rw){
            $r = (object) $rw;
            if(isset($list[$r->parent])){
                $list[$r->parent]->child[] = $r;
            } else {
                $list[$r->id] = $r;
            }
        }
        return view('allowance.index',[
            'title'=>'Jenis Elaun',
            'list'=>$list,
        ]);
    }
    public function create() {return redirect('/conf/allowance')->with('create',1);}
    public function addnew(Allowance $allowance){return redirect('/conf/allowance')->with('addnew',$allowance->id);}
    public function store(Request $request)
    {
        $vl = $request->validate([
            'name' => 'required',
            'unit' => 'required'
        ]);
        Allowance::create($request->all());
        return redirect('/conf/allowance')->with('success','Successfull');
    }

    public function edit( Allowance $allowance) {return redirect()->to(url('/conf/allowance'))->with(['id'=>$allowance->id,'data'=>$allowance]);}
    public function update( Request $request, Allowance $allowance)
    {
        if(empty($request->name??'')) return response()->json(['unsuccessful'=>'Invalid data']);
        $allowance->update(['name'=>$request->name,'unit'=>$request->unit]);
        return redirect()->to(url('/conf/allowance'))->with('success','Successfull');
    }
    public function destroy(Allowance $allowance)
    {
        $allowance->delete();
        return redirect('/conf/allowance')->with('success','Successfull');
    }

    public function level(Request $request){
        $indx = 1;
        if($request['idx'] ?? false) {
            if((int)$request['idx'] > 0) $indx = $request['idx'];
        }
        return view('allowance.level',[
            'title'=>'Tahap Kelayakan Elaun',
            'list'=>PosAllowance::with('type')->where('alwcate',$indx)->get(),
            'indx' => $indx
        ]);
    }
    public function list(){
        return response()->json($this->alwnList());
    }
}
