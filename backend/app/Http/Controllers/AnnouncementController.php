<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Announcement;
use App\Models\AuditLog;

class AnnouncementController extends Controller
{
    /**
     * Get list of announcements.
     * Public gets active only, Admin can request ?all=1 to see drafts.
     */
    public function index(Request $request)
    {
        // Auto-seed defaults if table is empty
        if (Announcement::count() === 0) {
            Announcement::create([
                'title' => 'Taro & Matcha Cloud Series Launch',
                'badge' => 'New Menu',
                'badge_color' => 'purple',
                'description' => 'Try our freshly crafted Velvet Taro Sweet Milk Tea and Ceremonial Matcha Latte crowned with rich cream cheese foam. Available now in store and online delivery!',
                'image_url' => './assets/menu-coffee.png',
                'cta_text' => 'Order New Drinks',
                'cta_action' => 'menu',
                'is_active' => true,
                'priority' => 10,
                'created_by' => 'Store Manager',
            ]);

            Announcement::create([
                'title' => 'Weekend Fiesta: Free Loaded Fries on Orders ₱350+',
                'badge' => 'Limited Promo',
                'badge_color' => 'orange',
                'description' => 'Celebrate this weekend with G Shot Teas! Spend a minimum of ₱350 on any milk tea and burgers to automatically receive a complimentary box of warm Crispy Loaded Cheese Fries.',
                'image_url' => null, // Intentionally photo-free to demonstrate automatic typographic layout optimization!
                'cta_text' => 'Browse Menu & Claim',
                'cta_action' => 'menu',
                'is_active' => true,
                'priority' => 5,
                'created_by' => 'Admin',
            ]);
        }

        $query = Announcement::query();

        if (!$request->boolean('all')) {
            $query->where('is_active', true);
        }

        $announcements = $query->orderBy('priority', 'desc')->orderBy('created_at', 'desc')->get();

        return response()->json($announcements);
    }

    /**
     * Create a new announcement.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'badge' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:30',
            'description' => 'required|string',
            'image_url' => 'nullable|string', // Optional photo
            'cta_text' => 'nullable|string|max:50',
            'cta_action' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
            'priority' => 'nullable|integer',
        ]);

        $user = $request->user();
        $validated['created_by'] = $user?->name ?? 'Staff/Admin';
        $validated['is_active'] = $request->input('is_active', true);
        $validated['priority'] = $request->input('priority', 0);
        $validated['badge'] = $validated['badge'] ?: 'Promo';
        $validated['badge_color'] = $validated['badge_color'] ?: 'orange';

        $announcement = Announcement::create($validated);

        AuditLog::create([
            'user_name' => $user?->name ?? 'Staff/Admin',
            'user_role' => $user?->role ?? 'admin',
            'action' => 'Announcement Created',
            'details' => 'Published announcement: "' . $announcement->title . '" (' . ($announcement->image_url ? 'With Photo' : 'Text Only') . ')',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Announcement posted successfully.',
            'announcement' => $announcement
        ], 201);
    }

    /**
     * Show a single announcement.
     */
    public function show($id)
    {
        $announcement = Announcement::findOrFail($id);
        return response()->json($announcement);
    }

    /**
     * Update an announcement.
     */
    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'badge' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:30',
            'description' => 'sometimes|required|string',
            'image_url' => 'nullable|string',
            'cta_text' => 'nullable|string|max:50',
            'cta_action' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
            'priority' => 'nullable|integer',
        ]);

        // If client explicitly sets image_url to null or empty string, clear it
        if ($request->has('image_url') && empty($request->input('image_url'))) {
            $validated['image_url'] = null;
        }

        $announcement->update($validated);

        $user = $request->user();
        AuditLog::create([
            'user_name' => $user?->name ?? 'Staff/Admin',
            'user_role' => $user?->role ?? 'admin',
            'action' => 'Announcement Updated',
            'details' => 'Modified announcement: "' . $announcement->title . '"',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Announcement updated successfully.',
            'announcement' => $announcement
        ]);
    }

    /**
     * Toggle visibility (is_active).
     */
    public function toggleActive(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->is_active = !$announcement->is_active;
        $announcement->save();

        $user = $request->user();
        AuditLog::create([
            'user_name' => $user?->name ?? 'Staff/Admin',
            'user_role' => $user?->role ?? 'admin',
            'action' => 'Announcement Status Toggled',
            'details' => 'Toggled announcement "' . $announcement->title . '" to ' . ($announcement->is_active ? 'Active' : 'Inactive'),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Announcement status updated.',
            'is_active' => $announcement->is_active,
            'announcement' => $announcement
        ]);
    }

    /**
     * Delete an announcement.
     */
    public function destroy(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);
        $title = $announcement->title;
        $announcement->delete();

        $user = $request->user();
        AuditLog::create([
            'user_name' => $user?->name ?? 'Staff/Admin',
            'user_role' => $user?->role ?? 'admin',
            'action' => 'Announcement Deleted',
            'details' => 'Removed announcement: "' . $title . '"',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Announcement deleted successfully.'
        ]);
    }
}
