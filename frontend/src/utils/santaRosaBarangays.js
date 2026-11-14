/**
 * Hardcoded 18 Barangays of Santa Rosa, Laguna with aliases,
 * approximate centroid coordinates, and estimated delivery times from
 * the store in Brgy. Sinalhan, Santa Rosa, Laguna.
 */
export const SANTA_ROSA_BARANGAYS = [
  {
    id: 'aplaya',
    name: 'Aplaya',
    aliases: ['aplaya'],
    lat: 14.3292,
    lng: 121.1273,
    eta: '20–30 Mins',
  },
  {
    id: 'balibago',
    name: 'Balibago',
    aliases: ['balibago', 'balibago complex'],
    lat: 14.2934,
    lng: 121.1082,
    eta: '25–35 Mins',
  },
  {
    id: 'caingin',
    name: 'Caingin',
    aliases: ['caingin'],
    lat: 14.3262,
    lng: 121.1172,
    eta: '20–30 Mins',
  },
  {
    id: 'dila',
    name: 'Dila',
    aliases: ['dila'],
    lat: 14.3005,
    lng: 121.1070,
    eta: '25–35 Mins',
  },
  {
    id: 'dita',
    name: 'Dita',
    aliases: ['dita'],
    lat: 14.2885,
    lng: 121.1020,
    eta: '30–40 Mins',
  },
  {
    id: 'don-jose',
    name: 'Don Jose',
    aliases: ['don jose', 'nuvali'],
    lat: 14.2415,
    lng: 121.0583,
    eta: '40–55 Mins',
  },
  {
    id: 'ibaba',
    name: 'Ibaba',
    aliases: ['ibaba'],
    lat: 14.3190,
    lng: 121.1120,
    eta: '15–25 Mins',
  },
  {
    id: 'kanluran',
    name: 'Kanluran (Poblacion Uno)',
    aliases: [
      'kanluran (poblacion uno)',
      'kanluran',
      'poblacion uno',
      'poblacion 1',
      'poblacion i',
      'pob uno',
      'pob. uno',
    ],
    lat: 14.3175,
    lng: 121.1105,
    eta: '15–25 Mins',
  },
  {
    id: 'labas',
    name: 'Labas',
    aliases: ['labas'],
    lat: 14.3045,
    lng: 121.1167,
    eta: '20–30 Mins',
  },
  {
    id: 'macabling',
    name: 'Macabling',
    aliases: ['macabling'],
    lat: 14.3023,
    lng: 121.0965,
    eta: '25–35 Mins',
  },
  {
    id: 'malitlit',
    name: 'Malitlit',
    aliases: ['malitlit'],
    lat: 14.2750,
    lng: 121.0880,
    eta: '35–45 Mins',
  },
  {
    id: 'malusak',
    name: 'Malusak (Poblacion Dos)',
    aliases: [
      'malusak (poblacion dos)',
      'malusak',
      'poblacion dos',
      'poblacion 2',
      'poblacion ii',
      'pob dos',
      'pob. dos',
    ],
    lat: 14.3160,
    lng: 121.1145,
    eta: '15–25 Mins',
  },
  {
    id: 'market-area',
    name: 'Market Area (Poblacion Tres)',
    aliases: [
      'market area (poblacion tres)',
      'market area',
      'poblacion tres',
      'poblacion 3',
      'poblacion iii',
      'pob tres',
      'pob. tres',
    ],
    lat: 14.3150,
    lng: 121.1120,
    eta: '15–25 Mins',
  },
  {
    id: 'pooc',
    name: 'Pooc (Pook)',
    aliases: ['pooc (pook)', 'pooc', 'pook'],
    lat: 14.3083,
    lng: 121.1189,
    eta: '20–30 Mins',
  },
  {
    id: 'pulong-santa-cruz',
    name: 'Pulong Santa Cruz',
    aliases: ['pulong santa cruz', 'pulong sta. cruz', 'pulong sta cruz'],
    lat: 14.2880,
    lng: 121.0850,
    eta: '30–45 Mins',
  },
  {
    id: 'santo-domingo',
    name: 'Santo Domingo',
    aliases: ['santo domingo', 'sto. domingo', 'sto domingo'],
    lat: 14.2541,
    lng: 121.0620,
    eta: '40–55 Mins',
  },
  {
    id: 'sinalhan',
    name: 'Sinalhan',
    aliases: ['sinalhan'],
    lat: 14.3167,
    lng: 121.1111,
    eta: '15–20 Mins',
  },
  {
    id: 'tagapo',
    name: 'Tagapo',
    aliases: ['tagapo'],
    lat: 14.3101,
    lng: 121.1035,
    eta: '20–30 Mins',
  },
];

