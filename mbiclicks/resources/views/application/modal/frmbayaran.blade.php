@php($classInput = 'form-control form-control-solid')
@php($classSelect = 'form-select form-select-solid')

<div class="form-content" data-kt-stepper-element="content">
    <div class="w-100">
        <input type="hidden" name="datatype" value="bayaran">

        <div class="row mb-5">

            <div class="fv-row col-md-3">
                <label class="required fs-5 fw-bold mb-2">Tarikh Pemohonan</label>
                <input class="form-control form-control-solid" type="date" placeholder="Pilih tarikh" name="pdate" value="{{ old('pdate',$petition->pdate??date('Y-m-d')) }}" required/>
            </div>

            {{-- <div class="fv-row col-md-6">
                <label class="required fs-5 fw-bold mb-2">Jenis Urusniaga</label>
                <select class="{{ $classSelect }}" data-control="select2" data-placeholder="Jenis Urusniaga" data-hide-search="true" name="body[urusniaga]" require>
                    <option value="">Jenis Urusniaga</option>
                    @foreach($urusn as $type)
                        <option value="{{ $type->id }}" @if(($body?->urusniaga??0) == $type->id) selected @endif >{{ $type->code . '-' . $type->uitem }}</option>
                    @endforeach
                </select>
            </div> --}}
            <div class="col-md-3">
                <label class="fs-5 fw-bold mb-2">No Projek</label>
                <input type="text" class="{{ $classInput }}" placeholder="Masukkan No" name="body[pno]" value="{{old('pno',$body->pno??'N/A')}}"/>
            </div>
            <div class="fv-row col-md-6">
                <div class="d-flex flex-column">
                    <label class="required form-label fs-5 fw-bold mb-2">Individu/Syarikat</label>
                    <div class="input-group flex-nowrap">
                        <div class="overflow-hidden flex-grow-1">
                            <select class="{{ $classSelect }} rounded-end-0" data-placeholder="Individu/Syarikat" name="body[payto]" required id="sup_select" data-def="{{ old('pno',$body->payto??'0') }}">
                                <option></option>
                            </select>
                        </div>
                        <button class="btn btn-secondary" type="button" kt-app-add-sup><i class="bi bi-plus fs-2"></i></button>
                    </div>
                </div>
            </div>
        </div>

        <div class="fv-row mb-5">
            <label class="required fs-5 fw-bold mb-2">Keterangan Bayaran</label>
            <input type="text" class="{{ $classInput }}" name="body[perkara]" placeholder="Taip keterangan" value="{{ old('perkara',$body->perkara??'') }}" onkeydown="return /[a-z_ ]/i.test(event.key)" required>
        </div>
    </div>
</div>

<div class="fv-row mb-10">
    <input type="hidden" name="plist" value="{{ old('plist',json_encode($plist)??'') }}">
    <table class="table table-borderless">
        <tr class="fw-bolder fs-6 text-gray-800">
            <th class="pb-0" style="width: 250px">Bajet</th>
            <th class="pb-0" >Perkara</th>
            <th class="pb-0" style="width: 120px">Rujukan</th>
            <th class="pb-0" style="width: 80px">Unit</th>
            <th class="pb-0" style="width: 90px">Harga</th>
            <th class="pb-0" style="width: 40px"></th>
        </tr>
        <tr class="fw-bolder fs-6 text-gray-800">
            <td class="pe-1"><select class="{{ $classSelect }}" data-control="select2" data-placeholder="Kod Bajet" id="itembudget" style="width:250px"><option></option></select></td>
            <td class="pe-1"><input type="text" class="{{ $classInput }}" id="itemname" placeholder="Perkara" onkeydown="return inputWordsKeydown(event)"></td>
            <td class="px-1"><input type="text" class="{{ $classInput }}" id="itemref" placeholder="No rujukan"onkeydown="return inputNumberWordwithoutspce(event)"></td>
            <td class="px-1"><input type="text" class="{{ $classInput }} text-center" id="itemunit" value="0" maxlength="3" onfocus="this.select()" placeholder="Unit" oninput="return inputNumeric(this)"></td>
            <td class="px-1"><input type="text" class="{{ $classInput }} text-end" id="itemamt" value="0.00" onfocus="this.select()" placeholder="0.00" oninput="return inputCurrency(this)"></td>
            <td class="ps-1"><a href="javascript:;" class="btn btn-primary w-100 px-2 add-detail"><i class="fa fa-plus icon-sm px-1"></i></a></td>
        </tr>
    </table>
    <table class="table align-middle table-row-bordered">
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
