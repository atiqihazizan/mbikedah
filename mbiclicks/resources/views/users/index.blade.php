
@extends('layouts.cms')

@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">Senarai Pengguna</h1>
        <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1">
            <li class="breadcrumb-item text-muted">
                <a href="javascript:avoid;" class="text-muted text-hover-primary">Utama</a>
            </li>
            <li class="breadcrumb-item">
                <span class="bullet bg-gray-400 w-5px h-2px"></span>
            </li>
            <li class="breadcrumb-item textmuted">Pengguna</li>
        </ul>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3">
        <div class="m-0"></div>
        <a href="/cms/user/create" class="btn btn-sm fw-bold btn-primary">
            <span class="svg-icon svg-icon-2 m-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16"> <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/> </svg>
            </span>
        </a>
    </div>
@endsection
@section('container')
    <div class="card card-flush">

        <div class="card-body pt-0">
            <table class="table align-middle table-row-dashed fs-6 gy-5" id="table_users">
                <thead>
                <tr class="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                    <th class="">No</th>
                    <th class="">Nama Penuh</th>
                    <th class="">Nama Panggilan</th>
                    <th class="">Tahap</th>
                    <th class="text-end">Kelayakan Ubahsuai</th>
                    <th class="text-end">Jenis</th>
                    <th class="text-end w-10px"></th>
                </tr>
                </thead>
                <tbody class="text-gray-600 fw-semibold">
                @foreach($data as $d)
                    <tr class="">
                        {{--<td class="text-center">{{$loop->iteration}}</td>--}}
                        <td class="">{{ $d->username }}</td>
                        <td class="">{{ $d->staff->fullname ?? ''}}</td>
                        <td class="">{{ $d->name }}</td>
                        <td class="">{{ $d->Userstep }}</td>
                        <td class="text-end">{!! $d->ability !!}</td>
                        <td class="text-end">{!! $d->type !!}</td>
                        <td class="text-end">
                            <a href="/cms/user/{{$d->id}}/edit">
                                <span class="svg-icon svg-icon-2 text-primay">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                                        <path fill="currentColor" fill-rule="evenodd" d="M15.586 3a2 2 0 0 1 2.828 0L21 5.586a2 2 0 0 1 0 2.828L19.414 10 14 4.586 15.586 3zm-3 3-9 9A2 2 0 0 0 3 16.414V19a2 2 0 0 0 2 2h2.586A2 2 0 0 0 9 20.414l9-9L12.586 6z" clip-rule="evenodd"/>
                                    </svg>
                                </span>
                            </a>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>
@endsection
@push('javascript')
    <script>
        $('#table_users').DataTable({dom: '<"d-flex justify-content-between mt-5"lf><t><"d-flex justify-content-between mt-5"ip>'});
    </script>
@endpush
