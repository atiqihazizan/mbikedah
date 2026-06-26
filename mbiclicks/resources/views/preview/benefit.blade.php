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
            <tr>
                <td class="text-center" colspan="6">
                    <h4 class="fs-2">PERMOHONAN TUNTUTAN FAEDAH KAKITANGAN</h4>
                </td>
            </tr>
            {{--<tr><th>Jenis Rawatan</th><th class="double-dot">:</th><td>{{collect($body->treatment)->join(', ')}}</td></tr>--}}
            <tr>
                <th>Jenis Rawatan</th>
                <th class="double-dot">:</th>
                <td>
                    @php($treat=[])
                    @foreach(TREATMENT as $t)
                        @continue(!in_array($t['id'],explode(',',$body->treatment)))
                        @php($treat[] = $t['value'])
                    @endforeach
                    <span>{{ implode(', ',$treat)  }}</span>
                </td>
            </tr>
            <tr><th>Rawatan Diambil</th><th class="double-dot">:</th><td>{{$body->item}}</td></tr>
            <tr><th class="line-separator" colspan="6"><hr></th></tr>
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
                <td class="pb-0">Disahkan Oleh</td><td class="double-dot">:</td><td></td>
                <td class="pb-0">Diluluskan Oleh</td><td class="double-dot">:</td><td></td>
            </tr>
            <tr>
                <td class="pt-0" colspan="3">Ketua Jabatan</td>
                <td class="pt-0" colspan="3">Jabatan Sumber Manusia</td>
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
            <tr><th class="line-separator" colspan="6"><hr></th></tr>
            <tr><th colspan="6">UNTUK KEGUNAAN JABATAN SUMBER MANUSIA</th></tr>
            <tr>
                {{--<td>Jumlah Semasa</td><td class="double-dot">:</td><td>RM {{ number_format($data->leaveBal,2) }}</td>--}}
                {{--<td>Jumlah Semasa</td><td class="double-dot">:</td><td>RM {{ number_format($data->leave['total'],2) }}</td>--}}
                <td>Jumlah Semasa</td><td class="double-dot">:</td><td>RM {{ number_format($body->totalamt,2)}}</td>
                <td>Baki Terkini</td><td class="double-dot">:</td><td>RM {{ number_format($data->leaveBal - $body->totalamt,2)  }}</td>
            </tr>
            <tr>
                {{--<td>Jumlah Dituntut</td><td class="double-dot">:</td><td>RM {{ number_format($body->totalamt,2)  }}</td>--}}
{{--                <td>Jumlah Dituntut</td><td class="double-dot">:</td><td>RM {{ number_format($data->leave['taken'],2)  }}</td>--}}
            </tr>
            <tr>
{{--                <td>Jumlah</td><td class="double-dot">:</td><td>RM {{ number_format($body->totalamt + $data->leave['taken'],2) }}</td>--}}
            </tr>
        </table>

    </div>
</div>
