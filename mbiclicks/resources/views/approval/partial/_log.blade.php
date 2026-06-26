
<div class="card shadow-sm pt-4 mb-6 mb-xl-9">
<div class="card-header border-0"><div class="card-title"><h2 title="events">Status Permohonan</h2></div></div>
<div class="card-body pt-0 pb-5">

{{--<div class="timeline-label">
    @foreach($petition->rulestepper as $s)
    <div class="timeline-item">
        <div class="timeline-label fw-bold text-gray-800 fs-6">{{ $s->logLatest?->toArray()['created_at']??'pending' }}</div>

        <div class="timeline-badge">
            <i class="fa fa-genderless text-warning fs-1"></i>
        </div>

        <div class="fw-mormal timeline-content text-muted ps-3">
            {{ $s->name }}
        </div>
    </div>
    @endforeach
</div>--}}
<div class="table-responsive">
<table class="table align-middle table-row-dashed fw-semibold text-gray-600 fs-6 gy-2" id="kt_table_petition_events">
<tbody>
<tr>
@foreach($log as $l)
<td class="w-150px "><div class="badge badge-light-{{ LOG_STATUS_COLOR[$l->psts] }}">{{ LOGSTS_VIEW[$l->petition->pcate][$l->psts] }}</div></td>
<td>{{ $l->remark }}</td>
<td class="w-auto">{{ $l->stepper->name }}</td>
<td class="pe-0 text-gray-600 text-end w-175px">{{ \Carbon\Carbon::parse($l->created_at)->format('d M Y h:i A') }}</td>
</tr>
@endforeach
</tbody>
</table>
</div>

</div></div>
