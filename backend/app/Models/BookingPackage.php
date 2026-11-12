<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BookingPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'subtitle',
        'badge',
        'accent_color',
        'price',
        'pricing_type',
        'base_pax',
        'option_label',
        'description',
        'inclusions',
        'image_url',
        'show_in_banner',
        'is_active',
        'sort_order',
        'updated_by',
    ];

    protected $casts = [
        'price' => 'float',
        'base_pax' => 'integer',
        'inclusions' => 'array',
        'show_in_banner' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public static function defaultPackages(): array
    {
        return [
            [
                'slug' => 'coffee-package',
                'name' => 'Coffee Package',
                'subtitle' => 'Featuring Coldbrew & Signature Artisan Brews',
                'badge' => '☕ COFFEE PACKAGE',
                'accent_color' => 'amber',
                'price' => 3500,
                'pricing_type' => 'per_pack',
                'base_pax' => 50,
                'option_label' => 'Coffee Package (₱3,500 • 50 cups 12oz • 5 choices • 3 hrs)',
                'description' => 'Includes: 50 cups of 12oz, 3 hours of on-site service, 5 choices of drinks (Coldbrew & specialty blends), and trained barista staff.',
                'inclusions' => [
                    '50 Cups of 12oz servings',
                    '3 Hours of Service with on-site barista staff',
                    '5 Choices of Drinks (Coldbrew & Specialty Coffee selections)',
                ],
                'image_url' => '/assets/booking-coffee-package.jpg',
                'show_in_banner' => true,
                'is_active' => true,
                'sort_order' => 1,
                'updated_by' => 'System Default',
            ],
            [
                'slug' => 'fruity-float-package',
                'name' => 'Fruity Float Package',
                'subtitle' => 'Featuring Sparkling Sodas & Ice Cream Floats',
                'badge' => '🍹 FRUITY FLOAT PACKAGE',
                'accent_color' => 'rose',
                'price' => 3500,
                'pricing_type' => 'per_pack',
                'base_pax' => 50,
                'option_label' => 'Fruity Float Package (₱3,500 • 50 cups 16oz • 7 choices • 3 hrs)',
                'description' => 'Includes: 50 cups of 16oz, 3 hours of on-site service, 7 choices of drinks (Sparkling sodas & ice cream fruity floats), and trained barista staff.',
                'inclusions' => [
                    '50 Cups of 16oz servings (larger size!)',
                    '3 Hours of Service with on-site barista staff',
                    '7 Choices of Drinks (Fruity float & sparkling refreshers)',
                ],
                'image_url' => '/assets/booking-fruity-float.jpg',
                'show_in_banner' => true,
                'is_active' => true,
                'sort_order' => 2,
                'updated_by' => 'System Default',
            ],
            [
                'slug' => 'mobile-bar-milktea-booth',
                'name' => 'Mobile Bar & Milktea Booth',
                'subtitle' => 'Custom Event & Mobile Bar Booth',
                'badge' => '🧋 MOBILE BAR BOOTH',
                'accent_color' => 'amber',
                'price' => 95,
                'pricing_type' => 'per_guest',
                'base_pax' => 1,
                'option_label' => 'Custom Mobile Bar & Milktea Booth',
                'description' => 'Includes custom milk tea & snack booth setup, drink cups, straws, pearls, and on-site staff. Transpo fee varies by location.',
                'inclusions' => [
                    'Custom milk tea & drink bar setup',
                    'Cups, straws, pearls & sinkers included',
                    'On-site trained service staff',
                ],
                'image_url' => null,
                'show_in_banner' => false,
                'is_active' => true,
                'sort_order' => 3,
                'updated_by' => 'System Default',
            ],
            [
                'slug' => 'comfort-food-catering',
                'name' => 'Comfort Food Catering',
                'subtitle' => 'Burgers & Pizza Party Catering',
                'badge' => '🍔 FOOD CATERING',
                'accent_color' => 'emerald',
                'price' => 95,
                'pricing_type' => 'per_guest',
                'base_pax' => 1,
                'option_label' => 'Comfort Food Catering (Burgers & Pizza)',
                'description' => 'Includes freshly prepared burgers, pizzas, and party food packs with serving setup. Transpo fee varies by location.',
                'inclusions' => [
                    'Freshly grilled burgers & artisan pizzas',
                    'Party food packaging & serving setup',
                    'Dedicated event coordination',
                ],
                'image_url' => null,
                'show_in_banner' => false,
                'is_active' => true,
                'sort_order' => 4,
                'updated_by' => 'System Default',
            ],
            [
                'slug' => 'bulk-order-delivery',
                'name' => 'Bulk Order Delivery',
                'subtitle' => 'Bulk Party Pack Delivery',
                'badge' => '📦 BULK PARTY PACK',
                'accent_color' => 'sky',
                'price' => 95,
                'pricing_type' => 'per_guest',
                'base_pax' => 1,
                'option_label' => 'Bulk Party Pack Delivery',
                'description' => 'Includes bulk drink and snack party packs delivered straight to your venue. Delivery fee varies by location.',
                'inclusions' => [
                    'Bulk milk tea, coffee & snack packs',
                    'Individually sealed & labeled cups',
                    'Scheduled venue delivery',
                ],
                'image_url' => null,
                'show_in_banner' => false,
                'is_active' => true,
                'sort_order' => 5,
                'updated_by' => 'System Default',
            ],
        ];
    }

    public static function seedDefaultsIfEmpty(): void
    {
        if (static::count() === 0) {
            foreach (static::defaultPackages() as $pkg) {
                static::create($pkg);
            }
        }
    }

    public static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'booking-package';
        $slug = $base;
        $counter = 2;

        while (
            static::where('slug', $slug)
                ->when($ignoreId !== null, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    public function computeEstimatedCost(int $guestCount): float
    {
        $guests = max(1, $guestCount);
        $price = max(0.0, (float) $this->price);

        if ($this->pricing_type === 'flat') {
            return round($price, 2);
        }

        if ($this->pricing_type === 'per_guest') {
            return round($guests * $price, 2);
        }

        $packSize = max(1, (int) ($this->base_pax ?: 50));
        $units = max(1, (int) ceil($guests / $packSize));

        return round($units * $price, 2);
    }

    public static function findMatchingPackage(?int $packageId = null, ?string $eventType = null, ?string $packageName = null): ?self
    {
        if ($packageId) {
            $byId = static::find($packageId);
            if ($byId) {
                return $byId;
            }
        }

        $candidates = array_filter([
            trim((string) $eventType),
            trim((string) $packageName),
        ]);

        if (empty($candidates)) {
            return null;
        }

        $packages = static::orderBy('sort_order')->orderBy('id')->get();

        foreach ($candidates as $candidate) {
            $lower = mb_strtolower($candidate);
            foreach ($packages as $pkg) {
                $pkgNameLower = mb_strtolower($pkg->name);
                $optLabelLower = mb_strtolower((string) $pkg->option_label);
                if (
                    $lower === $pkgNameLower ||
                    ($optLabelLower !== '' && $lower === $optLabelLower) ||
                    str_starts_with($lower, $pkgNameLower) ||
                    str_contains($lower, $pkgNameLower)
                ) {
                    return $pkg;
                }
            }
        }

        return null;
    }
}