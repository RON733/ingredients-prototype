/**
 * Default 9 supported delivery Barangays of Santa Rosa, Laguna with aliases,
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
    id: 'caingin',
    name: 'Caingin',
    aliases: ['caingin'],
    lat: 14.3262,
    lng: 121.1172,
    eta: '20–30 Mins',
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

export const KNOWN_ADDITIONAL_BARANGAYS = [
  { id: 'balibago', name: 'Balibago', aliases: ['balibago', 'balibago complex'], lat: 14.2934, lng: 121.1082, eta: '25–35 Mins' },
  { id: 'dila', name: 'Dila', aliases: ['dila'], lat: 14.2896, lng: 121.1162, eta: '25–35 Mins' },
  { id: 'dita', name: 'Dita', aliases: ['dita'], lat: 14.2775, lng: 121.1165, eta: '30–40 Mins' },
  { id: 'don-jose', name: 'Don Jose', aliases: ['don jose', 'nuvali'], lat: 14.2450, lng: 121.0600, eta: '35–50 Mins' },
  { id: 'macabling', name: 'Macabling', aliases: ['macabling'], lat: 14.2968, lng: 121.1010, eta: '25–35 Mins' },
  { id: 'malitlit', name: 'Malitlit', aliases: ['malitlit'], lat: 14.2680, lng: 121.0960, eta: '30–45 Mins' },
  { id: 'pooc', name: 'Pooc', aliases: ['pooc', 'pook'], lat: 14.3030, lng: 121.1235, eta: '25–35 Mins' },
  { id: 'pulong-santa-cruz', name: 'Pulong Santa Cruz', aliases: ['pulong santa cruz', 'pulong sta. cruz', 'pulong sta cruz'], lat: 14.2805, lng: 121.0870, eta: '30–40 Mins' },
  { id: 'santo-domingo', name: 'Santo Domingo', aliases: ['santo domingo', 'sto. domingo', 'sto domingo'], lat: 14.2620, lng: 121.0720, eta: '35–45 Mins' },
];

export const ALL_KNOWN_BARANGAYS = [...SANTA_ROSA_BARANGAYS, ...KNOWN_ADDITIONAL_BARANGAYS];

export const slugifyBarangayId = (name) => {
  const slug = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'brgy-' + Math.random().toString(36).slice(2, 8);
};

export const normalizeBarangayList = (items) => {
  if (!Array.isArray(items)) return [];
  const knownById = new Map(ALL_KNOWN_BARANGAYS.map((b) => [b.id, b]));
  const seen = new Set();
  const result = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const name = String(item.name || '').trim();
    if (!name) continue;
    const id = slugifyBarangayId(item.id || name);
    if (seen.has(id)) continue;
    seen.add(id);

    const known = knownById.get(id);
    const rawAliases = Array.isArray(item.aliases)
      ? item.aliases.map((a) => String(a || '').trim().toLowerCase()).filter(Boolean)
      : [];
    const nameLower = name.toLowerCase();
    const aliasSet = new Set([nameLower, ...rawAliases, ...(known?.aliases || [])]);

    const latNum = Number(item.lat);
    const lngNum = Number(item.lng);
    const lat = Number.isFinite(latNum) && latNum !== 0 ? latNum : (known?.lat ?? 14.3167);
    const lng = Number.isFinite(lngNum) && lngNum !== 0 ? lngNum : (known?.lng ?? 121.1167);
    const eta = String(item.eta || '').trim() || known?.eta || '20–30 Mins';

    result.push({
      id,
      name,
      aliases: Array.from(aliasSet),
      lat,
      lng,
      eta,
    });
  }

  return result;
};

const UNSUPPORTED_SANTA_ROSA_BARANGAYS = [
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

const buildSortedAliasCandidates = (barangays) => {
  const list = Array.isArray(barangays) ? barangays : SANTA_ROSA_BARANGAYS;
  return list
    .flatMap((barangay) => {
      const aliases = Array.isArray(barangay.aliases) && barangay.aliases.length
        ? barangay.aliases
        : [String(barangay.name || '').toLowerCase()];
      return aliases.map((alias) => ({ alias, len: alias.length, barangay }));
    })
    .sort((a, b) => b.len - a.len);
};

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

export const nearestBarangay = (lat, lng, barangays = SANTA_ROSA_BARANGAYS) => {
  const list = Array.isArray(barangays) ? barangays : SANTA_ROSA_BARANGAYS;
  let closest = null;
  let minKm = Infinity;
  for (const b of list) {
    const km = haversineKm(lat, lng, Number(b.lat), Number(b.lng));
    if (km < minKm) {
      minKm = km;
      closest = b;
    }
  }
  return closest ? { ...closest, distanceKm: Number(minKm.toFixed(2)) } : null;
};

export const hasUnsupportedSantaRosaBarangay = (text, barangays = SANTA_ROSA_BARANGAYS) => {
  const normalized = String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return false;
  const list = Array.isArray(barangays) ? barangays : SANTA_ROSA_BARANGAYS;
  const activeAliases = new Set();
  for (const b of list) {
    if (b.name) activeAliases.add(String(b.name).toLowerCase());
    for (const a of b.aliases || []) {
      activeAliases.add(String(a).toLowerCase());
    }
  }
  return UNSUPPORTED_SANTA_ROSA_BARANGAYS.some(
    (term) => !activeAliases.has(term.toLowerCase()) && hasWholeTerm(normalized, term)
  );
};

export const isWithinSantaRosaBounds = (lat, lng, barangays = SANTA_ROSA_BARANGAYS) => {
  if (lat < 14.210 || lat > 14.345 || lng < 121.030 || lng > 121.145) {
    return false;
  }
  const nearest = nearestBarangay(lat, lng, barangays);
  return Boolean(nearest && nearest.distanceKm <= 1.8);
};

export const detectSantaRosaBarangay = (addressText, barangays = SANTA_ROSA_BARANGAYS) => {
  const raw = String(addressText || '').trim();
  if (!raw) {
    return { matched: false, reason: 'empty', barangay: null, outsideCity: null };
  }

  const outsideCity = detectOutsideCity(raw);
  if (outsideCity) {
    return { matched: false, reason: 'outside_city', barangay: null, outsideCity };
  }

  const normalized = raw.toLowerCase().replace(/\s+/g, ' ');
  const candidates = buildSortedAliasCandidates(barangays);
  for (const candidate of candidates) {
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

export const detectBarangayFromCoords = (
  lat,
  lng,
  resolvedAddress = '',
  detectedCity = '',
  barangays = SANTA_ROSA_BARANGAYS
) => {
  const list = Array.isArray(barangays) ? barangays : SANTA_ROSA_BARANGAYS;
  const outsideCity = detectOutsideCity(detectedCity) || detectOutsideCity(resolvedAddress);
  if (outsideCity) {
    return { matched: false, reason: 'outside_city', barangay: null, outsideCity };
  }

  if (resolvedAddress) {
    const textMatch = detectSantaRosaBarangay(resolvedAddress, list);
    if (textMatch.matched) {
      return textMatch;
    }
    if (hasUnsupportedSantaRosaBarangay(resolvedAddress, list)) {
      return { matched: false, reason: 'not_in_list', barangay: null, outsideCity: null };
    }
  }

  const cityNorm = String(detectedCity || '').trim().toLowerCase();
  const cityIsNonSantaRosa =
    cityNorm !== '' &&
    !cityNorm.includes('santa rosa') &&
    !cityNorm.includes('sta. rosa') &&
    !cityNorm.includes('sta rosa');

  if (cityIsNonSantaRosa || !isWithinSantaRosaBounds(lat, lng, list)) {
    return {
      matched: false,
      reason: 'outside_area',
      barangay: null,
      outsideCity: cityIsNonSantaRosa ? detectedCity : null,
    };
  }

  const nearest = nearestBarangay(lat, lng, list);
  if (nearest && nearest.distanceKm <= 1.8) {
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

const formatBarangayListText = (list) => {
  const names = list.map((b) => b.name);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} or ${names[1]}`;
  const last = names.pop();
  return `${names.join(', ')}, or ${last}`;
};

export const getBarangayRejectionMessage = (detection, barangays = SANTA_ROSA_BARANGAYS) => {
  const list = Array.isArray(barangays) ? barangays : SANTA_ROSA_BARANGAYS;
  if (list.length === 0) {
    return 'Delivery unavailable: No supported delivery barangays are currently configured.';
  }
  const listText = formatBarangayListText(list);
  const count = list.length;
  const plural = count === 1 ? 'barangay' : 'barangays';

  if (detection?.reason === 'outside_city' && detection.outsideCity) {
    return `Delivery unavailable: Cannot deliver to "${detection.outsideCity}". Orders are only accepted in ${listText} (Santa Rosa, Laguna).`;
  }
  if (detection?.reason === 'empty') {
    return `Delivery unavailable: Please enter or detect an address in one of the ${count} accepted Santa Rosa ${plural}.`;
  }
  return `Delivery unavailable: Cannot deliver to this location. We only deliver to ${listText}.`;
};
