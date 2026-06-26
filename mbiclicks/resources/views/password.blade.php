
@extends('layouts.main')

@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">Ubah katalaluan</h1>
        <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1">
            <li class="breadcrumb-item text-muted">
                <a href="javascript:avoid;" class="text-muted text-hover-primary">Home</a>
            </li>
            <li class="breadcrumb-item">
                <span class="bullet bg-gray-400 w-5px h-2px"></span>
            </li>
            <li class="breadcrumb-item textmuted">Users</li>
        </ul>
    </div>
@endsection
@section('body')
    <div class="card card-flush">
        <div class="card-body ">
            <form action="{{ route('password.change') }}" method="post" autocomplete="off">
                @method('put')
                @csrf
                <div class="mb-5">
                    <label class="form-label required">Katalaluan Lama</label>
                    <input type="password" name="oldpassword" class="form-control" autofocus>
                    @error('oldpassword') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
                </div>
                <div class="mb-5">
                    <label class="form-label required">Katalaluan Baru</label>
                    <input type="password" name="newpassword" class="form-control">
                    @error('newpassword') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
                </div>
                <button type="submit" class="btn btn-primary w-100">Simpan</button>
            </form>
        </div>
    </div>
@endsection
