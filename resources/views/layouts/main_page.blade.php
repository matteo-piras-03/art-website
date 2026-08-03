@extends('layouts.common')

@section('meta')
    <meta name="csrf-token" content="{{ csrf_token() }}">
@endsection

@section('css')
    <link rel="stylesheet" href="{{ url('assets/css/navbar.css') }}">
    <link rel="stylesheet" href="{{ url('assets/css/footer.css') }}">
    <link rel="stylesheet" href="{{ url('assets/css/mobile_pages.css') }}">
@endsection

@section('js')
    <script src="{{url('assets/js/mobile.js')}}" defer></script>
@endsection

@section('layout')
    @section('navbar')
        <nav id="nav">
            <div id="nav_left">
                <a href="{{ url('/') }}">pirAs03</a>
            </div>
            <div id="nav_right">
                <a href="{{ url('/art') }}">Art</a>
                <a href="{{ url('/blog') }}">Blog</a>
                <a href="{{ url('/warmups') }}">Warmups</a>
                <button id="toggledarkmode"></button>
            </div>
        </nav>
    @show
    @section('navbar_mobile')
        <nav id="nav_mobile">
        </nav>
    @show
    <div class="nav-divider"></div>
    @section('main')
        <article id="main">
            @yield('contents')
        </article>
    @show
    @section('footer')
        <footer id="footer">
            <div id="footer-container">
                <h1>Matteo Piras | pirAs03</h1>
                <p>© 2025-2026 All rights reserved.</p>
                <a href="#top">Back to top</a>
            </div>
        </footer>
    @show
@endsection