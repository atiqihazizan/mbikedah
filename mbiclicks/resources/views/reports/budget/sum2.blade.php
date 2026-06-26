<div class="sheet">
    <style>
        table.sum_level_1 { border-collapse: collapse; width: 100%; page-break-before: auto; page-break-inside: avoid}
        table.sum_level_1 td,
        table.sum_level_1 th {border: 1px solid black;padding: 0.3rem 0.5rem; vertical-align: middle !important;}
        table.sum_level_1 .col-cate { min-width: 50px;max-width: 50px}
        table.sum_level_1 .col-code { min-width: 97px;max-width: 97px}
        table.sum_level_1 .col-itm { min-width: 350px;max-width: 350px}
        table.sum_level_1 .col-amt { text-align:right; min-width: 76px;max-width: 76px}
        table.sum_level_1 .thead {background-color: dimgrey;color: white;}
        table.sum_level_1 .footer {background-color: grey;color: white;}
        table.sum_level_1 .thead th {text-align: center !important;}
        table.sum_level_1 th, table.sum_level_1 td { font-size: 7pt}
        table.sum_level_1 tbody td { white-space: nowrap }
        @media print {
            @page { size: A4 landscape; }
            * { font-size: 6pt }
            table.sum_level_1 .col-cate { width: 25px}
            table.sum_level_1 .col-code { width: 30px}
            table.sum_level_1 .col-amt { width: 76px}
        }
    </style>
    <h2 class="text-center w-100">RINGKASAN ANGGARAN {{ $title }} BAGI TAHUN {{ YEAR_NOW }}</h2>
    <table class="sum_level_1">
        <tbody>
            <tr class="thead">
                <th class="col-cate">BIL</th>
                <th class="col-itm">PERIHAL</th>
                @foreach(explode(',','BAJET,JAN,FEB,MAC,APR,MEI,JUN,JUL,OGO,SEPT,OKT,NOV,DIS') as $m)
                <th class="col-amt">{{ $m }}</th>
                @endforeach
            </tr>
            @php([$title='',$rcur=0,$total=[],$amth=explode(',','actualamt,b1,b2,b3,b4,b5,b6,b7,b8,b9,b10,b11,b12')])
            @forelse($sub as $indx=>$b)
                @php($ss = $b->body)
                @continue($ss->bdgtio != $type)
                @if($rcur>0 && $ss->bdgtrpt == 1)
                    {!! rowFooter($total[$rcur]['title']??'',$amth,$total[$rcur]??[]) !!}
                    </tbody></table><br><table class="sum_level_1"><tbody>
                    {{--<tr><td class="text-end" colspan="15">&nbsp;</td></tr>--}}
                @endif
                <tr class="@if($ss->bdgtrpt == 1) fw-bold @endif">
                    <td class="text-center col-cate">{{ $ss->cate }}</td>
                    <td class="col-itm">{{ $ss->bdgtdesc }}</td>
                    @if($ss->bdgtrpt == 1)
                        @php([$total[$ss->id]=[],$total[$ss->id]['title']=$ss->bdgtdesc,$rcur=$ss->id])
                        @foreach($amth as $m)@php($total[$ss->id][$m]=(float)$ss->{$m})@endforeach
                        <td class="text-end" colspan="13"></td>
                    @else
                        @foreach($amth as $m)
                            @php($total[$ss->idparent][$m]= $total[$ss->idparent][$m]??0 + (float)$ss->{$m})
                            {!! colmth('',$ss->{$m}) !!}
                        @endforeach
                    @endif
                </tr>
            @empty
            @endforelse
            {!! rowFooter($total[$rcur]['title']??'',$amth,$total[$rcur]??[]) !!}
        </tbody>
    </table>
</div>
