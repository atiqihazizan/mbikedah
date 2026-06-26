@extends('layouts.main')
@push('style')
    <style>
        div.dataTables_scrollBody,div.dataTables_wrapper .table-responsive {height: calc(100vh - 430px) !important}
    </style>
@endpush
@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Budget <span class="ms-2" kt-yr-title></span></h1>
        <ul class="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7" id="kt_toolbar_bread">
            <li class="breadcrumb-item text-gray-600"><a href="/home" class="text-gray-600 text-hover-primary">Home</a></li>
            <li class="breadcrumb-item text-gray-500">Kewangan</li>
        </ul>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
        <button type="button" class="btn btn-primary text-nowrap d-none" @if(!$needopen) disabled @endif kt-acc-year>
            <span class="indicator-label">Bina Akaun Tahunan</span>
            <span class="indicator-progress">Please wait... <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
        </button>
    </div>
@endsection
@section('body')
    <div class="card">
        <div class="card-header border-0 pt-6">
            <div class="card-title">
                <div class="d-flex align-items-center position-relative my-1">
                    <span class="svg-icon svg-icon-1 position-absolute ms-6"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect opacity="0.5" x="17.0365" y="15.1223" width="8.15546" height="2" rx="1" transform="rotate(45 17.0365 15.1223)" fill="currentColor"></rect>
                        <path d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z" fill="currentColor"></path>
                        </svg>
                    </span>
                    <input type="text" data-kt-docs-table-filter="search" class="form-control form-control-solid w-250px ps-15" placeholder="Cari..">
                </div>
            </div>
            <div class="card-toolbar">

                <select class="form-select" kt_year_budget>
                    @foreach($years as $y)
                        <option value="{{$y['value']}}" @if($y['value'] == YEAR_NOW) selected @endif>{{$y['text']}}</option>
                    @endforeach
                </select>
            </div>
        </div>
        <div class="card-body pt-0">
            <table class="table align-middle table-row-dashed fs-6 gy-5 gx-2" id="kt_table_budget">
                    <thead class="border-gray-200 fs-6 fw-bold bg-lighten">
                    <tr class="text-start text-gray-400 fw-bold fs-5 text-uppercase gs-0">
                        <th class="w-auto">Perihal</th>
                        @for($i=1;$i<13;$i++)
                            <th class="text-end ">{{ 'Bln '.$i }}</th>
                        @endfor
                    </tr>
                    </thead>
                    <tbody class="text-gray-600 fw-semibold" kt_tbody_budget></tbody>
                </table>
        </div>
    </div>
@endsection
@push('javascript')
    <script src="{{ asset('js/app/budget.js?v='.time()) }}"></script>
@endpush
