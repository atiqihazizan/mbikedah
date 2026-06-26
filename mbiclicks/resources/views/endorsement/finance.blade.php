
@section('body')
    <div class="card frapage min-h-100" id="kt-table-petition">
        <div class="card-header border-0 pt-6">
            <div class="card-title">
                <div class="d-flex align-items-center position-relative my-1">
                    <span class="svg-icon svg-icon-1 position-absolute ms-6"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect opacity="0.5" x="17.0365" y="15.1223" width="8.15546" height="2" rx="1" transform="rotate(45 17.0365 15.1223)" fill="currentColor"></rect>
                        <path d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5
                        7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z" fill="currentColor"></path>
                        </svg>
                    </span>
                    <input type="text" data-kt-docs-table-filter="search" class="form-control form-control-solid w-250px ps-15" placeholder="Cari..">
                </div>
            </div>
            <div class="card-toolbar">
                <div class="d-flex justify-content-end" data-kt-approval-table-toolbar="base">@includeIf('endorsement._toolbarButton')</div>
            </div>
        </div>
        <div class="card-body pt-0">
            <table class="table align-middle table-row-dashed gy-5" id="kt_table_pending">
                <thead>
                <tr class="text-start fw-bold fs-5 text-uppercase gs-0">
                    <th class="w-75px">Tarikh</th>
                    <th class="w-auto">Perkara</th>
                    <th class="w-250px text-end">Jumlah</th>
                    {{-- <th class="text-center" style="width: 167px">Untuk Perhatian</th> --}}
                    <th class="text-end" style="width: 100px">Status</th>
                    <th class="w-150px text-center">Dihantar Pada</th>
                    <th class="text-end w-10px"></th>
                </tr>
                </thead>
                <tbody class="text-gray-600 fs-5 fw-semibold"></tbody>
            </table>
        </div>
    </div>

    <div class="card frapage d-none" id="kt-overview-petition">
        <div class="card-body">
            <div class="row">
                <div class="col-md-4">
                    @includeIf('endorsement._staffprofile')
                </div>
                <div class="col-md-8">
                    <div class="">
                        @includeIf('endorsement._bayaran')
                        @includeIf('endorsement._bayarandetail')
                        @includeIf('endorsement._attachment')

                       {{--  <div class="card shadow-sm pt-4" id="card-ulasan">
                            <div class="card-header border-0">
                                <div class="card-title"><div class="card-title"><h2>Ulasan</h2></div></div>
                            </div>
                            <div class="card-body pt-0 pb-5">
                                <p class="fs-5" id="view-ulasan"></p>
                            </div>
                        </div> --}}

                        <div id="form-process"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card frapage d-none position-relative" id="kt-preview-petition">
        <div class="card-header border-0 pt-6">
            <div class="card-title"></div>
            <div class="card-toolbar">
                <div class="d-flex justify-content-end" data-kt-approval-table-toolbar="base">                  
                    <a href="#" class="btn btn-icon btn-primary me-2 btnCancel"><i class="bi bi-arrow-left"></i></a>
                    <a href="#" class="btn btn-icon btn-primary" id="printout"><i class="bi bi-printer-fill fs-4"></i></a>
                </div>
            </div>
        </div>
        <div class="card-body reset" id="printout-body"></div>
    </div>
@endsection

@push('javascript')
    <script>const banks = @json($banks);</script>
    <script src="{{ URL::asset('js/endorse/finance.js?v='.time()) }}"></script>
@endpush
