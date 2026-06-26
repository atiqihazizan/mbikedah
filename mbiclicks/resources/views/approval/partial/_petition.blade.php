<div class="card shadow-sm pt-4 mb-6 mb-xl-9">
<div class="card-header border-0"><div class="card-title"><h2>{{ $ptyp->name }}</h2></div></div>
<div class="card-body pt-0 pb-5">
<div class="table-responsive">
<table class="table align-middle table-row-dashed gy-2" id="kt_table_petition"><tbody class="fs-6 fw-semibold text-gray-600">
@foreach($pett as $b)
<tr><td  class="w-250px">{{ $b->label }}</td><td><span class="reset">{{ trim($b->value??'') }}</span></td><td class="text-end"></td></tr>
@endforeach
</tbody></table></div></div></div>

{{--ptyp--}}
{{--pett--}}
@php($classInput = 'form-control form-control-sm')
@php($classSelect = 'form-select form-select-sm')
@if($ptt->pcate == 2)
    @if(isset($body->taskdetail) && isset($body->claim))
    <div class="card shadow-sm pt-4 mb-6 mb-xl-9">
        <div class="card-header border-0"><div class="card-title"><h2>Maklumat Perjalanan</h2></div></div>
        <div class="card-body pt-0 pb-5">
            <table class="table align-middle table-sm table-row-bordered gs-3 gy-1">
                <thead class="table-primary text-white-50">
                <tr class="fw-bolder fs-6 text-gray-800 align-middle">
                    <th rowspan="2" class="w-125px text-center">Tarikh</th>
                    <th class="w-80px text-center">Mula</th>
                    <th class="w-80px text-center">Hingga</th>
                    <th rowspan="2" class="w-80px text-center"></th>
                    <th rowspan="2" class="">Perkara</th>
                    <th rowspan="2" class="w-100px text-center text-nowrap">Jarak (KM)</th>
                    <th rowspan="2" class="w-20px"></th>
                </tr>
                </thead>
                <tbody>
                @foreach($body->taskdetail as $t)
                    <tr>
                        <td class="text-center">{{\Carbon\Carbon::parse($t->tarikh)->format('d-m-Y')}}</td>
                        <td class="text-center">{{\Carbon\Carbon::parse($t->masastart)->format('h:i A')}}</td>
                        <td class="text-center">{{\Carbon\Carbon::parse($t->masaend)->format('h:i A')}}</td>
                        <td class="text-center">{{$t->days==0.5?'1/2':'1'}} hari</td>
                        <td class="text-start">{{$t->perkara}}</td>
                        <td class="text-end">{{$t->jarak}} km</td>
                    </tr>
                @endforeach
                </tbody>
            </table>
            <div class="separator separator-dashed border-primary my-5"></div>
            <?php
            $pclaim = $body->claim;
            $indx = [];
            foreach ($pclaim as $key=>$c){if($c) $indx[] = $key;}
            ?>
            @foreach($alwn->type??[] as $t)
                @continue(collect($alwn->item[$t->id])->whereIn('id',$indx)->count() == 0)
                <div class="fv-row mb-7">
                    <label class="mb-2 fw-bold">{{$t->name}}</label>
                    <table class="table table-sm gy-1">
                        @foreach($alwn->item[$t->id] as $i)
                            @continue(!isset($pclaim->{$i->id}))
                            <tr>
                                <td class="w-200px">{{ $i->name }}</td>
                                <td class="w-80px text-end">
                                    @if(isset($i->unit) && in_array(strtolower($i->unit),['rm']))
                                        {{ $i->unit }}
                                        {{ number_format($pclaim->{$i->id},2) }}
                                    @endif
                                    @if(isset($i->unit) && in_array(strtolower($i->unit),['km','hari']))
                                        {{ $pclaim->{$i->id} }}
                                        {{ $i->unit }}
                                    @endif
                                </td>
                                <td></td>
                            </tr>
                        @endforeach
                    </table>
                </div>
            @endforeach
        </div>
    </div>
    @endif
@endif
