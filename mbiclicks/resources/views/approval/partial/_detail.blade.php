
<div class="card shadow-sm pt-4 mb-6 mb-xl-9">
<div class="card-header border-0"><div class="card-title"><h2>{{ $title??'Butiran' }}</h2></div></div>
<div class="card-body pt-0 pb-5">
<div class="table-responsive">

@php($classInput = 'form-control form-control-sm')
@php($classSelect = 'form-select form-select-sm')

@if(in_array(ENDORSE_PHR,auth()->user()->ustep) && $ptt->stepnow ==  ENDORSE_PHR && in_array($ptt->ptype_id,[5,7,8]))
{{--<div class="separator separator-dashed border-primary my-5"></div>--}}
{{--            <input type="hidden" id="plist" value="{{ json_encode($ptt['plist']??[]) }}">--}}
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
<td class="pe-1"><select class="{{ $classSelect }}" data-control="select2 w-250px" data-placeholder="Kod Bajet" id="itembudget" style="width:250px"><option></option></select></td>
<td class="pe-1"><input type="text" class="{{ $classInput }}" id="itemname" placeholder="Perkara"></td>
<td class="px-1"><input type="text" class="{{ $classInput }}" id="itemref" placeholder="No rujukan"></td>
<td class="px-1"><input type="text" class="{{ $classInput }} text-center" id="itemunit" value="0" maxlength="3" onfocus="this.select()" placeholder="Unit" oninput="return inputNumeric(this)"></td>
<td class="px-1"><input type="text" class="{{ $classInput }} text-end" id="itemamt" value="0.00" onfocus="this.select()" placeholder="0.00" oninput="return inputCurrency(this)"></td>
<td class="ps-1"><a href="javascript:;" class="btn btn-primary w-100 px-2 add-detail"><i class="fa fa-plus icon-sm px-1"></i></a></td>
</tr>
</table>
@endif
</div>

<div class="table-responsive">
<table class="table align-middle table-row-dashed gy-3"><thead><tr class="row-details fw-bold">
@foreach($cols as $col)
<th class="{{ $col['class'] }}">{{ $col['name'] }}</th>
@endforeach
</tr></thead>
<tbody class="fs-6 fw-semibold text-gray-600 kt_table_plist reset" id="kt_table_bayaran_detail_tbody">
@foreach($rows??[] as $row)
<tr>
@foreach($row as $idx => $data)
<td class="{{ $cols[$idx]['class']??'' }}">{{ $data }}</td>
@endforeach
</tr>
@endforeach
</tbody></table>
</div>
</div></div>

@if(($ptt->pcate == 1 && !in_array(PREPARED,auth()->user()->ustep) && isset($body->credits)) || $ptt->stepnow == ENDORSE_PKW)
<div class="card shadow-sm pt-4 mb-6 mb-xl-9">
<div class="card-header border-0"><div class="card-title"><h2>Kredit Bayaran</h2></div></div>
<div class="card-body pt-0 pb-5">
@if($ptt->stepnow == ENDORSE_PKW)
    <table class="table table-borderless table-sm">
    <tr><td>Kod Kredit</td><td class="w-150px">Jumlah</td><td class="w-10px"></td></tr>
    <tr>
    <td>
    <select class="{{ $classSelect }}" id="creditbank" data-control="select2" data-placeholder="Kod Kredit"
    tabindex="-1" aria-hidden="true" data-hide-search="true">
    <option value="">Pilih Bank/Tunai</option>
    @foreach($master->bank as $b)
    <option value="{{ $b->id }}">
    {{ $b->name }}{{ $b->accno?' - ' . $b->accno:'' }} (RM {{ number_format($b->amt,2) }} )
    </option>
    @endforeach
    </select>
    </td>
    <td><input type="text" class="{{ $classInput }}" placeholder="Jumlah" required id="txamt" oninput="return inputNumeric(this)" autocomplete="off"/></td>
    <td class="w-10px"><button class="btn btn-icon btn-primary btn-sm w-30px" id="add_bank_trans"><i class="fa fa-plus"></i> </button></td>
    </tr>
    </table>
@endif
@if(isset($body->credits) || $ptt->stepnow ==  ENDORSE_PKW)
    <table class="table table-sm align-middle table-row-dashed">
    <thead>
    <tr class="fw-bold">
    <th>Nama</th>
    <th class="text-end w-100px">Jumlah</th>
    @if($ptt->stepnow == ENDORSE_PKW)
    <th class="w-10px"></th>
    @endif
    </tr>
    </thead>
    <tbody id="tbody_bankcredit" class="fs-7 fw-semibold text-gray-600">
    @php($total=0)
    @foreach($body->credits??[] as $c)
    @php($total += $c->total)
    <tr><td>{{ $c->text }}</td><td class="text-end">{{ number_format($c->total,2) }}</td></tr>
    @endforeach
    <tr class="fw-bold text-black"><td class=""></td><td class="text-end fs-5" id="totalcredit">{{ number_format($total,2) }}</td></tr>
    </tbody>
    </table>
@endif
</div>
</div>
@endif
