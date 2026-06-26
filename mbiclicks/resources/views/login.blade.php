@extends('layouts.nonavbar')

@section('container')
<div class="login login-4 login-signin-on d-flex flex-row-fluid">
    <div class="d-flex flex-center flex-row-fluid bgi-size-cover bgi-position-top bgi-no-repeat"
         style="background-image: url({{ URL::asset('assets/media/bg/bg-3.jpg') }});">
      <div class="login-form text-center p-7 position-relative overflow-hidden">

        @if(session()->has('loginErr'))
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            {{ session('loginErr') }}
            <button class="btn-close" type="button" data-bs-dismiss="alert" arial-label="Close"></button>
          </div>
        @endif

        <div class="d-flex flex-center mb-15"><a href="#"><img src="{{ URL::asset('assets/media/logos/favicon1-180x180.png') }}" class="max-h-75px" alt=""></a></div>
        <!--Signin-->
        <div class="login-signin">
          <div class="mb-10"><h3>Daftar Masuk ke Portal MBIClicks</h3><div class="text-muted font-weight-bold">Masukkan email dan katalaluan untuk log masuk:</div></div>
          <form class="form fv-plugins-bootstrap5 fv-plugins-framework" action="{{ route('signin') }}" method="POST" autocomplete="off">
            @csrf
            <div class="fv-row mb-10 fv-plugins-icon-container">
              <input class="form-control h-auto form-control-solid py-4 px-8 text-uppercase" type="text" placeholder="Staff ID" name="username" autofocus required>
            </div>
            <div class="fv-row mb-10 fv-plugins-icon-container">
              <input class="form-control h-auto form-control-solid py-4 px-8" type="password" placeholder="KATALALUAN" name="password" required>
            </div>
            {{-- <div class="form-group mb-10 d-flex flex-wrap justify-content-between align-items-center">
              <div class="checkbox-inline"><!-- <label class="checkbox m-0 text-muted"><input type="checkbox" name="remember" /><span></span>Remember me</label> --></div>
              <a href="javascript:;" id="kt_login_forgot" class="text-muted text-hover-primary">Lupa Katalaluan ?</a>
            </div> --}}
            <button class="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 w-50 spinner-white spinner-right ">Log Masuk</button>
            <!--button type="submit" id="kt_sign_in_submit" class="btn btn-lg btn-primary w-100 mb-5">
              <span class="indicator-label">Login</span>
              <span class="indicator-progress">Please wait...<span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
            </button-->
          </form>
        </div>
        <!--Signin-->
      </div>
    </div>
  </div>
@endsection
