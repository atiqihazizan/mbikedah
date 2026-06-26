<div class="modal fade" tabindex="-1" id="kt_modal_bookhotel" style="background-color: #0101016b">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Lojing</h3>

                <div class="btn btn-icon btn-sm btn-active-light-danger ms-2" data-bs-dismiss="modal" aria-label="Close">
                    <span class="svg-icon svg-icon-2x">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9.39844" y="20.7144" width="16" height="2.66667" rx="1.33333" transform="rotate(-45 9.39844 20.7144)" fill="currentColor"/>
                        <rect x="11.2852" y="9.40039" width="16" height="2.66667" rx="1.33333" transform="rotate(45 11.2852 9.40039)" fill="currentColor"/>
                        </svg>
                    </span>
                </div>
            </div>

            <div class="modal-body">
                <form id="form_lojing_hotel" autocomplete="off">
                    @csrf
                    <input type="hidden" name="cate" value="2">
                    <input type="hidden" name="petition_id" value="">
                    <input type="hidden" name="depart_id" value="">
                    <input type="hidden" name="staff_id" value="">

                    <div class="fv-row mb-5"><label class="form-label mb-2">Tarikh Dari</label> <input type="date" class="form-control" name="dtstart"></div>
                    <div class="fv-row mb-5"><label class="form-label mb-2">Tarikh Hingga</label> <input type="date" class="form-control" name="dtuntil"></div>
                    {{--<select class="form-select" aria-label="Booking Hotel" name="descrip"></select>--}}
                    <div class="fv-row mb-5"><label class="form-label mb-2">Penginapan</label><input type="text" class="form-control" aria-label="Booking Hotel" name="descrip"></input></div>
                    <div class="fv-row mb-5"><label class="form-label mb-2">No Rujukan</label> <input type="text" class="form-control" name="ref"></div>
                </form>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="save_booking_lojing" >Save changes</button>
            </div>
        </div>
    </div>
</div>
