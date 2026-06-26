@extends('layouts.main')
@section('toolbar')
    <div class="d-flex flex-column align-items-start me-3 gap-2">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Perbelanjaan Perjalanan</h1>
        <ul class="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7" id="kt_toolbar_bread">
            <li class="breadcrumb-item text-gray-600"><a href="/home" class="text-gray-600 text-hover-primary">Home</a></li>
            <li class="breadcrumb-item text-gray-500">Perbelanjaan Perjalanan</li>
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
            <table class="table align-middle table-row-dashed fs-6 gy-5" id="kt_table_booking">
                <thead class="border-gray-200 fs-6 fw-bold bg-lighten">
                <tr class="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
                    <th class="d-none"></th>
                    <th class="text-center w-60px">Tarikh</th>
                    <th class="w-100px">Perkara</th>
                    <th class="w-80px">Rujukan</th>
                    <th class="text-end w-80px">Jumlah</th>
                    <th class="">Staff</th>
                    <th class="">Jabatan</th>
                    {{--<th class="text-end min-w-100px"></th>--}}
                </tr>
                </thead>
                <tbody class="text-gray-600 fw-semibold" id="tbody_booking">
                @foreach($data as $d)
                    <tr>
                        <td class="d-none">{{$d->id}}</td>
                        <td class="text-center">{{\Carbon\Carbon::parse($d->trandt)->format('d M y')}}</td>
                        <td class="">{{$d->descrip}}</td>
                        <td class="">{{$d->ref}}</td>
                        <td class="text-end pe-8">{{number_format($d->amt,2)}}</td>
                        <td class="">{{Str::title($d->staff->fullname)}}</td>
                        <td class="">{{Str::title($d->depart->name)}}</td>
                        {{--<td class="text-end">
                            <a href="#" class="btn btn-light-primary btn-sm px-3 py-2"><span class="fa fa-pencil"></span> </a>
                            <a href="#" class="btn btn-light-danger btn-sm px-3 py-2"><span class="fa fa-trash"></span> </a>
                        </td>--}}
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>
@endsection
@push('modal')
    <div class="modal fade" tabindex="-1" id="kt_modal_1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Modal title</h3>

                    <!--begin::Close-->
                    <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal" aria-label="Close">
                        <span class="svg-icon svg-icon-1"></span>
                    </div>
                    <!--end::Close-->
                </div>

                <div class="modal-body">
                    <p>Modal body text goes here.</p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>
@endpush
@push('javascript')
    <script>
        $("#kt_table_booking").DataTable();
    </script>
@endpush
