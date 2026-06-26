@extends('layouts.main')
@push('assetplugin')

    <link href="{{URL::asset('assets/plugins/custom/fullcalendar/fullcalendar.bundle.css')}}" rel="stylesheet" type="text/css" />
    <script src="{{URL::asset('assets/plugins/custom/fullcalendar/fullcalendar.bundle.js')}}"></script>
@endpush
@section('body')
    <div class="row">
        <div class="col-md-4">
            <div class="card card-flush mb-5">
                <div class="card-body bg-crystal1 px-10">
                    <h1 class="text-primary mb-10">SELAMAT DATANG, {{ strtoupper(auth()->user()->name) }}</h1>
                    <table class="border-0 table-borderless">
                        <tr><th class="fw-bold align-top">NAMA</th><td class="px-3 align-top" style="width: 1px">:</td><td>{{ $master->staff[auth()->user()->staff_id]->fullname }}</td></tr>
                        <tr><th class="fw-bold align-top">NO ID</th><td class="px-3 align-top" style="width: 1px">:</td><td>{{ $master->staff[auth()->user()->staff_id]->staffno }}</td></tr>
                        <tr><th class="fw-bold align-top">JAWATAN</th><td class="px-3 align-top" style="width: 1px">:</td><td>{{ $master->staff[auth()->user()->staff_id]->position->name }}</td></tr>
                        <tr><th class="fw-bold align-top">JABATAN</th><td class="px-3 align-top" style="width: 1px">:</td><td>{{ $master->depart[auth()->user()->depart_id]->name }}</td></tr>
                        {{--<tr><th class="fw-bold">UNIT</th><td class="px-3" style="width: 1px">:</td><td></td></tr>--}}
                    </table>
                    {{--
                    <button class="btn btn-success btn-lg">Makluman</button>
                    <p class="pt-5 fs-5">{!! $sys->inform !!}</p>--}}
                    @if(count($leave)>0)
                    <div class="separator separator-dashed my-5"></div>
                    @endif

                    @foreach($leave as $lv)
{{--                        @continue($lv->basic == 0)--}}
                        <?php
                            $take = $lv->basic - $lv->limit;
                            $max = $lv->basic;
                            $percent = 100;
                            $color = 'bg-primary';
                            if($take > 0 && $max > 0) $percent = round((($max - $take) / $max) * 100);
                            $warn =  intval(0.75 * $max);
                            if($take >= $warn && $max > 0) $color = 'bg-warning';
                            $quit =  intval(0.9 * $max);
                            if($take >= $quit && $max > 0) $color = 'bg-danger bg-opacity-75';
                            if($take < 0) $take *= -1;
                        ?>
                        <div class="d-flex align-items-center flex-column mb-7 w-100">

                            <div class="mx-3 w-100 bg-light-primary rounded position-relative">
                                <div class="position-relative z-index-3 d-flex justify-content-between w-100 px-2 py-1">
                                    <span class="fw-bolder fs-6 text-gray-900" kt-leave-name>{{ $lv->leaveType->leave }}</span>
                                    <span class="fw-bold fs-6 text-gray-900" kt-leave-percent>{{ $take . ' / ' . $max }}</span>
                                </div>
                                <div class="{{ $color }} rounded position-absolute top-0 end-0 bottom-0" role="progressbar" style="width: {{ $percent }}%;"
                                     aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
        <div class="col-md-8">
            <div class="card bg-transparent mb-5">
                <div class="card-body p-0">
                    <div class="row g-3">
                        @foreach($status as $c)
                            <div class="col-4">
                                <div class="{{$c[0]}} bg-opacity-70 rounded-2 px-6 py-5">
                                    <div class="m-0">
                                        <span class="text-white fw-bolder d-block fs-4hx lh-1 ls-n1 mb-1">{{ $c[2] }}</span>
                                        <span class="text-white fw-semibold fs-6">{{$c[3]}}</span>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div id="kt_docs_fullcalendar_basic"></div>
                </div>
            </div>
        </div>
    </div>