const OUTSIDE_CITIES = [
  { label: 'Biñan', patterns: ['biñan', 'binan'] },
  { label: 'Cabuyao', patterns: ['cabuyao'] },
  { label: 'Calamba', patterns: ['calamba'] },
  { label: 'San Pedro', patterns: ['san pedro'] },
  { label: 'Carmona', patterns: ['carmona'] },
  { label: 'Silang', patterns: ['silang'] },
  { label: 'Tagaytay', patterns: ['tagaytay'] },
  { label: 'Los Baños', patterns: ['los baños', 'los banos'] },
  { label: 'San Pablo', patterns: ['san pablo'] },
  { label: 'Muntinlupa', patterns: ['muntinlupa', 'alabang'] },
  { label: 'Las Piñas', patterns: ['las piñas', 'las pinas'] },
  { label: 'Parañaque', patterns: ['parañaque', 'paranaque'] },
  { label: 'Makati', patterns: ['makati'] },
  { label: 'Manila', patterns: ['metro manila', 'city of manila', 'manila'] },
  { label: 'Quezon City', patterns: ['quezon city'] },
  { label: 'Pasay', patterns: ['pasay'] },
  { label: 'Pasig', patterns: ['pasig'] },
  { label: 'Taguig', patterns: ['taguig', 'bgc'] },
  { label: 'Bacoor', patterns: ['bacoor'] },
  { label: 'Imus', patterns: ['imus'] },
  { label: 'Dasmariñas', patterns: ['dasmariñas', 'dasmarinas'] },
  { label: 'General Trias', patterns: ['general trias'] },
  { label: 'Cavite', patterns: ['cavite'] },
  { label: 'Batangas', patterns: ['batangas'] },
  { label: 'Rizal', patterns: ['rizal province', 'province of rizal'] },
  { label: 'Bulacan', patterns: ['bulacan'] },
];

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasWholeTerm = (text, term) => {
  const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(term)}(?![\\p{L}\\p{N}])`, 'iu');
  return regex.test(text);
};

// Pre-sorted longest-first alias list so multi-word names match before short tokens
const SORTED_ALIAS_CANDIDATES = SANTA_ROSA_BARANGAYS.flatMap((barangay) =>
  barangay.aliases.map((alias) => ({ alias, len: alias.length, barangay }))
).sort((a, b) => b.len - a.len);

export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371.0;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const detectOutsideCity = (text) => {
  const normalized = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\bmanila\s+south\s+(road|rd|highway|hwy)\b/giu, '');
  if (!normalized) return null;
  for (const entry of OUTSIDE_CITIES) {
    for (const pattern of entry.patterns) {
      const regex = new RegExp(
        `(?<![\\p{L}\\p{N}])${escapeRegex(pattern)}(?![\\p{L}\\p{N}])(?!\\s+(?:st|street|rd|road|ave|avenue|blvd|boulevard|dr|drive|ext|lane|south)\\b)`,
        'iu'
      );
      if (regex.test(normalized)) {
        return entry.label;
      }
    }
  }
  return null;
};

export const nearestBarangay = (lat, lng) => {
  let closest = null;
  let minKm = Infinity;
  for (const b of SANTA_ROSA_BARANGAYS) {
    const km = haversineKm(lat, lng, b.lat, b.lng);
    if (km < minKm) {
      minKm = km;
      closest = b;
    }
  }
  return closest ? { ...closest, distanceKm: Number(minKm.toFixed(2)) } : null;
};

export const isWithinSantaRosaBounds = (lat, lng) => {
  if (lat < 14.215 || lat > 14.342 || lng < 121.032 || lng > 121.142) {
    return false;
  }
  const nearest = nearestBarangay(lat, lng);
  return Boolean(nearest && nearest.distanceKm <= 3.8);
};

export const detectSantaRosaBarangay = (addressText) => {
  const raw = String(addressText || '').trim();
  if (!raw) {
    return { matched: false, reason: 'empty', barangay: null, outsideCity: null };
  }

  const outsideCity = detectOutsideCity(raw);
  if (outsideCity) {
    return { matched: false, reason: 'outside_city', barangay: null, outsideCity };
  }

  const normalized = raw.toLowerCase().replace(/\s+/g, ' ');
  for (const candidate of SORTED_ALIAS_CANDIDATES) {
    if (hasWholeTerm(normalized, candidate.alias)) {
      return {
        matched: true,
        reason: null,
        source: 'text',
        barangay: candidate.barangay,
        outsideCity: null,
      };
    }
  }

  return { matched: false, reason: 'not_in_list', barangay: null, outsideCity: null };
};

export const detectBarangayFromCoords = (lat, lng, resolvedAddress = '', detectedCity = '') => {
  const outsideCity = detectOutsideCity(detectedCity) || detectOutsideCity(resolvedAddress);
  if (outsideCity) {
    return { matched: false, reason: 'outside_city', barangay: null, outsideCity };
  }

  if (resolvedAddress) {
    const textMatch = detectSantaRosaBarangay(resolvedAddress);
    if (textMatch.matched) {
      return textMatch;
    }
  }

  const cityNorm = String(detectedCity || '').trim().toLowerCase();
  const cityIsNonSantaRosa =
    cityNorm !== '' &&
    !cityNorm.includes('santa rosa') &&
    !cityNorm.includes('sta. rosa') &&
    !cityNorm.includes('sta rosa');

  if (cityIsNonSantaRosa || !isWithinSantaRosaBounds(lat, lng)) {
    return {
      matched: false,
      reason: 'outside_area',
      barangay: null,
      outsideCity: cityIsNonSantaRosa ? detectedCity : null,
    };
  }

  const nearest = nearestBarangay(lat, lng);
  if (nearest && nearest.distanceKm <= 3.8) {
    return {
      matched: true,
      reason: null,
      source: 'gps',
      barangay: nearest,
      outsideCity: null,
    };
  }

  return { matched: false, reason: 'outside_area', barangay: null, outsideCity: null };
};

export const getBarangayRejectionMessage = (detection) => {
  if (detection?.reason === 'outside_city' && detection.outsideCity) {
    return `Delivery unavailable: Cannot deliver to "${detection.outsideCity}". Orders are only accepted within the 18 barangays of Santa Rosa, Laguna.`;
  }
  if (detection?.reason === 'empty') {
    return 'Delivery unavailable: Please enter or detect an address in one of the 18 accepted Santa Rosa barangays.';
  }
  return 'Delivery unavailable: Cannot deliver to this location. No supported Santa Rosa barangay was detected.';
};