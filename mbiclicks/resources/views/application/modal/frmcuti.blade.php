<input type="hidden" name="datatype" value="cuti">
<div class="row mb-5">
    <?php
    $date = [
        ['label'=>'Tarikh Permohonan','name'=>'pdate','value'=>$petition->pdate??date('Y-m-d')],
        ['label'=>'Tarikh Dari','name'=>'body[dtout]','cls'=>'dtout','value'=>$petition->body->dtout??date('Y-m-d')],
        ['label'=>'Tarikh Hingga','name'=>'body[dtback]','cls'=>'dtback','value'=>$petition->body->dtback??date('Y-m-d')]
    ];
    ?>
    @foreach($date as $v)
    <div class="fv-row col-md-4">
        <label class="required fs-5 fw-semibold mb-2">{{$v['label']}}</label>
        <input class="form-control form-control-solid {{$v['cls']??''}}" type="date" placeholder="Pilih tarikh" name="{{$v['name']}}" value="{{ $v['value'] }}" required/>
    </div>
    @endforeach
    <div class="fv-row">
        <input type="hidden" class="tday" name="body[num]" value="1"/>
    </div>
</div>
<div class="fv-row mb-5">
    <label class="required fs-5 fw-semibold mb-2">Sebab</label>
    <input type="text" name="body[reason]" class="form-control form-control-solid" value="{{ old('reason',$body->reason??'') }}" required>
</div>
