
@extends('layouts.report')

@section('container')
    <div class="app-toolbar align-items-center justify-content-between py-2 py-lg-4">
        <div class="d-flex flex-grow-1 flex-stack flex-wrap gap-2 mb-n10" id="kt_toolbar">
            <div class="d-flex flex-column align-items-start me-3 gap-2">
                <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Lejer Perbelanjaan</h1>
            </div>
            @if($errors->any())
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                {!! implode(', ', $errors->all(':message')) !!}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif
            <div class="d-flex align-items-center py-2" id="kt_toolbar_act">
                <select class="form-select me-3" aria-label="Bulan" onchange="showladger(this.value)">
                    @foreach($monthlist as $m)
                        <option value="{{ $m['id'] }}" @if(YRMTH == $m['id']) selected @endif>{{ $m['name'] }}</option>
                    @endforeach
                </select>
                {{--<a href="#" class="btn btn-sm btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#kt_modal_1"><i class="la la-plus fs-2 p-0"></i></a>--}}
            </div>
        </div>
    </div>

    <div class="app-content flex-column-fluid" id="kt_app_contents">
        <div class="card min-h-100">
            <div class="table-responsive">

                <table class="table table-flush table-hover align-middle table-row-bordered table-row-solid gy-4 gx-2 gs-7">
                    <thead class="border-gray-200 fs-6 fw-bold bg-lighten">
                    <tr class="fw-bolder text-uppercase">
                        <th class="text-center w-125px">Tarikh</th>
                        <th class="w-auto">Perkara</th>
                        <th class="w-auto"></th>
                        <th class="text-end w-125px">Jumlah</th>
                    </tr>
                    </thead>
                    <tbody class="fs-6 text-gray-600" id="tbodyledger"></tbody>
                </table>

            </div>
        </div>
    </div>
@endsection
@section('modal')
    <div class="modal fade" tabindex="-1" id="kt_modal_1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Tambah Rekod</h3>

                    <!--begin::Close-->
                    <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal" aria-label="Close">
                        <span class="svg-icon svg-icon-1"></span>
                    </div>
                    <!--end::Close-->
                </div>

                <form action="/budget/budgetledger/" method="post" autocomplete="off">
                    @csrf
                    <div class="modal-body">
                        <div class="row mb-5">
                            <div class="col-md-9">
                                <label class="required fs-6 fw-bold mb-2">Item Perbelanjaan</label>
                                <select class="form-select"data-control="select2" data-placeholder="Bajet" name="budget_id" required data-dropdown-parent="#kt_modal_1">
                                    <option></option>
                                    @foreach($budget as $b)
                                        <option value="{{ $b->id }}">{{ $b->bdgtcode . ' - '. $b->bdgtdesc }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="required fs-6 fw-bold mb-2">Tarikh</label>
                                <input class="form-control flatpicker" tplaceholder="Masukkan tarikh" name="datetx" required/>
                            </div>
                        </div>
                        <div class="row mb-5">
                            <div class="col-md-9">
                                <label class="required fs-6 fw-bold mb-2">Permohonan</label>
                                <select class="form-select"data-control="select2" data-placeholder="Permohonan" name="petition_id" data-dropdown-parent="#kt_modal_1" required>
                                    <option></option>
                                    <option value="0">Tiada Permohonan</option>
                                    @foreach($project as $b)
                                        <option value="{{ $b->id }}">{{ $b->pdate . '&nbsp;' .$b->ptitle }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="required fs-6 fw-bold mb-2">Jumlah</label>
                                <input class="form-control" placeholder="Masukkan jumlah" name="amt" oninput="return inputNumeric(this)" required/>
                            </div>
                        </div>
                        <div class="mb-5">
                            <label class="required fs-6 fw-bold mb-2">Catatan</label>
                            <input class="form-control" placeholder="Masukkan catatan(jika perlu)" name="remark"/>
                        </div>
                        <div class="mb-5">
                            <label class="required fs-6 fw-bold mb-2">Jenis</label>
                            <div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="type" id="inlineRadio1" value="1" required>
                                    <label class="form-check-label" for="inlineRadio1">Debit</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="type" id="inlineRadio2" value="2" required>
                                    <label class="form-check-label" for="inlineRadio2">Kredit</label>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                            <button type="submit" class="btn btn-primary">Save</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
@push('javascript')
<script>
    var tbody = document.getElementById('tbodyledger'),yrmth={{YRMTH}}
    $(".flatpicker").flatpickr({dateFormat:'d-m-Y'});

    function showladger(ym){
        yrmth = ym
        $.get( APP_URL + './finance/ledger/'+ym,function(res){
            if(res.success){
                tbody.innerHTML = res.data.map(function(r,n){
                    return `
                    <tr>
                        <td class="text-center">${moment(r.datetx).format('DD-MM-YYYY')}</td>
                        <td class="">${r.fcode + ' - ' + r.fname}</td>
                        <td>${ r.remark==null?'':r.remark }</td>
                        <td class="text-end">${currency(r.amt)}</td>
                    </tr>
                    `
                }).join('')
            } else {
                tbody.innerHTML = '';
            }
        })
    }
    function deleteLedger(id){
        if(!confirm("Anda pasti?")) return;
        $.ajax({
            url:'/budget/budgetledger/'+id,
            type : 'DELETE',
            data:{_token:'{{ csrf_token() }}'},
            success:function(data,status){if(data.success)showladger(yrmth)}
        });
    }
    showladger(yrmth)
</script>
@endpush
