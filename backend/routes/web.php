<?php

use Illuminate\Support\Facades\Route;

// Public Customer Storefront
Route::get('/', function () {
    return response()->file(public_path('index.html'));
});

// Dedicated Routes for Staff, Admin, and Super Admin Management Dashboard
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

// Fallback: If URL matches staff, admin, or superadmin routes, serve admin.html, otherwise customer storefront index.html
Route::fallback(function () {
    $path = strtolower(request()->path());
    if (
        str_starts_with($path, 'admin') || 
        str_starts_with($path, 'staff') || 
        str_starts_with($path, 'superadmin') || 
        str_starts_with($path, 'super-admin') || 
        str_starts_with($path, 'dashboard')
    ) {
        return response()->file(public_path('admin.html'));
    }
    return response()->file(public_path('index.html'));
});
