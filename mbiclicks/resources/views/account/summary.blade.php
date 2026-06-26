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
                    <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Ringkasan Bajet</h1>
                    <ul class="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7" id="kt_toolbar_bread">
                        <li class="breadcrumb-item text-gray-600"><a href="#" class="text-gray-600 text-hover-primary">Laporan</a></li>
                        <li class="breadcrumb-item text-gray-500">Bajet</li>
                    </ul>
                </div>
                <div class="d-flex align-items-center py-2" id="kt_toolbar_act">
                    <a href="javascript:;" class="btn btn-sm btn-primary me-2" id="print"><i class="fa fa-print fa-bold"></i></a>
                    <input type="hidden" id="pathview" value="finance/summary/{{$lay}}/{{$type}}/">
                    <select class="form-select" kt-year-budget>
                        @foreach($yrs as $y)
                            <option value="{{$y}}" @if($yr_selected ==$y) selected @endif >{{$y}}</option>
                        @endforeach
                    </select>
                    <a href="/finance/summary/{{$lay}}/{{$type}}/{{ $yr_selected }}" class="btn btn-sm btn-primary ms-3 text-nowrap" kt-view-budget>Papar</a>
                </div>
            </div>
        </div>

        <div class="app-content flex-column-fluid pb-0">
            <div class="card min-h-100">
                <div class="card-body overflow-auto">
                    @includeIf('account.partial._lay' . $lay)
                </div>
            </div>
        </div>
    </div>
@endsection
@push('javascript')
    <script>
        var kt_summary = function(){

            return {
                init:function(){
                    let yrEl = document.querySelector('[kt-year-budget]')
                    yrEl.addEventListener('change',function(e){
                        e.preventDefault()
                        let url = document.getElementById('pathview').value
                        let btn = document.querySelector('[kt-view-budget]')
                        btn.href = APP_URL + url + this.value
                    })
                }
            }
        }()

        document.addEventListener("DOMContentLoaded", () => {
            kt_summary.init();
        });
    </script>
@endpush
