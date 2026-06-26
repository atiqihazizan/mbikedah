@if(in_array($step, [ENDORSE_PKW,ENDORSE_KKW,ENDORSE_CEO,ENDORSE_PAY,ENDORSE_VFY]))
<div class="card shadow-sm pt-4 mb-6 mb-xl-9">
    <div class="card-header border-0">
        <div class="card-title"><div class="card-title"><h2>Butiran Credit</h2></div></div>
    </div>
    <div class="card-body pt-0 pb-5">
        <table class="table">
            @foreach($credits??[] as $c)
            <tr><td>{{ $c->text }}</td><td class="text-end w-100px">{{ number_format($c->total,2) }}</td></tr>
            @endforeach
        </table>
    </div>
</div>
@endif

<div class="card shadow-sm pt-4">
    <div class="card-header border-0">
        <div class="card-title"><div class="card-title"><h2>Ulasan</h2></div></div>
    </div>
    <div class="card-body pt-0 pb-5">
        <p class="fs-5">{{ $ulasan ?? ''}}</p>
    </div>
</div>