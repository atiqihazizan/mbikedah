@extends('layouts.main')
@section('toolbar')
    <div class="d-flex flex-column align-items-start me-3 gap-2">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Butiran Staff</h1>
        <ul class="breadcrumb breadcrumb-dot fw-semibold text-gray-600 fs-7">
            <li class="breadcrumb-item text-gray-600">
                <a href="/home" class="text-gray-600 text-hover-primary">Home</a>
            </li>
            <li class="breadcrumb-item text-gray-600">
                <a href="/conf/staff" class="text-gray-600 text-hover-primary">Staff</a>
            </li>
            <li class="breadcrumb-item text-gray-500">Butiran Staff</li>
        </ul>
    </div>
@endsection
@section('body')
    <div class="d-flex flex-column flex-xl-row">
        <div class="flex-column flex-lg-row-auto w-100 w-xl-350px mb-10">
            @include('staff.partial.profile')
        </div>
        <div class="flex-lg-row-fluid ms-lg-15">
            <div class="tab-content" id="myTabContent">
                <div class="tab-pane fade show active" id="kt_staff_view_leave_tab" role="tabpanel">
                    <div class="card pt-4 mb-6 mb-xl-9">
                        @include('staff.partial.kelayakan')
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
@section('modal')
    <div class="modal fade" id="kt_modal_update_staff" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
         aria-labelledby="kt_modal_update_staff" aria-hidden="true">>
        <div class="modal-dialog modal-dialog-centered" >
            <div class="modal-content">
                <form class="form" action="/conf/staff/{{$data->id}}" id="kt_modal_update_staff_form" method="post"
                      enctype="multipart/form-data" autocomplete="off">
                    @method('put')
                    @csrf
                    <div class="modal-header" id="kt_modal_update_staff_header">
                        <h2 class="fw-bold">Kemaskini Staff</h2>
                        <div id="kt_modal_update_staff_close" class="btn btn-icon btn-sm btn-active-icon-primary" data-bs-dismiss="modal">
                            <span class="svg-icon svg-icon-1">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect opacity="0.5" x="6" y="17.3137" width="16" height="2" rx="1" transform="rotate(-45 6 17.3137)"
                                          fill="currentColor" />
                                    <rect x="7.41422" y="6" width="16" height="2" rx="1" transform="rotate(45 7.41422 6)" fill="currentColor" />
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div class="modal-body py-10 px-lg-10">
                        <div class="d-flex flex-column scroll-y me-n7 pe-7" id="kt_modal_update_staff_scroll">
                            <div class="mb-7">
                                <label class="fs-6 fw-semibold mb-2">
                                    <span>Kemaskini Avatar</span>
                                    <i class="fas fa-exclamation-circle ms-1 fs-7" data-bs-toggle="tooltip"
                                       itle="Allowed file types: png, jpg, jpeg."></i>
                                </label>
                                <div class="mt-1 ps-3">
                                    <div class="image-input image-input-outline" data-kt-image-input="true" style="background-image: url('{{ URL::asset('assets/media/svg/avatars/blank.svg')}}')">
                                        <div class="image-input-wrapper w-125px h-125px" style="background-image: url('{{ old('img',$data->avatar ?? URL::asset('assets/media/avatars/blank.png'))}}')"></div>
                                        <label class="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
                                               data-kt-image-input-action="change" data-bs-toggle="tooltip" title="Change avatar">
                                            <i class="bi bi-pencil-fill fs-7"></i>
                                            <input type="file" name="avatar" accept=".png, .jpg, .jpeg" />
                                            <input type="hidden" name="avatar_remove" />
                                        </label>
                                        <span class="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
                                              data-kt-image-input-action="cancel" data-bs-toggle="tooltip" title="Cancel avatar">
                                            <i class="bi bi-x fs-2"></i>
                                        </span>
                                        <span class="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
                                              data-kt-image-input-action="remove" data-bs-toggle="tooltip" title="Remove avatar">
                                            <i class="bi bi-x fs-2"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            @include('staff.partial._form')
                        </div>
                    </div>
                    <div class="modal-footer flex-center">
                        <button type="reset" id="kt_modal_update_staff_cancel" class="btn btn-light me-3" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" id="kt_modal_update_staff_submit" class="btn btn-primary">
                            <span class="indicator-label">Hantar</span>
                            <span class="indicator-progress">Please wait...
                                <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
@push('javascript')
    <script>
        const modalEl = new bootstrap.Modal('#kt_modal_update_staff', {
            keyboard: false
        })
    </script>
    @if($errors->any())
        <script>modalEl.show();</script>
    @endif
@endpush
