@extends('layouts.main')
@section('toolbar')
    <div class="d-flex flex-column align-items-start me-3 gap-2">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Kenderaan Pejabat</h1>
        <ul class="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7" id="kt_toolbar_bread">
            <li class="breadcrumb-item text-gray-600"><a href="/home" class="text-gray-600 text-hover-primary">Home</a></li>
            <li class="breadcrumb-item text-gray-500">Kenderaan Pejabat</li>
        </ul>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
    </div>
@endsection
@section('body')
    <div class="card min-h-100">
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
{{--                <button type="button" class="btn btn-primary"><span class="fa fa-plus"></span> Tambah Baru</button>--}}
            </div>
        </div>

        <div class="card-body pt-0">
            <table class="table align-middle table-row-dashed fs-6 gy-5" id="kt_table_car_booking">
                <thead class="border-gray-200 fs-6 fw-bold bg-lighten">
                <tr class="text-start fw-bold fs-7 text-uppercase gs-0">
                    <th class="w-125px">Kenderaan</th>
                    <th class="w-100px">Plate No</th>
                    <th class="text-center w-100px">Dari</th>
                    <th class="text-center w-100px">Hingga</th>
                    <th class="">Pengguna</th>
                    <th class="text-center w-70px">Status</th>
                    <th class="text-end w-60px"></th><!--Action-->
                </tr>
                </thead>
                <tbody class="text-gray-600 fw-semibold" id="tbody_booking"></tbody>
            </table>
        </div>
    </div>
@endsection
@push('modal')
    @include('asset.modal_asset')
    @include('asset.modal_asset_return')
    @include('asset.modal_asset_booking')
    @include('asset.modal_asset_summary')
