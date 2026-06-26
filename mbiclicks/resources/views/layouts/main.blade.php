
<!DOCTYPE html>
<html lang="en">
<head>
    <title>MBIClicks | {{ $title }}</title>
    <meta charset="utf-8" />
    <meta name="description" content="Mbiclicks" />
    <meta name="keywords" content="Mbiclicks" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <link rel="shortcut icon" href="{{ URL::asset('assets/media/logos/favicon1-32x32.png') }}" />

    <!-- common css -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700" />

    <link href="{{URL::asset('assets/plugins/custom/datatables/datatables.bundle.css')}}" rel="stylesheet" type="text/css"/>
    <link href="{{ URL::asset('assets/plugins/global/plugins.bundle.css') }}" rel="stylesheet" type="text/css" />
    <link href="{{ URL::asset('assets/css/style.bundle.css') }}" rel="stylesheet" type="text/css" />

    <!-- custom style -->
    <link rel="stylesheet" href="{{ URL::asset('css/style.css?v='.time()) }}">

@stack('style')

    <!-- common javascript -->
    <script src="{{ URL::asset('assets/plugins/global/plugins.bundle.js') }}"></script>
    <script src="{{ URL::asset('assets/js/scripts.bundle.js') }}"></script>

    <!-- asset plugin css/javascript -->
    <script src="{{URL::asset('assets/plugins/custom/datatables/datatables.bundle.js')}}"></script>

@stack('assetplugin')
</head>
<body data-kt-name="metronic" id="kt_body" data-kt-app-header-stacked="true" data-kt-app-toolbar-enabled="true" class="app-default">
<div class="d-flex flex-column flex-root app-root" id="kt_app_root">
  <div class="app-page flex-column flex-column-fluid" id="kt_app_page">

    @include('partials.navbar')

    <div class="app-container  container-xxl d-flex flex-row flex-column-fluid " id="kt_app_wrapper">
        <div class="app-main flex-column flex-row-fluid" id="kt_app_main">
            <div class="d-flex flex-column flex-column-fluid">
              {{--toolbar--}}
              <div class="app-toolbar  align-items-center justify-content-between py-2 py-lg-4 z-index-3">
                  <div class="d-flex flex-grow-1 flex-stack flex-wrap gap-2 ">
                      @yield('toolbar')
                  </div>
              </div>
              {{--body--}}
              <div class="app-content  flex-column-fluid py-0" id="kt_app_contents">
                  @yield('body')
              </div>
            </div>
            {{--footer--}}
            <div class="app-footer align-items-center justify-content-between">
              <div class="app-container  container-fluid d-flex flex-column flex-md-row flex-center flex-md-stack py-3 ">
                  <div class="text-dark order-2 order-md-1">
                      <span class="text-muted fw-bold me-1">2022©</span><a href="#" target="_blank" class="text-gray-800 text-hover-primary">MBI Kedah</a>
                  </div>
                  <ul class="menu menu-gray-600 menu-hover-primary fw-bold order-1"></ul>
              </div>
            </div>
        </div>
    </div>
  </div>
</div>
@yield('modal')
@stack('modal')

<script>
    const APP_AUTH = parseInt("{{ auth()->id() }}")
    const APP_URL = "{{ URL::asset('') }}"

    @if( session()->get('success')) toastr.success('{{ session()->get('success') }}', '{{ session()->get('toasttitle') }}'); @endif
    @if( session()->get('err') ) toastr.error("{{ session()->get('err') }}", ""); @endif
    @if( session()->get('error')) toastr.error('{{ session()->get('error') }}', '{{ session()->get('toasttitle') }}'); @endif
    @if( session()->get('warning')) toastr.warning('{{ session()->get('warning') }}', '{{ session()->get('toasttitle') }}'); @endif
</script>

<script src="{{URL::asset('js/tools.js?v='. time() )}}"></script>
<script src="{{URL::asset('js/app/main.js?v='.time())}}"></script>
@stack('javascript')

</body>
</html>
