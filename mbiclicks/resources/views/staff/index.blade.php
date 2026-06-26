@extends('layouts.main')
@section('toolbar')
    <div class="d-flex flex-column align-items-start me-3 gap-2">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Senarai Pekerja</h1>
        <ul class="breadcrumb breadcrumb-dot fw-semibold text-gray-600 fs-7">
            <li class="breadcrumb-item text-gray-600">
                <a href="/home" class="text-gray-600 text-hover-primary">Home</a>
            </li>
            <li class="breadcrumb-item text-gray-600">Tetapan</li>
            <li class="breadcrumb-item text-gray-500">Senarai Pekerja</li>
        </ul>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
        <button type="button" class="btn btn-primary" kt-button-add-staff>
            <span class="fa fa-plus me-1"></span> Tambah Staff
        </button>
    </div>
@endsection
@section('body')
    <div class="card">
        <div class="card-header border-0 pt-6">
            <div class="card-title">
                <div class="d-flex align-items-center position-relative my-1">
                    <span class="svg-icon svg-icon-1 position-absolute ms-6">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect opacity="0.5" x="17.0365" y="15.1223" width="8.15546" height="2" rx="1" transform="rotate(45 17.0365 15.1223)" fill="currentColor" />
                            <path d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z" fill="currentColor" />
                        </svg>
                    </span>
                    <input type="text" data-kt-staff-table-filter="search" class="form-control form-control-solid w-250px ps-15" placeholder="Search Staff" />
                </div>
            </div>
            <div class="card-toolbar"><div class="d-flex justify-content-end" data-kt-staff-table-toolbar="base"></div></div>
        </div>
        <div class="card-body pt-0">
            <table class="table align-middle table-row-dashed fs-6 gy-2" id="kt_staff_table">
                <thead>
                    <tr class="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
                        <th class="w-80px">Staff No</th>
                        <th class="min-w-125px">Nama Penuh</th>
                        <th class="min-w-125px">Jawatan</th>
                        <th class="min-w-125px">Jabatan</th>
{{--                        <th class="w-150px">Mula Berkhidmat</th>--}}
                        <th class="w-30px"></th>
                    </tr>
                </thead>
                <tbody class="fw-semibold text-gray-600">

               {{-- @foreach($staff as $d)
                    <tr class="">
                        <td class="text-center">{{$d->staffno}}</td>
                        <td><a href="javascript:;" class="text-gray-800 text-hover-primary">{{ Str::title($d->fullname) }}</a></td>
                        <td class="text-gray-600">{{ Str::title($d->position->name??'') }}</td>
                        <td class="text-gray-600">{{ Str::title($d->depart->name) }}</td>
                        <td class="text-center">{{ $d->service_at?date('d-m-Y',strtotime($d->service_at)):'' }}</td>
                        <td>
                            <a href="/conf/staff/{{ $d->id }}" class="btn btn-primary btn-icon w-25px h-25px">
                                <span class="fa fa-user-cog"></span>
                            </a>
                        </td>
                    </tr>
                @endforeach--}}
                </tbody>
            </table>
        </div>
    </div>
@endsection
@push('javascript')
    <script>
        var kt_staff = function(){
            function drawData(data=[]){
                let tbody = document.querySelector('#kt_staff_table tbody')
                tbody.innerHTML = data.map(e => {
                    return `
                    <tr class="">
                        <td class="text-center">${e.staffno}</td>
                        <td><a href="javascript:;" class="text-gray-800 text-hover-primary">${ toTitleCase(e.fullname) }</a></td>
                        <td class="text-gray-600">${ toTitleCase(e?.position?.name??'') }</td>
                        <td class="text-gray-600">${ toTitleCase(e.depart.name) }</td>
                        <td>
                            <a href="${APP_URL}conf/staff/${ e.id }" class="btn btn-primary btn-icon w-25px h-25px">
<span class="fa fa-pencil-alt fs-8"></span></a>
                        </td>
                    </tr>
                    `
                }).join('')
            }
            async function init(){
                let res = await $.get(APP_URL+'conf/staff/?json=1')
                drawData(res.data)
                document.querySelector('[kt-button-add-staff]').addEventListener('click',function(e){
                    e.preventDefault();
                    let pos = '';
                    let dep = '';
                    let html = `<form id="swaform" autocomplete="off">@include('staff.partial._form')</form>`;
                    swaHtml('Staff baru',html,function(){
                        let form = document.getElementById('swaform')
                        let formSerial = $(form).serializeArray()
                        let param = {_token:CSRF_TOKEN, ...formSerial.reduce((k,v)=>({ ...k, [v.name]: v.value}), {} )}

                        return $.post(APP_URL+'conf/staff/',param).then(res => {
                            if(!res.success) {
                                Swal.showValidationMessage(res.message);
                                return console.log(res)
                            }
                            drawData(res.data)
                        })
                    }).then(res=>{
                        if(!res.isConfirmed) return;
                    })
                })
            }
            return {
                init:init
            }
        }()
        document.addEventListener("DOMContentLoaded", () => kt_staff.init());

    </script>
@endpush

