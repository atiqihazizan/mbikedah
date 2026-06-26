<div class="mb-5">
    @if(!isset($body->car_return))
        <div class="mb-5">
            <label for="" class="form-label">Pengesahan Kenderaan</label>
            <select name="idcar" class="form-select">
                @foreach($vhc as $v)
                    <option value="{{ $v->id }}" @if($body->car->id==$v->id) selected @endif >{{ $v->model . '-' .$v->regno }}</option>
                @endforeach
            </select>
        </div>
        @if(isset($body->car->driver))
        <div class="mb-5">
            <label for="" class="form-label">Nama Pemandu</label>
            <input type="text" class="form-control" name="driver_name">
        </div>
        @endif
    @else
        <table class="table align-middle gy-3"><tbody class="fs-6 fw-semibold text-gray-600">
            <tr>
                <td>Tarikh/Masa</td>
                <td><input type="datetime-local" class="form-control" value="{{ $body->car_return->dtreturn }}" name="verified_return[dtreturn]" max="{{ DATENOW }}T00:00"/> </td>
            </tr>
            <tr>
                <td>Mileage Sebelum</td>
                <td><input type="number" class="form-control" value="{{ $body->car_return->milbefore??'' }}" name="verified_return[milbefore]" /> </td>
            </tr>
            <tr>
                <td>Mileage Selepas</td>
                <td><input type="number" class="form-control" value="{{ $body->car_return->milafter??'' }}" name="verified_return[milafter]" /> </td>
            </tr>
            <tr>
                <td>Pembelian Minyak/Km</td>
                <td><input type="number" class="form-control" value="{{ $body->car_return->fuelkmbefore??'' }}" name="verified_return[fuelkmbefore]" /> </td>
            </tr>
            <tr>
                <td>Baki Minyak/Km</td>
                <td><input type="number" class="form-control" value="{{ $body->car_return->fuelkmafter??'' }}" name="verified_return[fuelkmafter]" /> </td>
            </tr>
            <tr>
                <td>Pembelian TnG</td>
                <td><input type="number" class="form-control" value="{{ $body->car_return->tngtopup??'' }}" name="verified_return[tngtopup]" /> </td>
            </tr>
            <tr>
                <td>Baki TnG</td>
                <td><input type="number" class="form-control" value="{{ $body->car_return->tngbal }}" name="verified_return[tngbal]" /> </td>
            </tr>
            <tr>
                <td>Keadaan</td>
                <td>
                    @php($sts = ['Baik','Tidak Baik'])
                    @foreach($sts as $s)
                    <div class="form-check form-check-custom form-check-inline">
                        <input class="form-check-input" type="radio" name="verified_return[condition]" value="{{ $s }}"
                               id="condition_{{ $loop->index }}" @if($s == $body->car_return->condition) checked @endif/>
                        <label class="form-check-label" for="condition_{{ $loop->index }}">{{ $s }}</label>
                    </div>
                    @endforeach
                </td>
            </tr>
            </tbody></table>
    @endif
</div>
