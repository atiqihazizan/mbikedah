
<!DOCTYPE html>
<html lang="en">
<head>
  <title>MBIClicks | {{ $title }}</title>
  <meta charset="utf-8" />
  <meta name="description" content="Mbiclicks" />
  <meta name="keywords" content="Mbiclicks" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="shortcut icon" href="assets/media/logos/favicon1-32x32.png" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700" />
  <link href="{{ URL::asset('assets/plugins/global/plugins.bundle.css') }}" rel="stylesheet" type="text/css" />
  <link href="{{ URL::asset('assets/css/style.bundle.css') }}" rel="stylesheet" type="text/css" />
  <link rel="stylesheet" href="{{ URL::asset('css/style.css') }}">

</head>
<body data-kt-name="metronic" id="kt_body" data-kt-app-header-stacked="true" data-kt-app-toolbar-enabled="true" class="app-default">
<div class="d-flex flex-column flex-root app-root" id="kt_app_root">
  <div class="app-page flex-column flex-column-fluid" id="kt_app_page">
    <div class="d-flex flex-column flex-root">
      @yield('container')
    </div>
  </div>
</div>

<script src="{{ URL::asset('assets/plugins/global/plugins.bundle.js') }}"></script>
<script src="{{ URL::asset('assets/js/scripts.bundle.js') }}"></script>

</body>
</html>