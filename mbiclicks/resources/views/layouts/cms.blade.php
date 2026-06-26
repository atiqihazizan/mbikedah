
<!DOCTYPE html>
<html lang="en">
<head>
{{--    <title>CMS MBIClicks | {{ $title }}</title>--}}
    <meta charset="utf-8" />
    <meta name="description" content="Mbiclicks" />
    <meta name="keywords" content="Mbiclicks" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="shortcut icon" href="{{ URL::asset('assets/media/logos/favicon1-32x32.png') }}" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700" />
{{--    <link href="{{ URL::asset('assets/css/cms/plugins.bundle.css') }}" rel="stylesheet" type="text/css" />--}}
{{--    <link href="{{ URL::asset('assets/css/cms/plugins-custom.bundle.css') }}" rel="stylesheet" type="text/css" />--}}
    <link rel="stylesheet" href="{{ URL::asset('assets/css/cms/style.bundle.css') }}">

    <link href="{{ URL::asset('assets/plugins/global/plugins.bundle.css') }}" rel="stylesheet" type="text/css" />

    <script src="{{ URL::asset('assets/plugins/global/plugins.bundle.js') }}"></script>
    <script src="{{ URL::asset('assets/js/scripts.bundle.js') }}"></script>

    <link href="{{URL::asset('assets/plugins/custom/datatables/datatables.bundle.css')}}" rel="stylesheet" type="text/css"/>
    <script src="{{URL::asset('assets/plugins/custom/datatables/datatables.bundle.js')}}"></script>
     <meta name="csrf-token" content="{{ csrf_token() }}" />
    @yield('style')
</head>
{{--<body
    id="kt_body"
    data-kt-app-layout="dark-sidebar"
    data-kt-app-header-fixed="true"
    data-kt-app-sidebar-fixed="true"
    data-kt-app-sidebar-hoverable="true"
    data-kt-app-sidebar-push-header="true"
    data-kt-app-sidebar-push-toolbar="true"
    data-kt-app-sidebar-push-footer="true"
    data-kt-app-toolbar-enabled="true"
    class="header-fixed header-tablet-and-mobile-fixed toolbar-enabled toolbar-fixed aside-enabled aside-fixed app-default app-default"
    style="--kt-toolbar-height:55px;--kt-toolbar-height-tablet-and-mobile:55px"
    data-kt-name="metronic">--}}

<body id="kt_app_body"
      data-kt-app-layout="dark-sidebar"
      data-kt-app-header-fixed="true"
      data-kt-app-sidebar-enabled="true"
      data-kt-app-sidebar-fixed="true"
      data-kt-app-sidebar-hoverable="true"
      data-kt-app-sidebar-push-header="true"
      data-kt-app-sidebar-push-toolbar="true"
      data-kt-app-sidebar-push-footer="true"
      data-kt-app-toolbar-enabled="true" class="app-default">

<div class="d-flex flex-column flex-root app-root" id="kt_app_root">
    <div class="app-page flex-column flex-column-fluid" id="kt_app_page">
        <div id="kt_app_header" class="app-header">

        </div>
        <div class="app-wrapper flex-column flex-row-fluid" id="kt_app_wrapper">
            @include('partials.sidebar')
            <div class="app-main flex-column flex-row-fluid" id="kt_app_main">
                <div class="d-flex flex-column flex-column-fluid">
                    {{--toolbar--}}
                    <div class="app-toolbar py-3 py-lg-6">
                        <div class="app-container container-xxl d-flex flex-stack">
                            @yield('toolbar')
                        </div>
                    </div>
                    {{--content--}}
                    <div class="app-content flex-column-fluid" id="kt_app_contents">
                        <div class="app-container container-xxl">
                            @yield('container')
                        </div>
                    </div>
                </div>
{{--                @include('partials.footer')--}}

            </div>
        </div>
    </div>
</div>

@stack('modal')
<script>
    window.setTimeout(function() {$(".alert").fadeTo(500, 0).slideUp(500, function(){$(this).remove();});}, 5000);
    function inputNumeric(input,def=''){input.value = input.value.replace(/[^0-9.]/g, def).replace(/(\..*)\./g, '$1');}
    function inputCurrency(input,def=''){input.value = input.value.replace(/[^0-9.]/g, def).replace(/(\..*)\./g, '$1');}
    function currency(str){return Number(str).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');}
</script>
@stack('javascript')
</body>
</html>
