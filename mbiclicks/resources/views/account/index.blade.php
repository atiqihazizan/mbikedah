@extends('layouts.main')

@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Kod Kewangan</h1>
        <ul class="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7" id="kt_toolbar_bread">
            <li class="breadcrumb-item text-gray-600"><a href="/home" class="text-gray-600 text-hover-primary">Home</a></li>
            <li class="breadcrumb-item text-gray-500">Kewangan</li>
        </ul>
    </div>
@endsection
@section('body')
    <div class="card">
        <div class="card-body py-4 ps-5 pe-0">
            <div class="" style="height: calc(100vh - 340px) !important; overflow-y: auto; padding-right: .75rem">
                <table class="table table-flush table-hover align-middle table-row-bordered table-row-solid gy-4 gx-2" kt_acc_data>
                    <thead class="border-gray-200 fs-6 fw-bold bg-lighten align-middle">
                    <tr class="fw-bolder text-uppercase">
                        <th class="w-150px">
                            <a href="javascript:;" kt_add_acc><i class="fa fa-plus-square fs-1 text-primary me-3"></i></a>
                            <span>Kod Akaun</span>
                        </th>
                        <th class="w-auto">Perihal</th>
                        <th class="text-end w-80px">Jenis</th>
                        {{--<th class="text-center w-80px">Txn</th>--}}
                        <th class="text-end w-90px">
                        </th>
                    </tr>
                    </thead>
                    <tbody class="fs-6 text-gray-600"></tbody>
                </table>
            </div>
        </div>
    </div>
@endsection
@push('javascript')
<script src="{{asset('js/app/finance.js?v='.time())}}"></script>
@endpush
