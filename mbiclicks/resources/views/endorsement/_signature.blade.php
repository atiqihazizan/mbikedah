@if(in_array($petition->stepnow, [ENDORSE_PKW,ENDORSE_KKW,ENDORSE_CEO,ENDORSE_PAY,ENDORSE_VFY]))
<div class="card shadow-sm pt-4 mb-6 mb-xl-9">
    <div class="card-header border-0">
        <div class="card-title"><div class="card-title"><h2>Butiran Credit</h2></div></div>
    </div>
    <div class="card-body pt-0 pb-5">
        <table class="table">
            @foreach($petition->body->credits??[] as $c)
            <tr><td>{{ $c->text }}</td><td class="text-end w-100px">{{ number_format($c->total,2) }}</td></tr>
            @endforeach
        </table>
    </div>
</div>
@endif
<div class="card shadow-sm pt-4">
    <div class="card-header border-0">
        <div class="card-title"><div class="card-title"><h2>Untuk Pengesahan</h2></div></div>
    </div>
    <div class="card-body pt-0 pb-5">        
        <span class="kt_pt_slug d-none">{{ $petition->slug??'' }}</span>
        <span class="kt_pt_total d-none">{{ $petition->tamt??'0' }}</span>
        <form class="form_verify" autocomplete="off" onsubmit="event.preventDefault();">

            @if($petition->stepnow == ENDORSE_PKW) 
                @include('endorsement.financecheck')
                <input type="hidden" name="body[credits]" />
                <input type="hidden" name="body[creditverified]" />
            @endif

            <div class="fv-row mb-5">
                <label for="" class="form-label">Ulasan</label>
                <input type="text" class="form-control" name="remark">
            </div>
            <div class="fv-row mb-5">
                <label for="" class="required form-label">Status</label>
                <div class="d-flex">
                @foreach($status as $s)
                    <div class="form-check form-check-custom me-10">
                        <input class="form-check-input" type="radio" name="psts" value="{{ $s['value'] }}" id="verify_{{ $s['value'] }}"/>
                        <label class="form-check-label" for="verify_{{ $s['value'] }}">{{ $s['text'] }}</label>
                    </div>
                @endforeach
                </div>
            </div>

            <?php
            $label = 'Pengesahan';
            switch($petition->stepnow) {
                case ENDORSE_KJ: $label = 'Pengesahan'; break;
                case ENDORSE_PKW: $label = 'Semakan'; break;
                case ENDORSE_VFY: $label = 'Pengesahan dan Cetak Borang'; break;
                case ENDORSE_PAY: $label = 'Pembayaran'; break;
            }
            ?>
            <button type="button" class="btn btn-primary w-100 btn-verify-submit mb-3">{{ $label}}</button>
        </form>
    </div>
</div>