@endpush
@push('javascript')
    <script>
        "use strict";
        var KTAsset = function(){
            var table;
            var dt;
            var filter;
            var modal = {};
            var modalEL = {};

            var initTable = function(){
                const d = new Date();
                dt = $("#kt_table_car_booking").DataTable({
                    ajax: {url:APP_URL +'asset/?datajson=' + d.getTime()},
                    columns: [{data: 'model'}, {data: 'regno'},{data:'booking'},{data:'booking'},{data: 'staff'},{data:null},{data:null}],
                    columnDefs: [
                        {targets: 2,orderable: false,className: 'text-center',render: function(data,type,row){return row.booking?moment(row.booking.dtstart).format('D MMM Y'):''}},
                        {targets: 3,orderable: false,className: 'text-center',render: function(data,type,row){return row.booking?moment(row.booking.dtuntil).format('D MMM Y'):''}},
                        {targets: 4,orderable: false,className:  'text-start',render: function(data,type,row){return row.staff?toTitleCase(row.staff.fullname):''}},
                        {targets: 5,orderable: false,className: 'text-end',render: function(data,type,row){return row.book_id>0?`<span class="badge badge-light-danger">Sedang digunakan</span>`:''}},
                        {
                            targets: -1, data: null, orderable: false, className: 'text-end',render: function(data,type,row){
                                let btn = `<button class="btn btn-icon btn-light btn-active-light-primary w-30px h-20px" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end"><i class="bi bi-three-dots fs-5"></i></button>`;
                                let act = `<div class="menu-item"><a class="menu-link p-3 carbooking" data-kt-docs-table-filter="car_booking">Pengguna Baru</a></div>`;
                                if(row.book_id>0) act = `<div class="menu-item"><a class="menu-link p-3 carreturn" data-kt-docs-table-filter="car_return">Pemulangan</a></div>`
                                btn += `<div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary w-auto p-3" data-kt-menu="true">
                                <div class="menu-item"><a class="menu-link p-3 caredit" data-kt-docs-table-filter="edit_row">Kemaskini</a></div>${act}
                                <div class="menu-item"><a class="menu-link p-3 summary" data-kt-docs-table-filter="summary_row">Ringkasan</a></div>
                            </div>
                        </td>`;
                                return btn;
                            }
                        }
                    ]
                });
                table = dt.$;
                dt.on('draw',function(){
                    handleEditDatatable();
                    handleReturnDatatable();
                    handleBookingDatatable();
                    handleSummaryDatatable();
                    KTMenu.createInstances();
                })
            }
            var handleEditDatatable = function () {
                const editButtons = document.querySelectorAll('[data-kt-docs-table-filter="edit_row"]');
                editButtons.forEach(d => {
                    d.addEventListener('click',function(e){
                        const parent = e.target.closest('tr');
                        const data = dt.row( parent ).data();
                        const form = modalEL.kt_modal_asset.querySelector('form')
                        e.preventDefault();
                        modalEL.kt_modal_asset.querySelector('.modal-title').innerHTML = data.model + ' - ' + data.regno
                        form.elements.id.value = data.id
                        form.elements.model.value = data.model
                        form.elements.regno.value = data.regno
                        modal.kt_modal_asset.show();
                    })
                })
            }
            var handleReturnDatatable = function () {
                const editButtons = document.querySelectorAll('[data-kt-docs-table-filter="car_return"]');
                editButtons.forEach(d => {
                    d.addEventListener('click',function(e){
                        const parent = e.target.closest('tr');
                        const data = dt.row( parent ).data();
                        const form = modalEL.kt_modal_return.querySelector('form')
                        e.preventDefault();
                        modalEL.kt_modal_return.querySelector('.modal-title').innerHTML = 'Pemulangan ' + data.model + ' - ' + data.regno
                        form.elements.id.value = data.id
                        modal.kt_modal_return.show();
                    })
                })

            }
            var handleBookingDatatable = function () {
                const editButtons = document.querySelectorAll('[data-kt-docs-table-filter="car_booking"]');
                editButtons.forEach(d => {
                    d.addEventListener('click',function(e){
                        const parent = e.target.closest('tr');
                        const data = dt.row( parent ).data();
                        const form = modalEL.kt_modal_booking.querySelector('form')
                        e.preventDefault();
                        modalEL.kt_modal_booking.querySelector('.modal-title').innerHTML = 'Daftar Guna Kenderaan ' + data.model + ' - ' + data.regno
                        form.elements.refid.value = data.id
                        modal.kt_modal_booking.show();
                    })
                })
            }
            var handleSummaryDatatable = function () {
                const btns = document.querySelectorAll('[data-kt-docs-table-filter="summary_row"]');
                btns.forEach(d => {
                    d.addEventListener('click',async function(e){
                        const parent = e.target.closest('tr');
                        const data = dt.row( parent ).data();
                        let sumData = await $.get(APP_URL + 'booking/?cate='+data.id)??[];
                        e.preventDefault();
                        modalEL.kt_modal_summary.querySelector('.modal-title').innerHTML = 'Daftar Guna Kenderaan ' + data.model + ' - ' + data.regno
                        modalEL.kt_modal_summary.querySelector('table tbody').innerHTML = sumData.map((e,n)=>{
                            return `<tr>
  <td>${e.staff.fullname}</td>
  <td>${moment(e.dtstart).format('D MMM Y')}</td>
  <td>${moment(e.dtuntil).format('D MMM Y')}</td>
  <td>${e.odobefore}</td>
  <td>${e.odoafter}</td>
  <td>${e.remark??''}</td>
</tr>`
                        }).join('')
                        modal.kt_modal_summary.show();
                    })
                })
            }
            var handleSearchDatatable = function () {
                const filterSearch = document.querySelector('[data-kt-docs-table-filter="search"]');
                filterSearch.addEventListener('keyup', function (e) {
                    dt.search(e.target.value).draw();
                });
            }
            var initFormAsset = function() {
                const form = modalEL.kt_modal_asset.querySelector('form')
                const validator = formValidatorInit(form, {
                    'model': {validators: {notEmpty: {message: 'Model diperlukan'}}}, 'regno': {validators: {notEmpty: {message: 'No Plat diperlukan'}}},
                })
                form.addEventListener('submit', e => {
                    e.preventDefault()
                    let el = e.target.elements
                    let dp = $(el).serializeArray();
                    if (!validator) return
                    validator.validate().then(function (status) {
                        if (status === 'Valid') $.post(APP_URL + 'asset/' + el.id.value, $.param(dp)).done(function (res) {
                            if (res.success) dt.ajax.reload();
                            modal.kt_modal_asset.hide();
                        }).fail(function (err) {
                            swalErr(err.message, err)
                        })
                    })
                })
            }
            var initFormReturn = function(){
                const form = modalEL.kt_modal_return.querySelector('form')
                const validator = formValidatorInit(form,{
                    'odoafter': {validators: {notEmpty: {message: 'Odo Meter diperlukan'}}},
                })

                form.addEventListener('submit',e=>{
                    e.preventDefault()
                    let el = e.target.elements
                    let dp = $(el).serializeArray();
                    if(!validator) return
                    validator.validate().then(function(status){
                        if(status === 'Valid') $.post(APP_URL+'asset/'+el.id.value,$.param(dp)).done(function(res){if(res.success)dt.ajax.reload(); modal.kt_modal_return.hide();}).fail(function(err){swalErr(err.message,err)})
                    })
                })

            }
            var initFormBooking = function(){
                const form = modalEL.kt_modal_booking.querySelector('form')
                const validator = formValidatorInit(form,{
                    'dtstart': {validators: {notEmpty: {message: 'Tarikh diperlukan'}}},
                    'dtuntil': {validators: {notEmpty: {message: 'Tarikh diperlukan'}}},
                    'staff_id': {validators: {notEmpty: {message: 'Staff diperlukan'}}},
                    'odobefore': {validators: {notEmpty: {message: 'Odo Meter diperlukan'}}},
                })

                form.addEventListener('submit',e=>{
                    e.preventDefault()
                    let el = e.target.elements
                    let dp = $(el).serializeArray();
                    if(!validator) return
                    validator.validate().then(function(status){
                        if(status === 'Valid') $.post(APP_URL+'booking',$.param(dp)).done(function(res){if(res.success)dt.ajax.reload(); modal.kt_modal_booking.hide();}).fail(function(err){swalErr(err.message,err)})
                    })
                })
            }

            return {
                init: function(){
                    document.querySelectorAll('.kt_modal').forEach(function(m){
                        modalEL[m.id] = m;
                        modal[m.id] = new bootstrap.Modal(m,{keyboard:false,backdrop:'static'})
                    })
                    initTable();
                    initFormAsset();
                    initFormReturn();
                    initFormBooking();
                    handleSearchDatatable();
                }
            }
        }();

        KTUtil.onDOMContentLoaded(function(){KTAsset.init()})
    </script>
@endpush
