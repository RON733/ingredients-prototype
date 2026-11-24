<?php

namespace App\Services;

use App\Models\SystemSetting;

class SantaRosaDeliveryService
{
    public const STORE_LAT = 14.3167;
    public const STORE_LNG = 121.1167;

    /**
     * Default 9 supported delivery Barangays of Santa Rosa, Laguna with aliases,
     * approximate centroid coordinates, and estimated delivery times from
     * the store in Brgy. Sinalhan, Santa Rosa, Laguna.
     */
    public const BARANGAYS = [
        [
            'id' => 'aplaya',
            'name' => 'Aplaya',
            'aliases' => ['aplaya'],
            'lat' => 14.3292,
            'lng' => 121.1273,
            'eta' => '20–30 Mins',
        ],
        [
            'id' => 'caingin',
            'name' => 'Caingin',
            'aliases' => ['caingin'],
            'lat' => 14.3262,
            'lng' => 121.1172,
            'eta' => '20–30 Mins',
        ],
        [
            'id' => 'ibaba',
            'name' => 'Ibaba',
            'aliases' => ['ibaba'],
            'lat' => 14.3190,
            'lng' => 121.1120,
            'eta' => '15–25 Mins',
        ],
        [
            'id' => 'kanluran',
            'name' => 'Kanluran (Poblacion Uno)',
            'aliases' => [
                'kanluran (poblacion uno)',
                'kanluran',
                'poblacion uno',
                'poblacion 1',
                'poblacion i',
                'pob uno',
                'pob. uno',
            ],
            'lat' => 14.3175,
            'lng' => 121.1105,
            'eta' => '15–25 Mins',
        ],
        [
            'id' => 'labas',
            'name' => 'Labas',
            'aliases' => ['labas'],
            'lat' => 14.3045,
            'lng' => 121.1167,
            'eta' => '20–30 Mins',
        ],
        [
            'id' => 'malusak',
            'name' => 'Malusak (Poblacion Dos)',
            'aliases' => [
                'malusak (poblacion dos)',
                'malusak',
                'poblacion dos',
                'poblacion 2',
                'poblacion ii',
                'pob dos',
                'pob. dos',
            ],
            'lat' => 14.3160,
            'lng' => 121.1145,
            'eta' => '15–25 Mins',
        ],
        [
            'id' => 'market-area',
            'name' => 'Market Area (Poblacion Tres)',
            'aliases' => [
                'market area (poblacion tres)',
                'market area',
                'poblacion tres',
                'poblacion 3',
                'poblacion iii',
                'pob tres',
                'pob. tres',
            ],
            'lat' => 14.3150,
            'lng' => 121.1120,
            'eta' => '15–25 Mins',
        ],
        [
            'id' => 'sinalhan',
            'name' => 'Sinalhan',
            'aliases' => ['sinalhan'],
            'lat' => 14.3167,
            'lng' => 121.1111,
            'eta' => '15–20 Mins',
        ],
        [
            'id' => 'tagapo',
            'name' => 'Tagapo',
            'aliases' => ['tagapo'],
            'lat' => 14.3101,
            'lng' => 121.1035,
            'eta' => '20–30 Mins',
        ],
    ];

    /**
     * Known additional Santa Rosa barangays (used for auto-filling coordinates & aliases when added by the owner).
     */
    public const KNOWN_ADDITIONAL_BARANGAYS = [
        'balibago' => ['name' => 'Balibago', 'aliases' => ['balibago', 'balibago complex'], 'lat' => 14.2934, 'lng' => 121.1082, 'eta' => '25–35 Mins'],
        'dila' => ['name' => 'Dila', 'aliases' => ['dila'], 'lat' => 14.2896, 'lng' => 121.1162, 'eta' => '25–35 Mins'],
        'dita' => ['name' => 'Dita', 'aliases' => ['dita'], 'lat' => 14.2775, 'lng' => 121.1165, 'eta' => '30–40 Mins'],
        'don-jose' => ['name' => 'Don Jose', 'aliases' => ['don jose', 'nuvali'], 'lat' => 14.2450, 'lng' => 121.0600, 'eta' => '35–50 Mins'],
        'macabling' => ['name' => 'Macabling', 'aliases' => ['macabling'], 'lat' => 14.2968, 'lng' => 121.1010, 'eta' => '25–35 Mins'],
        'malitlit' => ['name' => 'Malitlit', 'aliases' => ['malitlit'], 'lat' => 14.2680, 'lng' => 121.0960, 'eta' => '30–45 Mins'],
        'pooc' => ['name' => 'Pooc', 'aliases' => ['pooc', 'pook'], 'lat' => 14.3030, 'lng' => 121.1235, 'eta' => '25–35 Mins'],
        'pulong-santa-cruz' => ['name' => 'Pulong Santa Cruz', 'aliases' => ['pulong santa cruz', 'pulong sta. cruz', 'pulong sta cruz'], 'lat' => 14.2805, 'lng' => 121.0870, 'eta' => '30–40 Mins'],
        'santo-domingo' => ['name' => 'Santo Domingo', 'aliases' => ['santo domingo', 'sto. domingo', 'sto domingo'], 'lat' => 14.2620, 'lng' => 121.0720, 'eta' => '35–45 Mins'],
    ];

