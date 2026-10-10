export interface Coordinates {
  lat: number;
  lng: number;
}

// Haversine formula distance calculation in kilometers
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Capture browser geolocation with fallback to Lucknow default coords
export async function getCurrentLocation(): Promise<{ lat: number; lng: number; isDefault?: boolean }> {
  // Lucknow default coordinates
  const defaultLucknow = { lat: 26.8467, lng: 80.9462, isDefault: true };

  if (typeof window === "undefined" || !navigator.geolocation) {
    return defaultLucknow;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          isDefault: false,
        });
      },
      () => {
        // Fallback gracefully on permission deny or error
        resolve(defaultLucknow);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}
