
@extends('layouts.cms')

@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">Cipta Pengumuman</h1>
        <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1">
            <li class="breadcrumb-item text-muted">
                <a href="javascript:avoid;" class="text-muted text-hover-primary">Home</a>
            </li>
            <li class="breadcrumb-item">
                <span class="bullet bg-gray-400 w-5px h-2px"></span>
            </li>
            <li class="breadcrumb-item textmuted">Pengumuman</li>
        </ul>
    </div>
    {{--<div class="d-flex align-items-center gap-2 gap-lg-3">
        <div class="m-0"></div>
        <a href="/cms/user/create" class="btn btn-sm fw-bold btn-primary">
            <span class="svg-icon svg-icon-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16"> <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/> </svg>
            </span>
        </a>
    </div>--}}
@endsection
@section('container')
    <div class="app-content flex-column-fluid" id="kt_app_contents">
        <div class="card">
            <div class="card-body container">
                <form action="/cms/event/" method="post" autocomplete="off">
                    @csrf
                    <input type="hidden" name="user_id" value="{{auth()->id()}}">
                    <input type="hidden" name="dtevent" value="{{ date('Y-m-d H:i:s') }}">
                    @include('cms.event.form')

                </form>
            </div>
        </div>
    </div>
@endsection
