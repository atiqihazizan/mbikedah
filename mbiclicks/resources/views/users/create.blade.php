
@extends('layouts.cms')

@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">Pengguna Baru</h1>
        <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1">
            <li class="breadcrumb-item text-muted"><a href="#" class="text-muted text-hover-primary">Utama</a></li>
            <li class="breadcrumb-item"><span class="bullet bg-gray-400 w-5px h-2px"></span></li>
            <li class="breadcrumb-item textmuted">Pengguna</li>
        </ul>
    </div>
@endsection
@section('container')
    <div class="app-content flex-column-fluid" id="kt_app_contents">
        <div class="card">
            <div class="card-body container">
                <form action="/cms/user/" method="post" autocomplete="off">
                    @csrf
                    <div class="mb-5">
                        <label class="required form-label fw-bold">Nama</label>
                        <select class="form-select @error('staff_id') is-invalid @enderror"data-control="select2" data-placeholder="Select Staff" name="staff_id" required>
                            <option></option>
                            @foreach($staff as $s)
                                <option value="{{ $s->id }}" @if(old('staff_id',$data->staff_id ?? -1) == $s->id) selected @endif >{{ $s->staffno . ' - ' .$s->fullname }}</option>
                            @endforeach
                        </select>
                        @error('staff_id') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
                    </div>

                    @include('users.partials.form')

                </form>
            </div>
        </div>
    </div>
@endsection
