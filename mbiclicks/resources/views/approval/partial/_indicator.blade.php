<style>
    .step-indicator {display: flex;}
    .step:first-of-type::before, .step:last-of-type::after {display: none;}
    .step {flex : 1;background : #b1b1b1;height : 30px;line-height : 30px;margin-right : 33px;position : relative;color : #fff;cursor : default;}
    .step::after, .step::before {content: "";position: absolute;width: 0;height: 0;top: 0;}
    .step::before {left: -30px;border: 15px solid transparent;border-color: #b1b1b1 #b1b1b1 #b1b1b1 transparent;}
    .step::after {right: -30px;border: 15px solid transparent;border-left-color: #b1b1b1;}
    .step:first-of-type {border-radius: 2px 0 0 2px;padding-left: 15px;}
    .step:last-of-type {border-radius: 0 2px 2px 0;margin-right: 0;}
    .step.completed {background : #1b5800;color : #fff;cursor : pointer;}
    .step.completed::before {border-color: #1b5800 #1b5800 #1b5800 transparent;}
    .step.completed::after {border-left-color: #1b5800;}
    .step.current {background : #ffd500;color : #fff;cursor : pointer;}
    .step.current::before {border-color: #ffd500 #ffd500 #ffd500 transparent;}
    .step.current::after {border-left-color: #ffd500;}
</style>
<div class="card p-0">
<div class="card-body p-0">
<div class="step-indicator">
{{--    <a class="step fs-2 py-3 completed" href="#">Step one</a>--}}
{{--    <a class="step fs-2 py-3 completed" href="#">Step two</a>--}}
{{--    <a class="step fs-2 py-3" href="#">Step three</a>--}}
    @foreach($petition->rulestepper as $r)
        <?php
        $complete = '';
        if($loop->iteration <= count($petition->routestep)) $complete = 'completed';
//        if($r->id == $petition->stepnow && in_array($petition->psts,[STS_PROCESS,STS_CLAIM])) $complete = 'current';
        if($loop->index == count($petition->routestep)) $complete = 'current';
        ?>
        <a class="step {{ $complete }} fw-bold" href="#" data-bs-toggle="tooltip" data-bs-custom-class="tooltip-inverse" data-bs-title="{{ $r->name }}">{{ $r->code }}</a>
    @endforeach
</div>
</div>
</div>
