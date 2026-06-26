@extends('layouts.main')
@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Cuti Mengikut Permohonan</h1>
        <ul class="breadcrumb breadcrumb-dot fw-semibold text-gray-600 fs-7">
            <li class="breadcrumb-item text-gray-600"><a href="/home" class="text-gray-600 text-hover-primary">Home</a></li>
            <li class="breadcrumb-item text-gray-600">Cuti Mengikut Permohonan</li>
        </ul>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
    </div>
@endsection
@section('body')
    <div class="card">
        {{--<div class="card-body">--}}
        <div class="table-responsive">
            <table class="table table-sm table-row-dashed table-row-gray-300 gy-3 gs-7 table-hover align-middle g-2" id="table_pos_leave">
                <thead class="border-gray-200 fs-6 fw-bold bg-lighten">
                <tr class="fw-bold fs-6 text-gray-800 text-uppercase">
                    <th class="text-center w-50px">#</th>
                    <th class="w-auto">Nama</th>
                    <th class="">Jenis Cuti</th>
                    {{--<th class="text-center w-20px">Aktif</th>--}}
                    <th class="w-20px"></th>
                </tr>
                </thead>
                <tbody class="fs-6 text-gray-600" id="tbody_leave">
                @foreach($ptype as $d)
                    <tr class="">
                        <td class="text-center w-20px">{{$loop->iteration}}</td>
                        <td class="text-nowrap w-200px">{{$d->name}}</td>
                        <td class="">{{ $d->lvtype }}</td>
                        {{--<td class="text-center w-10px">
                            <form action="/conf/petitiontype/enabled/{{$d->id}}" method="post">
                                @csrf
                                @method('put')
                                <input type="hidden" name="shw" value="{{$d->shw}}">
                                <button type="submit" class="border-0 bg-transparent">
                                    <span class="fa @if($d->shw == 1 )fa-circle-check text-primary @else fa-times-circle text-danger @endif fs-3"></span>
                                </button>
                            </form>
                        </td>--}}
                        <td class="text-end w-10px">
                            <a href="/conf/petitiontype/{{ $d->id??0 }}/edit" class="btn btn-primary btn-icon w-25px h-25px"><span class="fa fa-pencil"></span></a>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>

        </div>
        {{--</div>--}}
    </div>
@endsection
@section('modal')
    <div class="modal fade" id="kt_modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <form @if(session()->has('id')) action="/conf/petitiontype/{{session('id')}}" @else action="/conf/petitiontype" @endif method="post" autocomplete="off" id="form_modal">
                    @csrf
                    @if(session()->has('id'))
                        @method('put')
                        @php($data = session('data'))
                        @php($lv = $data['lvtyp'])
                    @endif
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Cuti / Faedah Staff</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">

                        <div class="row mb-3">
                            @foreach($master->lvtype as $a)
                                @if($loop->index>0 && ($loop->index % 4)==0)
                                    </div><div class="row mb-3">
                                @endif
                                <div class="col-md-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" value="{{$a->id}}" id="lv_{{$a->id}}" name="lvtyp[]" @if(in_array($a->id,$lv ?? [])) checked @endif/>
                                        <label class="form-check-label" for="lv_{{$a->id}}">{{$a->leave}}</label>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

@push('javascript')
    <script>
        let err = '{{$errors->any()}}';
        let addnew = '{{ session()->get('addnew') }}'
        let update = '{{ session('id') }}'
        const myModal = new bootstrap.Modal('#kt_modal', {keyboard: false})
        if(err || update) myModal.show()
        if(addnew){
            document.getElementById('form_modal').reset();
            myModal.show()
        }
    </script>
@endpush
