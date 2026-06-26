
<div class="mb-5">
    <label class="required form-label fw-bold">Nama Pengguna</label>
    <input type="text" class="form-control" placeholder="Enter username" name="name" value="{{old('name',$data['name']??'')}}" required/>
    @error('name') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
</div>

<div class="mb-5">
    <label class="required form-label fw-bold">Kelayakan</label>
    <div>
        @foreach($stepper as $s)
            <div class="form-check form-check-inline mt-3 me-3">
                <input class="form-check-input" type="checkbox" value="{{$s->id}}" name="ustep[]" id="stepper_{{$s->id}}" @if(in_array($s->id,old('ustep',$data->ustep??[]))) checked @endif>
                <label class="form-check-label" for="stepper_{{$s->id}}">{{ $s->name }}</label>
            </div>
        @endforeach
        @error('ustep') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
    </div>
</div>
<br>
<div class="row mb-5">
    <div class="col-md-6">
        <label class="required form-label fw-bold me-3">Jenis</label>
        @foreach([['val'=>0,'label'=>'Biasa'],['val'=>1,'label'=>'Kewangan'],['val'=>2,'label'=>'HR']] as $s)
            <div class="form-check form-check-inline me-3">
                <input class="form-check-input" type="radio" value="{{$s['val']}}" name="utype" id="type_{{$s['val']}}" @if(old('utype',$data->utype ?? -1) == $s['val']) checked @endif>
                <label class="form-check-label" for="type_{{$s['val']}}">{{ $s['label'] }}</label>
            </div>
        @endforeach
        @error('utype') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
    </div>
    <div class="col-md-3 offset-3 d-flex justify-content-end">
        <label class="required form-label fw-bold me-3">Benarkan Ubahsuai</label>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" value="1" name="uability" id="ability_1" @if(old('uability',$data->uability ?? -1)==1) checked @endif>
            <label class="form-check-label" for="ability_1">Enabled</label>
        </div>
        @error('uability') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
    </div>
</div>
<div class="separator my-5"></div>
<div class="d-flex justify-content-center">
    <a href="/cms/user" class="btn btn-secondary me-3">Cancel</a>
    <button class="btn btn-primary" type="submit">Save</button>
</div>
