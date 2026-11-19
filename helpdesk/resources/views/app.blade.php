<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>{{ config('app.name', "Jephthah's Workbench") }}</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('assets/images/SP.ico') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    @vite('resources/css/app.css')
    <script>window.__APP_BASE_PATH__ = @json(rtrim(request()->getBaseUrl(), '/'));</script>
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    @inertiaHead
</head>
<body class="bg-black text-white antialiased selection:bg-white/20 selection:text-white">
    @inertia
</body>
</html>
