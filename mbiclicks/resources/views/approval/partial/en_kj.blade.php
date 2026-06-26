@if($req=$ptyp->preq??false)
@php($req = $req->{$petition->stepnow}??[])
@if($req)
<div class="fv-row mb-5 {{ $req->class??'' }}">
<label for="" class="form-label">{{$req->title??''}}</label>
@if(($req?->el??'') === 'nombor')
<div class="input-group input-group">
<input type="number" min="1" max="{{ $petition->body->num??0 }}" class="form-control border-end-0" name="{{$req->name}}"
       tname="{{ $req->title }}" value="{{ $petition->body->num??0 }}" required oninput="inputCurrency(this)" onfocus="this.select();" autofocus>
<span class="input-group-text bg-white border-start-0" >{{ $req->unit }}</span>
</div>
@elseif(($req?->el??'') === 'currency')
<div class="input-group input-group">
<span class="input-group-text bg-white border-end-0" >{{ $req->unit }}</span>
<input type="number" min="1" max="{{ $petition->body->jumconfirm??0 }}" class="form-control border-start-0" name="{{$req->name}}"
       tname="{{ $req->title }}" value="{{ $petition->body->totalamt??0 }}" required oninput="inputCurrency(this)" onfocus="this.select();" autofocus>
</div>
@endif
</div>
@endif
@endif
