@extends('layouts.main')
@push('style')
    <style>
        div.dataTables_scrollBody,div.dataTables_wrapper .table-responsive {height: calc(100vh - 430px);}
    </style>
@endpush
@section('toolbar')
    <div class="d-flex flex-column align-items-start me-3 gap-2">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Semakan</h1>
        <ul class="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7" id="kt_toolbar_bread">
            <li class="breadcrumb-item text-gray-600"><a href="#" class="text-gray-600 text-hover-primary">Home</a></li>
            <li class="breadcrumb-item text-gray-500">Pengesahan yang telah dibuat</li>
        </ul>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act"></div>
@endsection
@section('body')
    <div class="card frapage min-h-100" id="kt-table-petition">
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
                <div class="d-flex justify-content-end" data-kt-approval-table-toolbar="base"></div>
            </div>
        </div>
        <div class="card-body pt-0">
            <table class="table align-middle table-row-dashed fs-6 gy-5" id="kt_table_events">
                <thead>
                <tr class="text-start fw-bold fs-7 text-uppercase gs-0">
                    <th class="w-300px">Jenis</th>
                    <th class="text-start" style="width: 436.25px">Staff</th>
                    <th class="">Catatan</th>
                    {{--<th class="w-80px">Status</th>--}}
                    <th class="w-175px text-end">Tarikh dan Masa</th>
                    <th class="w-10px">Papar</th>
                </tr>
                </thead>
                <tbody class="text-gray-600 fw-semibold"></tbody>
            </table>
        </div>
    </div>

    @include('approval.partial._overview')

@endsection
@push('javascript')
    <script src="{{ URL::asset('js/app/archive.js?v='.time()) }}"></script>
@endpush
