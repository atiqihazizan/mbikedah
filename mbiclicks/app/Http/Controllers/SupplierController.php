<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {

        $field = ['id','name as text'];
        $rs = Supplier::select($field)->get();//where('pid',0)->orderBy('code','asc')->get();
        if(isset($request->searchTerm)) $rs = Supplier::where('name','like', '%'.$request->searchTerm.'%')->get($field);

        return response()->json(['data'=>$rs]);
//        return Supplier::select('id','name as text')->get();
    }

    public function store(Request $request)
    {
        Supplier::create(['name'=>$request->nama]);
        return redirect()->route('supplier.index');
//        return response()->json(['success'=>Supplier::select('id','name as text')->get()]);;
    }
    public function show(Supplier $supplier)
    {
        //
    }

    public function update(Request $request, Supplier $supplier)
    {
        //
    }
    public function destroy(Supplier $supplier)
    {
        //
    }
}
