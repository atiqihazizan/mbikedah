<?php

namespace App\Http\Controllers;

use App\Models\Petition;
use App\Models\StaffEvent;
use App\Models\StaffLeave;
use App\Models\System;
use App\Traits\PetitionsTraits;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(){
        $user = auth()->user();
        $staff = $user->staff;
//        $staffid = $user->staff_id;

        $leave =  $staff->leaveByYear;
//        dd($staff->leaveByYear[1]->leaveType);
//        StaffLeave::with('leaveType')->where([['staff_id',$staffid],['yr',YEAR_NOW]])->get();
        $mypeti = collect(Petition::where('created_id',$user->id)->get());
        $status = [
            ['bg-success','las la-folder-open',$mypeti->count(),'Permohonan'],
            ['bg-info','las la-hourglass-half',$mypeti->where('psts',2)->count(),'Pengesahan'],
            ['bg-primary','las la-thumbs-down',$mypeti->where('psts',4)->count(),'Dibatalkan'],
//            ['bg-danger','las la-thumbs-down',$pendingcount,'Aktivity'],
        ];
//        $sys = System::first();
        $title = 'Utama';
//        $event = StaffEvent::where('depart_id',$user->depart_id)->first();
        return view('dashboard.index',compact(['title','leave','status']));
    }
}
