
@extends('layouts.cms')

@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">Pengumuman List</h1>
        <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1">
            <li class="breadcrumb-item text-muted">
                <a href="javascript:avoid;" class="text-muted text-hover-primary">Utama</a>
            </li>
            <li class="breadcrumb-item">
                <span class="bullet bg-gray-400 w-5px h-2px"></span>
            </li>
            <li class="breadcrumb-item textmuted">Pengumuman</li>
        </ul>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3">
        <div class="m-0"></div>
        <a href="/cms/event/create" class="btn btn-sm fw-bold btn-primary">
            <span class="svg-icon svg-icon-2 m-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16"> <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/> </svg>
            </span>
        </a>
    </div>
@endsection
@section('container')
    <div class="card min-h-100">
        <div class="table-responsive">

            <table class="table table-flush table-hover align-middle table-row-bordered table-row-solid gy-4 gx-2 ">
                <thead class="border-gray-200 fs-6 fw-bold bg-lighten">
                <tr class="fw-bolder text-uppercase py-4">
                    <th class="text-center w-40px">#</th>
                    <th class="">Jabatan</th>
                    <th class="">Pengumuman</th>
                    {{--<th class="text-end">Active</th>--}}
                    <th class="text-end w-80px"></th>
                </tr>
                </thead>
                <tbody class="fs-6 text-gray-600">
                @foreach($data as $d)
                    <tr class="py-3">
                        <td class="text-center">{{$loop->iteration}}</td>
                        <td class="">{{ $d->depart->name }}</td>
                        <td class="text-nowrap">{!! strip_tags(Str::limit($d->textevent,100)) !!}</td>
                        {{--<td class="text-end">{!! $d->active !!}</td>--}}
                        <td class="text-end w-80px d-flex justify-content-center">
                            <a href="/cms/event/{{$d->id}}/edit" class="me-3">
                                <span class="svg-icon svg-icon-2 text-primay">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                                        <path fill="currentColor" fill-rule="evenodd" d="M15.586 3a2 2 0 0 1 2.828 0L21 5.586a2 2 0 0 1 0 2.828L19.414 10 14 4.586 15.586 3zm-3 3-9 9A2 2 0 0 0 3 16.414V19a2 2 0 0 0 2 2h2.586A2 2 0 0 0 9 20.414l9-9L12.586 6z" clip-rule="evenodd"/>
                                    </svg>
                                </span>
                            </a>
                            <form action="/cms/event/{{$d->id}}" method="post">
                                @csrf
                                @method('delete')
                                <button type="submit" class="border-0 bg-transparent" onclick="return confirm('Are you sure?')">
                                    <span class="svg-icon svg-icon-2 text-danger">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                        </svg>
                                    </span>
                                </button>
                            </form>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>

        </div>
    </div>
@endsection
