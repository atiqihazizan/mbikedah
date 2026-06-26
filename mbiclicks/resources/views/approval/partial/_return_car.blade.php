{{--<div class="card shadow-sm pt-4 mb-6 mb-xl-9">--}}
{{--<div class="card-header border-0"><div class="card-title"><h2>Pemulangan Kenderaan</h2></div></div>--}}
{{--<div class="card-body pt-0 pb-5">--}}
<div class="table-responsive"><form id="swalForm">
@csrf
<input type="hidden" name="psts" value="{{ LOGSTS_GIVEBACK }}" />
{{--@foreach($body as $k=>$b)--}}
{{--<input type="hidden" name="body[{{ $k }}]" value="{{ $b }}" />--}}
{{--@endforeach--}}
{{--@foreach($car as $k=>$c)--}}
{{--<input type="hidden" name="body[car][{{ $k }}]" value="{{ $c }}" />--}}
{{--@endforeach--}}
<table class="table align-middle gy-3"><tbody class="fs-6 fw-semibold text-gray-600">
    <tr>
        <td>Tarikh/Masa Serahan</td>
        <td><input type="datetime-local" class="form-control" name="car_return[dtreturn]" max="{{ DATENOW }}T00:00"/> </td>
    </tr>
    <tr>
        <td>Mileage Sebelum</td>
        <td><input type="number" class="form-control" name="car_return[milbefore]" /> </td>
    </tr>
    <tr>
        <td>Mileage Selepas</td>
        <td><input type="number" class="form-control" name="car_return[milafter]" /> </td>
    </tr>
    <tr>
        <td>Pembelian Minyak/Kilometer</td>
        <td><input type="number" class="form-control" name="car_return[fuelkmbefore]" /> </td>
    </tr>
    <tr>
        <td>Baki Minyak/Kilometer</td>
        <td><input type="number" class="form-control" name="car_return[fuelkmafter]" /> </td>
    </tr>
    <tr>
        <td>Pembelian TnG</td>
        <td><input type="number" class="form-control" name="car_return[tngtopup]" /> </td>
    </tr>
    <tr>
        <td>Baki TnG</td>
        <td><input type="number" class="form-control" name="car_return[tngbal]" /> </td>
    </tr>
    <tr>
        <td>Keadaan Kereta</td>
        <td>
            <div class="form-check form-check-custom form-check-inline">
                <input class="form-check-input" type="radio" name="car_return[condition]" value="Baik" id="condition_baik"/>
                <label class="form-check-label" for="condition_baik">Baik</label>
            </div>

            <div class="form-check form-check-custom form-check-inline">
                <input class="form-check-input" type="radio" name="car_return[condition]" value="Tidak Baik" id="condition_tidak_baik"/>
                <label class="form-check-label" for="condition_tidak_baik">Tidak Baik</label>
            </div>
        </td>
    </tr>
<tr>
    <td>Ulasan</td>
    <td><input type="text" class="form-control" name="car_return[remark]" /> </td>
</tr>
</tbody></table>
</form></div>
{{--</div></div>--}}
