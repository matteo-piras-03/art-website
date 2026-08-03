@extends('layouts.main_page')

@section('title', 'Home - pirAs03')

@section('css')
    @parent
    <link rel="stylesheet" href="{{ url('assets/css/index.css') }}">
@endsection

@section('js')
    @parent
    <script>
        const base_url = "{{ url('/') }}";
    </script>
    <script src="{{ url('assets/js/index.js') }}" defer></script>
@endsection

@section('contents')
    <div id="section-0">
        <div id="section-0-left">
            <img src="{{ url('assets/images/hrnt_pfp.jpeg') }}" id="logo">
            <h1>pirAs03</h1>
            <p>Hello! My name is Matteo Piras, I'm a 22 years old male from Italy. I'm currently an electronics engineer student, but as a hobby I started drawing seriously on late 2025.
            Currently a Drawabox student and nothing else, so everything you see here was born by trial and error. I also like cooking and videogames!</p>
        </div>
        <div id="section-0-right">
            <h1>Commissions are currently closed.</h1>
            <div class="gray-line"></div>
            <h1>Art Socials</h1>
            <ul class="buttons_list">
                <li><a href="https://www.instagram.com/pirasdraws._/" target="_blank" class="button">Instagram</a></li>
                <li><a href="https://www.bsky.app/profile/piras03.bsky.social" target="_blank" class="button">Bluesky</a></li>
                <li><a href="https://artfight.net/~Piras03" target="_blank" class="button">Artfight</a></li>
            </ul>
            <h1>Other Socials</h1>
            <ul class="buttons_list">
                <li><a href="https://www.youtube.com/@piras03" target="_blank" class="button">YouTube</a></li>
                <li><a href="https://steamcommunity.com/id/Pirassone/" target="_blank" class="button">Steam</a></li>
            </ul>
        </div>
    </div>
    <div class="gray-line"></div>
    <div id="section-1">
        <h1>Featured Art</h1>
        <ul class="gallery">
            <li><a href="{{ url('assets/images/art/1.png') }}"><img src="{{ url('assets/images/art/1.png') }}"></a></li>
        </ul>
    </div>
@endsection