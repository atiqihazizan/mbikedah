<div class="modal fade kt_modal" tabindex="-1" id="kt_modal_asset">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Modal title</h3>

                <!--begin::Close-->
                <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal" aria-label="Close">
                    <span class="svg-icon svg-icon-1"></span>
                </div>
                <!--end::Close-->
            </div>

            <div class="modal-body">
                <form autocomplete="off" id="kt_form_asset">
                    @csrf
                    @method('put')
                    <input type="hidden" name="type" value="1">
                    <input type="hidden" name="id">
                    <div class="fv-row mb-5"><label class="form-lable mb-2">Model</label><input type="text" class="form-control" name="model"></div>
                    <div class="fv-row mb-5"><label class="form-lable mb-2">Plate No</label><input type="text" class="form-control" name="regno"></div>
                </form>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-primary" form="kt_form_asset">Save changes</button>
            </div>
        </div>
    </div>
</div>
