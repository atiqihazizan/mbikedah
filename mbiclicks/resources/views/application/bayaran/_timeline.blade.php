<style>
    .timeline {
        --bs-timeline-icon-size: 38px;
        --bs-timeline-icon-space: 0.35rem;
    }
    .timeline.timeline-border-dashed .timeline-icon {
        border-style: dashed!important;
    }
    .timeline .timeline-icon {
        z-index: 1;
        flex-shrink: 0;
        margin-right: 1rem;
        width: var(--bs-timeline-icon-size);
        height: var(--bs-timeline-icon-size);
        display: flex;
        text-align: center;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--bs-gray-300);
        border-radius: 50%;
    }
    .timeline.timeline-border-dashed .timeline-line {
        border-left-style: dashed!important;
    }
    .timeline .timeline-line {
        display: block;
        content: " ";
        justify-content: center;
        position: absolute;
        z-index: 0;
        left: 0;
        top: var(--bs-timeline-icon-size);
        bottom: 0;
        transform: translate(50%);
        border-left-width: 1px;
        border-left-style: solid;
        border-left-color: var(--bs-gray-300);
        width: var(--bs-timeline-icon-size);
        margin-top: var(--bs-timeline-icon-space);
        margin-bottom: var(--bs-timeline-icon-space);
    }
    </style>
<div class="m-0">
    <div class="timeline timeline-border-dashed">
        @foreach($dataLog as $i=>$l)
            @if($l->type == 0)
                @php($color = 'text-success')
            @endif
            @if($l->type == 1)
                @php($color = 'text-warning')
            @endif
            @if($l->type == 6)
                @php($color = 'text-danger')
            @endif
            
            @php($icon = '<i class="ki-duotone ki-cd fs-2 text-success"><span class="path1"></span><span class="path2"></span></i>')
            @if($i == count($dataLog)-1)
                @php($icon = '<i class="ki-duotone ki-geolocation fs-2 '.$color.'"><span class="path1"></span><span class="path2"></span></i>')
            @endif

            <div class="timeline-item pb-5">
                <div class="timeline-line"></div>

                <div class="timeline-icon">{!!$icon!!}</div>

                <div class="timeline-content m-0">
                    <span class="fs-8 fw-bolder {{$color}} text-uppercase">{{ $l->status }}</span>

                    @if($i > 0)
                        <a href="#" class="fs-6 text-gray-800 fw-bold d-block text-hover-primary">{{ $l->stepper }}</a>
                    @endif

                    <div class="d-flex flex-column">
                        <span class="fw-semibold text-gray-500">{{ $l->date }}</span>
                        <span class="text-danger">{{ $l->remark }}</span>
                    </div>
                </div>
            </div>
        @endforeach
        
        {{-- <div class="timeline-item">
            <div class="timeline-line"></div>

            <div class="timeline-icon">
                <i class="ki-duotone ki-geolocation fs-2 text-info"><span class="path1"></span><span class="path2"></span></i>                                   
            </div>

            <div class="timeline-content m-0">
                <span class="fs-8 fw-bolder text-info text-uppercase">Receiver</span>

                <a href="#" class="fs-6 text-gray-800 fw-bold d-block text-hover-primary">Ralph Edwards</a>                                        
                
                <span class="fw-semibold text-gray-500">2464 Royal Ln. Mesa, New Jersey 45463</span>
            </div>
        </div> --}}                                        
    </div>
</div>