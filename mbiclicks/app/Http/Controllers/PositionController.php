<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PositionController extends Controller
{
    public function index()
    {
        return view('position.index', [
            'title' => 'Jawatan',
            'pos' => Position::orderBy('grpcate')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Position $position)
    {
        //        $fv = Validator::make($request->all(), [
        //            'counter' => 'required'
        //        ]);
        //        if ($fv->fails()) return $fv->errors()->all();
        $position->update($request->all());
        return response()->json(['success' => 'Kemaskini berjaya']);
    }
}
