<div class="sheet">
    <style>
        table.sum_level_2 { border-collapse: collapse; width: 100%;page-break-before: auto; page-break-inside: avoid}
        table.sum_level_2 tbody td { white-space: nowrap }
        table.sum_level_2 td,
        table.sum_level_2 th {border: 1px solid black;padding: 0.3rem 0.5rem;}
        table.sum_level_2 .col-cate { min-width: 55px;max-width: 55px;}
        table.sum_level_2 .col-code { min-width: 97px;max-width: 97px;}
        table.sum_level_2 .col-itm { min-width: 270px;max-width: 270px; white-space: pre-wrap}
        table.sum_level_2 .col-amt { text-align: right; min-width: 65px;max-width: 65px;}
        table.sum_level_2 .thead {background-color: dimgrey;color: white;}
        table.sum_level_2 .thead th {text-align: center !important;}
        table.sum_level_2 th, table.sum_level_2 td { font-size: 7pt}
        table.sum_level_2 { margin-top: -1px}
        /*table.sum_level_2 tr:last-child td { border-bottom: 0;}
        table.sum_level_2:last-child tr:last-child td { border-bottom: 1px solid black;}*/
        @media print {
            @page { size: A4 landscape; }
            * { font-size: 5pt }
            table.sum_level_2 .col-cate { width: 25px}
            table.sum_level_2 .col-itm { width: 250px; white-space: pre-wrap}
            table.sum_level_2 .col-code { width: 30px}
            table.sum_level_2 .col-amt { width: 50px}
        }
    </style>
    <h2 class="text-center w-100">BUTIRAN ANGGARAN {{ $title }} BAGI TAHUN {{ YEAR_NOW }}</h2>
    <table class="sum_level_2">
        <tbody>
            <tr class="thead">
                <th class="col-cate">BIL</th>
                {{--<th class="col-code">KOD AKAUN</th>--}}
                <th class="col-itm">PERIHAL</th>
                @foreach(explode(',','BAJET,JAN,FEB,MAC,APR,MEI,JUN,JUL,OGO,SEPT,OKT,NOV,DIS') as $m)
                    <th class="col-amt">{{ $m }}</th>
                @endforeach
            </tr>
        @php([$title='',$rcur=0,$amth=explode(',','actualamt,b1,b2,b3,b4,b5,b6,b7,b8,b9,b10,b11,b12')])
        @foreach($det as $indx=>$b)
            @php($ss = $b->body)
            @continue($ss->bdgtio != $type)
            @if($rcur>0 && $ss->bdgtrpt == 1)
                </tbody></table><br><table class="sum_level_2"><tbody>
                {{--<tr><td class="text-end" colspan="15">&nbsp;</td></tr>--}}
            @endif
            @if($ss->bdgtgrp == 1 && $ss->bdgtrpt == 2)
                </tbody></table><table class="sum_level_2"><tbody>
            @endif
            @if($ss->bdgtrpt == 1) @php($rcur = $ss->id)@endif
            <tr class="@if($ss->bdgtgrp == 1) fw-bold @endif">
                <td class="text-center col-cate">{{ $ss->cate }}</td>
                <td class="col-itm">{{ $ss->bdgtdesc }}</td>
                @foreach($amth as $m)
                    {!! colmth('',$ss->{$m}) !!}
                @endforeach
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
