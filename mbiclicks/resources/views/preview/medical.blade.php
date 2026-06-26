{{--@if($data->complete && $data->relid == 0)
    <form action="{{ route('petition.store') }}" method="post">
        @csrf
        <input type="hidden" name="pdate" value="{{ date('Y-m-d') }}" />
        <input type="hidden" name="ptype_id" value="{{$data->ptype->refid}}" />
        <input type="hidden" name="staff_id" value="{{$data->staff_id}}" />
        <input type="hidden" name="relid" value="{{$data->id}}" />
        <button type="submit" class="btn btn-primary position-absolute end-0 me-5">Tuntutan Bayaran</button>
    </form>
@endif--}}
<div id="printpage" class="paper A4">
    <style>
        .table-benefit th,
        .table-benefit td { padding-top: 1px; padding-bottom: 1px;}
        .table-benefit th { font-weight: bold}
        .table-benefit .double-dot { width: 1px}
        .table-benefit .line-separator { padding-top: 5px; padding-bottom: 10px;}
        .table-benefit .line-separator hr { border-top: 1px solid black;padding: 0;margin: 0;opacity: 1}
        @media print {
            @page { size: portrait; }
            .table-benefit * { font-size: 6pt }
        }
    </style>
    <div class="sheet" style="">
        @include('preview.tools.letterhead')
        <table class="table w-100 table-benefit g-1">
            <tr><td class="text-center" colspan="6"><h4 class="fs-2">PERMOHONAN TUNTUTAN PERUBATAN</h4></td></tr>
            <tr><th colspan="6">PEMOHON</th></tr>
            <tr>
                <td class="w-125px">Pemohon</td><td class="double-dot">:</td><td>{{$master->staff[$data->staff_id]->fullname}}</td>
                <td class="w-100px">Jawatan</td><td class="double-dot">:</td><td>{{$data->position->name}}</td>
            </tr>
            <tr>
                <td>No Kakitangan</td><td class="double-dot">:</td><td>{{$master->staff[$data->staff_id]->staffno}}</td>
                <td>Jabatan</td><td class="double-dot">:</td><td>{{$master->depart[$data->depart_id]->name}}</td>
            </tr>
            <tr>
                <td>Dituntut Oleh</td><td class="double-dot">:</td><td>{{ $body->claimant}}</td>
                <td>Hubungan</td><td class="double-dot">:</td><td>{{ $body->relation}}</td>
            </tr>
            <tr>
                <td>Tarikh</td><td class="double-dot">:</td><td>{{ $data->pdt}}</td>
                <td>Jumlah</td><td class="double-dot">:</td><td>{{ number_format($body->totalamt,2)}}</td>
            </tr>
            <tr><th class="line-separator" colspan="6"><hr></th></tr>
            <tr><th colspan="6">PENGESAHAN DAN KELULUSAN</th></tr>
            <tr>
                <td class="pb-0">Disahkan Oleh</td><td class="double-dot">:</td><th class="fw-bold">Ketua Jabatan</th>
                <td class="pb-0">Diluluskan Oleh</td><td class="double-dot">:</td><th class="fw-bold">Jabatan Sumber Manusia</th>
            </tr>
            <tr>
                <td>Nama</td><td class="double-dot">:</td><td>{{ $veri[1]->name ?? '' }}</td>
                <td>Nama</td><td class="double-dot">:</td><td>{{ $veri[2]->name ?? '' }}</td>
            </tr>
            <tr>
                <td>Tarikh</td><td class="double-dot">:</td><td>{{ $veri[1]->date ?? '' }}</td>
                <td>Tarikh</td><td class="double-dot">:</td><td>{{ $veri[2]->date ?? '' }}</td>
            </tr>
            <tr>
                <td>Jawatan</td><td class="double-dot">:</td><td>{{ $veri[1]->jawatan ?? '' }}</td>
                <td>Jawatan</td><td class="double-dot">:</td><td>{{ $veri[2]->jawatan ?? '' }}</td>
            </tr>
            @if($data->psts == 3)
            <tr><th class="line-separator" colspan="6"><hr></th></tr>
            <tr><th colspan="6">UNTUK KEGUNAAN JABATAN SUMBER MANUSIA</th></tr>

            <tr>
                <td>Jumlah Semasa</td><td class="double-dot">:</td><td>RM {{ number_format($body->jumlah_semasa,2) }}</td>
                <td>Baki Terkini</td><td class="double-dot">:</td><td>RM {{ number_format($body->baki_terkini,2)  }}</td>
            </tr>
            <tr>
                <td>Jumlah Dituntut</td><td class="double-dot">:</td><td>RM {{ number_format($body->jumlah_telah_tuntut,2)  }}</td>
            </tr>
            <tr>
                <td>Jumlah</td><td class="double-dot">:</td><td>RM {{ number_format($data->taken,2) }}</td>
            </tr>
            @endif
        </table>

    </div>
</div>
