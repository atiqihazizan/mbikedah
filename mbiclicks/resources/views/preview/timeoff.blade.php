<div id="printpage" class="paper A4">
    <style>
        .table-timeoff th,
        .table-timeoff td { padding-top: 1px; padding-bottom: 1px;}
        .table-timeoff th { font-weight: bold}
        .table-timeoff .double-dot { width: 1px}
        .table-timeoff .line-separator { padding-top: 5px; padding-bottom: 10px;}
        .table-timeoff .line-separator hr { border-top: 1px solid black;padding: 0;margin: 0;opacity: 1}
        @media print {
            @page { size: portrait; }
            .table-timeoff * { font-size: 6pt }
        }
    </style>
    <div class="sheet" style="">
        @include('preview.tools.letterhead')
        <table class="table w-100 table-timeoff g-1">
            <tr>
                <th colspan="9" class="text-center">
                    <h4 class="fs-2">PERMOHONAN "TIME OFF"</h4>
                </th>
            </tr>
            <tr><th colspan="9"><br></th></tr>
            <tr>
                <th style="width: 100px !important;">No Kakitangan</th><th class="double-dot">:</th><td class="w-200px">{{$master->staff[$data->staff_id]->staffno}}</td>
                <th class="w-100px">Pemohon</th><th class="double-dot">:</th><td class="w-200px">{{$master->staff[$data->staff_id]->fullname}}</td>
                <th class="w-150px">Tarikh</th><th class="double-dot">:</th><td class="w-200px">{{ $data->pdt}}</td>
            </tr>
            <tr>
                <th>Tarikh Dari</th><th class="double-dot">:</th><td>{{ date('d-m-Y',strtotime($body->date)) }}</td>
                <th>Waktu Keluar</th><th class="double-dot">:</th><td>{{ \Carbon\Carbon::parse($body->tout)->format('h:i A')}}</td>
                <th>Waktu Masuk</th><th class="double-dot">:</th><td>{{ \Carbon\Carbon::parse($body->tin)->format('h:i A')}}</td>
            </tr>
            <tr>
                <th>Jumlah Waktu</th><th class="double-dot">:</th><td>{{ $body->num }} jam</td>
                <th>Alasan</th><th class="double-dot">:</th><td colspan="4">{!! $body->reason ?? '&nbsp;' !!}</td>
            </tr>
            <tr><th class="line-separator" colspan="9"><hr></th></tr>
            <tr><th colspan="9">PENYEDIAAN PERMOHONAN</th></tr>
            <tr><th>Disediakan Oleh</th><th class="double-dot">:</th><td colspan="6">{!! $veri[0]->name ?? '&nbsp;' !!}</td></tr>
            <tr><th>Tarikh</th><th class="double-dot">:</th><td colspan="6">{!! $veri[0]->date ?? '&nbsp;' !!}</td></tr>
            <tr><th class="line-separator" colspan="9"><hr></th></tr>
            <tr><th colspan="9">KELULUSAN KETUA JABATAN</th></tr>
            <tr>
                <th>Dilulus Oleh</th><th class="double-dot">:</th><td>{!! $veri[1]->name ?? '&nbsp;' !!}</td>
                <td></td><td></td><td></td><th>Bilangan yang diluluskan</th><th class="double-dot">:</th><td>{{$body->jumconfirm??''}} jam</td>
            </tr>
            <tr><th>Tarikh</th><th class="double-dot">:</th><td colspan="6">{!! $veri[1]->date ?? '&nbsp;' !!}</td></tr>
            <tr><th class="line-separator" colspan="9"><hr></th></tr>
            <tr><th colspan="9">KEGUNAAN JABATAN SUMBER MANUSIA DAN PENTADBIRAN</th></tr>
            <tr>
                <th>Dilulus Oleh</th><th class="double-dot">:</th><td>{!! $veri[2]->name ?? '&nbsp;' !!}</td>
                <td></td><td></td><td></td>
                <th>Waktu Masuk</th><th class="double-dot">:</th><td>{{ $body->tinconfirm ?? ''}}</td>
            </tr>
            <tr>
                <th>Tarikh</th><th class="double-dot">:</th><td>{!! $veri[2]->date ?? '&nbsp;' !!}</td>
                <td></td><td></td><td></td>
                <th>Jumlah Waktu</th><th class="double-dot">:</th><td>{{$body->jumconfirm??''}} jam</td>
            </tr>
            <tr><th class="line-separator" colspan="9"><hr></th></tr>
            <tr><th colspan="9"><br></th></tr>
            <tr><td colspan="9" class="py-0">Nota :-</td></tr>
            <tr>
                <td colspan="9">
                    <ol>
                        <li>Jumlah waktu untuk "Time Off" yang dibenarkan adalah dua Jam sahaja</li>
                        <li>Jumlah waktu "Time Off" yang telah mencukupi 8jam akan ditolak satu hari cuti tahunan</li>
                        <li>Semua kakitangan diwajibkan untuk mengisi borang "Time Off" sekiranya hendak keluar dari pejabat semasa waktu bekerja bagi urusan peribadi serta bagi kakitangan yang datang lewat</li>
                    </ol>
                </td>
            </tr>

        </table>

    </div>
</div>
