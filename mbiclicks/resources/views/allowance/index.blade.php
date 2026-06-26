@extends('layouts.main')
@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Jenis Elaun</h1>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
    </div>
@endsection
@section('body')
    <div class="card">
        <div class="table-responsive">
            <table class="table table-sm table-row-dashed table-row-gray-300 gs-4 table-hover align-middle gap-2" id="table_pos_leave">
                <thead class="border-gray-200 fs-6 fw-bold bg-lighten">
                <tr class="fw-bold fs-6 text-gray-800 text-uppercase">
                    <th class="text-center w-50px">#</th>
                    <th class="w-auto" colspan="2">Jenis</th>
                    <th class="w-100px">Unit</th>
                    <th class="w-90px">
                        <a href="/conf/allowance/create" class="btn btn-primary btn-sm py-2 px-3 w-100"><span class="fa fa-plus m-0 fs-5"></span></a>
                    </th>
                </tr>
                </thead>
                <tbody class="fs-6 text-gray-600" id="tbody_leave">
                @foreach($list as $d)
                    <tr class="fw-bold">
                        <td class="text-center w-20px">{{$loop->iteration}}</td>
                        <td class="text-nowrap" colspan="2">{{ $d->name }}</td>
                        <td class="text-nowrap">{{ $d->unit }}</td>
                        <td class="text-center">
                            <a href="/conf/allowance/{{ $d->id??0 }}/add" class="btn btn-primary btn-icon w-25px h-25px">
                                <span class="fa fa-plus"></span>
                            </a>
                            @if(isset($d->child))
                                <a href="/conf/allowance/{{ $d->id??0 }}/edit" class="btn btn-secondary btn-icon w-25px h-25px">
                                    <span class="fa fa-pencil"></span>
                                </a>
                            @endif

                        </td>
                    </tr>
                    @continue(!isset($d->child))
                    @foreach($d->child as $c)
                        <tr class="">
                            <td></td>
                            <td class="text-center w-20px">-</td>
                            <td class="text-nowrap">{{ $c->name }}</td>
                            <td class="text-nowrap">{{ $c->unit }}</td>
                            <td class="text-center">
                                <a href="/conf/allowance/{{ $c->id??0 }}/edit" class="btn btn-secondary btn-icon w-25px h-25px">
                                    <span class="fa fa-pencil"></span>
                                </a>
                                <form action="/conf/allowance/{{ $c->id??0 }}" method="POST" class="d-inline">
                                    <?php echo method_field('delete'); ?>
                                    <?php echo csrf_field(); ?>
                                    <button class="btn btn-danger btn-icon w-25px h-25px" onclick="return confirm('Anda pasti?')"><span class="fa fa-times"></span></button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
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
                @php($action = '/conf/allowance')
                @if(session()->has('id'))
                    @php($action = '/conf/allowance/'.session('id'))
                @endif
                <form action="{{ $action }}" method="post" autocomplete="off" id="form_modal">
                    @if(session()->has('id'))
                        @method('put')
                        <input type="hidden" name="page" value="{{ app('request')->input('page')??'' }}">
                        @php($data = session('data'))
                    @endif
                    @if(session()->has('addnew'))
                        <input type="hidden" name="parent" value="{{ session()->get('addnew') }}"/>
                    @endif
                    @csrf
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Elaun Staff</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">

                        @foreach([['name'=>'name','label'=>'Jenis'],['name'=>'unit','label'=>'Unit']] as $a)
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
        let create = '{{ session()->get('create') }}'
        let addnew = '{{ session()->get('addnew') }}'
        let update = '{{ session('id') }}'
        const myModal = new bootstrap.Modal('#modal_leave', {keyboard: false})
        if(err || update) myModal.show()
        if(create || addnew){
            document.getElementById('form_modal').reset();
            myModal.show()
        }
    </script>
@endpush
