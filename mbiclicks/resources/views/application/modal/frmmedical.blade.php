<input type="hidden" name="datatype" value="medical">
<div class="row mb-10">
    <div class="fv-row col-md-3">
        <label class="required fs-5 fw-semibold mb-2">Tarikh Pemohonan</label>
        <input class="form-control form-control-solid" type="date" placeholder="Pilih tarikh" name="pdate" value="{{ old('pdate',$petition->pdate??date('Y-m-d')) }}" required/>
    </div>
    <div class="fv-row col-md-3">
        <label class="required fs-5 fw-semibold mb-2">Tuntutan Oleh</label>
        <input class="form-control form-control-solid" type="text" placeholder="Nama penuntut" name="body[claimant]" value="{{ old('claimant',$body->claimant??'') }}" required/>
    </div>
    <div class="fv-row col-md-3">
        <label class="fs-5 fw-semibold mb-2">Hubungan</label>
        <input class="form-control form-control-solid related" type="text" placeholder="Jenis hubungan" name="body[relation]" value="{{ old('relation',$body->relation??'') }}"/>
    </div>
    <div class="fv-row col-md-3">
        <label class="required fs-5 fw-semibold mb-2">Jumlah</label>
        <input class="form-control form-control-solid" type="number" placeholder="Jumlah tuntutan" name="body[totalamt]" value="{{ old('totalamt',$body->totalamt??0) }}" min="1" step="any" required />
    </div>
</div>
