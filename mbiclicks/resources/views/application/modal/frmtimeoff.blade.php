<input type="hidden" name="datatype" value="timeoff">
<div class="row">
    <div class="fv-row col-md-3">
        <label class="required fs-5 fw-semibold mb-2">Tarikh Pemohonan</label>
        <input class="form-control form-control-solid" type="date" placeholder="Pilih tarikh" name="pdate" value="{{ old('pdate',$petition->pdate??date('Y-m-d')) }}" required/>
    </div>
    <div class="fv-row col-md-3">
        <label class="required fs-5 fw-semibold mb-2">Tarikh Keluar</label>
        <input class="form-control form-control-solid date out" placeholder="Tarikh keluar" type="date" value="{{ old('date',$body->date??date('Y-m-d')) }}" name="body[date]" required/>
    </div>
    <div class="fv-row col-md-3">
        <label class="required fs-5 fw-semibold mb-2">Waktu Keluar</label>
        <input class="form-control form-control-solid timeoff out" type="time" placeholder="Pilih masa keluar" value="{{ old('tout',$body->tout??'08:00')}}" min="08:00" max="17:00" name="body[tout]" required/>
    </div>

    <div class="fv-row col-md-3">
        <label class="required fs-5 fw-semibold mb-2">Waktu Masuk</label>
        <input class="form-control form-control-solid timeoff in" type="time" placeholder="Pilih masa masuk" value="{{ old('tin',$body->tin??'08:00')}}" min="08:00" max="17:00" name="body[tin]" required/>
    </div>
</div>
<div class="fv-row mb-5">
    {{--<label class="required fs-5 fw-semibold mb-2">Jumlah Waktu (jam)</label>--}}
    <input type="hidden" class="totalhr" name="body[num]" value="{{ old('num',$body->num??0) }}"/>
    {{--<span class="form-control form-control-solid disp_hr">0 jam</span>--}}
</div>
<div class="fv-row mb-5">
    <label class="d-flex align-items-center fs-5 fw-semibold mb-4"><span class="required">Sebab</span></label>
    @foreach(['Lewat','Urusan sekolah','Urusan keluarga','Urusan bank','Lain-lain'] as $r)
        <label class="d-flex flex-stack mb-5 cursor-pointer">
            <span class="d-flex align-items-center me-2"><span class="d-flex flex-column"><span class="fw-bold fs-6">{{ $r }}</span></span></span>
            <span class="form-check form-check-custom form-check-solid"><input class="form-check-input" type="radio" @if(($body->reason??false) == $r) checked @endif name="body[reason]" value="{{ $r }}"></span>
        </label>
    @endforeach

    <input class="form-control form-control-solid" type="text" placeholder="Nyatakan sebab" name="body[other]" value="{{ old('other',$body->other??'') }}" required/>
</div>

