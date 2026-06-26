@extends('layouts.main')
@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Kelayakan Cuti</h1>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
    </div>
@endsection
@section('body')
    <div class="row">
        @foreach($group as $g)
            <div class="col-md-6">
                <div class="card mb-5">
                    <div class="card-body">
                        <p class="fw-bold text-uppercase text-gray text-center text-info fs-5">{{ $g->name }}</p>
                        <table class="table-bordered w-100 gs-3" id="table_leave_{{ $g->id }}">
                            <thead>
                            <tr class="text-center fw-bold fs-7 text-uppercase">
                                <th class="w-auto">Tahun Sehingga</th>
                                <th class="w-auto">Kelayakan</th>
                                <th class="w-auto">Had Bawa Kehadapan</th>
                                <th class="w-auto">Had Baki</th>
                            </tr>
                            </thead>
                            <tbody class="text-gray-700" id="tbody_leave">
                            @php($arr = [])
                            @foreach($g->leaveEntitle as $e)
                                @if(!in_array($e->leave->leave,$arr))
                                    @php($arr[] = $e->leave->leave)
                                    <tr>
                                        <td colspan="4" class="py-2 ps-3">{{ $e->leave->leave }}</td>
                                    </tr>
                                @endif
                                <tr kt-tr="{{$e->id}}">
                                    <td class="text-end pe-2 py-1"><a href="javascript:;" class="text-gray-700 text-hover-primary" kt-y>{{ $e->yr_up }}</a></td>
                                    <td class="text-end pe-2 py-1"><a href="javascript:;" class="text-gray-700 text-hover-primary" kt-e>{{ $e->entitle }}</a></td>
                                    <td class="text-end pe-2 py-1"><a href="javascript:;" class="text-gray-700 text-hover-primary" kt-f>{{ $e->maxbfwd }}</a></td>
                                    <td class="text-end pe-2 py-1"><a href="javascript:;" class="text-gray-700 text-hover-primary" kt-b>{{ $e->maxbal }}</a></td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
@endsection
@push('javascript')
    <script>
        var kt_yearupto = function(){
            function init(){
                let tr = document.querySelectorAll('[kt-tr]')
                tr.forEach(el => {
                    let id = el.getAttribute('kt-tr') * 1
                    let uYr = el.querySelector('[kt-y]')
                    let uEn = el.querySelector('[kt-e]')
                    let uFw = el.querySelector('[kt-f]')
                    let uBl = el.querySelector('[kt-b]')

                    uYr.addEventListener('click',function(){update(this,id,'yr_up')})
                    uEn.addEventListener('click',function(){update(this,id,'entitle')})
                    uFw.addEventListener('click',function(){update(this,id,'maxbfwd')})
                    uBl.addEventListener('click',function(){update(this,id,'maxbal')})
                })
            }
            function update(el,id,key){
                let val = el.innerText
                swaTextOnly('Kemaskini','','Simpan',cnt => {
                    let param = {_token:CSRF_TOKEN}
                    param[key] = cnt*1
                    return $.put(APP_URL+'conf/leave/yeartoup/'+id,param).done(res=>{
                        if(!res.success) return console.log(res);
                        el.innerText = cnt *1
                    })
                },'number',val)
            }
            return { init: init}
        }()
        document.addEventListener("DOMContentLoaded", () => kt_yearupto.init());
    </script>
@endpush
