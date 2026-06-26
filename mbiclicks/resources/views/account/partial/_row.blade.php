<?php
    if(!isset($d->children)) $row_bold = '';
?>
<tr class="{{ $row_bold }}">
    <td class="text-center">{{$d->code}}</td>
    <td style="padding-left: {{$level}}rem; ">{{$d->name}}</td>
    @foreach($field as $m)
        <td class="col-amt">{{ number_format($d->{$m},2) }}</td>
    @endforeach
</tr>
@php($level += 0.7)
@foreach($d->children??[] as $d)
    @include('account.partial._row')
@endforeach
