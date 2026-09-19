const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

export const isValidLocation = (location) =>
    Boolean(location && location.formatted && Number.isFinite(location.lat) && Number.isFinite(location.lon));

export const haversineKm = (from, to) => {
    if (!isValidLocation(from) || !isValidLocation(to)) return 0;

    const dLat = toRadians(to.lat - from.lat);
    const dLon = toRadians(to.lon - from.lon);
    const lat1 = toRadians(from.lat);
    const lat2 = toRadians(to.lat);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
};

export const formatKm = (km) => {
    if (km == null || Number.isNaN(km)) return null;
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(km < 10 ? 2 : 1)} km`;
};

export const formatDuration = (hours) => {
    if (hours == null || Number.isNaN(hours)) return null;

    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs} hr ${mins} min`;
};

export const buildStops = (origin, waypoints, destination) =>
    [origin, ...waypoints, destination].filter(isValidLocation);

export const radialSegments = (stops) =>
    stops.slice(0, -1).map((stop, index) => ({
        from: stop,
        to: stops[index + 1],
        distanceKm: haversineKm(stop, stops[index + 1]),
    }));

export const totalRadialKm = (stops) =>
    radialSegments(stops).reduce((sum, segment) => sum + segment.distanceKm, 0);
