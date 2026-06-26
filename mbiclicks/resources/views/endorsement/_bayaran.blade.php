<div class="card shadow-sm pt-4 mb-6 mb-xl-9">
    <div class="card-header border-0">
        <div class="card-title"><h2>Bayaran</h2></div>
        <div class="card-toolbar">
            <div class="d-flex justify-content-end" data-kt-approval-table-toolbar="base">
                <div id="petSts"></div>
            </div>
        </div>
    </div>
    <div class="card-body pt-0 pb-5">
        <div class="table-responsive">
            <table class="table align-middle table-row-dashed gy-2" id="kt_table_petition">
                <tbody class="fs-6 fw-semibold text-gray-600">
                <tr><td class="w-250px">Tarikh Permohonan</td><td><span class="reset data-pdt">{{ date('d-m-Y')}}</span></td></tr>
                <tr><td class="w-250px">Projek No</td><td><span class="reset data-pno"></span></td></tr>
                <tr><td class="w-250px">Nama Pembekal/Kontraktor/Penerima</td><td><span class="reset data-recepient"></span></td></tr>
                <tr><td class="w-250px">Keterangan Bayaran</td><td><span class="reset data-perkara"></span></td></tr>
                <tr><td class="w-250px">Jumlah (RM)</td><td><span class="reset fw-bold data-total"></span></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>