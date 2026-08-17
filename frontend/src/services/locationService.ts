export type LocationSearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export async function searchLocations(query: string) {
  if (!query.trim()) {
    return [];
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query,
    )}&limit=5`,
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar localização.");
  }

  return response.json() as Promise<LocationSearchResult[]>;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar endereço.");
  }

  const data = await response.json();

  return data.display_name as string;
}