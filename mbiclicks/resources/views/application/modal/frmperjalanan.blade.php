<div class="">
    <input type="hidden" name="datatype" value="perjalanan">
    <div class="row">
        {{--<div class="fv-row col-md-3">
            <label class="required fs-5 fw-semibold mb-2">Tarikh Pemohonan</label>
            <input class="form-control form-control-solid" type="date" placeholder="Pilih tarikh" name="pdate" value="{{ old('pdate',$petition->pdate??date('Y-m-d')) }}" required/>
        </div>--}}
        {{--@foreach([['label'=>'Tarikh Permohonan','name'=>'pdate'],['label'=>'Tarikh Dari','name'=>'dtout'],['label'=>'Tarikh Hingga','name'=>'dtback']] as $v)
            <div class="fv-row col-md-4">
                <label class="required fs-5 fw-semibold mb-2">{{$v['label']}}</label>
                <input class="form-control form-control-solid {{$v['name']}}" type="date" placeholder="Pilih tarikh" name="body[{{$v['name']}}]" value="{{ old('pdate',$body->{$v['name']}??date('Y-m-d')) }}" required/>
            </div>
        @endforeach--}}
        <?php
        $date = [
            ['label'=>'Tarikh Permohonan','name'=>'pdate','value'=>$petition->pdate??date('Y-m-d')],
            ['label'=>'Tarikh Dari','name'=>'body[dtout]','cls'=>'dtout','value'=>$petition->body->dtout??date('Y-m-d')],
            ['label'=>'Tarikh Hingga','name'=>'body[dtback]','cls'=>'dtback','value'=>$petition->body->dtback??date('Y-m-d')]
        ];
        ?>
        @foreach($date as $v)
            <div class="fv-row col-md-4">
                <label class="required fs-5 fw-semibold mb-2">{{$v['label']}}</label>
                <input class="form-control form-control-solid {{$v['cls']??''}}" type="date" placeholder="Pilih tarikh" name="{{$v['name']}}" value="{{ $v['value'] }}" required/>
            </div>
        @endforeach
    </div>

    <div class="fv-row mb-5">
        <input type="hidden" class="tday" name="body[num]" value="{{ old('num',$body->num??1) }}"/>
    </div>

    <div class="fv-row mb-5">
        <label class="required fs-5 fw-semibold mb-2">Lokasi</label>
        <div class="position-relative d-flex">
            <input type="text" name="body[location]" class="form-control form-control-solid pe-12" placeholder="Masukkan lokasi yang hendak dituju" value="{{ old('location',$body->location??'') }}">
        </div>
    </div>
    <div class="fv-row mb-5">
        <label class="required fs-5 fw-semibold mb-2">Alamat dan tempat berurusan</label>
        <textarea name="body[addr]" class="form-control form-control-solid" data-kt-autosize="true" rows="3" placeholder="Alamat tempat berurusan" required>{{ old('addr',$body->addr??'') }}</textarea>
    </div>

</div>

<div class="mb-5">
    <label class="fs-5 fw-semibold mb-4 required">Urusan</label>
    <div class="fv-row mb-5">
        @foreach(['Mesyuarat','Lawatan Tapak','Lain-lain'] as $r)
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="body[urusan]" @if(($body->urusan??'') == $r) checked @endif id="inlineRadio_{{ $r }}" value="{{ $r }}">
                <label class="form-check-label" for="inlineRadio_{{ $r }}">{{ $r }}</label>
            </div>
        @endforeach
    </div>

    <input class="form-control form-control-solid" type="text" placeholder="Lain-lain jika ada" name="body[other]" value="" required/>
</div>

<div class="row my-5 validity-car  @if(isset($body->car?->driver)) fv-row @endif">
    <label class="fs-5 fw-semibold mb-4 validity-car-label @if(isset($body->car?->driver)) required @endif">
        Memohon Penggunaan Kenderaan
    </label>
    <div class="col-md-2">
        <div class="form-check mt-3">
            <input type="checkbox" name="body[vehicle]" class="form-check-input" id="body_vehicle" value="{{ ENDORSE_VHCL }}" @if($body->vehicle??false) checked @endif />
            <label class="form-check-label" for="body_vehicle">Memohon Kenderaan</label>
        </div>
    </div>
    <div class="col-md-4">
        <select class="form-select form-select-solid vehicle" name="body[car][id]">
            <option value="">Pilih Kenderaan</option>
            @foreach($vhcl as $n)
                <option value="{{$n->id}}" @if(($body?->car?->id??0) == $n->id) selected @endif >{{ $n->model . ' - ' . $n->regno }}</option>
            @endforeach
        </select>
    </div>
    <div class="col-md-4">
        <div class="form-check mt-3">
            <input type="checkbox" name="body[car][driver]" class="form-check-input vehicle" id="body_car_driver" value="1" @if(isset($body->car?->driver)) checked @endif/>
            <label class="form-check-label" for="body_car_driver">Keperluan Pemandu</label>
        </div>
    </div>
</div>
<div class="separator separator-dashed border-primary my-5"></div>
<div class="fv-row mb-5">
    <label class="d-flex align-items-center fs-5 fw-semibold mb-4"><span>Keperluan</span></label>
    <input type="hidden" name="plist" value="{{ old('plist',json_encode($plist)??'') }}">
    <table class="table align-middle table-sm table-bordered table-row-bordered gs-3">
        <thead class="table-primary text-white-50">
            <tr class="fw-bolder fs-6 text-gray-800">
                <th class="">Kategori</th>
                <th class="">Item</th>
                <th class="">Keterangan</th>
                <th class=""></th>
            </tr>
            <tr>
                <th class="w-250px">
                    <select class="form-select form-select-solid form-select-sm reset need-item">
                        <option value="">Pilih Item</option>
                        @foreach($master->need as $n)
                            <option value="{{$n->id}}">{{ $n->item }}</option>
                        @endforeach
                    </select>
                </th>
                <th class="w-300px">
                    <select class="form-select form-select-solid form-select-sm reset need-desc"></select>
                    <input type="hidden" class="need-type" value="0">
                </th>
                <th class="w-auto">
                    <input type="text" class="form-control form-control-solid form-control-sm reset need-value" placeholder="Keterangan">
                </th>
                <th class="w-30px">
                    <button type="button" class="btn btn-primary btn-sm btn-icon w-30px need-add"><i class="fa fa-plus p-0"></i> </button>
                </th>
            </tr>
        </thead>
        <tbody class="tbody-need">
        </tbody>
    </table>
</div>