    /**
     * Other Santa Rosa barangays outside our default delivery coverage so GPS reverse-geocoding
     * does not snap them to a neighboring supported barangay unless explicitly enabled by the owner.
     */
    private const UNSUPPORTED_SANTA_ROSA_BARANGAYS = [
        'balibago complex',
        'balibago',
        'dila',
        'dita',
        'don jose',
        'nuvali',
        'macabling',
        'malitlit',
        'pooc',
        'pook',
        'pulong santa cruz',
        'pulong sta. cruz',
        'pulong sta cruz',
        'santo domingo',
        'sto. domingo',
        'sto domingo',
    ];

    /**
     * Neighboring and major PH cities/municipalities that must be rejected
     * even if a street or barangay shares a common name (e.g. Aplaya in Calamba, Santo Domingo in Biñan).
     */
    private const OUTSIDE_CITIES = [
        'Biñan' => ['biñan', 'binan'],
        'Cabuyao' => ['cabuyao'],
        'Calamba' => ['calamba'],
        'San Pedro' => ['san pedro'],
        'Carmona' => ['carmona'],
        'Silang' => ['silang'],
        'Tagaytay' => ['tagaytay'],
        'Los Baños' => ['los baños', 'los banos'],
        'San Pablo' => ['san pablo'],
        'Muntinlupa' => ['muntinlupa', 'alabang'],
        'Las Piñas' => ['las piñas', 'las pinas'],
        'Parañaque' => ['parañaque', 'paranaque'],
        'Makati' => ['makati'],
        'Manila' => ['metro manila', 'city of manila', 'manila'],
        'Quezon City' => ['quezon city'],
        'Pasay' => ['pasay'],
        'Pasig' => ['pasig'],
        'Taguig' => ['taguig', 'bgc'],
        'Bacoor' => ['bacoor'],
        'Imus' => ['imus'],
        'Dasmariñas' => ['dasmariñas', 'dasmarinas'],
        'General Trias' => ['general trias'],
        'Cavite' => ['cavite'],
        'Batangas' => ['batangas'],
        'Rizal' => ['rizal province', 'province of rizal'],
        'Bulacan' => ['bulacan'],
    ];

    public static function slugifyId(string $name): string
    {
        $slug = mb_strtolower(trim($name));
        $slug = preg_replace('/[^a-z0-9]+/i', '-', $slug);
        return trim((string) $slug, '-') ?: ('brgy-' . substr(md5($name), 0, 6));
    }

    public static function normalizeBarangayList(array $items): array
    {
        $knownCatalog = [];
        foreach (self::BARANGAYS as $b) {
            $knownCatalog[$b['id']] = $b;
        }
        foreach (self::KNOWN_ADDITIONAL_BARANGAYS as $id => $b) {
            $knownCatalog[$id] = array_merge(['id' => $id], $b);
        }

        $normalized = [];
        $seenIds = [];

        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }
            $name = trim((string) ($item['name'] ?? ''));
            if ($name === '') {
                continue;
            }
            $id = trim((string) ($item['id'] ?? ''));
            $id = $id === '' ? self::slugifyId($name) : self::slugifyId($id);
            if (isset($seenIds[$id])) {
                continue;
            }
            $seenIds[$id] = true;

            $known = $knownCatalog[$id] ?? null;

            $aliases = [];
            if (!empty($item['aliases']) && is_array($item['aliases'])) {
                foreach ($item['aliases'] as $a) {
                    $aTrim = mb_strtolower(trim((string) $a));
                    if ($aTrim !== '') {
                        $aliases[] = $aTrim;
                    }
                }
            }
            $nameLower = mb_strtolower($name);
            if (!in_array($nameLower, $aliases, true)) {
                array_unshift($aliases, $nameLower);
            }
            if ($known && !empty($known['aliases'])) {
                foreach ($known['aliases'] as $ka) {
                    if (!in_array($ka, $aliases, true)) {
                        $aliases[] = $ka;
                    }
                }
            }
            $aliases = array_values(array_unique($aliases));

