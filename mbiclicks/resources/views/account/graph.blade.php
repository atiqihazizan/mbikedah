@extends('layouts.main')

@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Carta Pendapatan Dan Perbelanjaan</h1>
        <ul class="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7" id="kt_toolbar_bread">
            <li class="breadcrumb-item text-gray-600"><a href="/home" class="text-gray-600 text-hover-primary">Home</a></li>
            <li class="breadcrumb-item text-gray-500">Carta</li>
        </ul>
    </div>
@endsection
@section('body')
    <div class="card">
        <div class="card-body">
            <button class="btn btn-secondary position-absolute z-index-1" style="right: 15px" id="printout-click"><i class="fa fa-print"></i></button>
            <div id="printout">
                <h1 class="text-center fw-bold mt-3 text-uppercase">CARTA PENDAPATAN DAN PERBELANJAAN SEHINGGA <span id="datenow"></span></h1>
                <div id="graph_sum" style="width:100%;"></div>
                <style>
                    /*.table-chart .mth {width: calc({{ 100/7 }}% - 20px)}*/
                    .table-chart .mth ,.table-chart .label { font-size: 8pt}
                    .table-chart .mth {width: auto}
                    .table-chart .label {width: 175px }
                    .table-chart {margin-top: -11px;z-index: 10000;position: relative;}
                    .table-chart tr:first-child td:first-child { border: 0; }
                    .table-chart tr:first-child { border-top: 0; }
                    @media print {
                        body {padding-right: 15mm;}
                        #graph_sum img{width: 100%;}
                        .label {font-size: 7pt; width:150px !important;}
                    }
                </style>
{{--                <canvas id="graph_sum" class="mh-500px"></canvas>--}}
                <table class="table table-sm table-bordered border-gray-900 table-chart" ></table>
            </div>
        </div>
    </div>
@endsection
@push('javascript')
    <script>
        // var dataGraph = [
        //     ['', 'Sebenar Pendapatan', 'Sebenar Perbelanjaan', 'Bajet Pendapatan', 'Bajet Perbelanjaan'],
        //     ['JAN',1437985,1439185,3550705,2347568],
        //     ['FEB',2759929,887126,4462564,3983647],
        //     ['MAC',3508917,4746123,4665424,4372975],
        //     ['APR',1985165,127041,6370115,6076088],
        //     ['MEI',1985165,127041,6370115,6076088],
        //     ['JUN',1985165,127041,6370115,6076088],
        //     ['JUL',1985165,127041,6370115,6076088],
        //     ['OGO',1985165,127041,6370115,6076088],
        //     ['SEP',1985165,127041,6370115,6076088],
        //     ['OKT',1985165,127041,6370115,6076088],
        //     ['NOV',1985165,127041,6370115,6076088],
        //     ['DIS',1985165,127041,6370115,6076088],
        // ];
        var dataGraph = @json($data) || [];

    </script>
    <script src="//www.google.com/jsapi"></script>
    <script src="{{asset('js/app/finance_actual_bajet.js?v='.time())}}"></script>
@endpush
