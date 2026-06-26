
@foreach($input as $el)
    @if(is_array($el))
        <div class="row mb-5">
            @foreach($el??[] as $o)
                <div class="fv-row col-md-{{ $o->col }}">
                    <label class="fs-6 fw-semibold mb-2">{{ $o->label }}</label>
                    <input type="{{ $o->el }}" class="form-control form-control-solid" placeholder=""
                           name="{{ $o->id }}" value="{{old($o->id,$data->{$o->id}??$o->def)}}" />
                    @if ($errors->has($o->id))
                        <div class="fv-plugins-message-container invalid-feedback">{{ $errors->first($o->id) }}</div>
                    @endif
                </div>
            @endforeach
        </div>
    @else
        <div class="fv-row mb-5">
            <label class="fs-6 fw-semibold mb-2">{{ $el->label }}</label>
            <input type="{{ $el->el }}" class="form-control form-control-solid" placeholder=""
                   name="{{ $el->id }}" value="{{old($el->id,$data->{$el->id}??$el->def)}}" />
            @if ($errors->has($el->id))
                <div class="fv-plugins-message-container invalid-feedback">{{ $errors->first($el->id) }}</div>
            @endif
        </div>
    @endif
@endforeach
@foreach($select as $o)
    <div class="fv-row mb-5">
        <label class="fs-6 mb-2">{{ $o->label }}</label>
        <select name="{{$o->id}}" aria-label="Pilih {{ $o->label }}" data-control="select2"
                data-placeholder="Pilih {{ $o->label }}..."
                data-dropdown-parent="#kt_modal_update_staff" class="form-select form-select-solid">
            <option value="">Pilih {{ $o->label }}</option>
            @foreach($o->list as $s)
                <option value="{{ $s->id }}" @if(old($o->id,$data->{$o->id} ?? -1) == $s->id) selected @endif>
                    {{ Str::title($s->name) }}
                </option>
            @endforeach
        </select>
        @if ($errors->has($o->id))
            <div class="fv-plugins-message-container invalid-feedback">{{ $errors->first($o->id) }}</div>
        @endif
    </div>
@endforeach
{{--

@foreach($input as $el)
    <div class="row mb-8">
        @foreach($el as $o)
            <div class="fv-row col-md-{{ $o->col }}">
                <label class="fs-6 fw-semibold mb-2">{{ $o->label }}</label>
                <input type="{{ $o->el }}" class="form-control form-control-solid" placeholder=""
                       name="{{ $o->id }}" value="{{old($o->id,$data->{$o->id}??$o->def)}}" />
                @if ($errors->has($o->id))
                    <div class="fv-plugins-message-container invalid-feedback">{{ $errors->first($o->id) }}</div>
                @endif
            </div>
        @endforeach
    </div>
@endforeach
<div class="row ">
    @foreach($select as $o)
        <div class="fv-row col-md-{{ $o->col }}">
            <label class="fs-6 mb-2">{{ $o->label }}</label>
            <select name="{{$o->id}}" aria-label="Pilih {{ $o->label }}" data-control="select2"
                    data-placeholder="Pilih {{ $o->label }}..."
                    data-dropdown-parent="#kt_modal_update_staff" class="form-select form-select-solid">
                <option value="">Pilih {{ $o->label }}</option>
                @foreach($o->list as $s)
                    <option value="{{ $s->id }}" @if(old($o->id,$data->{$o->id} ?? -1) == $s->id) selected @endif>
                        {{ Str::title($s->name) }}
                    </option>
                @endforeach
            </select>
            @if ($errors->has($o->id))
                <div class="fv-plugins-message-container invalid-feedback">{{ $errors->first($o->id) }}</div>
            @endif
        </div>
    @endforeach
</div>
--}}
