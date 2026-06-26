<div class="w-100">
    <input type="hidden" name="datatype" value="benefit">
    <div class="fv-row mb-5">
        <label class="required fs-5 fw-semibold mb-2">Jenis Rawatan</label>
        <div>
            @foreach(TREATMENT as $v)
                <div class="form-check form-check-inline">
                    <input class="form-check-input treatment" type="radio" id="treat_{{$v['id']}}" value="{{$v['id']}}" name="body[treatment]" @if($body->treatment == $v['id']) checked @endif  >
                    <label class="form-check-label" for="treat_{{$v['id']}}">{{$v['value']}}</label>
                </div>
            @endforeach
        </div>
    </div>
    <div class="row g-5 mb-5">
        <div class="fv-row col-md-3">
            <label class="required fs-5 fw-semibold mb-2">Tarikh Pemohonan</label>
            <input class="form-control form-control-solid" type="date" placeholder="Pilih tarikh" name="pdate" value="{{ old('pdate',$petition->pdate??date('Y-m-d')) }}" required/>
        </div>
        <div class="fv-row col-md-3">
            <label class="required fs-5 fw-semibold mb-2">Dituntut Oleh</label>
            <input class="form-control form-control-solid" type="text" placeholder="Nama penuntut" name="body[claimant]" value="{{ old('claimant',$body->claimant??'') }}" required/>
        </div>
        <div class="fv-row col-md-3">
            <label class="fs-5 fw-semibold mb-2">Hubungan</label>
            <input class="form-control form-control-solid" type="text" placeholder="Jenis hubungan" name="body[relation]" value="{{ old('relation',$body->relation??'') }}"/>
        </div>
        <div class="fv-row col-md-3">
            <label class="required fs-5 fw-semibold mb-2">Jumlah</label>
            <input class="form-control form-control-solid" type="number" placeholder="Jumlah RM" value="{{ old('totalamt',$body->totalamt??0) }}" name="body[totalamt]" min="1" step="any" required />
        </div>
    </div>
    <div class="fv-row mb-5">
        <label class="required fs-5 fw-semibold mb-2">Nyatakan Item</label>
        <input class="form-control form-control-solid" type="text" placeholder="Item rawatan" name="body[item]" value="{{ old('item',$body->item??0) }}" required/>
    </div>

</div>
