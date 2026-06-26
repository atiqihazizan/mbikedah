<div id="printpage" class="paper A4">
    <style>
        .table-payment td,
        .table-payment th {border: 1px solid;padding: 0.3rem 0.5rem;}
        .table-payment th {text-align: center;}
        .table-payment .colgroup-0 {width : 5%;}
        .table-payment .colgroup {width : 3%;}
        #form-payment .rejected {color:#f1416c; position: absolute;font-size: 10rem;top: 47%;left: 26%;transform: rotate(-41deg);}

        div#tab41 .header { display: none}
        @media print {
            .table-payment * { font-size: 7pt }
            .table-payment .th-title { font-size: 7pt }
            .table-payment .th-block { font-size: 8pt }
            .table-payment .th-detail { font-size: 6pt }
        }
    </style>
    <div class="sheet" id="form-payment" style="position: relative">
        @include('preview.tools.letterhead')
        <table class="table-payment mt-1">
            <col style="width: 22cm">
            <col style="width: 61cm">
            <col style="width: 102cm">
            <col style="width: 47cm">
            <col style="width: 49cm">
            <col style="width: 96cm">
            <col style="width: 81cm">
            <col style="width: 61cm">
            <col style="width: 55cm">
            <col style="width: 91cm">
            {{--<col style="width: 10cm">
            <col style="width: 31cm">
            <col style="width: 49cm">--}}
            <tbody>
                <tr><th class="text-center th-block fw-bold" colspan="10">PERMOHONAN PEMBAYARAN</th></tr>
                <tr><td class="text-center th-block fw-bold bg-opacity-25 bg-dark" colspan="10">BAHAGIAN A: MAKLUMAT PERMOHONAN</td></tr>
                <tr><td class="fw-bold th-title" colspan="4">TARIKH PERMOHONAN</td><td class="text-center">{{ $pdata->pdt }}</td><td class="text-center fw-bold">NO. SIRI</td><td class="" colspan="4">{{ $body->siri }}</td></tr>
                <tr><td class="fw-bold th-title" colspan="4">PERMOHONAN OLEH</td><td colspan="6">{{ $staff->fullname }}</td></tr>
                <tr><td class="fw-bold th-title" colspan="4">JABATAN</td><td colspan="6">{{ $depart->name }}</td></tr>
                <tr><td class="fw-bold th-title" colspan="4">NO. PROJEK</td><td colspan="6">{{ $body->pno }}</td></tr>
                <tr><td class="fw-bold th-title" colspan="4">NAMA PEMBEKAL/KONTRAKTOR/PENERIMA</td><td colspan="6">{{ $body->recepient }}</td></tr>

                <tr><th class="text-center th-block fw-bold bg-opacity-25 bg-dark" colspan="10">BAHAGIAN B: MAKLUMAT KEPERLUAN</th></tr>
                <tr>
                    <td class="text-center th-detail fw-bold">BIL</td>
                    <td class="text-center th-detail fw-bold">KOD BAJET</td>
                    <td class="text-center th-detail fw-bold" colspan="4">BUTIR BEKALAN/PERKHIDMATAN</td>
                    <td class="text-center th-detail fw-bold">NO. RUJUKAN/INBOIS</td>
                    <td class="text-center th-detail fw-bold">BIL/UNIT</td>
                    <td class="text-center th-detail fw-bold">KOS/UNIT</td>
                    <td class="text-center th-detail fw-bold">JUMLAH</td>
                </tr>
                @php($kodkredit=[])
                @foreach($list??[] as $rw)
                <?php if(!in_array($rw->verified->code,$kodkredit)) $kodkredit[] = $rw->verified->code; ?>
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td class="text-center">{{ $rw->budget->code }}</td>
                    <td colspan="4">{{ $rw->item }}</td>
                    <td >{{ $rw->refe ?? '' }}</td>
                    <td class="text-center">{{ $rw->unit }}</td>
                    <td class="text-end">{{ number_format($rw->amnt,2) }}</td>
                    <td class="text-end">{{ number_format($rw->total,2) }}</td>
                </tr>
                @endforeach
                <tr><td class="text-center fw-bold" colspan="10">TUJUAN/KETERANGAN BAYARAN</td></tr>
                <tr><td class="" colspan="10">{{ $body->perkara }}</td></tr>
                <tr><td class="" colspan="10">&nbsp;</td></tr>
                <tr><td class="text-center fw-bold" colspan="5">DISEDIAKAN OLEH</td><td class="text-center fw-bold">TARIKH</td><td class="text-center fw-bold" colspan="3">DISAHKAN OLEH KETUA JABATAN</td><td class="text-center fw-bold">TARIKH</td></tr>
                <tr><td class="text-center" colspan="5">{{ $verify[0]->name }}</td><td class="text-center">{{ $verify[0]->date }}</td><td class="text-center" colspan="3">{{ $verify[1]->name }}</td><td class="text-center">{{ $verify[1]->date }}</td></tr>

                <!-- azilah -->
                <tr><th class="text-center th-block fw-bold bg-opacity-25 bg-dark" colspan="10">BAHAGIAN C: SEMAKAN OLEH JABATAN KEWANGAN</th></tr>
                <tr>
                    <td class="text-center fw-bold" colspan="5">DISEMAK OLEH PEGAWAI KEWANGAN</td><td class="text-center fw-bold">TARIKH</td>
                    <td class="text-center fw-bold" colspan="3">KOD AKAUN : DEBIT</td><td class="text-center" colspan="1">{{ implode(', ',$kodkredit) }}</td>
                </tr>
                <tr>
                    <td class="text-center" colspan="5">{{ $verify[2]->name }}</td><td class="text-center">{{ $verify[2]->date }}</td>
                    <td class="text-center fw-bold" colspan="3">KOD AKAUN : KREDIT</td><td class="text-center" colspan="1">{{ $body->verified->kodkredit??'' }}</td>
                </tr>
                <tr>
                    <td class="text-center fw-bold" colspan="6">ULASAN</td>
                    <td class="text-center fw-bold" colspan="3">NAMA BANK</td><td class="text-center fw-bold" colspan="1">BAKI BANK</td>
                </tr>
                <tr>
                    <td class="text-center" colspan="6" rowspan="2" >{{ $verify[2]->remark??'' }}</td>
                    <td class="text-center" colspan="3">
                        <div class="d-flex flex-column">
                            @foreach($body->credits??[] as $c)
                                <span class="text-start">{{ $c->text }}</span>
                            @endforeach
                        </div>
                    </td>
                    <td class="text-end" colspan="1">
                        <div class="d-flex flex-column">
                            @foreach($body->credits??[] as $c)
                                <span>{{ number_format($c->total,2) }}</span>
                            @endforeach
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="text-center fw-bold" colspan="3">JUMLAH INI</td><td class="text-end" colspan="1">{{ number_format($body->creditverified,2) }}</td>
                </tr>
                <!-- azilah -->

                <!-- husna -->
                <tr><th class="text-center th-block fw-bold bg-opacity-25 bg-dark" colspan="10">BAHAGIAN D: PENGESAHAN JABATAN KEWANGAN</th></tr>
                <tr><td class="text-center fw-bold" colspan="5">DISAHKAN OLEH JABATAN KEWANGAN</td><td class="text-center fw-bold">TARIKH</td><td class="text-center fw-bold" colspan="4">ULASAN</td></tr>
                <tr><td class="text-center" colspan="5">{{ $verify[3]->name??'' }}&nbsp;</td><td class="text-center">{{ $verify[3]->date??'' }}</td><td class="text-center" colspan="4">{{ $verify[3]->remark??'' }}</td></tr>
                <!-- husna -->
        
                <tr><th class="text-center th-block fw-bold bg-opacity-25 bg-dark" colspan="10">BAHAGIAN E: KELULUSAN KETUA JABATAN KEWANGAN</th></tr>
                <tr><td class="text-center fw-bold" colspan="5">DILULUSKAN OLEH KETUA JABATAN KEWANGAN</td><td class="text-center fw-bold">TARIKH</td><td class="text-center fw-bold" colspan="4">TANDATANGAN</td></tr>
                <tr><td class="text-center" colspan="5" >&nbsp;</td><td class="text-center">&nbsp;</td><td class="text-center" colspan="4" rowspan="3">&nbsp;</td></tr>

                <tr><td class="text-center fw-bold" colspan="6" >ULASAN</td></tr>
                <tr><td class="text-center" colspan="6" >&nbsp;</td></tr>


                <tr><th class="text-center th-block fw-bold bg-opacity-25 bg-dark" colspan="10">BAHAGIAN F: KELULUSAN KETUA PEGAWAI EKSEKUTIF</th></tr>
                <tr><td class="text-center fw-bold" colspan="5">DILULUSKAN OLEH KETUA PEGAWAI EKSEKUTIF</td><td class="text-center fw-bold">TARIKH</td><td class="text-center fw-bold" colspan="4">TANDATANGAN</td></tr>
                <tr><td class="text-center" colspan="5" >&nbsp;</td><td class="text-center">&nbsp;</td><td class="text-center" colspan="4" rowspan="3">&nbsp;</td></tr>

                <tr><td class="text-center fw-bold" colspan="6" >ULASAN</td></tr>
                <tr><td class="text-center" colspan="6" >&nbsp;</td></tr>
            </tbody>
        </table>
    </div>
</div>