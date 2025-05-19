
// src/lib/data/timezone-map-data.ts
// Illustrative GeoJSON data for timezones.
// For a real application, you'd use a more comprehensive GeoJSON file.
// You can find such files from sources like https://github.com/evansiroky/timezone-boundary-builder

export interface TimezoneFeatureProperties {
  tzid: string; // IANA timezone ID
  name: string; // A display name for the timezone
}

export interface TimezoneGeoJSON {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: TimezoneFeatureProperties;
    geometry: {
      type: "Polygon" | "MultiPolygon";
      coordinates: any; // GeoJSON coordinates structure
    };
  }>;
}

export const illustrativeTimezoneMapData: TimezoneGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { tzid: "America/New_York", name: "US Eastern Time" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [ // A very rough box over parts of Eastern US
            [-85, 25], [-70, 25], [-70, 45], [-85, 45], [-85, 25]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: { tzid: "Europe/London", name: "UK Time (GMT/BST)" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [ // A very rough box over the UK
            [-10, 49], [2, 49], [2, 60], [-10, 60], [-10, 49]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: { tzid: "Asia/Tokyo", name: "Japan Standard Time" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [ // A very rough box over Japan
            [129, 30], [147, 30], [147, 45], [129, 45], [129, 30]
          ]
        ]
      }
    },
    {
        type: "Feature",
        properties: { tzid: "Australia/Sydney", name: "Australian Eastern Time" },
        geometry: {
          type: "Polygon",
          coordinates: [ // A very rough box over SE Australia
            [140, -40], [155, -40], [155, -25], [140, -25], [140, -40]
          ]
        }
      }
  ]
};
