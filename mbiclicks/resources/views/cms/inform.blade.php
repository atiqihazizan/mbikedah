
@extends('layouts.cms')

@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">Pengumuman Semua Jabatan</h1>
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
        <form action="/cms/inform/{{$sys->id}}" method="post" autocomplete="off">
            @csrf
            @method('put')

            <div class="card-body container">

                {{--<div class="d-flex flex-column mb-8">
                    <label class="fs-6 fw-semibold mb-2">Text</label>
                    <textarea type="text" class="form-control form-control-solid" placeholder="Enter text" name="inform" rows="5">{{ old('inform',$sys->inform) }}</textarea>
                    <div class="invalid-feedback"></div>
                </div>--}}

                <textarea name="inform" id="kt_docs_ckeditor_classic" class="form-control d-none">{!! old('inform',$sys->inform) !!}</textarea>

            </div>

            <div class="card-footer">
                <button type="submit" class="btn btn-primary w-100">Simpan</button>
            </div>

        </form>
    </div>
@endsection

@push('javascript')
    <script src="{{URL::asset('assets/plugins/custom/ckeditor/ckeditor-classic.bundle.js')}}"></script>
    <script>
        ClassicEditor
        .create(document.querySelector('#kt_docs_ckeditor_classic'))
         .then(editor => {
            console.log(editor);
        })
         .catch(error => {
            console.error(error);
        });
    </script>
@endpush
