<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\EventBookingController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\LoyverseController;

// --- Public Endpoints ---
Route::post('/auth/login', [AuthController::class, 'login'])->name('login');
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::get('/auth/google/config', [AuthController::class, 'googleConfig']);
Route::get('/auth/staff-list', [AuthController::class, 'listStaff']);
Route::get('/staff-list', [AuthController::class, 'listStaff']);
Route::post('/auth/pin-switch', [AuthController::class, 'quickPinLogin']);
Route::post('/auth/verify-password', [AuthController::class, 'verifyPassword']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/active', [OrderController::class, 'activeOrder']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);
Route::match(['put', 'patch'], '/orders/{id}/customer-location', [OrderController::class, 'updateCustomerLocation']);
Route::match(['put', 'patch'], '/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::match(['put', 'patch'], '/orders/{id}/verify-payment', [OrderController::class, 'verifyPayment']);
Route::match(['put', 'patch'], '/orders/{id}/driver-location', [OrderController::class, 'updateDriverLocation']);
Route::match(['put', 'patch'], '/orders/{id}/assign-driver', [OrderController::class, 'assignDriver']);
Route::get('/drivers', [OrderController::class, 'getDrivers']);
Route::match(['put', 'patch'], '/driver/toggle-availability', [OrderController::class, 'toggleDriverAvailability']);
Route::get('/driver/orders', [OrderController::class, 'driverOrders']);

Route::get('/ingredients', [IngredientController::class, 'index']);
Route::get('/settings', [SystemController::class, 'settings']);
Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::post('/chatbot', [SystemController::class, 'chatbot']);
Route::post('/bookings', [EventBookingController::class, 'store']);

// Loyverse POS Integration
Route::get('/loyverse/status', [LoyverseController::class, 'status']);
Route::post('/loyverse/sync', [LoyverseController::class, 'sync']);
Route::post('/loyverse/export-menu', [LoyverseController::class, 'exportMenu']);
Route::post('/loyverse/register-webhook', [LoyverseController::class, 'registerWebhook']);
Route::post('/loyverse/webhook', [LoyverseController::class, 'webhook']);

// --- Authenticated & Operational Endpoints ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // Ingredients & Kitchen Inventory Management (Prototype)
    Route::post('/ingredients', [IngredientController::class, 'store']);
    Route::match(['put', 'patch'], '/ingredients/{id}', [IngredientController::class, 'update']);
    Route::post('/ingredients/{id}/adjust', [IngredientController::class, 'quickAdjust']);
    Route::delete('/ingredients/{id}', [IngredientController::class, 'destroy']);

    // Menu / Product Management
    Route::post('/products', [ProductController::class, 'store']);
    Route::match(['put', 'patch'], '/products/{id}', [ProductController::class, 'update']);
    Route::match(['put', 'patch'], '/products/{id}/toggle-availability', [ProductController::class, 'toggleAvailability']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Event Bookings
    Route::get('/bookings', [EventBookingController::class, 'index']);
    Route::match(['put', 'patch'], '/bookings/{id}/status', [EventBookingController::class, 'updateStatus']);

    // Analytics (Owner / Admin Exclusive)
    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'overview']);

    // Announcements (Staff & Admin)
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::match(['put', 'patch'], '/announcements/{id}', [AnnouncementController::class, 'update']);
    Route::match(['put', 'patch'], '/announcements/{id}/toggle', [AnnouncementController::class, 'toggleActive']);
    Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);

    // Personnel & Super Admin Controls & Audit Trail
    Route::get('/users', [AuthController::class, 'listUsers']);
    Route::post('/users', [AuthController::class, 'createUser']);
    Route::match(['put', 'patch'], '/users/{id}', [AuthController::class, 'updateUserRole']);
    Route::post('/settings', [SystemController::class, 'updateSettings']);
    Route::get('/audit-logs', [SystemController::class, 'auditLogs']);
});

// Also provide unauthenticated operational endpoints for seamless local evaluation/testing if token header isn't passed
Route::prefix('v1')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::match(['put', 'patch'], '/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::match(['put', 'patch'], '/orders/{id}/verify-payment', [OrderController::class, 'verifyPayment']);
    Route::match(['put', 'patch'], '/orders/{id}/driver-location', [OrderController::class, 'updateDriverLocation']);
    Route::match(['put', 'patch'], '/orders/{id}/customer-location', [OrderController::class, 'updateCustomerLocation']);
    Route::match(['put', 'patch'], '/orders/{id}/assign-driver', [OrderController::class, 'assignDriver']);
    Route::get('/drivers', [OrderController::class, 'getDrivers']);
    Route::match(['put', 'patch'], '/driver/toggle-availability', [OrderController::class, 'toggleDriverAvailability']);
    Route::get('/driver/orders', [OrderController::class, 'driverOrders']);
    Route::post('/ingredients', [IngredientController::class, 'store']);
    Route::match(['put', 'patch'], '/ingredients/{id}', [IngredientController::class, 'update']);
    Route::post('/ingredients/{id}/adjust', [IngredientController::class, 'quickAdjust']);
    Route::delete('/ingredients/{id}', [IngredientController::class, 'destroy']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::match(['put', 'patch'], '/products/{id}', [ProductController::class, 'update']);
    Route::match(['put', 'patch'], '/products/{id}/toggle-availability', [ProductController::class, 'toggleAvailability']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::get('/bookings', [EventBookingController::class, 'index']);
    Route::match(['put', 'patch'], '/bookings/{id}/status', [EventBookingController::class, 'updateStatus']);
    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/users', [AuthController::class, 'listUsers']);
    Route::post('/users', [AuthController::class, 'createUser']);
    Route::match(['put', 'patch'], '/users/{id}', [AuthController::class, 'updateUserRole']);
    Route::get('/auth/staff-list', [AuthController::class, 'listStaff']);
    Route::get('/staff-list', [AuthController::class, 'listStaff']);
    Route::post('/auth/pin-switch', [AuthController::class, 'quickPinLogin']);
    Route::post('/auth/verify-password', [AuthController::class, 'verifyPassword']);
    Route::post('/pin-switch', [AuthController::class, 'quickPinLogin']);
    Route::post('/verify-password', [AuthController::class, 'verifyPassword']);
    Route::post('/settings', [SystemController::class, 'updateSettings']);
    Route::get('/audit-logs', [SystemController::class, 'auditLogs']);

    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::match(['put', 'patch'], '/announcements/{id}', [AnnouncementController::class, 'update']);
    Route::match(['put', 'patch'], '/announcements/{id}/toggle', [AnnouncementController::class, 'toggleActive']);
    Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);

    // Loyverse POS Integration
    Route::get('/loyverse/status', [LoyverseController::class, 'status']);
    Route::post('/loyverse/sync', [LoyverseController::class, 'sync']);
    Route::post('/loyverse/export-menu', [LoyverseController::class, 'exportMenu']);
    Route::post('/loyverse/register-webhook', [LoyverseController::class, 'registerWebhook']);
    Route::post('/loyverse/webhook', [LoyverseController::class, 'webhook']);
});
