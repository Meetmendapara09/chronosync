
"use client";

import { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { DateTime } from 'luxon';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, Clock, Info } from "lucide-react";
import type { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import type { LatLngExpression, LeafletMouseEvent, PathOptions, Layer } from 'leaflet';
import { illustrativeTimezoneMapData, TimezoneFeatureProperties } from '@/lib/data/timezone-map-data';

// Dynamically import Leaflet components to ensure they are only loaded on the client-side
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-[500px] w-full"><Loader2 className="h-10 w-10 animate-spin text-primary" /> <p className="ml-2">Loading Map...</p></div>,
});
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface LeafletMapComponentProps {
  geoJsonData: FeatureCollection<any, TimezoneFeatureProperties>;
  onFeatureClick: (event: LeafletMouseEvent, feature: Feature<any, TimezoneFeatureProperties>) => void;
  selectedPosition: LatLngExpression | null;
  popupContent: ReactNode | null;
}

const LeafletMapComponent: React.FC<LeafletMapComponentProps> = ({
  geoJsonData,
  onFeatureClick,
  selectedPosition,
  popupContent,
}) => {
  const geoJsonStyle: PathOptions = {
    fillColor: 'hsl(var(--primary))',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.5,
  };

  const onEachFeature = useCallback((feature: Feature<any, TimezoneFeatureProperties>, layer: Layer) => {
    layer.on({
      click: (event: LeafletMouseEvent) => onFeatureClick(event, feature),
      mouseover: (event: LeafletMouseEvent) => {
        event.target.setStyle({
          fillOpacity: 0.7,
          weight: 2,
        });
      },
      mouseout: (event: LeafletMouseEvent) => {
        event.target.setStyle(geoJsonStyle);
      },
    });
  }, [onFeatureClick, geoJsonStyle]);

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '500px', width: '100%' }} className="rounded-md shadow-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geoJsonData && <GeoJSON key={JSON.stringify(geoJsonData)} data={geoJsonData as GeoJsonObject} style={geoJsonStyle} onEachFeature={onEachFeature} />}
      {selectedPosition && popupContent && (
        <Popup position={selectedPosition}>
          {popupContent}
        </Popup>
      )}
    </MapContainer>
  );
};


const TimeZoneMap = () => {
  const [mapReady, setMapReady] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<LatLngExpression | null>(null);
  const [selectedTimeZoneInfo, setSelectedTimeZoneInfo] = useState<string | null>(null);
  const [selectedTimeZoneName, setSelectedTimeZoneName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMapReady(true); // Indicate that we are on the client and Leaflet can be initialized
    // Dynamically import Leaflet CSS
    import('leaflet/dist/leaflet.css');
  }, []);

  const handleFeatureClick = useCallback((event: LeafletMouseEvent, feature: Feature<any, TimezoneFeatureProperties>) => {
    setError(null);
    const tzid = feature.properties?.tzid;
    const displayName = feature.properties?.name || tzid;

    if (!tzid) {
      setError("Timezone ID not found for this region.");
      setSelectedPosition(null);
      setSelectedTimeZoneInfo(null);
      setSelectedTimeZoneName(null);
      return;
    }

    try {
      const nowInZone = DateTime.now().setZone(tzid);
      if (!nowInZone.isValid) {
        throw new Error(nowInZone.invalidReason || "Invalid timezone for Luxon");
      }
      const formattedTime = nowInZone.toFormat("HH:mm:ss, MMM dd, yyyy (ZZZZ)");
      setSelectedTimeZoneInfo(formattedTime);
      setSelectedTimeZoneName(displayName);
      setSelectedPosition(event.latlng);
    } catch (e: any) {
      console.error("Error processing timezone click:", e);
      setError(`Could not get time for ${displayName}: ${e.message}`);
      setSelectedPosition(event.latlng); // Still show popup at clicked location, but with error
      setSelectedTimeZoneInfo(`Error: Could not retrieve time for ${displayName}.`);
      setSelectedTimeZoneName(displayName);
    }
  }, []);

  const geoJsonData = useMemo(() => illustrativeTimezoneMapData, []);
  
  const popupContent = useMemo(() => {
    if (!selectedTimeZoneName) return null;
    return (
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{selectedTimeZoneName}</p>
        <p className="text-sm text-muted-foreground">{selectedTimeZoneInfo || "Loading..."}</p>
      </div>
    );
  }, [selectedTimeZoneName, selectedTimeZoneInfo]);

  if (!mapReady) {
    return (
      <div className="flex justify-center items-center h-[500px] w-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-2">Preparing Map...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <MapPin className="h-8 w-8 text-primary" /> Interactive Time Zone Map
          </CardTitle>
          <CardDescription className="text-md">
            Click on a region to view its current time. (Using illustrative timezone boundaries)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LeafletMapComponent 
            geoJsonData={geoJsonData}
            onFeatureClick={handleFeatureClick}
            selectedPosition={selectedPosition}
            popupContent={popupContent}
          />

          {error && (
            <Alert variant="destructive" className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Map Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {selectedTimeZoneName && !error && (
            <Alert className="mt-4">
              <Clock className="h-4 w-4" />
              <AlertTitle>{selectedTimeZoneName}</AlertTitle>
              <AlertDescription>
                Current time: {selectedTimeZoneInfo}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Map data &copy; OpenStreetMap contributors. Timezone boundaries are illustrative.</p>
          <p>Ensure you have run `pnpm install leaflet react-leaflet @types/leaflet` or the equivalent for your package manager.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TimeZoneMap;
