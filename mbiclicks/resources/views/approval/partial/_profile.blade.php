<div class="card shadow-sm mb-5 mb-xl-8">
    <div class="card-body">
        <div class="d-flex flex-center flex-column py-5">
            <!--begin::Avatar-->
            <div class="symbol symbol-100px symbol-circle mb-7">
                <img id="avatar" src="{{ URL::asset('assets/media/avatars/blank.png')}}" alt="image blank">
            </div>

            <a href="#" class="fs-3 text-gray-800 text-hover-primary fw-bold mb-3 reset staff-fullname"></a>
            <div class="mb-9"><div class="badge badge-lg badge-light-primary d-inline reset staff-position"></div></div>
            <!-- details -->
            <div class="d-flex flex-stack fs-4 py-3 justify-content-around w-100">
                {{--<div class="fw-bold rotate collapsible collapsed flex-grow-1" data-bs-toggle="collapse" href="#kt_staff_view_details"--}}
                <div class="fw-bold rotate collapsible flex-grow-1" data-bs-toggle="collapse" href="#kt_staff_view_details"
                     role="button" aria-expanded="false" aria-controls="kt_staff_view_details">Butiran
                    <span class="ms-2 rotate-180">
                        <span class="svg-icon svg-icon-3">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.4343 12.7344L7.25 8.55005C6.83579 8.13583 6.16421 8.13584 5.75 8.55005C5.33579
                                8.96426 5.33579 9.63583 5.75 10.05L11.2929 15.5929C11.6834 15.9835 12.3166 15.9835 12.7071
                                15.5929L18.25 10.05C18.6642 9.63584 18.6642 8.96426 18.25 8.55005C17.8358 8.13584 17.1642
                                8.13584 16.75 8.55005L12.5657 12.7344C12.2533 13.0468 11.7467 13.0468 11.4343 12.7344Z" fill="currentColor" />
                            </svg>
                        </span>
                    </span>
                </div>
            </div>
            <div class="separator separator-dashed my-3 w-100"></div>
            <div id="kt_staff_view_details" class="collapse show w-100">
                <div class="py-5 fs-6">
                    <!-- staff no -->
                    <div class="fw-bold mt-5">Staff No</div>
                    <div class="text-gray-600 reset staff-staffno">0001</div>
                    <!-- email -->
                    <div class="fw-bold mt-5">Email</div>
                    <div class="text-gray-600"><a href="#" class="text-gray-600 text-hover-primary staff-email"></a></div>
                    <!-- department -->
                    <div class="fw-bold mt-5">Jabatan</div>
                    <div class="text-gray-600 reset staff-depart"></div>
                </div>
            </div>

        </div>

    </div>
    {{--<div class="card-footer border-0 d-flex justify-content-center pt-0">
        <button class="btn btn-sm btn-danger w-100" kt-modal-button-action="close">Tutup</button>
    </div>--}}
</div>

<!-- Cuti staff -->
<div class="card shadow-sm pt-4 mb-6 mb-xl-9" data-kt-type="humanresources">
    <div class="card-header border-0">
        <div class="card-title"><h2>Kelayakan Staff</h2></div>
        <div class="card-toolbar">
        </div>
    </div>
    <div class="card-body pt-0 pb-5" id="kt_staff_leave">
            <div kt-leave-data class="d-none">
                <div class="d-flex align-items-center flex-column mb-7 w-100">
                    <div class="d-flex justify-content-between w-100 mb-2">
                        {{--<span class="fw-bolder fs-6 text-dark" kt-leave-name>1,048 to Goal</span>--}}
                        <span class="fw-bolder fs-6 text-gray-500" kt-leave-name>1,048 to Goal</span>
                        <span class="fw-bold fs-6 text-gray-400" kt-leave-percent>100%</span>
                    </div>

                    <div class="h-8px mx-3 w-100 bg-light-success rounded">
                        <div class="bg-success rounded h-8px" kt-leave-bar role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
                {{--<div class="separator separator-dashed my-5"></div>--}}
            </div>
            <div id="kt_staff_leave" class="w-100">
                <div class="py-2 reset" kt-leave-list></div>
            </div>
        </div>
</div>

