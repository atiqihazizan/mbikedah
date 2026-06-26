<div id="printpage" class="paper A4">
    <div class="sheet" style="">
        <style>
            .table-leave th,
            .table-leave td { padding-top: 1px; padding-bottom: 1px;}
            .table-leave th { font-weight: bold}
            .table-leave .double-dot { width: 1px}
            .table-leave .line-separator { padding-top: 5px; padding-bottom: 10px;}
            .table-leave .line-separator hr { border-top: 1px solid black;padding: 0;margin: 0;opacity: 1}
            @media print {
                @page { size: portrait; }
                .table-leave * { font-size: 6pt }
            }
        </style>
        @include('preview.tools.letterhead')
        <table class="table w-100 table-leave g-1">
            <tr><td class="text-center" colspan="9"><h4 class="fs-2">PERMOHONAN CUTI</h4><br></td></tr>
            <tr>
                <th class="w-100px">No Kakitangan</th><th class="double-dot">:</th><td class="w-250px">{{$master->staff[$data->staff_id]->staffno}}</td>
                <th class="w-100px">Pemohon</th><th class="double-dot">:</th><td class="w-250px">{{$master->staff[$data->staff_id]->fullname}}</td>
                <th class="w-100px">Tarikh</th><th class="double-dot">:</th><td class="w-100px">{{ $data->pdt}}</td>
            </tr>
            <tr><th>Jenis Cuti</th><th class="double-dot">:</th><td colspan="4">{{ $master->lvtype[$data->typlv]->leave }}</td></tr>
            <tr>
                <th>Tarikh Dari</th><th class="double-dot">:</th><td>{{ $body->dtout}}</td>
                <th>Tarikh Hingga</th><th class="double-dot">:</th><td>{{ $body->dtback}}</td>
                <th>Bilangan Hari</th><th class="double-dot">:</th><td>{{ $body->num }} hari</td>
            </tr>
            <tr><th>Alasan</th><th class="double-dot">:</th><td colspan="4">{!! $body->reason ?? '&nbsp;' !!}</td></tr>
            <tr><th class="line-separator" colspan="9"><hr></th></tr>
            <tr><th colspan="9">PENYEDIAAN PERMOHONAN</th></tr>
            <tr><th>Disediakan Oleh</th><th class="double-dot">:</th><td colspan="6">{!! $veri[0]->name ?? '&nbsp;' !!}</td></tr>
            <tr><th>Tarikh</th><th class="double-dot">:</th><td colspan="6">{!! $veri[0]->date ?? '&nbsp;' !!}</td></tr>
            <tr><th class="line-separator" colspan="9"><hr></th></tr>
            <tr>
                <th colspan="5">KELULUSAN KETUA JABATAN</th>
                <th colspan="2" class="text-end"><span class="me-3">Bilangan hari yang diluluskan</span></th><th class="double-dot">:</th><td>{{$body->jumconfirm ?? ''}} hari</td>
            </tr>
            <tr><th>Dilulus Oleh</th><th class="double-dot">:</th><td colspan="6">{!! $veri[1]->name ?? '&nbsp;' !!}</td></tr>
            <tr><th>Tarikh</th><th class="double-dot">:</th><td colspan="6">{!! $veri[1]->date ?? '&nbsp;' !!}</td></tr>
            <tr><th class="line-separator" colspan="9"><hr></th></tr>
            <tr><th colspan="9">KEGUNAAN JABATAN SUMBER MANUSIA DAN PENTADBIRAN</th></tr>
            <tr><th>Dilulus Oleh</th><th class="double-dot">:</th><td colspan="6">{!! $veri[2]->name ?? '&nbsp;' !!}</td></tr>
            <tr>
                <th>Tarikh</th><th class="double-dot">:</th><td>{!! $veri[2]->date ?? '&nbsp;' !!}</td>
                <td colspan="6">
                    @foreach($lvs as $l)
                        @if($loop->index > 0)
                            <span class="mx-3">/</span>
                        @endif
                        <div class="text-center fw-bold d-inline-flex">{{$l['leave'] }} <span class="fw-normal w-30px mx-2 border-bottom">{{$l['total'] - $l['taken']}}</span> {{ $l['unit']}}</div>
                    @endforeach
                </td>
            </tr>
        </table>

    </div>
</div>
