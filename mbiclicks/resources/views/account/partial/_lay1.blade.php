<div class="sheet">
    <style>
        table.sum_level_1 { border-collapse: collapse; width: 100%; page-break-before: auto; page-break-inside: avoid}
        table.sum_level_1 tbody td { white-space: nowrap }
        table.sum_level_1 td,
        table.sum_level_1 th {border: 1px solid black;padding: 0.3rem 0.5rem; vertical-align: middle !important;}
        table.sum_level_1 .col-cate { min-width: 55px;max-width: 55px;}
        /*table.sum_level_1 .col-code { min-width: 97px;max-width: 97px}*/
        /*table.sum_level_1 .col-itm { min-width: 270px;max-width: 270px}*/
        table.sum_level_1 .col-itm {white-space: pre-wrap}
        table.sum_level_1 .col-code { width: 80px;max-width: 80px;}
        table.sum_level_1 .col-amt { text-align:right; width: 80px;max-width: 80px}
        table.sum_level_1 .thead {background-color: dimgrey;color: white;}
        table.sum_level_1 .footer {background-color: grey;color: white;}
        table.sum_level_1 .thead th {text-align: center !important;}
        table.sum_level_1 th, table.sum_level_1 td { font-size: 7pt}
        @media print {
            @page { size: A4 landscape; }
            * { font-size: 6pt }
            table.sum_level_1 .col-cate { width: 25px}
            table.sum_level_1 .col-code { width: 74px}
            table.sum_level_1 .col-amt { width: 88px}
        }
    </style>

    <table class="sum_level_1">
        <caption style="caption-side:top">
            <h2 class="text-center mb-3">RINGKASAN ANGGARAN {{ $title }} BAGI TAHUN {{ $yr_selected }}</h2>
        </caption>
        <thead>
        <tr class="thead">
            <th class="col-code">KOD AKAUN</th>
            <th class="col-itm">PERIHAL</th>
            @foreach(explode(',','BAJET,JAN,FEB,MAC,APR,MEI,JUN,JUL,OGO,SEPT,OKT,NOV,DIS') as $m)
                <th class="col-amt">{{ $m }}</th>
            @endforeach
        </tr>
        </thead>
        <tbody>
            <?php $field = explode(',','atotal,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12'); $total=[]; ?>

            @php([$tr_bold = 'fw-bold fw-900',$ds=$data??[],$total_text='KESELURUHAN'])
            @include('account.partial._row1')

            @foreach($data as $d)
                <tr>
                    <td colspan="{{count($field) + 2}}">&nbsp;</td>
                </tr>
                <tr class="fw-bold fw-900">
                    <td class="text-center">{{$d->code}}</td>
                    <td>{{$name = $d->name}}</td>
                    <td colspan="{{count($field)}}">&nbsp;</td>
                </tr>

                @php([$tr_bold = '',$ds=$d->children??[],$total_text = $name])
                @include('account.partial._row1')
            @endforeach
        </tbody>
    </table>
</div>
