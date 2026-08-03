<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;

Route::get('/', [PageController::class, 'home']);
Route::get('/art', [PageController::class, 'art']);
Route::get('/blog', [PageController::class, 'blog']);
Route::get('/warmups', [PageController::class, 'warmups']);