
@csrf
<input type="hidden" name="ptype_id" value="{{ old('ptype_id',$petition->ptype_id??$ptype->id) }}">
<input type="hidden" name="pttid" value="{{ old('pttid',$petition->slug??0) }}">
<input type="hidden" name="staff_id" value="{{ auth()->user()->staff_id }}"/>

{{--<div class="row mb-5">
    <div class="fv-row col-md-3">
        <label class="required fs-5 fw-semibold mb-2">Tarikh Pemohonan</label>
        <input class="form-control form-control-solid" type="date" placeholder="Pilih tarikh" name="pdate" value="{{ old('pdate',$petition->pdate??date('Y-m-d')) }}" required/>
        <input type="hidden" name="staff_id" value="{{ auth()->user()->staff_id }}"/>
    </div>
    <div class="fv-row col-md-9">
        <label class="required form-label fs-5 fw-semibold mb-2">Nama Pemohon</label>
        <select class="form-select form-select-solid " data-placeholder="Pembohon" name="staff_id" required>
            <option></option>
        </select>
    </div>
</div>--}}

@if($ptype->lvtyp??false)
<div class="fv-row mb-5 @if(count($ptype->lvtyp)==1) d-none @endif">
    <div class="">
        @foreach($ptype->leave ?? [] as $l)
            <div class="form-check form-check-inline me-10 mb-5">
                <input class="form-check-input" type="radio" value="{{$l->id}}" id="leave_{{$loop->index}}" name="typlv" @if(count($ptype->lvtyp)==1 || ($petition->typlv??0) ==$l->id) checked @endif/>
                <label class="form-check-label" for="leave_{{$loop->index}}">{{ $l->leave }}</label>
            </div>
        @endforeach
    </div>
</div>
@endif

{{--@if($t->code == 'tripclaim')
    <div class="fv-row mb-5">
        <label class="fs-6 fw-bold mb-2">Unit</label>
        <input class="form-control form-control-solid" name="body[staffunit]" value=""/>
    </div>
@endif--}}

@includeIf('application.modal.frm'.$ptype->code)

<div class="separator separator-dashed border-primary my-5"></div>
<!-- attachment -->
<div id="attactfile" class="editable @if(!isset($petition->slug)) d-none @endif">
    <label class="d-flex align-items-center fs-5 fw-semibold mb-4"><span>Lampiran(Jika ada)</span></label>
    <div class="dropzone dropzone-queue mb-2 dropzone_file">
        <div class="dropzone-panel mb-lg-0 mb-2">
            <label class="btn btn-primary btn-sm fs-6 fw-semibold py-3 me-5">
                <i class="fa fa-paperclip"></i>&nbsp;Lampiran
                <input type="file" class="d-none attachment">
            </label>
        </div>
        <span class="form-text text-muted">Max file size is 2MB.</span>
        <div class="dropzone-items wm-200px">
            <div class="dropzone-item" style="display: none">
                <div class="dropzone-file">
                    <div class="dropzone-filename" title="some_image_file_name.jpg">
                        <a data-dz-name target="_blank" rel="noopener noreferrer">some_image_file_name.jpg</a>
                        {{--<strong>(<span data-dz-size>340kb</span>)</strong>--}}
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

<div class="form-check my-10 fw-bold editable @if(!isset($petition->slug)) d-none @endif">
    <input class="form-check-input" type="checkbox" value="1" id="agreedtosend"/>
    <label class="form-check-label" for="flexCheckDefault">Permohonan akan dihantar kepada <b>Ketua Jabatan</b></label>
</div>

<!-- button bottom -->
<div class="d-flex flex-stack pt-10">
    <div class="me-2">
        <button type="button" class="btn btn-lg btn-secondary me-3" data-kt-stepper-action="home"><i class="fa fa-arrow-left me-2"></i> Kembali</button>
    </div>
    <div>
        <button type="button" class="btn btn-lg btn-primary" data-kt-stepper-action="save">
            <span class="indicator-label">Simpan <i class="fa fa-arrow-right ms-2"></i></span>
            <span class="indicator-progress">Tunggu sebentar...<span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
        </button>
    </div>
</div>
