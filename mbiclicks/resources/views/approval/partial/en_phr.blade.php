<input type="hidden" name="staffid">
@php($classInput = 'form-control')
@php($classSelect = 'form-select')
@if($req=$ptyp->preq??false)
@if($req = $req->{$petition->stepnow}??false)
    {{--@if($req->el == 'vehicle')
        <div class="fv-row mb-5">
            <select class="form-select" name="vehicle">
                <option value="">Pilih Kenderaan</option>
                @foreach($master->cars as $v)
                    @continue($v->staff_id > 0 && $v->staff_id != $petition->staff_id)
                    <option value="{{ $v->id }}" @if($body->vehicle == $v->id) selected @endif>{{ $v->model . '-' . $v->regno }}</option>
                @endforeach
            </select>
        </div>
    @endif--}}
    @if(($req->el??'') === 'claim')

        <div class="fv-row mb-5">
            <label class="fs-5 fw-semibold mb-2">Jenis Urusniaga</label>
            <select class="{{ $classSelect }}" data-control="select2" data-placeholder="Jenis Urusniaga" data-hide-search="true" name="urusniaga">
                <option value="">Jenis Urusniaga</option>
                @foreach($master->urusn as $type)
                    <option value="{{ $type->id }}">{{ $type->code . '-' . $type->uitem }}</option>
                @endforeach
            </select>
        </div>

        <div class="fv-row mb-5">
            <label class="required fs-5 fw-semibold mb-2">Keterangan Bayaran</label>
            <input type="text" class="{{ $classInput }}" name="perkara" placeholder="Taip keterangan" required>
        </div>
    @endif
@endif
@endif
