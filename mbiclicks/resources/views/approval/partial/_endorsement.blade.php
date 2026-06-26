
<form class="form_verify" autocomplete="off" onsubmit="event.preventDefault();"><span class="kt_pt_slug d-none">{{ $petition->slug??'' }}</span>
@includeIf('approval.partial.en_'.strtolower($stepper->code))
<div class="fv-row mb-5"><label for="" class="form-label">Ulasan</label><input type="text" class="form-control" name="remark"></div>
<div class="fv-row mb-5"><label for="" class="required form-label">Status</label>
<select class="form-select" name="psts">
<option value="">Pilih Status</option>
@foreach($status as $s)
<option value="{{ $s['value'] }}">{{ $s['text'] }}</option>
@endforeach
</select>
</div></form>
