{{--<div class="row mb-5">
    @foreach([['id'=>'username','label'=>'Staff No'],['id'=>'name','label'=>'Short Name']] as $d)
        <div class="col-md-4">
            <label class="required form-label fw-bold">{{$d['label']}}</label>
            <input type="text" class="form-control" placeholder="username" name="{{$d['id']}}" value="{{old($d['id'],$data[$d['id']]??'')}}" required/>
            @error($d['id']) <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
        </div>
    @endforeach
    <div class="col-md-4">
        <label class="required form-label fw-bold">Staff</label>
        <select class="form-select @error('staff_id') is-invalid @enderror"data-control="select2" data-placeholder="staff" name="staff_id" required>
            <option></option>
            @foreach($staff as $s)
                @if(old('staff_id',$data->staff_id ?? -1) == $s->id)
                    <option value="{{ $s->id }}" selected>{{ $s->staffno . ' - ' .$s->fullname }}</option>
                @else
                    <option value="{{ $s->id }}">{{ $s->staffno . ' - ' .$s->fullname }}</option>
                @endif
            @endforeach
        </select>
        @error('staff_id') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
    </div>
</div>--}}

<div class="mb-5">
    <label class="required form-label fw-bold">Jabatan</label>
    <select class="form-select @error('depart_id') is-invalid @enderror"data-control="select2" data-placeholder="Jabatan" name="depart_id" required>
        <option></option>
        @foreach($dep as $s)
            <option value="{{ $s->id }}" @if(old('depart_id',$data->depart_id ?? -1) == $s->id) selected @endif>{{ $s->name }}</option>
        @endforeach
    </select>
    @error('depart_id') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
</div>

<div class="mb-5">
    <label class="required form-label fw-bold">Teks</label>
    <textarea class="form-control d-none" name="textevent" rows="3" id="kt_docs_ckeditor_classic">
        {{ $data->textevent ?? ''}}
    </textarea>
</div>

{{--<div class="separator separator-dashed mb-5"></div>--}}<br>
<div class="separator my-5"></div>
<div class="d-flex justify-content-center">
    <a href="/cms/event" class="btn btn-secondary me-3">Batal</a>
    <button class="btn btn-primary" type="submit">Simpan</button>
</div>

@push('javascript')
    <script src="{{URL::asset('assets/plugins/custom/ckeditor/ckeditor-classic.bundle.js')}}"></script>
    <script>
        ClassicEditor
        .create(document.querySelector('#kt_docs_ckeditor_classic'))
         .then(editor => {
            console.log(editor);
        })
         .catch(error => {
            console.error(error);
        });
    </script>
@endpush