            $lat = isset($item['lat']) && is_numeric($item['lat']) && (float) $item['lat'] != 0.0
                ? (float) $item['lat']
                : ($known['lat'] ?? self::STORE_LAT);
            $lng = isset($item['lng']) && is_numeric($item['lng']) && (float) $item['lng'] != 0.0
                ? (float) $item['lng']
                : ($known['lng'] ?? self::STORE_LNG);
            $eta = trim((string) ($item['eta'] ?? ''));
            if ($eta === '') {
                $eta = $known['eta'] ?? '20–30 Mins';
            }

            $normalized[] = [
                'id' => $id,
                'name' => $name,
                'aliases' => $aliases,
                'lat' => $lat,
                'lng' => $lng,
                'eta' => $eta,
            ];
        }

        return $normalized;
    }

    public static function getSupportedBarangays(): array
    {
        try {
            $raw = SystemSetting::where('key', 'delivery_barangays')->value('value');
            if ($raw !== null && trim((string) $raw) !== '') {
                $decoded = json_decode((string) $raw, true);
                if (is_array($decoded)) {
                    return self::normalizeBarangayList($decoded);
                }
            }
        } catch (\Throwable $e) {
            // Fallback to defaults if DB is unavailable
        }

        return self::BARANGAYS;
    }

    public static function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadiusKm = 6371.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2)
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
            * sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadiusKm * $c;
    }

    public static function detectOutsideCity(?string $text): ?string
    {
        $normalized = mb_strtolower(trim((string) $text));
        if ($normalized === '') {
            return null;
        }

        // Strip Santa Rosa street names like "Manila South Road" before checking outside cities
        $cleaned = preg_replace('/\bmanila\s+south\s+(road|rd|highway|hwy)\b/iu', '', $normalized);

        foreach (self::OUTSIDE_CITIES as $label => $patterns) {
            foreach ($patterns as $pattern) {
                $regex = '/(?<![\p{L}\p{N}])' . preg_quote($pattern, '/') . '(?![\p{L}\p{N}])(?!\s+(?:st|street|rd|road|ave|avenue|blvd|boulevard|dr|drive|ext|lane|south)\b)/iu';
                if (preg_match($regex, $cleaned)) {
                    return $label;
                }
            }
        }

        return null;
    }

    public static function hasUnsupportedSantaRosaBarangay(?string $text, ?array $barangays = null): bool
    {
        $normalized = preg_replace('/\s+/u', ' ', mb_strtolower(trim((string) $text)));
        if ($normalized === '') {
            return false;
        }

        $activeBarangays = $barangays ?? self::getSupportedBarangays();
        $activeAliases = [];
        foreach ($activeBarangays as $b) {
            $activeAliases[] = mb_strtolower($b['name']);
            foreach ($b['aliases'] ?? [] as $a) {
                $activeAliases[] = mb_strtolower($a);
            }
        }

        foreach (self::UNSUPPORTED_SANTA_ROSA_BARANGAYS as $term) {
            if (in_array(mb_strtolower($term), $activeAliases, true)) {
                continue;
            }
            $regex = '/(?<![\p{L}\p{N}])' . preg_quote($term, '/') . '(?![\p{L}\p{N}])/iu';
            if (preg_match($regex, $normalized)) {
                return true;
            }
        }

        return false;
    }

    public static function isWithinSantaRosaBounds(float $lat, float $lng, ?array $barangays = null): bool
    {
        if ($lat < 14.210 || $lat > 14.345 || $lng < 121.030 || $lng > 121.145) {
            return false;
        }

        $nearest = self::nearestBarangay($lat, $lng, $barangays);
        return $nearest !== null && $nearest['distance_km'] <= 1.8;
    }

    public static function nearestBarangay(float $lat, float $lng, ?array $barangays = null): ?array
    {
        $list = $barangays ?? self::getSupportedBarangays();
        $closest = null;
        $minKm = PHP_FLOAT_MAX;

        foreach ($list as $barangay) {
            $km = self::haversineKm($lat, $lng, (float) $barangay['lat'], (float) $barangay['lng']);
            if ($km < $minKm) {
                $minKm = $km;
                $closest = $barangay;
            }
        }

        if ($closest === null) {
            return null;
        }

        $closest['distance_km'] = round($minKm, 2);
        return $closest;
    }

    public static function detectFromText(?string $address, ?array $barangays = null): array
    {
        $raw = trim((string) $address);
        if ($raw === '') {
            return [
                'matched' => false,
                'reason' => 'empty',
                'barangay' => null,
                'outside_city' => null,
            ];
        }

        $outsideCity = self::detectOutsideCity($raw);
        if ($outsideCity !== null) {
            return [
                'matched' => false,
                'reason' => 'outside_city',
                'barangay' => null,
                'outside_city' => $outsideCity,
            ];
        }

        $list = $barangays ?? self::getSupportedBarangays();
        $normalized = preg_replace('/\s+/u', ' ', mb_strtolower($raw));

        $candidates = [];
        foreach ($list as $barangay) {
            foreach ($barangay['aliases'] ?? [mb_strtolower($barangay['name'])] as $alias) {
                $candidates[] = [
                    'alias' => $alias,
                    'len' => mb_strlen($alias),
                    'barangay' => $barangay,
                ];
            }
        }
        usort($candidates, fn ($a, $b) => $b['len'] <=> $a['len']);

        foreach ($candidates as $candidate) {
            $regex = '/(?<![\p{L}\p{N}])' . preg_quote($candidate['alias'], '/') . '(?![\p{L}\p{N}])/iu';
            if (preg_match($regex, $normalized)) {
                return [
                    'matched' => true,
                    'reason' => null,
                    'source' => 'text',
                    'barangay' => $candidate['barangay'],
                    'outside_city' => null,
                ];
            }
        }

        return [
            'matched' => false,
            'reason' => 'not_in_list',
            'barangay' => null,
            'outside_city' => null,
        ];
    }

    public static function detectFromCoordinates(
        float $lat,
        float $lng,
        ?string $resolvedAddress = null,
        ?string $detectedCity = null,
        ?array $barangays = null
    ): array {
        $list = $barangays ?? self::getSupportedBarangays();

        $outsideCity = self::detectOutsideCity($detectedCity) ?? self::detectOutsideCity($resolvedAddress);
        if ($outsideCity !== null) {
            return [
                'matched' => false,
                'reason' => 'outside_city',
                'barangay' => null,
                'outside_city' => $outsideCity,
            ];
        }

        if ($resolvedAddress) {
            $textMatch = self::detectFromText($resolvedAddress, $list);
            if ($textMatch['matched']) {
                return $textMatch;
            }
            if (self::hasUnsupportedSantaRosaBarangay($resolvedAddress, $list)) {
                return [
                    'matched' => false,
                    'reason' => 'not_in_list',
                    'barangay' => null,
                    'outside_city' => null,
                ];
            }
        }

        $cityNormalized = mb_strtolower(trim((string) $detectedCity));
        $cityIsNonSantaRosa = $cityNormalized !== ''
            && !str_contains($cityNormalized, 'santa rosa')
            && !str_contains($cityNormalized, 'sta. rosa')
            && !str_contains($cityNormalized, 'sta rosa');

        if ($cityIsNonSantaRosa || !self::isWithinSantaRosaBounds($lat, $lng, $list)) {
            return [
                'matched' => false,
                'reason' => 'outside_area',
                'barangay' => null,
                'outside_city' => $cityIsNonSantaRosa ? $detectedCity : null,
            ];
        }

        $nearest = self::nearestBarangay($lat, $lng, $list);
        if ($nearest !== null && $nearest['distance_km'] <= 1.8) {
            return [
                'matched' => true,
                'reason' => null,
                'source' => 'gps',
                'barangay' => $nearest,
                'outside_city' => null,
            ];
        }

        return [
            'matched' => false,
            'reason' => 'outside_area',
            'barangay' => null,
            'outside_city' => null,
        ];
    }

    private static function formatBarangayListText(array $list): string
    {
        $names = array_map(fn ($b) => $b['name'], $list);
        $count = count($names);
        if ($count === 0) {
            return '';
        }
        if ($count === 1) {
            return $names[0];
        }
        if ($count === 2) {
            return $names[0] . ' or ' . $names[1];
        }
        $last = array_pop($names);
        return implode(', ', $names) . ', or ' . $last;
    }

    public static function rejectionMessage(array $detection, ?array $barangays = null): string
    {
        if (($detection['reason'] ?? null) === 'empty') {
            return 'Delivery address is required for Delivery orders.';
        }

        $list = $barangays ?? self::getSupportedBarangays();
        $count = count($list);
        if ($count === 0) {
            return 'Delivery rejected: Delivery is currently unavailable because no supported barangays are configured.';
        }

        $listText = self::formatBarangayListText($list);

        if (($detection['reason'] ?? null) === 'outside_city' && !empty($detection['outside_city'])) {
            return "Delivery rejected: {$detection['outside_city']} is outside our delivery area. We only deliver to {$listText} in Santa Rosa, Laguna.";
        }

        $plural = $count === 1 ? 'barangay' : 'barangays';
        return "Delivery rejected: Please enter or pin an address within our {$count} supported Santa Rosa {$plural} ({$listText}).";
    }
}
