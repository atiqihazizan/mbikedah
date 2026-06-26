<div class="card card-flush">
{{--    <div class="card-header">--}}
{{--        <div class="card-title"><h2>Cuti Staff</h2></div>--}}
{{--        <div class="card-toolbar"></div>--}}
{{--    </div>--}}
    <div class="card-body pt-3">
        <div id="kt_customer_view_statement_tab_content" class="tab-content">
            <div id="kt_customer_view_statement" class="py-0">
                @if($data->service_cnt == 0)
                    <p class="text-center fst-italic text-gray-500 mb-0">Sila kemaskini tarikh mula berkhidmat</p>
                @elseif($data->lvyr == YEAR_NOW)
                    @include('.staff.partial._leavetable')
                @else
                    <form action="/conf/staffleave/" method="post">
                        @csrf
                        <input type="hidden" name="staffid" value="{{$data->id}}">
                        <button class="btn btn-primary w-100">Daftar Kelayakan Cuti {{ YEAR_NOW }}</button>
                    </form>
                @endif
            </div>
        </div>
    </div>
</div>
