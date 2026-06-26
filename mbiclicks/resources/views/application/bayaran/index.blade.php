@extends('layouts.main')
@php($classInput = 'form-control')
@php($classSelect = 'form-select')
@push('style')
    <style>
        ul.pagination > li.page-item > a.page-link[rel="prev"],
        ul.pagination > li.page-item > a.page-link[rel="next"] {font-size:3rem ; padding-top: 0; padding-bottom: 0.25rem; font-width : bold;}
        div.dataTables_scrollBody,div.dataTables_wrapper .table-responsive {height: calc(100vh - 430px);}
        #toastr-container>div { width: auto !important;}
        #itembudget {width: 250px}
    </style>
@endpush
@section('toolbar')
    <div class="d-flex flex-column align-items-start me-3 gap-2">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Permohonan Bayaran</h1>
        <ul class="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7" id="kt_toolbar_bread">
            <li class="breadcrumb-item text-gray-600"><a href="/home" class="text-gray-600 text-hover-primary">Home</a></li>
            <li class="breadcrumb-item text-gray-500">Permohonan Bayaran</li>
        </ul>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
    </div>
@endsection
@section('body')
<div class="card frapage min-h-100" id="card-table">
    <div class="card-header border-0 pt-6">
        <div class="card-title">
            <div class="d-flex align-items-center position-relative my-1">
                <span class="svg-icon svg-icon-1 position-absolute ms-6"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect opacity="0.5" x="17.0365" y="15.1223" width="8.15546" height="2" rx="1" transform="rotate(45 17.0365 15.1223)" fill="currentColor"></rect>
                    <path d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z" fill="currentColor"></path>
                    </svg>
                </span>
                <input type="text" id="search" class="{{$classInput}} w-250px ps-15" placeholder="Cari..">
            </div>
        </div>
        <div class="card-toolbar d-flex flex-row">

            <button type="button" class="btn btn-primary" id="btnAdd">
                <span class="fa fa-plus me-2"></span>Permohonan Baru
            </button>

            <div class="btn-group ms-2" role="group" aria-label="Permohonan">
                <input type="radio" class="btn-check" name="activity_status" data-val="1" id="btnActive" autocomplete="off" checked>
                <label class="btn btn-light-primary" for="btnActive">Semasa</label>
              
                <input type="radio" class="btn-check" name="activity_status" data-val="0" id="btnHistory" autocomplete="off">
                <label class="btn btn-light-primary" for="btnHistory">Terdahulu</label>
            </div>
        </div>
    </div>
    <div class="card-body pt-0">
        <div class="table-responsive">
            <table class="table align-middle table-row-dashed fs-6 gy-3" id="table_bayaran">
                <thead class="border-gray-200 fs-5 fw-bold bg-lighten">
                <tr class="text-start fw-bold fs-5 text-uppercase gs-0">
                    <th class="text-center w-80px">Tarikh</th>
                    <th class="min-w-350px">Perkara</th>
                    <th class="min-w-130px">Ulasan</th>
                    <th class="min-w-100px">Status</th>
                    <th class="min-w-70px">Tempoh</th>
                    <th class="text-end min-w-10px"></th>
                </tr>
                </thead>
                <tbody class="text-gray-600 fw-semibold" id="tbody_petition"></tbody>
            </table>
        </div>
    </div>
</div>

