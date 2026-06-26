<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Necessity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NecessityController extends Controller
{
    public function index() {}
    public function create() {}
    public function store(Request $request) {}
    public function show(Necessity $necessity) {}
    public function edit(Necessity $necessity) {}
    public function update(Request $request, Necessity $necessity) {}
    public function destroy(Necessity $necessity) {}
    public function getItem(Request $request){
        $need = Necessity::all();
        $cate = [];
        $item = [];
        foreach ($need as $n){
            if($n->actv == 0) continue;
            if($n->parent == 0)$cate[$n->id] = $n;
            if($n->db == 1 && $n->dbname == 'assets'){
                $staffid = $request->staff??0;
//                $rw = Asset::select(['id', DB::raw("CONCAT(model,'-',regno) as item"), DB::raw("'$n->id' as parent"), DB::raw("'car' as verifycode")])
                $rw = Asset::where('staff_id',0)->orWhere('staff_id',$staffid)->get();
                $data = [];
                foreach ($rw as $r){
                    $data[$r->id] = (object)[
                        'id' => $r->id,
                        'item' => $r->model . '-' . $r->regno,
                        'parent' => $n->id,
                        'verifycode' => 'car',
                        'onlyone' => true,
                    ];
                }
                $item[$n->id] = $data;
            } else if($n->parent > 0) {
                $n->verifycode = 'necessary';
                $n->onlyone = false;
                $item[$n->parent][$n->id] = $n;
            }
        }
        return response()->json(['cate'=>$cate,'item'=>$item]);
    }
}
