
@extends('layouts.cms')

@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">Profil</h1>
        <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1">
            <li class="breadcrumb-item text-muted">
                <a href="javascript:avoid;" class="text-muted text-hover-primary">Utama</a>
            </li>
            <li class="breadcrumb-item">
                <span class="bullet bg-gray-400 w-5px h-2px"></span>
            </li>
            <li class="breadcrumb-item textmuted">Profil</li>
        </ul>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3">
        <div class="m-0"></div>
        {{--<a href="/cms/user/create" class="btn btn-sm fw-bold btn-primary">
            <span class="svg-icon svg-icon-2">
                <svg width="24" height="24" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 19V5C3 3.89543 3.89543 3 5 3H16.1716C16.702 3 17.2107 3.21071 17.5858 3.58579L20.4142 6.41421C20.7893 6.78929 21 7.29799 21 7.82843V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M8.6 9H15.4C15.7314 9 16 8.73137 16 8.4V3.6C16 3.26863 15.7314 3 15.4 3H8.6C8.26863 3 8 3.26863 8 3.6V8.4C8 8.73137 8.26863 9 8.6 9Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M6 13.6V21H18V13.6C18 13.2686 17.7314 13 17.4 13H6.6C6.26863 13 6 13.2686 6 13.6Z" stroke="currentColor" stroke-width="1.5"/>
                </svg>
            </span>
        </a>--}}
    </div>
@endsection
@section('container')
    <div class="card">
        <form action="/cms/profile/{{$sys->id}}" method="post" autocomplete="off">
            @csrf
            @method('put')

            <div class="card-body container">
                <div class="d-flex flex-column mb-8">
                    <label class="fs-6 fw-semibold mb-2">Nama</label>
                    <input type="text" class="form-control form-control-solid" placeholder="Enter name" name="agency" value="{{ old('agency',$sys->agency) }}">
                    <div class="invalid-feedback"></div>
                </div>

                <div class="d-flex flex-column mb-8">
                    <label class="fs-6 fw-semibold mb-2">Alamat</label>
                    <textarea type="text" class="form-control form-control-solid" placeholder="Enter address" name="address" rows="3">{{ old('address',$sys->address) }}</textarea>
                    <div class="invalid-feedback"></div>
                </div>

                <div class="row g-9 mb-8">
                    <div class="col-md-6 fv-row">
                        <label  class="fs-6 fw-sembibold mb-2">No.Tel</label> <input type="text" class="form-control form-control-solid"  placeholder="Enter tel no" name="tel" value="{{old('tel',$sys->tel)}}">
                    </div>
                    <div class="col-md-6 fv-row">
                        <label  class="fs-6 fw-sembibold mb-2">No.Fax</label> <input type="text" class="form-control form-control-solid"  placeholder="Enter fax no" name="fax" value="{{old('fax',$sys->fax)}}">
                    </div>
                </div>

{{--                <div class="row g-9 mb-8">--}}
{{--                    <div class="col-md-6 fv-row">--}}
{{--                        <label  class="fs-6 fw-sembibold mb-2">Year Started</label> <input type="number" class="form-control form-control-solid"  placeholder="Enter tel no" name="yr" value="{{old('yr',$sys->yr)}}">--}}
{{--                    </div>--}}
{{--                </div>--}}
            </div>

            <div class="card-footer">
                <button type="submit" class="btn btn-primary w-100">Simpan</button>
            </div>

        </form>
    </div>
@endsection
