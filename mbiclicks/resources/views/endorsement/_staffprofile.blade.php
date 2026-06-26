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
    <div class="card-footer border-0 d-flex justify-content-center pt-0">
        <button type="button" class="btn btn-secondary w-100 btnCancel">
            <i class="fa-solid fa-arrow-left-long"></i> Kembali</button>
    </div>
</div>