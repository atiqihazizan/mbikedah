
@extends('layouts.main')

@section('container')
    <div class="app-toolbar align-items-center justify-content-between py-2 py-lg-4">
        <div class="d-flex flex-grow-1 flex-stack flex-wrap gap-2 mb-n10" id="kt_toolbar">
            <div class="d-flex flex-column align-items-start me-3 gap-2">
                <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Ringkasan Cuti Pekerja</h1>
            </div>
            {{--<div class="d-flex align-items-center py-2" id="kt_toolbar_act">
                <div class="me-2">
                    <select class="form-select form-select-sm w-250px" data-kt-select2="true" data-hide-search="true" data-placeholder="Staff" onchange="category(this)">
                        <option></option>
                        @foreach($staff as $s)
                            <option value="{{$s->staffno}}" @if(request()->staff == $s->staffno) selected @endif >{{$s->fullname}}</option>
                        @endforeach
                    </select>
                </div>
            </div>--}}
        </div>
    </div>

    <div class="app-content flex-column-fluid pb-0" id="kt_app_contents">
        <div class="card mb-6">
            {{--<div class="card-body pt-9 px-0 pb-0">--}}
            <div class="card-body">
                <form action="/leave/staff" method="get" class=" d-flex justify-content-between gap-2">
                    <div class="flex-grow-1">
                        <select class="form-select form-select-sm w-100" data-kt-select2="true" data-hide-search="false" data-placeholder="Staff"  name="staff">
                            <option></option>
                            @foreach($staff as $s)
                                <option value="{{$s->staffno}}" @if(old('staff',request()->staff)==$s->staffno) selected @endif >{{$s->fullname}}</option>
                            @endforeach
                        </select>
                        @error('staff') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
                    </div>
                    <div>
                        <select class="form-select form-select-sm w-150px" data-kt-select2="true" data-hide-search="true" data-placeholder="Cuti"  name="type">
                            <option></option>
                            @foreach($lvtype as $s)
                                <option value="{{$s->fieldname}}" @if(old('type',request()->type)==$s->fieldname) selected @endif >{{str_replace('Cuti','',$s->leave)}}</option>
                            @endforeach
                        </select>
                        @error('type') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
                    </div>
                    <div>
                        <button type="submit" class="btn btn-primary btn-sm"><i class="fa fa-search p-0"></i></button>
                    </div>
                </form>
                {{--<div class="d-flex flex-wrap flex-sm-nowrap"></div>
                <div class="d-flex align-items-center">
                    <button type="button" class="btn bg-transparent border-0 mt-2" onclick="moveNavigation(-100)"><span class="fa fa-chevron-left text-active-primary fs-5"></span></button>
                    <ul class="nav nav-stretch nav-line-tabs nav-line-tabls-2x border-transparent fs-5 fw-bold flex-nowrap flex-grow-1 overflow-hidden" style="height: 63px;scroll-behavior: smooth;">
                        @foreach($lvtype as $t)
                            <li class="nav-item mt-2 text-nowrap leave-tab">
                                <form action="/leave/staff" method="get">
                                    <input type="hidden" name="type" value="{{ $t->fieldname }}">
                                    <input type="hidden" name="staff" value="{{ request()->staff }}">
                                    <button type="submit" class="nav-link text-active-primary ms-0 me-10 py-5 bg-transparent {{request()->input('type') == $t->fieldname?'active':''}}" id="{{$t->fieldname}}">
                                        {{ str_replace('Cuti','',$t->leave)}}
                                    </button>
                                </form>
                            </li>
                        @endforeach
                    </ul>
                    <button type="button" class="btn bg-transparent border-0 mt-2" onclick="moveNavigation(100)"><span class="fa fa-chevron-right text-active-primary fs-5"></span></button>
                </div>--}}

            </div>
        </div>
        <div class="d-flex flex-wrap flex-stack mb-6"></div>
        <div class="card g-6 g-xl-9" style="min-height: calc( 100vh - 486px );">
            <div class="table-responsive">
                <table class="table table-sm table-row-dashed table-row-gray-300 gy-4 gs-7 table-hover align-middle g-2">
                    <thead class="border-gray-200 fs-6 fw-bold bg-lighten">
                        <tr class="fw-bold fs-6 text-gray-800 text-uppercase">
                            <th class="text-center w-100px">Tarikh</th>
                            <th class="text-center w-150px">Dari</th>
                            <th class="text-center w-150px">Hingga</th>
                            <th class="text-center w-50px">Jum</th>
                            <th class="">Sebab</th>
                        </tr>
                    </thead>
                    <tbody>
                    @if(count($petition)>0)
                        @foreach($petition as $p)
                            <tr>
                                <td class="text-center">{{date('d-m-Y',strtotime($p->pdate))}}</td>
                                <td class="text-center">{{$p->bodyat}}</td>
                                <td class="text-center">{{$p->bodyto}}</td>
                                <td class="text-center">{{$p->counter}}</td>
                                <td>{{$p->reason}}</td>
                            </tr>
                        @endforeach
                    @else
                        <tr>
                            <td class="text-center fst-italic" colspan="5">Tiada Data</td>
                        </tr>
                    @endif
                    </tbody>
                </table>
            </div>
        </div>

        {{--<div class="d-flex flex-stack flex-wrap pt-10"></div>--}}
    </div>

@endsection

@push('javascript')
    <script>
        var navigation= document.getElementsByClassName("nav")[0];
        function moveNavigation(byX) {
            navigation.scrollLeft= navigation.scrollLeft + byX;
        }
        let lvtab = document.querySelectorAll('.leave-tab');
        let lvtabActive = document.querySelector('.leave-tab button.active');
        let wid = 0;
        lvtab.forEach(function(e){
            let btn = e.querySelector('button');
            let navwid = navigation.clientWidth
            wid += e.clientWidth
            if(lvtabActive == null) return false;
            if(btn.id == lvtabActive.id && wid > navwid) {moveNavigation(wid-navwid); return false;}
            return true;
        })
        function category(e){
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            let url = `/leave/staff?staff=${e.value}`;
            if(urlParams.has('type'))url += '&type=' + urlParams.get('type')
            window.document.location.href = url
        }
    </script>
@endpush
