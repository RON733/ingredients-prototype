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

// --- Public Endpoints ---
Route::post('/auth/login', [AuthController::class, 'login'])->name('login');
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::get('/auth/google/config', [AuthController::class, 'googleConfig']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/orders/active', [OrderController::class, 'activeOrder']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);

Route::get('/ingredients', [IngredientController::class, 'index']);
Route::get('/settings', [SystemController::class, 'settings']);
Route::post('/chatbot', [SystemController::class, 'chatbot']);
Route::post('/bookings', [EventBookingController::class, 'store']);

// --- Authenticated & Operational Endpoints ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // Orders Management
    Route::get('/orders', [OrderController::class, 'index']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::patch('/orders/{id}/verify-payment', [OrderController::class, 'verifyPayment']);

    // Ingredients & Kitchen Inventory Management (Prototype)
    Route::post('/ingredients', [IngredientController::class, 'store']);
    Route::put('/ingredients/{id}', [IngredientController::class, 'update']);
    Route::post('/ingredients/{id}/adjust', [IngredientController::class, 'quickAdjust']);
    Route::delete('/ingredients/{id}', [IngredientController::class, 'destroy']);

    // Menu / Product Management
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::patch('/products/{id}/toggle-availability', [ProductController::class, 'toggleAvailability']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Event Bookings
    Route::get('/bookings', [EventBookingController::class, 'index']);
    Route::patch('/bookings/{id}/status', [EventBookingController::class, 'updateStatus']);

    // Analytics (Owner / Admin Exclusive)
    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);

    // Super Admin Controls & Audit Trail
    Route::get('/users', [AuthController::class, 'listUsers']);
    Route::patch('/users/{id}', [AuthController::class, 'updateUserRole']);
    Route::post('/settings', [SystemController::class, 'updateSettings']);
    Route::get('/audit-logs', [SystemController::class, 'auditLogs']);
});

// Also provide unauthenticated operational endpoints for seamless local evaluation/testing if token header isn't passed
Route::prefix('v1')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::patch('/orders/{id}/verify-payment', [OrderController::class, 'verifyPayment']);
    Route::post('/ingredients', [IngredientController::class, 'store']);
    Route::put('/ingredients/{id}', [IngredientController::class, 'update']);
    Route::post('/ingredients/{id}/adjust', [IngredientController::class, 'quickAdjust']);
    Route::delete('/ingredients/{id}', [IngredientController::class, 'destroy']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::patch('/products/{id}/toggle-availability', [ProductController::class, 'toggleAvailability']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::get('/bookings', [EventBookingController::class, 'index']);
    Route::patch('/bookings/{id}/status', [EventBookingController::class, 'updateStatus']);
    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/users', [AuthController::class, 'listUsers']);
    Route::patch('/users/{id}', [AuthController::class, 'updateUserRole']);
    Route::post('/settings', [SystemController::class, 'updateSettings']);
    Route::get('/audit-logs', [SystemController::class, 'auditLogs']);
});
