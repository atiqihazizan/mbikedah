<?php
if(!isset($d->children)) $row_bold = '';
?>
@foreach($ds as $d)
    <tr class="{{$tr_bold}}">
        <td class="text-center">{{$d->code}}</td>
        <td>{{$d->name}}</td>
        @foreach($field as $m)
            <td class="col-amt" {{ $m }}>{{ number_format($d->{$m},2) }}</td>
            <?php
                if(!isset($total[$m])) $total[$m] = 0;
                $total[$m] += (float)$d->{$m};
            ?>
        @endforeach
    </tr>
@endforeach
<tr class="fw-bold fw-900">
    <td class="footer" colspan="2">JUMLAH {{ $total_text }}</td>
    @foreach($field as $m)
        <th class="col-amt footer">{{ number_format($total[$m]??0,2) }}</th>
    @endforeach
</tr>
