<?php

namespace App\Services;

class SantaRosaDeliveryService
{
    public const STORE_LAT = 14.3167;
    public const STORE_LNG = 121.1167;

    /**
     * Hardcoded 6 supported delivery Barangays of Santa Rosa, Laguna with aliases,
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
            'id' => 'tagapo',
            'name' => 'Tagapo',
            'aliases' => ['tagapo'],
            'lat' => 14.3101,
            'lng' => 121.1035,
            'eta' => '20–30 Mins',
        ],
    ];

    /**
     * Other Santa Rosa barangays outside our delivery coverage so GPS reverse-geocoding
     * does not snap them to a neighboring supported barangay.
     */
    private const UNSUPPORTED_SANTA_ROSA_BARANGAYS = [
        'balibago complex',
        'balibago',
        'dila',
        'dita',
        'don jose',
        'nuvali',
        'ibaba',
        'labas',
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
        'sinalhan',
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

    public static function hasUnsupportedSantaRosaBarangay(?string $text): bool
    {
        $normalized = preg_replace('/\s+/u', ' ', mb_strtolower(trim((string) $text)));
        if ($normalized === '') {
            return false;
        }

        foreach (self::UNSUPPORTED_SANTA_ROSA_BARANGAYS as $term) {
            $regex = '/(?<![\p{L}\p{N}])' . preg_quote($term, '/') . '(?![\p{L}\p{N}])/iu';
            if (preg_match($regex, $normalized)) {
                return true;
            }
        }

        return false;
    }

    public static function isWithinSantaRosaBounds(float $lat, float $lng): bool
    {
        if ($lat < 14.300 || $lat > 14.338 || $lng < 121.095 || $lng > 121.136) {
            return false;
        }

        $nearest = self::nearestBarangay($lat, $lng);
        return $nearest !== null && $nearest['distance_km'] <= 1.8;
    }

    public static function nearestBarangay(float $lat, float $lng): ?array
    {
        $closest = null;
        $minKm = PHP_FLOAT_MAX;

        foreach (self::BARANGAYS as $barangay) {
            $km = self::haversineKm($lat, $lng, $barangay['lat'], $barangay['lng']);
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

    public static function detectFromText(?string $address): array
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

        $normalized = preg_replace('/\s+/u', ' ', mb_strtolower($raw));

        $candidates = [];
        foreach (self::BARANGAYS as $barangay) {
            foreach ($barangay['aliases'] as $alias) {
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
        ?string $detectedCity = null
    ): array {
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
            $textMatch = self::detectFromText($resolvedAddress);
            if ($textMatch['matched']) {
                return $textMatch;
            }
            if (self::hasUnsupportedSantaRosaBarangay($resolvedAddress)) {
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

        if ($cityIsNonSantaRosa || !self::isWithinSantaRosaBounds($lat, $lng)) {
            return [
                'matched' => false,
                'reason' => 'outside_area',
                'barangay' => null,
                'outside_city' => $cityIsNonSantaRosa ? $detectedCity : null,
            ];
        }

        $nearest = self::nearestBarangay($lat, $lng);
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

    public static function rejectionMessage(array $detection): string
    {
        if (($detection['reason'] ?? null) === 'outside_city' && !empty($detection['outside_city'])) {
            return "Delivery rejected: {$detection['outside_city']} is outside our delivery area. We only deliver to Aplaya, Caingin, Kanluran (Poblacion Uno), Malusak (Poblacion Dos), Market Area (Poblacion Tres), and Tagapo in Santa Rosa, Laguna.";
        }

        if (($detection['reason'] ?? null) === 'empty') {
            return 'Delivery address is required for Delivery orders.';
        }

        return 'Delivery rejected: Please enter or pin an address within our 6 supported Santa Rosa barangays (Aplaya, Caingin, Kanluran (Poblacion Uno), Malusak (Poblacion Dos), Market Area (Poblacion Tres), or Tagapo).';
    }
}