@extends('layouts.main')
@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <a href="{{ route($pgback)  }}" class="text-dark fw-bolder ps-1 fs-3"><span class="fa fa-chevron-left"></span></a>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
        <a class="btn pb-2 px-2" onclick="printClick('printpage','Permohonan')"><span class="fa fa-print fs-2"></span></a>
    </div>
@endsection
@section('body')
    <div class="card min-h-100">
        <div class="card-body">
            @include('preview.' . $data->ptype->code)
        </div>
    </div>
@endsection
