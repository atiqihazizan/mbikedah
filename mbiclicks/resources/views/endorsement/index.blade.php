@extends('layouts.main')
@section('toolbar')
    <div class="d-flex flex-column align-items-start me-3 gap-2">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Aktiviti</h1>
        <ul class="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7" id="kt_toolbar_bread">
            <li class="breadcrumb-item text-gray-600"><a href="/home" class="text-gray-600 text-hover-primary">Home</a></li>
            <li class="breadcrumb-item text-gray-500">Pengesahan atau Kelulusan Permohonan</li>
        </ul>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
    </div>
@endsection
@push('style')
    <style>
        div.dataTables_scrollBody,div.dataTables_wrapper .table-responsive {height: calc(100vh - 430px);}
    </style>
@endpush
<?php
$ustep = auth()->user()->ustep;
?>
@if(in_array(ENDORSE_KJ,$ustep))
    @include('endorsement.headofdepart')
@endif
@if(in_array(ENDORSE_PKW,$ustep) || in_array(ENDORSE_PAY,$ustep) || in_array(ENDORSE_VFY,$ustep))
    @include('endorsement.finance')
@endif
