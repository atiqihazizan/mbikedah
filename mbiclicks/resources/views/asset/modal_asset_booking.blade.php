<div class="modal fade kt_modal" tabindex="-1" id="kt_modal_booking">
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
                <form autocomplete="off" id="kt_form_booking">
                    @csrf
                    <input type="hidden" name="cate" value="1">
                    <input type="hidden" name="refid">
                    <div class="fv-row mb-5"><label class="form-label mb-2">Tarikh Dari</label> <input type="date" class="form-control" name="dtstart"></div>
                    <div class="fv-row mb-5"><label class="form-label mb-2">Tarikh Hingga</label> <input type="date" class="form-control" name="dtuntil"></div>
                    <div class="fv-row mb-5"><label class="form-label mb-2">Staff</label>
                        <select class="form-select" name="staff_id">
                            <option value="">Pilih</option>
                            @foreach($staff as $s)
                                <option value="{{$s->id}}">{{$s->fullname}}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="fv-row mb-5"><label class="form-label mb-2">Odo Meter Sebelum</label> <input type="number" class="form-control" name="odobefore"></div>
                </form>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-primary" form="kt_form_booking">Save changes</button>
            </div>
        </div>
    </div>
</div>
