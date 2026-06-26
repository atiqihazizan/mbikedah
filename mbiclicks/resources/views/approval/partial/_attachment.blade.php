
<!-- lampiran -->
<div class="card shadow-sm pt-4 mb-6 mb-xl-9">
<div class="card-header border-0 cursor-pointer rotate collapsible" data-bs-toggle="collapse" data-bs-target="#kt_attacment">
<div class="card-title"><h2>Lampiran</h2></div>
<div class="card-toolbar rotate-180">
<span class="svg-icon svg-icon-1">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.4343 12.7344L7.25 8.55005C6.83579 8.13583 6.16421 8.13584 5.75 8.55005C5.33579 8.96426 5.33579
9.63583 5.75 10.05L11.2929 15.5929C11.6834 15.9835 12.3166 15.9835 12.7071 15.5929L18.25 10.05C18.6642 9.63584
18.6642 8.96426 18.25 8.55005C17.8358 8.13584 17.1642 8.13584 16.75 8.55005L12.5657 12.7344C12.2533 13.0468
11.7467 13.0468 11.4343 12.7344Z" fill="currentColor"></path>
</svg>
</span></div></div>
<div class="collapse show" id="kt_attacment">
<div class="card-body pt-0 pb-5">
<div class="table-responsive">
<table class="table align-middle table-row-dashed gy-5" id="kt_table_attach_detail">
<tbody class="fs-6 fw-semibold text-gray-600 kt_table_attach reset" id="kt_table_attach_detail_tbody">
@foreach($attach as $l)
<tr><td class="p-4 rounded text-active-primary"><a href="{{ URL::asset('/storage/'.$l->path) }}" class="" target="_blank" rel="noopener noreferrer">{{$l->filename}}</a></td></tr>
@endforeach
</tbody>
</table></div></div></div></div>
