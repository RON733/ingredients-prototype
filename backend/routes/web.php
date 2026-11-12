<?php

use Illuminate\Support\Facades\Route;

$serveSpaHtml = function (string $filename) {
    return response()->file(public_path($filename), [
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0',
    ]);
};

// Public Customer Storefront (Guarded: Workers strictly access their own dashboards only)
Route::get('/', function (\Illuminate\Http\Request $request) use ($serveSpaHtml) {
    $role = $request->cookie('gst_role') ?? ($_COOKIE['gst_role'] ?? null);
    if ($role && in_array($role, ['staff', 'admin', 'super_admin', 'superadmin', 'driver', 'rider'])) {
        return redirect(($role === 'driver' || $role === 'rider') ? '/driver' : '/admin');
    }

    return $serveSpaHtml('index.html');
});

// Dedicated Routes for Staff, Admin, Super Admin, and Delivery Rider Operations Portal
Route::get('/admin', fn () => $serveSpaHtml('admin.html'));
Route::get('/staff', fn () => $serveSpaHtml('admin.html'));
Route::get('/superadmin', fn () => $serveSpaHtml('admin.html'));
Route::get('/super-admin', fn () => $serveSpaHtml('admin.html'));
Route::get('/dashboard', fn () => $serveSpaHtml('admin.html'));
Route::get('/driver', fn () => $serveSpaHtml('admin.html'));
Route::get('/rider', fn () => $serveSpaHtml('admin.html'));
Route::get('/operations', fn () => $serveSpaHtml('admin.html'));
Route::get('/ops', fn () => $serveSpaHtml('admin.html'));
Route::get('/terminal', fn () => $serveSpaHtml('admin.html'));
Route::get('/portal', fn () => $serveSpaHtml('admin.html'));

// Fallback: If URL matches staff, admin, superadmin, rider, or driver routes, serve admin.html, otherwise check worker role before serving customer storefront
Route::fallback(function (\Illuminate\Http\Request $request) use ($serveSpaHtml) {
    $path = strtolower($request->path());

    // Never serve HTML for missing static assets (prevents strict MIME type errors)
    if (
        str_starts_with($path, 'assets/') ||
        preg_match('/\.(js|css|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot)$/i', $path)
    ) {
        abort(404);
    }

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
        return $serveSpaHtml('admin.html');
    }

    $role = $request->cookie('gst_role') ?? ($_COOKIE['gst_role'] ?? null);
    if ($role && in_array($role, ['staff', 'admin', 'super_admin', 'superadmin', 'driver', 'rider'])) {
        return redirect(($role === 'driver' || $role === 'rider') ? '/driver' : '/admin');
    }

    return $serveSpaHtml('index.html');
});
