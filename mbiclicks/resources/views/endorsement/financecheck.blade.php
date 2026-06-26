@php($classInput = 'form-control form-control-sm')
@php($classSelect = 'form-select form-select-sm')
@if($petition->stepnow == ENDORSE_PKW)
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
    <td class="w-10px"><a href="#" class="btn btn-icon btn-primary btn-sm w-30px" id="add_bank_trans"><i class="fa fa-plus"></i> </a></td>
    </tr>
    </table>
@endif
@if(isset($body->credits) || $petition->stepnow ==  ENDORSE_PKW)
    <table class="table table-sm align-middle table-row-dashed">
    <thead>
    <tr class="fw-bold">
    <th>Nama</th>
    <th class="text-end w-100px">Jumlah</th>
    @if($petition->stepnow == ENDORSE_PKW)
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