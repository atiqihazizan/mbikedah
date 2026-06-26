<div class="sheet">
    <style>
        table.sum_level_2 { border-collapse: collapse; width: 100%;page-break-before: auto; page-break-inside: avoid}
        table.sum_level_2 tbody td { white-space: nowrap }
        table.sum_level_2 td,
        table.sum_level_2 th {border: 1px solid black;padding: 0.3rem 0.5rem; vertical-align: middle !important;}
        table.sum_level_2 .col-cate { min-width: 55px;max-width: 55px;}
        table.sum_level_2 .col-code { width: 84px;max-width: 84px;}
        table.sum_level_2 .col-itm { white-space: pre-wrap}
        table.sum_level_2 .col-amt { text-align: right; width: 80px;max-width: 80px;}
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
    <table class="sum_level_2">
        <caption style="caption-side:top">
            <h2 class="text-center mb-3">BUTIRAN ANGGARAN {{ $title }} BAGI TAHUN {{ $yr_selected }}</h2>
        </caption>
        <thead>
        <tr class="thead">
{{--            <th class="col-cate">BIL</th>--}}
            <th class="col-code">KOD AKAUN</th>
            <th class="col-itm">PERIHAL</th>
            @foreach(explode(',','BAJET,JAN,FEB,MAC,APR,MEI,JUN,JUL,OGO,SEPT,OKT,NOV,DIS') as $m)
                <th class="col-amt">{{ $m }}</th>
            @endforeach
        </tr>
        </thead>
        <tbody>
        <?php
        $field = explode(',','atotal,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12');
        $level = 0.5;
        ?>

        @foreach($data as $d)
            @if($loop->index > 0)
            <tr>
                <td colspan="{{ count($field) + 2 }}">&nbsp;</td>
            </tr>
            @endif
            @php($row_bold = 'fw-bold fw-900')
            @include('account.partial._row')
        @endforeach
        </tbody>
    </table>
</div>
