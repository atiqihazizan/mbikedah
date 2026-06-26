@extends('layouts.main')
@push('style')
    <style>
        div.dataTables_scrollBody,div.dataTables_wrapper .table-responsive {height: calc(100vh - 430px) !important;}
    </style>
@endpush
@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3" toolbar-title>Bank</h1>
        <ul class="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7" id="kt_toolbar_bread">
            <li class="breadcrumb-item text-gray-600"><a href="/home" class="text-gray-600 text-hover-primary">Home</a></li>
            <li class="breadcrumb-item text-gray-500">Bank</li>
        </ul>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
    </div>
@endsection
@section('body')
    <div class="d-flex justify-content-between gap-4">
        <div class="card" page-block="0" title="Bank" style="width:500px">
            <div class="card-header border-0 pt-6">
                <div class="card-title">
                    <div class="d-flex align-items-center position-relative my-1">
                    <span class="svg-icon svg-icon-1 position-absolute ms-6">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect opacity="0.5" x="17.0365" y="15.1223" width="8.15546" height="2" rx="1"
                              transform="rotate(45 17.0365 15.1223)" fill="currentColor"></rect>
                        <path d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444
                        15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17
                        7.53333 14.4667 5 11 5Z" fill="currentColor"></path>
                        </svg>
                    </span>
                        <input type="text" data-kt-docs-table-filter="search" class="form-control form-control-solid w-250px ps-15" placeholder="Cari..">
                    </div>
                </div>
                <div class="card-toolbar">
                </div>
            </div>
            <div class="card-body pt-0">
                <table class="table align-middle table-row-dashed fs-6 gy-5 gx-2" id="kt_table_bank">
                    <thead class="border-gray-200 fs-6 fw-bold bg-lighten">
                    <tr class="text-start text-gray-400  fs-5 text-uppercase gs-0">
                        {{--<th class="w-100px">No Bank</th>--}}
                        <th class="w-auto">Nama</th>
                        {{--                    <th class="w-100px">Akaun</th>--}}
                        <th class="w-90px text-end">Jumlah</th>
                        <th class="w-50px text-end">
                            <button type="button" class="btn btn-sm btn-icon btn-light btn-active-light-primary toggle h-25px w-25px" kt-bank-add>
                                <i class="ki-duotone ki-plus fs-4 m-0"></i></button>
                        </th>
                    </tr>
                    </thead>
                    <tbody class="fw-bold text-gray-600" kt-tbody-bank></tbody>
                </table>
            </div>
        </div>
        <div class="card card-flush flex-grow-1" page-block="1" title="Transaksi Bank">
            <div class="card-header pt-7">
                <h3 class="card-title align-items-start flex-column">
                    <span class="card-label fw-bold text-dark" kt-data-trans-title></span>
                    <span class="text-gray-400 mt-1 fw-semibold fs-6">Total RM <span kt-data-trans-total></span></span>
                </h3>
                <div class="card-toolbar">
{{--                    <button class="btn btn-danger btn-sm me-2" kt-back-home>Kembali</button>--}}
                    <button class="btn btn-light btn-sm" kt-trans-addnew><span class="fa fa-plus me-2"></span></button>
                </div>
            </div>
            <div class="card-body">
                <table class="table align-middle table-row-dashed fs-6 gy-3" kt-trans-table>
                    <thead>
                    <tr class="text-gray-400 fw-bold fs-5 text-uppercase gs-0">
                        <th class="w-125px text-center">Tarikh</th>
                        <th>Perkara</th>
                        <th class="w-90px text-end">Amaun</th>
                    </tr>
                    </thead>
                    <tbody class="text-gray-600" kt-trans-tbody></tbody>
                </table>
            </div>
        </div>
    </div>
@endsection
@push('javascript')
    <script src="{{ asset('js/app/bank.js?v='.time()) }}"></script>
@endpush
