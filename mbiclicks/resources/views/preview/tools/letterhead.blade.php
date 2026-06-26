<style>
    .head-logo {width: 100%;}
    div#tab41 .header { display: none}
    .header td { vertical-align: middle !important; }
    /*.table.header {display:none}*/
    @media print {
        /*@page { size: portrait; }*/
        /*.table.header {display:inline}*/
        .head-logo { width:65%}
        .header h4 { font-size: 9pt; }
        .header span { font-size: 8pt; }
    }
</style>
@if(($data->psts??0) == 4)<h1 class="rejected">DITOLAK</h1>@endif
<table class="table header w-100">
    <tr>
        <td style="width:200px">
            <img src="{{ URL::asset('./img/logo/mbi-head.png')}}" alt="heade-logo" class="head-logo">
        </td>
        <td class="">
            <div class="text-center text-nowrap" style="width:calc( 100% - 200px )">
                <h4 id="fname">{{$sys->agency }}</h4>
                <span class="text-center" id="addr">{!! $sys->address !!}n</span> <br>
                <div>
                    <span>Tel : {{$sys->tel}}</span>
                    <span>Fax : {{$sys->fax}}</span>
                </div>
            </div>
        </td>
    </tr>
</table>
