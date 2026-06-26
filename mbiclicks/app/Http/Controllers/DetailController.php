<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Petition;
use Illuminate\Http\Request;

class DetailController extends Controller
{
    public function index(){}
    public function create(){}
    public function store(Request $request){}
    public function show(Petition $petition){}
    public function edit(Petition $petition){}
    public function update(Request $request, Petition $petition){}
    public function destroy(Petition $petition){}

    public function detail(Petition $petition){
        return response()->json(['success'=>$petition->plist=='' ? [] : collect(json_decode($petition->plist,true))]);
    }
    public function detadd(Request $request, Petition $petition){
        $obj = $request->except('_token');
        $data = [];
        if($petition->plist != '' ) $data['plist'] = json_decode ($petition->plist,true);
        $total = (float)$obj['unit'] * (float)$obj['amnt'];
        $id = $obj['item'];
        $item = Item::find($id);
        $obj['item'] = $item['name'];
        $obj['amnt'] = number_format($obj['amnt'],2);
        $obj['total'] = number_format($total,2);
        $obj['curr'] = $total;
        $data['plist'][] = $obj;
        $data['tamt'] = $this->retotal($data['plist']);
        $petition->update($data);
        return response()->json(['success'=>$data['plist']]);
    }
    public function detdel(Request $request, Petition $petition){
        $idx = $request['idx'];
        $obj = [];
        if($petition->plist != '' ) {
            $obj = json_decode($petition->plist,true);
            unset($obj[$idx]);
            $obj = array_values($obj);
        }
        $data['tamt'] = $this->retotal($obj);
        $data['plist'] = $obj;
        $petition->update($data);
        return response()->json(['success'=>$data['plist']]);
    }

    private function retotal($data){
        $total = 0;
        for ($i=0;$i<count($data);$i++){$total += (float)$data[$i]['curr'];}
        return $total;
    }
}
