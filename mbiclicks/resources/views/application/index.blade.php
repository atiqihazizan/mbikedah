@extends('layouts.main')
@section('toolbar')
    <div class="d-flex flex-column align-items-start me-3 gap-2">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Permohonan</h1>
        <ul class="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7" id="kt_toolbar_bread">
            <li class="breadcrumb-item text-gray-600"><a href="/home" class="text-gray-600 text-hover-primary">Home</a></li>
            <li class="breadcrumb-item text-gray-500">Permohonan</li>
        </ul>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
    </div>
@endsection
@section('body')
    <div class="card min-h-100" >
        <div class="card-body">
            <a href="{{URL::asset('/petition/bayaran')}}" class="btn btn-primary">Permohonan Bayaran</a>
        </div>
    </div>
@endsection
