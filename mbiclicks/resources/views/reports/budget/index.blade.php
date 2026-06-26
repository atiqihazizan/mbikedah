@extends('layouts.report')
@section('container')
<style>
    div#tab51 table { border-collapse: collapse; width: 100%}
    div#tab51 table td,
    div#tab51 table th {
        border: 1px solid;
        padding: 0.3rem 0.5rem;
    }
    div#tab51 table thead {background-color: dimgrey;color: white;}
    div#tab51 table tfoot {background-color: grey;color: white;}
    div#tab51 table th {text-align: center;}
</style>
<div class="d-flex flex-column flex-column-fluid">
        <div class="app-toolbar align-items-center justify-content-between py-2 py-lg-4 z-index-3">
            <div class="d-flex flex-grow-1 flex-stack flex-wrap gap-2 mb-n10" id="kt_toolbar">
                <div class="d-flex flex-column align-items-start me-3 gap-2">
                    <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Laporan Bajet</h1>
                    <ul class="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7" id="kt_toolbar_bread">
                        <li class="breadcrumb-item text-gray-600"><a href="#" class="text-gray-600 text-hover-primary">Laporan</a></li>
                        <li class="breadcrumb-item text-gray-500">Laporan Bajet</li>
                    </ul>
                </div>
                <div class="d-flex align-items-center py-2" id="kt_toolbar_act">
                    <a href="{{ route('budget.modified') }}" class="btn btn-primary btn-sm  me-3" id="generate">Kemaskini Bajet</a>
                    <a href="#" class="btn btn-sm btn-primary" id="print"><i class="fa fa-print fa-bold"></i></a>
                </div>
            </div>
        </div>

        <div class="app-content flex-column-fluid pb-0">
            <div class="card min-h-100">
                <div class="card-header position-relative py-0 border-bottom-1">
                    <h3 class="card-title">&nbsp;</h3>
                    <div class="card-toolbar mb-0">
                        <ul class="nav nav-tabs nav-line-tabs nav-stretch fs-6 border-0">
                            <li class="nav-item"><a class="nav-link py-6 active" data-bs-toggle="tab" href="#kt_tab_rpt_1">Ringkasan Bajet</a></li>
                            <li class="nav-item"><a class="nav-link py-6" data-bs-toggle="tab" href="#kt_tab_rpt_2">Ringkasan Keseluruhan</a></li>
                            <li class="nav-item"><a class="nav-link py-6" data-bs-toggle="tab" href="#kt_tab_rpt_3">Ringkasan Hasil Punca</a></li>
                            <li class="nav-item"><a class="nav-link py-6" data-bs-toggle="tab" href="#kt_tab_rpt_4">Ringkasan Belanja</a></li>
                            <li class="nav-item"><a class="nav-link py-6" data-bs-toggle="tab" href="#kt_tab_rpt_5">Perincian Hasil Punca</a></li>
                            <li class="nav-item"><a class="nav-link py-6" data-bs-toggle="tab" href="#kt_tab_rpt_6">Perincian Belanja</a></li>
                        </ul>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <div class="tab-content" id="myTabContent">
                            <div class="tab-pane fade show active" id="kt_tab_rpt_1" role="tabpanel">
                                {{--@include('preview.tools.letterhead')--}}
                                @include('reports.budget.sum0')
                            </div>
                            <div class="tab-pane fade" id="kt_tab_rpt_2" role="tabpanel">
                                {{--@include('preview.tools.letterhead')--}}
                                @include('reports.budget.sum1')
                            </div>
                            <div class="tab-pane fade" id="kt_tab_rpt_3" role="tabpanel">
                                {{--@include('preview.tools.letterhead')--}}
                                @include('reports.budget.sum2',['type'=>1,'title'=>'PENERIMAAN HASIL'])
                            </div>
                            <div class="tab-pane fade" id="kt_tab_rpt_4" role="tabpanel">
                                {{--@include('preview.tools.letterhead')--}}
                                @include('reports.budget.sum2',['type'=>2,'title'=>'PERBELANJAAN'])
                            </div>
                            <div class="tab-pane fade" id="kt_tab_rpt_5" role="tabpanel">
                                {{--@include('preview.tools.letterhead')--}}
                                @include('reports.budget.sum3',['type'=>1,'title'=>'PENERIMAAN HASIL'])
                            </div>
                            <div class="tab-pane fade" id="kt_tab_rpt_6" role="tabpanel">
                                {{--@include('preview.tools.letterhead')--}}
                                @include('reports.budget.sum3',['type'=>2,'title'=>'PERBELANJAAN'])
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
@push('javascript')
    @if( session()->get('update_done'))
        <script>toastr.success("Kemaskini selesai", "Kemaskini");</script>
    @endif
    @if( session()->get('update_fail'))
        <script>toastr.error("{{session()->get('update_fail')}}", "Kemaskini");</script>
    @endif
    <script>
        let bprint = document.getElementById('print')
        bprint.addEventListener('click',function(){
            let div = document.querySelector('.tab-pane.show.active')
            printJS(div.innerHTML,'Cetak Laporan Bajet')
        })
    </script>
@endpush
