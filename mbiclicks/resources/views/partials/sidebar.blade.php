
<div id="kt_app_sidebar" class="app-sidebar flex-column" data-kt-drawer="true" data-kt-drawer-name="app-sidebar" data-kt-drawer-activate="{default: true, lg: false}" data-kt-drawer-overlay="true" data-kt-drawer-width="225px" data-kt-drawer-direction="start" data-kt-drawer-toggle="#kt_app_sidebar_mobile_toggle" style="background-color:#1e1e2d">
    <div class="app-sidebar-logo px-6" id="kt_app_sidebar_logo">
        <a href="/">
            <img alt="Logo" src="{{ URL::asset('assets/media/logos/logo.svg') }}" class="h-25px app-sidebar-logo-default">
            <img alt="Logo" src="{{ URL::asset('assets/media/logos/logo.svg') }}" class="h-20px app-sidebar-logo-minimize">
        </a>
    </div>
<?php
$menu = [
    ['/cms/position','Jawatan','<i class="fa fa-building" aria-hidden="true"></i>'],
    ['/cms/user','Pengguna','<i class="fa fa-users" aria-hidden="true"></i>'],
    ['/cms/event','Pengumuman Untuk Jabatan Sahaja','<i class="fa fa-bullhorn" aria-hidden="true"></i>'],
    ['/cms/inform','Pengumuman Untuk Semua Jabatan','<i class="fa fa-bullhorn" aria-hidden="true"></i>'],
    ['/cms/profile','Profil','<i class="fa fa-building" aria-hidden="true"></i>'],
];
?>
    <div class="app-sidebar-menu overflow-hidden flex-column-fluid">
        <div id="kt_app_sidebar_menu_wrapper" class="app-sidebar-wrapper hover-scroll-overlay-y my-5" data-kt-scroll="true" data-kt-scroll-activate="true" data-kt-scroll-height="auto" data-kt-scroll-dependencies="#kt_app_sidebar_logo, #kt_app_sidebar_footer" data-kt-scroll-wrappers="#kt_app_sidebar_menu" data-kt-scroll-offset="5px" data-kt-scroll-save-state="true" style="height: 1067px;">
            <div class="menu menu-column menu-rounded menu-sub-indention px-3" id="#kt_app_sidebar_menu" data-kt-menu="true" data-kt-menu-expand="false">
                <div class="menu-item">
                    <div class="menu-content pt-8 pb-2">
                        <span class="menu-section text-muted text-uppercase fs-8 ls-1">Modul</span>
                    </div>
                </div>

                @foreach($menu as $m)
                <div class="menu-item">
                    <a class="menu-link {{request()->is($m[0]) ? 'active' : ''}}" href="{{ $m[0] }}">
                        <span class="menu-icon">
                            {!! $m[2] !!}
                            {{--<span class="svg-icon svg-icon-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-users">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </span>--}}
                        </span>
                        <span class="menu-title">{{ $m[1] }}</span>
                    </a>
                </div>
                @endforeach

            </div>

        </div>
    </div>

    <div class="app-sidebar-footer flex-column-auto pt-2 pb-6 px-6" id="kt_app_sidebar_footer">
        <form action="/logout" method="post" class="menu-link p-0">
            @csrf
            <button type="submit" class="btn btn-flex flex-center btn-danger overflow-hidden text-nowrap px-0 h-40px w-100">
                <span class="btn-label">Log Keluar</span>
                <span class="svg-icon btn-icon svg-icon-2 m-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" style="fill:#FFF5F8">
                        <title>Logout logo SVG icon</title>
                        <path d="M938,500c0,16.7-7,31.7-18.1,42l0,0L737.4,711.6v0c-9.7,9-22.5,14.5-36.6,14.5c-30.2,0-54.8-25.3-54.8-56.5c0-16.7,7-31.7,18.1-42l0,0l76.5-71.1H408.7l0,0c-30.2,0-54.8-25.3-54.8-56.5s24.5-56.5,54.8-56.5l0,0h331.8l-76.5-71v0c-11.1-10.3-18.1-25.3-18.1-42c0-31.2,24.5-56.5,54.8-56.5c14.1,0,26.9,5.5,36.6,14.5l0,0L919.9,458l0,0C931,468.3,938,483.3,938,500z M390.5,123.1h-219v753.8h219c30.2,0,54.8,25.3,54.8,56.5c0,31.2-24.5,56.5-54.8,56.5H116.7C86.5,990,62,964.7,62,933.5V66.5C62,35.3,86.5,10,116.7,10h273.8c30.2,0,54.8,25.3,54.8,56.5C445.2,97.8,420.7,123.1,390.5,123.1z"></path>
                    </svg>
                </span>
            </button>
        </form>
    </div>
</div>
