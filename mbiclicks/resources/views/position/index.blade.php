@extends('layouts.cms')
@section('toolbar')
    <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
        <h1 class="d-flex text-dark fw-bolder m-0 fs-3">Jawatan</h1>
    </div>
    <div class="d-flex align-items-center gap-2 gap-lg-3" id="kt_toolbar_act">
        @foreach(MAN_CATEGORY as $c)
            @continue($loop->index == 0)
            <span>{{$loop->index}} : {{ $c }}</span>
        @endforeach
    </div>
@endsection
@section('container')
    <div class="card card-flush">
        <div class="card-body pt-0">
            <div class="table-responsive">
                <table class="table align-middle table-row-dashed fs-6 gy-5" id="table_position">
                    <thead>
                    <tr class="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                        <th class="">Jenis</th>
                        <th class="">Kategori</th>
                        <th class="text-end w-10px">
                            <a href="/cms/position/create" class="btn btn-sm btn-primary py-2 px-3">
                                <span class="svg-icon svg-icon-2 m-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16"> <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/> </svg>
                                </span>
                            </a>
                        </th>
                    </tr>
                    </thead>
                    <tbody class="text-gray-600 fw-semibold" id="tbody_leave">
                    @foreach($pos as $d)
                        <tr class="">
                            <td class="">{{$d->name}}</td>
                            <td class="">
                                <a href="#" onclick="editCategory({{$d->id}},{{$d->grpcate}})">{{ MAN_CATEGORY[$d->grpcate] }}</a>
                            </td>
                            <td class="text-center">
                                <a href="#" onclick="editName({{$d->id}},'{{$d->name}}')">
                                    <span class="svg-icon svg-icon-2 text-primay">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                                            <path fill="currentColor" fill-rule="evenodd" d="M15.586 3a2 2 0 0 1 2.828 0L21 5.586a2 2 0 0 1 0 2.828L19.414 10 14 4.586 15.586 3zm-3 3-9 9A2 2 0 0 0 3 16.414V19a2 2 0 0 0 2 2h2.586A2 2 0 0 0 9 20.414l9-9L12.586 6z" clip-rule="evenodd"/>
                                        </svg>
                                    </span>
                                </a>
                            </td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
@endsection
@push('javascript')
    <script>
        $('#table_position').DataTable({dom: '<"d-flex justify-content-between mt-5"lf><t><"d-flex justify-content-between mt-5"ip>'});

        function editName(id,n){
            let name = prompt('Masukkan jawatan',n)
            let url='/cms/position/' + id;
            let opt = {
                name:name,
                _token:"{{ csrf_token() }}",
                _method:"PUT",
            }
            if(name.length < 3) return;
            postData(url,opt)
        }
        function editCategory(id,n){
            let idx = prompt('Masukkan Kategori',n)
            let url='/cms/position/' + id;
            let opt = {
                grpcate:idx,
                _token:"{{ csrf_token() }}",
                _method:"PUT",
            }
            if(isNaN(parseInt(idx))) return;
            postData(url,opt)
        }
        function postData(url,opt){
            $.post(url,opt).done(function(res,status){
                if(res.success) window.location.reload()
                console.log(res)
            }).fail(function(err){console.log(err.responseText)})

        }
    </script>
@endpush
