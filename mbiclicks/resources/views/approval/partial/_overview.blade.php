
<div class="card frapage d-none" id="kt-overview-petition">
    <div class="card-body">
        <div class="row">
            <div class="col-md-4">
                @includeIf('approval.partial._profile')
            </div>
            <div class="col-md-8">
                <div class="" id="kt_modal_body"></div>
                <button type="button" class="btn btn-secondary w-100 btn-verify-cancel">Kembali</button>
            </div>
        </div>
    </div>
</div>

<div class="card frapage d-none" id="kt-printout-petition">
    <div class="card-body">
        <div class="position-absolute z-index-1 end-0 pe-3">
            <button type="button" class="btn btn-secondary btn-verify-cancel">Kembali</button>
            <button type="button" class="btn btn-secondary" id="printout"><i class="fa fa-print"></i></button>
        </div>
        <div id="printout-body"></div>
    </div>
</div>
