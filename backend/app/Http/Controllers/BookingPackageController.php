<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\BookingPackage;
use Illuminate\Http\Request;

class BookingPackageController extends Controller
{
    private function authorizeOperator(Request $request)
    {
        $user = auth('sanctum')->user() ?? $request->user();
        if ($user && !in_array($user->role, ['staff', 'admin', 'super_admin'])) {
            return [null, response()->json([
                'message' => 'Access Denied: Only Staff or Admin can edit booking packages.',
            ], 403)];
        }
        return [$user, null];
    }

    private function normalizeInclusions($raw): array
    {
        if (is_array($raw)) {
            return array_values(array_filter(array_map(fn ($item) => trim((string) $item), $raw), fn ($item) => $item !== ''));
        }
        if (is_string($raw)) {
            return array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $raw)), fn ($item) => $item !== ''));
        }
        return [];
    }

    public function index(Request $request)
    {
        BookingPackage::seedDefaultsIfEmpty();

        $query = BookingPackage::query();
        if (!$request->boolean('all')) {
            $query->where('is_active', true);
        }

        $packages = $query->orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();

        return response()->json($packages);
    }

    public function store(Request $request)
    {
        [$user, $denied] = $this->authorizeOperator($request);
        if ($denied) {
            return $denied;
        }

        BookingPackage::seedDefaultsIfEmpty();

        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'subtitle' => 'nullable|string|max:200',
            'badge' => 'nullable|string|max:60',
            'accent_color' => 'nullable|in:amber,rose,emerald,sky,purple',
            'price' => 'required|numeric|min:0|max:500000',
            'pricing_type' => 'required|in:per_pack,per_guest,flat',
            'base_pax' => 'nullable|integer|min:1|max:500',
            'option_label' => 'nullable|string|max:180',
            'description' => 'nullable|string|max:1000',
            'inclusions' => 'nullable',
            'image_url' => 'nullable|string',
            'show_in_banner' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0|max:999',
        ]);

        $imageUrl = isset($validated['image_url']) ? trim((string) $validated['image_url']) : null;
        if ($imageUrl === '') {
            $imageUrl = null;
        }

        $maxSort = (int) BookingPackage::max('sort_order');

        $package = BookingPackage::create([
            'slug' => BookingPackage::generateUniqueSlug($validated['name']),
            'name' => trim($validated['name']),
            'subtitle' => isset($validated['subtitle']) ? trim((string) $validated['subtitle']) : null,
            'badge' => isset($validated['badge']) && trim((string) $validated['badge']) !== ''
                ? trim((string) $validated['badge'])
                : strtoupper(trim($validated['name'])),
            'accent_color' => $validated['accent_color'] ?? 'amber',
            'price' => (float) $validated['price'],
            'pricing_type' => $validated['pricing_type'],
            'base_pax' => (int) ($validated['base_pax'] ?? ($validated['pricing_type'] === 'per_pack' ? 50 : 1)),
            'option_label' => isset($validated['option_label']) && trim((string) $validated['option_label']) !== ''
                ? trim((string) $validated['option_label'])
                : null,
            'description' => isset($validated['description']) ? trim((string) $validated['description']) : null,
            'inclusions' => $this->normalizeInclusions($request->input('inclusions')),
            'image_url' => $imageUrl,
            'show_in_banner' => $request->has('show_in_banner') ? $request->boolean('show_in_banner') : true,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : true,
            'sort_order' => $validated['sort_order'] ?? ($maxSort + 1),
            'updated_by' => $user?->name ?? 'Staff/Admin',
        ]);

        AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'Staff/Admin',
            'user_role' => $user?->role ?? 'staff',
            'action' => 'Booking Package Created',
            'details' => "Added booking package \"{$package->name}\" (₱" . number_format($package->price, 2) . ", {$package->pricing_type})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Booking package created successfully.',
            'package' => $package,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        [$user, $denied] = $this->authorizeOperator($request);
        if ($denied) {
            return $denied;
        }

        $package = BookingPackage::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:120',
            'subtitle' => 'nullable|string|max:200',
            'badge' => 'nullable|string|max:60',
            'accent_color' => 'nullable|in:amber,rose,emerald,sky,purple',
            'price' => 'sometimes|required|numeric|min:0|max:500000',
            'pricing_type' => 'sometimes|required|in:per_pack,per_guest,flat',
            'base_pax' => 'nullable|integer|min:1|max:500',
            'option_label' => 'nullable|string|max:180',
            'description' => 'nullable|string|max:1000',
            'inclusions' => 'nullable',
            'image_url' => 'nullable|string',
            'show_in_banner' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0|max:999',
        ]);

        $updateData = [];

        if (array_key_exists('name', $validated)) {
            $updateData['name'] = trim($validated['name']);
        }
        if (array_key_exists('subtitle', $validated)) {
            $updateData['subtitle'] = $validated['subtitle'] !== null ? trim((string) $validated['subtitle']) : null;
        }
        if (array_key_exists('badge', $validated)) {
            $updateData['badge'] = $validated['badge'] !== null && trim((string) $validated['badge']) !== ''
                ? trim((string) $validated['badge'])
                : null;
        }
        if (array_key_exists('accent_color', $validated)) {
            $updateData['accent_color'] = $validated['accent_color'] ?: 'amber';
        }
        if (array_key_exists('price', $validated)) {
            $updateData['price'] = (float) $validated['price'];
        }
        if (array_key_exists('pricing_type', $validated)) {
            $updateData['pricing_type'] = $validated['pricing_type'];
        }
        if (array_key_exists('base_pax', $validated)) {
            $updateData['base_pax'] = max(1, (int) ($validated['base_pax'] ?: 50));
        }
        if (array_key_exists('option_label', $validated)) {
            $opt = trim((string) ($validated['option_label'] ?? ''));
            $updateData['option_label'] = $opt !== '' ? $opt : null;
        }
        if (array_key_exists('description', $validated)) {
            $updateData['description'] = $validated['description'] !== null ? trim((string) $validated['description']) : null;
        }
        if ($request->has('inclusions')) {
            $updateData['inclusions'] = $this->normalizeInclusions($request->input('inclusions'));
        }
        if ($request->has('image_url')) {
            $img = trim((string) ($request->input('image_url') ?? ''));
            $updateData['image_url'] = $img !== '' ? $img : null;
        }
        if ($request->has('show_in_banner')) {
            $updateData['show_in_banner'] = $request->boolean('show_in_banner');
        }
        if ($request->has('is_active')) {
            $updateData['is_active'] = $request->boolean('is_active');
        }
        if (array_key_exists('sort_order', $validated) && $validated['sort_order'] !== null) {
            $updateData['sort_order'] = (int) $validated['sort_order'];
        }
        $updateData['updated_by'] = $user?->name ?? 'Staff/Admin';

        $package->update($updateData);

        AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'Staff/Admin',
            'user_role' => $user?->role ?? 'staff',
            'action' => 'Booking Package Updated',
            'details' => "Updated booking package \"{$package->name}\" (₱" . number_format($package->price, 2) . ", {$package->pricing_type})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Booking package updated successfully.',
            'package' => $package->fresh(),
        ]);
    }

    public function toggleActive(Request $request, $id)
    {
        [$user, $denied] = $this->authorizeOperator($request);
        if ($denied) {
            return $denied;
        }

        $package = BookingPackage::findOrFail($id);
        $package->is_active = !$package->is_active;
        $package->updated_by = $user?->name ?? 'Staff/Admin';
        $package->save();

        AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'Staff/Admin',
            'user_role' => $user?->role ?? 'staff',
            'action' => 'Booking Package Visibility Toggled',
            'details' => "Booking package \"{$package->name}\" marked " . ($package->is_active ? 'Active' : 'Hidden'),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Booking package visibility updated.',
            'package' => $package,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        [$user, $denied] = $this->authorizeOperator($request);
        if ($denied) {
            return $denied;
        }

        if (BookingPackage::count() <= 1) {
            return response()->json([
                'message' => 'Cannot delete the last remaining booking package.',
            ], 422);
        }

        $package = BookingPackage::findOrFail($id);
        $name = $package->name;
        $package->delete();

        AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'Staff/Admin',
            'user_role' => $user?->role ?? 'staff',
            'action' => 'Booking Package Deleted',
            'details' => "Deleted booking package \"{$name}\"",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Booking package \"{$name}\" deleted.",
        ]);
    }
}