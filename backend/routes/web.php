<?php

use Illuminate\Support\Facades\Route;

// Public Customer Storefront
Route::get('/', function () {
    return response()->file(public_path('index.html'));
});

// Dedicated Routes for Staff, Admin, Super Admin, and Delivery Rider Operations Portal
Route::get('/admin', function () {
    return response()->file(public_path('admin.html'));
});

Route::get('/staff', function () {
    return response()->file(public_path('admin.html'));
});

Route::get('/superadmin', function () {
    return response()->file(public_path('admin.html'));
});

Route::get('/super-admin', function () {
    return response()->file(public_path('admin.html'));
});

Route::get('/dashboard', function () {
    return response()->file(public_path('admin.html'));
});

Route::get('/driver', function () {
    return response()->file(public_path('admin.html'));
});

Route::get('/rider', function () {
    return response()->file(public_path('admin.html'));
});

Route::get('/operations', function () {
    return response()->file(public_path('admin.html'));
});

Route::get('/ops', function () {
    return response()->file(public_path('admin.html'));
});

Route::get('/terminal', function () {
    return response()->file(public_path('admin.html'));
});

Route::get('/portal', function () {
    return response()->file(public_path('admin.html'));
});

// Fallback: If URL matches staff, admin, superadmin, rider, or driver routes, serve admin.html, otherwise serve customer storefront
Route::fallback(function (\Illuminate\Http\Request $request) {
    $path = strtolower($request->path());
    if (
        str_starts_with($path, 'admin') || 
        str_starts_with($path, 'staff') || 
        str_starts_with($path, 'superadmin') || 
        str_starts_with($path, 'super-admin') || 
        str_starts_with($path, 'dashboard') ||
        str_starts_with($path, 'driver') ||
        str_starts_with($path, 'rider') ||
        str_starts_with($path, 'operation') ||
        str_starts_with($path, 'ops') ||
        str_starts_with($path, 'terminal') ||
        str_starts_with($path, 'portal')
    ) {
        return response()->file(public_path('admin.html'));
    }

    return response()->file(public_path('index.html'));
});
