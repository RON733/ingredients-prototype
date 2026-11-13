<?php

use Illuminate\Support\Facades\Route;

$serveSpaHtml = function (string $filename) {
    $path = public_path($filename);
    $headers = [
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0',
    ];

    if ($filename === 'admin.html') {
        $headers['X-Robots-Tag'] = 'noindex, nofollow';
    }

    if ($filename === 'index.html' && file_exists($path)) {
        $baseUrl = rtrim(request()->getSchemeAndHttpHost(), '/');
        $currentUrl = rtrim(url()->current(), '/');
        if ($currentUrl === '') {
            $currentUrl = $baseUrl . '/';
        }
        $html = file_get_contents($path);
        $html = str_replace(
            [
                'id="canonical-link" href="/"',
                'property="og:url" content="/"',
                'content="/assets/hero-banner.png"',
                '"image": "/assets/hero-banner.png"',
                '"logo": "/assets/logo-square.png"',
            ],
            [
                'id="canonical-link" href="' . e($currentUrl) . '"',
                'property="og:url" content="' . e($currentUrl) . '"',
                'content="' . e($baseUrl) . '/assets/hero-banner.png"',
                '"image": "' . e($baseUrl) . '/assets/hero-banner.png"',
                '"logo": "' . e($baseUrl) . '/assets/logo-square.png"',
            ],
            $html
        );
        $headers['Content-Type'] = 'text/html; charset=UTF-8';
        return response($html, 200, $headers);
    }

    return response()->file($path, $headers);
};

// Dynamic XML Sitemap for Search Engines (Google, Bing, etc.)
Route::get('/sitemap.xml', function (\Illuminate\Http\Request $request) {
    $baseUrl = rtrim($request->getSchemeAndHttpHost(), '/');
    $lastmod = now()->toAtomString();

    $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{$baseUrl}/</loc>
    <lastmod>{$lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
XML;

    return response($xml, 200, [
        'Content-Type' => 'application/xml; charset=UTF-8',
        'Cache-Control' => 'public, max-age=3600',
    ]);
});

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