@endsection
@push('javascript')
<script>
    var dashboard_user = function(){
        var events = []
        var todayDate = moment().startOf("day");
        var nowDateTime = moment().format('YYYY-MM-DDTHH:mm:ss');
        var YM = todayDate.format("YYYY-MM");
        var YESTERDAY = todayDate.clone().subtract(1, "day").format("YYYY-MM-DD");
        var TODAY = todayDate.format("YYYY-MM-DD");
        var TOMORROW = todayDate.clone().add(1, "day").format("YYYY-MM-DD");
        var calendarEl = document.getElementById("kt_docs_fullcalendar_basic");
        var calendar = new FullCalendar.Calendar(calendarEl, {
            timeZone:'UTC',
            themeSystem: 'bootstrap5',
            headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
            },

            height: 650,
            contentHeight: 580,
            aspectRatio: 3,  // see: https://fullcalendar.io/docs/aspectRatio

            nowIndicator: true,
            // now: TODAY + "T09:25:00", // just for demo
            now: nowDateTime,

            initialView: "dayGridMonth",
            initialDate: TODAY,
            locale: 'ms',
            // buttonIcons: false, // show the prev/next text
            // weekNumbers: true,
            selectable:true,
            editable: true,
            dayMaxEvents: true, // allow "more" link when too many events
            navLinks: true,

            //eventTimeFormat: { hour: "numeric", minute: "2-digit", timeZoneName: "short" },
            eventTimeFormat: { hour: "numeric", minute: "2-digit" },
            events: events,

            eventContent: function (info) {
                var element = $(info.el);

                if (info.event.extendedProps && info.event.extendedProps.description) {
                    if (element.hasClass("fc-day-grid-event")) {
                        element.data("content", info.event.extendedProps.description);
                        element.data("placement", "top");
                        KTApp.initPopover(element);
                    } else if (element.hasClass("fc-time-grid-event")) {
                        element.find(".fc-title").append('<div class="fc-description">' + info.event.extendedProps.description + "</div>");
                    } else if (element.find(".fc-list-item-title").lenght !== 0) {
                        element.find(".fc-list-item-title").append('<div class="fc-description">' + info.event.extendedProps.description + "</div>");
                    }
                }
            },
            eventClick: function(arg) {
                arg.jsEvent.preventDefault();
                // alert('Event: ' + info.event.title + '\nCoordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY + '\nView: ' + info.view.type);
                // change the border color just for fun
                // info.el.style.borderColor = 'red';
                swaWarning("Pasti hendak buang?",'Buang') .then(function (result) {
                    if (result.dismiss === "cancel") return;
                    if (!result.value)  return;
                    let url = APP_URL + 'calendar/'+arg.event.id;
                    $.delete(url,{_token: CSRF_TOKEN,id:arg.event.id}).done(function(res){
                        //if(res.success) return arg.event.remove()
                        if(res.success) return redrawEvent(res.data)
                        swaError(res.error)
                    })
                });
            },
            select: function (arg) {
                let pos = {}
                let evtnow = moment().format('YYYY-MM-DDTHH:mm:ss');
                let tmnow = moment().format('HH:mm:ss');
                let evtstart = moment(arg.start)
                let evtend  = moment(arg.end)
                let evtDiff = evtend.diff(evtstart, 'days')
                let html = `<div class="mb-7">Membuat Agenda baru?</div><div class="fw-bold mb-5">Nama Agenda:</div><input type="text" class="form-control" name="event_name" autocomplete="off"/>`
                let evt = {
                    title: '',
                    start: evtstart.format('YYYY-MM-DD'),
                    end: evtend.format('YYYY-MM-DD'),
                    // allDay: arg.allDay
                }

                if(evtDiff == 1){
                    html += '<br>'
                    html += `<div class="fw-bold mb-5">Waktu Mula:</div><input type="time" class="form-control" name="event_start" value="${tmnow}" />`
                    html += '<br>'
                    html += `<div class="fw-bold mb-5">Waktu Hingga:</div><input type="time" class="form-control" name="event_end" value="${tmnow}" />`

                    evt.end = evt.start;
                    delete evt.allDay
                }

                swaInfo(html,"Simpan").then(function (result) {
                    let title = document.querySelector('input[name="event_name"]').value;
                    calendar.unselect()

                    if (result.dismiss === "cancel") return;
                    if (!result.value) return;
                    if (title.length < 1) return;
                    if (evtDiff == 1){
                        let tmstart = document.querySelector('input[name="event_start"]').value;
                        let tmend = document.querySelector('input[name="event_end"]').value;
                        evt.start += 'T'+tmstart
                        evt.end += 'T'+tmend
                    }
                    evt.title = title
                    pos = {_token: CSRF_TOKEN, ...evt}
                    $.post(APP_URL + 'calendar',pos).done(function(res){
                        if(res.success) redrawEvent(res.data)
                    })
                });
            },
        });
        const getFormat = (d) => {
            let dt = d.split(' ');
            if(dt[1] === '00:00:00') return "YYYY-MM-DD";
            return "YYYY-MM-DDTHH:mm:ss";
            // if(d.includes("T")){
            // } else {
            //     return "YYYY-MM-DD";
            // }
        }

        function redrawEvent(eventsArray){
            // Remove all events
            const removeEvents = calendar.getEvents();
            removeEvents.forEach(event => {
                event.remove();
            });

            eventsArray.forEach(evt => {
                let sec = 28800
                var start;
                var end;

                // start = moment(evt.start).add(sec, "seconds").format(getFormat(evt.start));
                // end = evt.end ? moment(evt.end).add(sec, "seconds").format(getFormat(evt.end)) : start;
                start = moment(evt.start).format(getFormat(evt.start));
                end = evt.end ? moment(evt.end).format(getFormat(evt.end)) : start;

                calendar.addEvent({
                    id:evt.id,
                    title: evt.title,
                    start: start,
                    end: end
                });
            });

            calendar.render();
        }

        return {
            init: function(){$.get(APP_URL + 'calendar').done(res => {if(res.success) redrawEvent(res.data)})}
        }
    }()
    dashboard_user.init();
</script>
@endpush