<div class="frapage d-none" id="card-view">
    <div class="row mb-5">
        <div class="col-md-8">
            <div class="card">
                <div class="card-body">
                    <table class="table align-middle table-row-dashed gy-2 fs-4" id="content_bayaran">
                        <tbody class="">
                            <tr>
                                <th class="w-150px fw-bold">Tarikh Permohonan</th>
                                <td style="width:300px">
                                    <span class="overview" data-field="pdate" data-format="date"></span>
                                </td>
                            </tr>
                            <tr>
                                <th class="fw-bold">No Projek</th>
                                <td><span class="overview" data-field="pno"></span></td>
                            </tr>
                            <tr>
                                <th class="fw-bold">Individu / Syarikat</th>
                                <td><span class="overview" data-field="sup"></span></td>
                            </tr>
                            <tr>
                                <th class="fw-bold">Keterangan Bayaran</th>
                                <td><span class="overview" data-field="perkara"></span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card mt-5">
                <div class="card-body">
                    <table class="table align-middle gy-2 fs-5">
                        <thead class="fw-bolder fs-6 bg-black text-white">
                            <tr>
                                <th class="w-100px text-center ps-4">Bajet</th>
                                <th class="w-auto">Perkara</th>
                                <th class="w-125px text-center">Rujukan</th>
                                <th class="text-center w-60px">Unit</th>
                                <th class="text-end w-80px">Harga</th>
                                <th class="text-end w-100px pe-4">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody id='detail_bayaran'></tbody>
                    </table>
                </div>
            </div>
            <div class="card mt-5">
                <div class="card-body fs-4">
                    <label class="fw-bold">Lampiran</label>
                    <table class="table align-middle gy-2 fs-5">
                        <tbody id='attach_bayaran'></tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <div class="fs-1 d-flex flex-column mb-5">
                        <label class="fw-bold d-flex flex-column">
                            Status Terkini<br>
                            <span class="fw-normal" id="cur-state"></span>
                        </label>
                        <label class="fw-bold pt-4 d-flex justify-content-between">
                            Jumlah
                            <span class="overview text-end" data-field="tamt" data-format="curr"></span>
                        </label>
                    </div>
                    <button type="button" class="btn btn-secondary w-100 btnBack">Kembali</button>
                </div>
            </div>
            <div class="card mt-5">
                <div class="card-body">
                    <div id="timeline"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="card frapage d-none" id="card-form">
    <form class="form" novalidate="novalidate" id="bayaran-form" autocomplete="off">
        @csrf
        <input type="hidden" name="slug">

        <div class="card-body">

            <div class="row mb-5">
                <div class="fv-row col-md-3">
                    <label class="required fs-5 fw-bold mb-2">Tarikh Pemohonan</label>
                    <input class="{{$classInput}}" type="date" placeholder="Pilih tarikh" name="pdate" value="{{ date('Y-m-d') }}" required/>
                </div>
                <div class="col-md-3">
                    <label class="fs-5 fw-bold mb-2">No Projek</label>
                    <input type="text" class="{{$classInput}}" placeholder="Masukkan No" name="body[pno]" value="N/A"/>
                </div>
                <div class="fv-row col-md-6">
                    <div class="d-flex flex-column">
                        <label class="required form-label fs-5 fw-bold mb-2">Individu/Syarikat</label>
                        <div class="input-group flex-nowrap">
                            <div class="overflow-hidden flex-grow-1">
                                <select class="{{$classInput}} rounded-end-0" data-control="select2" data-placeholder="Pilih" name="body[payto]" required id="sup_select" data-def="0">
                                    <option></option>
                                    {{-- @foreach($suppliers as $s)
                                        <option value="{{$s->id}}">{{$s->text}}</option>
                                    @endforeach --}}
                                </select>
                            </div>
                            <button class="btn btn-secondary" type="button" id="btnAddSup"><i class="bi bi-plus fs-2"></i></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="fv-row mb-5">
                <label class="required fs-5 fw-bold mb-2">Keterangan Bayaran</label>
                <input type="text" class="{{$classInput}}" name="body[perkara]" placeholder="Keterangan bayaran.." onkeydown="return /[a-z_ ]/i.test(event.key)" required>
            </div>

            <div class="fv-row mb-10">
                <input type="hidden" name="plist" id="plist">
                <table class="table table-borderless">
                    <tr class="fw-bolder fs-6 text-gray-800">
                        <th class="pb-0" style="width: 250px">Kod Bajet</th>
                        <th class="pb-0" >Perkara</th>
                        <th class="pb-0" style="width: 120px">Rujukan</th>
                        <th class="pb-0" style="width: 80px">Unit</th>
                        <th class="pb-0" style="width: 90px">Harga</th>
                        <th class="pb-0" style="width: 40px"></th>
                    </tr>
                    <tr class="fw-bolder fs-6 text-gray-800">
                        <td class="pe-1">
                            <select class="{{ $classSelect }}" data-control="select2" data-width="resolve" data-placeholder="Pilih" id="itembudget">
                                <option></option>
                                {{-- @foreach($budgets as $s)
                                    <option value="{{$s->id}}">{{$s->text}}</option>
                                @endforeach --}}
                            </select>
                        </td>
                        <td class="pe-1"><input type="text" class="{{ $classInput }}" id="itemname" placeholder="Perkara" onkeydown="return inputWordsKeydown(event)"></td>
                        <td class="px-1"><input type="text" class="{{ $classInput }}" id="itemref" placeholder="No rujukan"onkeydown="return inputNumberWordwithoutspce(event)"></td>
                        <td class="px-1"><input type="text" class="{{ $classInput }} text-center" id="itemunit" value="0" maxlength="3" onfocus="this.select()" placeholder="Unit" oninput="return inputNumeric(this)"></td>
                        <td class="px-1"><input type="text" class="{{ $classInput }} text-end" id="itemamt" value="0.00" onfocus="this.select()" placeholder="0.00" oninput="return inputCurrency(this)"></td>
                        <td class="ps-1"><a href="javascript:;" class="btn btn-primary w-100 px-2" id="addDetail"><i class="fa fa-plus icon-sm px-1"></i></a></td>
                    </tr>
                </table>
                <table class="table align-middle table-row-bordered" style="min-height: 300px;">
                    <thead class=" text-white-50">
                        <tr class="table-primary fw-bolder fs-6 text-gray-800">
                            <th class="w-100px ps-4">Bajet</th>
                            <th class="w-auto">Perkara</th>
                            <th class="w-125px text-center">Rujukan</th>
                            <th class="text-center w-60px">Unit</th>
                            <th class="text-end w-80px">Harga</th>
                            <th class="text-end w-100px">Jumlah</th>
                            <th class="text-center w-30px"></th>
                        </tr>
                    </thead>
                    <tbody id="tbody_item"></tbody>
                    <tfoot class="table-primary fw-bolder">
                        <tr>
                            <th colspan="5" class="text-end fw-bold"><h2 class="fs-4">Keseluruhan</h2></th>
                            <th class="text-end fw-bold"><span class="fs-4" id="grandtotal"></span><input type="hidden" name="tamt" value="0"></th>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <!-- attachment -->
            <div id="attactfile" class="editable d-none">
                <div class="separator separator-dashed border-primary my-5"></div>
                <label class="d-flex align-items-center fs-5 fw-bold mb-4"><span>Lampiran(Jika ada)</span></label>
                <div class="dropzone dropzone-queue mb-2 dropzone_file">
                    <div class="dropzone-panel mb-lg-0 mb-2">
                        <label class="btn btn-primary btn-sm fs-6 fw-semibold py-3 me-5">
                            <i class="fa fa-paperclip"></i>&nbsp;Lampiran
                            <input type="file" class="d-none attachment" id="attach" accept="image/jpeg,image/gif,image/png,application/pdf" >
                        </label>
                    </div>
                    <span class="form-text text-muted">Max file size is 2MB.</span>
                    <div class="dropzone-items wm-200px">
                        <div class="dropzone-item" style="display: none">
                            <div class="dropzone-file fs-6">
                                <div class="dropzone-filename fs-6" title="some_image_file_name.jpg">
                                    <a data-dz-name target="_blank" rel="noopener noreferrer">some_image_file_name.jpg</a>
                                </div>

                                <div class="dropzone-error" data-dz-errormessage></div>
                            </div>

                            <div class="dropzone-toolbar">
                                <span class="dropzone-delete" data-dz-remove><i class="bi bi-x fs-1"></i></span>
                            </div>
                        </div>
                        <div class="dropzone-clone"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer">
            <fieldset class="d-flex justify-content-center" id="btnprocces">
                <div class="">
                    <button type="button" class="btn btn-lg btn-secondary btnBack"><i class="fa fa-arrow-left me-2"></i> Kembali</button>
                </div>
                <div class="mx-2">
                    <button type="button" class="btn btn-lg btn-primary" id="btnSave">
                        <span class="indicator-label"><i class="fa fa-floppy-disk me-2"></i> Simpan</span>
                        <span class="indicator-progress">Tunggu sebentar...<span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                    </button>
                </div>
                <div class="editable d-none prosessing">
                    <a href="#" class="btn btn-lg btn-info" id="btnSubmit">
                        <span class="indicator-label">Simpan dan Hantar <i class="fa fa-arrow-right ms-2"></i></span>
                        <span class="indicator-progress">Tunggu sebentar...<span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                    </a>
                </div>
            </fieldset>
        </div>
    </form>
</div>

@endsection

@push('javascript')
    <script>
        const suppliers = @json($suppliers);
    </script>
    <script src="{{ URL::asset('js/bayaran/props.js?v='.time()) }}"></script>
    <script src="{{ URL::asset('js/bayaran/index.js?v='.time()) }}"></script>
@endpush
