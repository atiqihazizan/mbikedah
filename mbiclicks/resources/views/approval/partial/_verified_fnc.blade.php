<div class="card shadow-sm pt-4 mb-6 mb-xl-9">
<div class="card-header border-0"><div class="card-title"><h2>Pengesahan Bahagian Kewangan</h2></div></div>
<div class="card-body pt-0 pb-5">
<div class="table-responsive">
<table class="table align-middle table-row-dashed gy-2">
<tbody class="fs-6 fw-semibold text-gray-600">
<tr><td class="w-125px">Jenis Transaksi</td><td>{{ $payment->methodpay??'' }}</td></tr>
<tr><td>Rujukan</td><td>{{ $payment->ref??'' }}</td></tr>
<tr><td>Pengesahan</td><td>{{ $payment->verify??'' }}</td></tr>
<tr><td>Ulasan</td><td>{{ $payment->remark??'' }}</td></tr>
</tbody>
</table>
</div></div></div>
