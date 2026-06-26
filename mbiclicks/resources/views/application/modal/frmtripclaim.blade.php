
<input type="hidden" name="datatype" value="tripclaim">
<input type="hidden" name="body[totalamt]" value="0">
@foreach($body as $key=>$b)
{{--    @continue($key == 'taskdetail' || $key == 'claim')--}}
    @continue(gettype($b) == 'array' || gettype($b) == 'object')
    <input type="hidden" name="body[{{ $key }}]" value="{{ $b }}">
@endforeach
<div class="fv-row mb-10 d-none">
    <label class="required fs-5 fw-semibold mb-2">Tarikh Pemohonan</label>
    <input class="form-control form-control-solid" type="date" placeholder="Pilih tarikh" name="pdate" value="{{ old('pdate',$petition->pdate??date('Y-m-d')) }}" required/>
</div>
<div class="fv-row mb-10">
    <table class="table table-sm">
        <tr>
            <td class="w-100px">Tarikh</td>
            <td colspan="2">Masa</td>
            <td>Perkara</td>
            <td class="w-100px">Jarak</td>
            <td class="w-10px"></td>
        </tr>
        <tr>
            <td><input class="form-control form-control-solid tarikh" placeholder="Tarikh Aktiviti" type="date"/></td>
{{--            <td><input class="form-control form-control-solid masa" placeholder="Waktu mula dan hingga" oninput="return this.value = this.value.replace(/[^0-9-:]/g, '')"/></td>--}}
            <td class="w-100px"><input class="form-control form-control-solid dari" placeholder="Waktu mula" type="time" value="08:00"/></td>
            <td class="w-100px"><input class="form-control form-control-solid hingga" placeholder="Waktu hingga" type="time" value="08:00"/></td>
            <td><input class="form-control form-control-solid perkara" type="text" placeholder="Aktiviti kerja"/></td>
            <td><input class="form-control form-control-solid jarak" type="text" placeholder="Jarak" oninput="return this.value = this.value.replace(/[^0-9,]/g, '').replace(/(\,.*?)\,.*/g, '$1')"/></td>
            <td><button type="button" class="btn btn-primary" id="addTask"><span class="fa fa-plus"></span> </button></td>
        </tr>
    </table>
    <input type="hidden" name="chktaskdaily" value="{{ $body->taskdetail??''?json_encode($body->taskdetail):'' }}">
    <input type="hidden" name="body[totaldays]" value="">
{{--    <h5 class="required">Butiran Kerja</h5>--}}
    <table class="table align-middle table-sm table-row-bordered gs-3">
        <thead class="table-primary text-white-50">
        <tr class="fw-bolder fs-6 text-gray-800 align-middle">
            <th rowspan="2" class="w-125px text-center">Tarikh</th>
            <th class="w-80px text-center">Mula</th>
            <th class="w-80px text-center">Hingga</th>
            <th rowspan="2" class="w-80px text-center"></th>
            <th rowspan="2" class="">Perkara</th>
            <th rowspan="2" class="w-100px text-center text-nowrap">Jarak (KM)</th>
            <th rowspan="2" class="w-20px"></th>
        </tr>
        </thead>
        <tbody id="tbody_task">
        </tbody>
    </table>
</div>
<div class="separator separator-dashed border-primary my-5"></div>
@php([$chkclaimempty='',$claim = $body->claim??[]])
@foreach($alwn->type as $t)
    <div class="fv-row mb-7">
        <label class="mb-2 fw-bold">{{$t->name}}</label>
        <div class="d-flex flex-wrap gap-5">
            @foreach($alwn->item[$t->id] as $i)
                <?php if($claim->{$i->id}??'' != '') $chkclaimempty = 1; ?>
                <div class="input-group" style="width: 23%">
                    <span class="input-group-text" id="claim_${i.id}">{{$i->name}} </span>
                    <input type="number" class="form-control item-claim" aria-describedby="claim_{{ $i->id }}" name="body[claim][{{ $i->id }}]" value="{{ $claim->{$i->id}??'' }}" onfocus="this.select()" />
                    @if(isset($i->unit) && (strtolower($i->unit) == 'km' || strtolower($i->unit) == 'hari')) <span class="input-group-text">{{ $i->unit }}</span> @endif
                </div>
            @endforeach
        </div>
    </div>
@endforeach
{{--{{ dd($chkclaimempty) }}--}}
<div class="fv-row"><input type="hidden" name="chkclaimempty" value="{{ $chkclaimempty }}"></div>

{{--@push('javascript')--}}
{{--<script src="{{ URL::asset('js/app/tripclaim.js') }}"></script>--}}
{{--@endpush--}}
