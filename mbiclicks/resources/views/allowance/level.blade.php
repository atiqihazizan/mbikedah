@extends('layouts.main')
@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Kategori Kelayakan Elaun</h1>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
        <label class="me-3">Kategori</label>
        <ul class="pagination pagination-circle">
            @foreach(ALLOWANCE_LEVEL as $l=>$i)
                @continue($loop->index == 0)
                <li class="page-item {{ $indx==$l? 'active' : '' }}">
                    <a href="{{ route('allowance.level',['idx'=>$l]) }}" class="page-link">{{ $l }}</a>
                </li>
            @endforeach
        </ul>
    </div>
@endsection
@section('body')
    <div class="card">
        <div class="table-responsive">
            <table class="table table-row-dashed table-row-gray-300 gs-4 table-hover align-middle" id="table_pos_leave">
                <thead class="border-gray-200 fs-6 fw-bold bg-lighten">
                <tr class="fw-bold fs-6 text-gray-800 text-uppercase">
                    <th class="text-center w-50px">#</th>
                    <th class="w-auto">Jenis</th>
                    <th class="w-150px text-end">LIMIT</th>
                    {{--<th class="w-20px">
                        <a href="/conf/leave/create" class="btn btn-primary btn-sm py-2 px-3"><span class="fa fa-plus"></span></a>
                    </th>--}}
                </tr>
                </thead>
                <tbody class="fs-6 text-gray-600" id="tbody_leave">
                @foreach($list as $d)
                    <tr class="">
                        <td class="text-center w-20px">{{$loop->iteration}}</td>
                        <td class="text-nowrap">{{ $d->type->name }}</td>
                        <td class="text-end">RM {{ $d->amt . ' / ' . $d->type->unit}}</td>
                        {{--<td class="text-center">
                            <a href="/conf/leave/{{ $d->id??0 }}/edit" class="btn btn-primary btn-sm py-2 px-3"><span class="fa fa-pencil m-0 fs-8"></span></a>
                        </td>--}}
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>
@endsection
@section('modal')
    <div class="modal fade" id="modal_leave" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <form @if(session()->has('id')) action="/conf/leave/{{session('id')}}" @else action="/conf/leave" @endif method="post" autocomplete="off" id="form_modal">
                    @if(session()->has('id'))
                        @method('put')
                        <input type="hidden" name="page" value="{{ app('request')->input('page')??'' }}">
                        @php($data = session('data'))
                    @endif
                    @csrf
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Cuti / Faedah Staff</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">

                        @foreach([['name'=>'leave','label'=>'Jenis'],['name'=>'unit','label'=>'Unit']] as $a)
                            <div class="mb-3">
                                <label class="required form-label">{{$a['label']}}</label>
                                <input type="text" class="form-control @error($a['name']) is-invalid @enderror" name="{{$a['name']}}" required value="{{ old($a['name'],$data[$a['name']]??'') }}"/>
                                @error($a['name']) <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>
                        @endforeach
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
        const myModal = new bootstrap.Modal('#modal_leave', {keyboard: false})
        if(err || update) myModal.show()
        if(addnew){
            document.getElementById('form_modal').reset();
            myModal.show()
        }
    </script>
@endpush
