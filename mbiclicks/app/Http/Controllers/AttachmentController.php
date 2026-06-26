<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Petition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AttachmentController extends Controller
{
    public function index(){}
    public function create(){}
    public function store(Request $request){}
    public function show(Attachment $attachment){}
    public function edit(Attachment $attachment){}
    public function update(Request $request, Attachment $attachment){}
    public function destroy(Attachment $attachment){}

    public function getattach(Petition $petition){
        $file = $petition->attachment;
        return response()->json(['success'=>$file]);
    }
    public function addattach(Request $request,Petition $petition){
//        $validator = Validator::make($request->all(), ['attach' => ['file','mimes:pdf,jpg,jpeg,png','max:2048']],[
        $validator = Validator::make($request->all(), ['attach' => ['file','max:3072','mimes:pdf,jpg,jpeg,png']],[
            'attach.max' => 'Saiz fail tidak boleh melebihi dari 3MB',
            'attach.mimes'=> 'Format pdf, jpg, jpeg, dan png sahaja dibenarkan'
//            'attach.max' => 'The file must not greater than 2MB',
//            'attach.mimes'=> 'The file must be a format pdf, jpg, jpeg, png only'
        ]);

        if ($validator->fails()) return response()->json(['fails' => $validator->errors()->all()]);
        $data = [];
        if($request->hasFile('attach')){
            $data['petition_id'] = $petition->id;
            $data['depart_id'] = auth()->user()->staff->depart_id;
            $data['path'] = $request->file('attach')->store('attachment');
            $data['ext'] = $request->file('attach')->getClientOriginalExtension();
            $data['filename'] = $request->file('attach')->getClientOriginalName();
            Attachment::create($data);
        }
        return response()->json(['success'=>Attachment::where('petition_id',$petition->id)->get()]);
    }
    public function delattach(Request $request,Petition $petition){
        $id = $request->id;
        $attch = Attachment::find($id);
        Storage::delete($attch->path);
        $attch->delete();
        return response()->json(['success'=>Attachment::where('petition_id',$petition->id)->get()]);;
    }
}
