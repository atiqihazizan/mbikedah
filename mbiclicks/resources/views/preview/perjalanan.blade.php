{{--@if($data->complete && $data->relid == 0)
    <form action="{{ route('petition.store') }}" method="post">
        @csrf
        <input type="hidden" name="pdate" value="{{ date('Y-m-d') }}" />
        <input type="hidden" name="ptype_id" value="{{$data->ptype->refid}}" />
        <input type="hidden" name="staff_id" value="{{$data->staff_id}}" />
        <input type="hidden" name="relid" value="{{$data->id}}" />
        <button type="submit" class="btn btn-primary position-absolute end-0 me-5">Tuntutan Perjalanan</button>
    </form>
@endif--}}
<div id="printpage" class="paper A4">
    <style>
        .table-trip th,
        .table-trip td { padding-top: 1px; padding-bottom: 1px;}
        .table-trip th { font-weight: bold}
        .table-trip .double-dot { width: 1px; padding: 0}
        .table-trip .line-separator { padding-top: 5px; padding-bottom: 10px;}
        .table-trip .line-separator hr { border-top: 1px solid black;padding: 0;margin: 0;opacity: 1}
        @media print {
            @page { size: portrait; }
            .table-timeoff * { font-size: 6pt }
        }
    </style>
    <div class="sheet">
        @include('preview.tools.letterhead')
        <table class="table w-100 table-trip g-1">
            <tr><td class="text-center" colspan="9"><h4 class="fs-2">PERMOHONAN PERJALANAN</h4></td></tr>
            <tr>
                <th style="">No Kakitangan</th><th class="double-dot">:</th><td>{{$master->staff[$data->staff_id]->staffno}}</td>
                <th colspan="3"></th>
                <th style="">Tarikh</th><th class="double-dot">:</th><td>{{ $data->pdt}}</td>
            </tr>
            <tr>
                <th>Nama</th><th class="double-dot">:</th><td>{{ Str::title($master->staff[$data->staff_id]->fullname) }}</td>
                <th colspan="3"></th>
                <th>Jabatan</th><th class="double-dot">:</th><td>{{ Str::title($master->depart[$data->depart_id]->name) }}</td>
            </tr>
            <tr>
                <th>Jawatan</th><th class="double-dot">:</th><td>{{ Str::title($data->position->name) }}</td>
                <th colspan="3"></th>
                <th>Unit</th><th class="double-dot">:</th><td>&nbsp;</td>
            </tr>
            <tr>
                <th>Urusan</th><th class="double-dot">:</th><td>{{$body->urusan}}</td>
                <td colspan="6">{{ $body->keteranganlain??'' }}</td>
            </tr>
            <tr><th colspan="9">&nbsp;</th></tr>
            <tr>
                <th>Tarikh Bertolak</th><th class="double-dot">:</th><td>{{ \Carbon\Carbon::parse($body->dtout)->format('d M Y')}}</td>
                <th>Tarikh Kembali</th><th class="double-dot">:</th><td>{{ \Carbon\Carbon::parse($body->dtback)->format('d M Y')}}</td>
                <th>Bil. hari</th><th class="double-dot">:</th><td>{{$body->num}} hari</td>
            </tr>
            <tr><th colspan="9">&nbsp;</th></tr>
            <tr><th>Lokasi</th><th class="double-dot">:</th><td colspan="7">{!! $body->location ?? '&nbsp;' !!}</td></tr>
            <tr><th>Alamat dan Tempat</br>Urusan</th><th class="double-dot">:</th><td colspan="7">{!! $body->addr ?? '&nbsp;' !!}</td></tr>
            <tr><th colspan="9">&nbsp;</th></tr>
            <tr><th>Keperluan</th></tr>
            @foreach($needs as $n)
                <tr>
                    <th>{{ $n->cate }}</th><th class="double-dot">:</th><td>{{ $n->item }}</td>
                    @continue(empty($n->desc))
                    <td></td><td></td><td class="">{{ $n->desc }}</td>
                    <td colspan="3"></td>
                </tr>
            @endforeach
            <tr><th colspan="9">&nbsp;</th></tr>
            <tr><th>Disediakan Oleh</th><th class="double-dot">:</th><td colspan="7">{!! Str::title($veri[0]->name ?? '&nbsp;') !!}</td></tr>
            <tr><th>Tarikh</th><th class="double-dot">:</th><td colspan="7">{!! $veri[0]->date ?? '&nbsp;' !!}</td></tr>

            <tr><th colspan="9" style="border-bottom: 1px solid black !important;"></th></tr>

            <tr><td colspan="9"><h3 class="py-4">Pengesahan dan Kelulusan</h3></td></tr>

            <tr>
                <th colspan="3" style="width:33.33%">Disahkan Oleh Ketua Jabatan</th>
                <th colspan="3" style="width:33.33%">Disemak Oleh Jabatan Sumber Manusia</th>
                <th colspan="3" style="width:33.33%">Dilulus Oleh Jabatan Sumber Manusia</th>
            </tr>
            <tr>
                <th>Nama</th><th class="double-dot">:</th><td style="width: 200px">{!! Str::title($veri[1]->name ?? '') !!}</td>
                <th>Nama</th><th class="double-dot">:</th><td style="width: 200px">{!! Str::title($veri[2]->name ?? '') !!}</td>
                <th>Nama</th><th class="double-dot">:</th><td style="width: 200px">{!! Str::title($veri[3]->name ?? '') !!}</td>
            </tr>
            <tr>
                <th>Tarikh</th><th class="double-dot">:</th><td>{!! $veri[1]->date ?? '&nbsp;' !!}</td>
                <th>Tarikh</th><th class="double-dot">:</th><td>{!! $veri[2]->date ?? '&nbsp;' !!}</td>
                <th>Tarikh</th><th class="double-dot">:</th><td>{!! $veri[3]->date ?? '&nbsp;' !!}</td>
            </tr>
        </table>

    </div>
</div>
