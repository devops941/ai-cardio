// GeoJSON helpers for the $geoNear index (Section 9.5).

export function withLocation<T extends Record<string, unknown>>(data: T): T {
  const lat = data.latitude as number | null | undefined;
  const lng = data.longitude as number | null | undefined;
  if (lat != null && lng != null) {
    return { ...data, location: { type: "Point", coordinates: [lng, lat] } };
  }
  return { ...data, location: null };
}
