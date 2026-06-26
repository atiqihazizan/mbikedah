
@extends('layouts.cms')

@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">Kemaskini Pengguna</h1>
        <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1">
            <li class="breadcrumb-item text-muted">
                <a href="#" class="text-muted text-hover-primary">Utama</a>
            </li>
            <li class="breadcrumb-item">
                <span class="bullet bg-gray-400 w-5px h-2px"></span>
            </li>
            <li class="breadcrumb-item textmuted">Pengguna</li>
        </ul>
    </div>
@endsection
@section('container')
    <div class="card">
        <div class="card-body container">
            <form action="/cms/user/{{ $data->id }}" method="post" autocomplete="off">
                @csrf
                @method('put')

                <div class="row mb-5">
                    <div class="col-md-6">
                        <label class="required form-label fw-bold">Nama</label>
                        <input type="text" class="form-control" disabled value="{{$data->staff->fullname}}">
                    </div>
                    <div class="col-md-6">
                        <label class="required form-label fw-bold">Jabatan</label>
                        <input type="text" class="form-control" disabled value="{{$data->depart->name}}">
                    </div>
                </div>

                @include('users.partials.form')
            </form>
        </div>
    </div>
@endsection
