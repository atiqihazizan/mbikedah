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
            <tr><td class="text-center" colspan="9"><h4 class="fs-3">PERMOHONAN TUNTUTAN PERJALANAN</h4></td></tr>
            <tr>
                <td style="width:120px">No Kakitangan</td><td class="double-dot">:</td><td>{{$master->staff[$data->staff_id]->staffno}}</td>
                <td></td>
                <td style="width: 70px">Tarikh</td><td class="double-dot">:</td><td colspan="2">{{ $data->pdt}}</td>
            </tr>
            <tr>
                <td>Nama</td><td class="double-dot">:</td><td>{{$master->staff[$data->staff_id]->fullname}}</td>
                <td></td>
                <td>Jabatan</td><td class="double-dot">:</td><td colspan="2">{{$master->depart[$data->depart_id]->name}}</td>
            </tr>
            <tr>
                <td>Jawatan</td><td class="double-dot">:</td><td>{{$data->position->name}}</td>
                <td></td>
                <td>Unit</td><td class="double-dot">:</td><td colspan="2">{{$body->staffunit ?? ''}}</td>
            </tr>
            {{--<tr>
                <td>Bulan Tuntutan</td><td class="double-dot">:</td><td>{{ strtoupper($body->mthclaim ?? '')}}</td>
                <td colspan="3"></td>
                <td colspan="3"></td>
            </tr>--}}

            <tr>
                <td colspan="9">
                    <table class="table table-bordered">
                        <thead class="text-center align-middle border border-gray-900">
                        <tr>
                            <th style="width: 100px" rowspan="2">Tarikh</th>
                            <th colspan="2">Waktu</th>
                            <th rowspan="2">Perkara / Tujuan</th>
                            <th style="width: 112px">Jarak Perjalanan</th>
                        </tr>
                        <tr>
                            <th style="width: 90px">Mula</th>
                            <th style="width: 90px">Hingga</th>
                            <th>(Kilometer)</th>
                        </tr>
                        </thead>
                        <tbody class=" align-middle border border-gray-900">
                        @foreach(json_decode($body->taskdetail??'',true)??[] as $task)
                            <tr>
                                <td class="text-center">{{ \Carbon\Carbon::parse($task['tarikh'])->format('d M Y') }}</td>
                                <td class="text-center">{{ \Carbon\Carbon::parse($task['masastart'])->format('h:i A') }}</td>
                                <td class="text-center">{{ \Carbon\Carbon::parse($task['masaend'])->format('h:i A') }}</td>
                                <td class="">{{ $task['perkara'] }}</td>
                                <td class="text-center">{{ number_format($task['jarak']) }}km</td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </td>
            </tr>

            <tr><th>Tuntutan</th></tr>

            <tr>
                <td colspan="9">
                    <table class="table pb-0">
                        <tbody class="align-middle">
                        @foreach($claimtype??[] as $c)
                            <tr>
                                <td class="w-250px">{{ $c->name }}</td><td class="w-5px text-center">:</td>
                                <td class="align-middle">
                                    <div class="d-flex flex-justify-around">
                                        @foreach($claimitem[$c->id]??[] as $ci)
                                            <div class="me-5">
                                                @if($claimdata[$ci->id])
                                                    <i class="fa-solid fa-square-check"></i>
                                                @else
                                                    <i class="fa-regular fa-square"></i>
                                                @endif
                                                <span>{{$ci->name}}</span>
                                            </div>
                                        @endforeach
                                    </div>
                                </td>
                                <td>
                                @foreach($claimitem[$c->id]??[] as $ci)
                                    @continue(!$claimdata[$ci->id] || $ci->stscost == 0)
                                    {{ $claimdata[$ci->id] }}
                                    {{ $c->unit }}
                                @endforeach
                                </td>
                                <td class="w-150px text-end">
                                    @foreach($claimitem[$c->id]??[] as $ci)
                                        @continue(!$claimdata[$ci->id] || $ci->stscost == 1)
                                        RM {{ $claimdata[$ci->id] }}
                                    @endforeach
                                </td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </td>
            </tr>

            <tr>
                <th>Jumlah Tuntutan</th><th>:</th><th>RM {{$body->totalamt??'0.00' }}</th>
            </tr>

            <tr><th colspan="9" class="pt-5">PENGESAHAN DAN KELULUSAN</th></tr>
            <tr>
                <td colspan="9">
                    <table class="table">
                        <tr>
                            <td class="w-100px pb-0">Disahkan Oleh</td><td class="double-dot">:</td><td style="width: 22%"></td>
                            <td class="w-100px pb-0">Disemak Oleh</td><td class="double-dot">:</td><td style="width: 22%"></td>
                            <td class="w-100px pb-0">Diluluskan Oleh</td><td class="double-dot">:</td><td style="width: 22%"></td>
                        </tr>
                        <tr>
                            <td class="pt-0" colspan="3">Ketua Jabatan</td>
                            <td class="pt-0" colspan="3">Jabatan Sumber Manusia</td>
                            <td class="pt-0" colspan="3">Jabatan Sumber Manusia</td>
                        </tr>
                        <tr>
                            <td>Nama</td><td class="double-dot">:</td><td>{{ $veri[1]->name ?? '' }}</td>
                            <td>Nama</td><td class="double-dot">:</td><td>{{ $veri[2]->name ?? '' }}</td>
                            <td>Nama</td><td class="double-dot">:</td><td>{{ $veri[3]->name ?? '' }}</td>
                        </tr>
                        <tr>
                            <td>Tarikh</td><td class="double-dot">:</td><td>{{ $veri[1]->date ?? '' }}</td>
                            <td>Tarikh</td><td class="double-dot">:</td><td>{{ $veri[2]->date ?? '' }}</td>
                            <td>Tarikh</td><td class="double-dot">:</td><td>{{ $veri[3]->date ?? '' }}</td>
                        </tr>
                        <tr>
                            <td>Jawatan</td><td class="double-dot">:</td><td>{{ $veri[1]->jawatan ?? '' }}</td>
                            <td>Jawatan</td><td class="double-dot">:</td><td>{{ $veri[2]->jawatan ?? '' }}</td>
                            <td>Jawatan</td><td class="double-dot">:</td><td>{{ $veri[3]->jawatan ?? '' }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

    </div>
</div>
