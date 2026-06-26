<div class="sheet">
    <style>
        table.table-sumbudgetall  { border-collapse: collapse; width: 100%}
        table.table-sumbudgetall  td,
        table.table-sumbudgetall  th {border: 1px solid black;padding: 0.3rem 0.5rem;}
        table.table-sumbudgetall .col-cate { width: 45px}
        table.table-sumbudgetall .col-code { width: 60px}
        table.table-sumbudgetall  thead {background-color: dimgrey;color: white;}
        table.table-sumbudgetall  tfoot {background-color: grey;color: white;}
        table.table-sumbudgetall  th {text-align: center;}
        @media print {
            @page {  size: A4 portrait; }
            * { font-size: 8pt }
            table.table-sumbudgetall .col-cate { text-align: center; width: 30px}
            table.table-sumbudgetall .col-itm { text-align: left; width: 250px}
        }
    </style>
    <div>
        @php
            $totaldebit = 0;
            $totalcredit = 0;
        @endphp
        <h2 class="text-center w-100">BAJET {{ $yr_selected }}</h2>
        <table class="table-sumbudgetall">
            <thead>
            {!! trHeadObj() !!}
            </thead>
            <tbody id="table_sumbudinc">
            @foreach($data['debit']??[] as $b)
                {!! trObj('',$b->code,$b->name,$b->atotal ) !!}
                @php($totaldebit += (float)$b->atotal)
            @endforeach
            </tbody>
            <tfoot>
            <th colspan="3" style="text-align: center">JUMLAH PENDAPATAN DARI SEMUA PUNCA</th>
            <th style="text-align: right" id="totalysumin">{{ number_format($totaldebit,2) }}</th>
            </tfoot>
        </table>
        <br>
        <table class="table-sumbudgetall">
            <thead>
            {!! trHeadObj() !!}
            </thead>
            <tbody id="table_sumbudexp">
            @foreach($data['credit']??[] as $b)
                {!! trObj('',$b->code,$b->name,$b->atotal ) !!}
                @php($totalcredit += (float)$b->atotal)
            @endforeach
            </tbody>
            <tfoot>
            <th colspan="3" style="text-align: center">JUMLAH KESELURUHAN PERBELANJAAN</th>
            <th style="text-align: right" id="totalysumexp">{{ number_format($totalcredit,2) }}</th>
            </tfoot>
        </table>
    </div>
</div>
