
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { DateTime } from 'luxon';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Info, AlertCircle } from "lucide-react";
import type { Layer, LeafletMouseEvent, PathOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { illustrativeTimezoneMapData, TimezoneFeatureProperties } from '@/lib/data/timezone-map-data';
import dynamic from 'next/dynamic';

// Dynamically import react-leaflet components to ensure they are client-side only
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full flex items-center justify-center bg-muted rounded-md shadow-lg"><p>Loading map...</p></div> 
});
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });


interface MapComponentProps {
  geoJsonData: typeof illustrativeTimezoneMapData;
  onFeatureClick: (properties: TimezoneFeatureProperties, latlng: { lat: number, lng: number }) => void;
  selectedPosition: { lat: number, lng: number } | null;
  selectedInfo: { name: string; tzid: string; currentTime: string; } | null;
}

const LeafletMapComponent: React.FC<MapComponentProps> = ({ 
  geoJsonData, 
  onFeatureClick,
  selectedPosition,
  selectedInfo
}) => {
  const onEachFeature = useCallback((feature: any, layer: Layer) => {
    layer.on({
      click: (e: LeafletMouseEvent) => {
        if (feature.properties) {
          onFeatureClick(feature.properties as TimezoneFeatureProperties, e.latlng);
        }
      }
    });
  }, [onFeatureClick]);

  const geoJsonStyle = useCallback((): PathOptions => {
    return {
      fillColor: 'hsl(var(--primary))',
      weight: 1,
      opacity: 1,
      color: 'white', // Border color of polygons
      fillOpacity: 0.5
    };
  }, []);

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '500px', width: '100%' }} className="rounded-md shadow-lg bg-muted">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON 
        data={geoJsonData as any} 
        style={geoJsonStyle} 
        onEachFeature={onEachFeature} 
        key={JSON.stringify(geoJsonData)} // Re-render if data changes
      />
      {selectedPosition && selectedInfo && Popup && (
        <Popup position={selectedPosition}>
          <div className="text-sm">
              <p className="font-semibold">{selectedInfo.name}</p>
              <p className="text-xs text-muted-foreground">({selectedInfo.tzid})</p>
              <p className="text-lg text-accent">{selectedInfo.currentTime.split('(')[0].trim()}</p>
              <p className="text-xs text-muted-foreground">{selectedInfo.currentTime.match(/\((.*?)\)/)?.[1]}</p>
          </div>
        </Popup>
      )}
    </MapContainer>
  );
};


const TimeZoneMap = () => {
  const [selectedTimeZoneInfo, setSelectedTimeZoneInfo] = useState<{ name: string; tzid: string; currentTime: string; } | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number, lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This ensures Leaflet related code only runs on the client
    setMapReady(true); 
  }, []);

  const handleFeatureClick = useCallback((properties: TimezoneFeatureProperties, latlng: { lat: number, lng: number }) => {
    setError(null); // Clear previous errors
    setSelectedPosition(latlng); // Set position for popup

    try {
      if (!properties || !properties.tzid) {
        throw new Error("Missing timezone information in map data.");
      }
      const nowInZone = DateTime.now().setZone(properties.tzid);
      
      if (!nowInZone.isValid) {
        console.warn(`Invalid timezone ID from GeoJSON: ${properties.tzid}. Reason: ${nowInZone.invalidReason}`);
        throw new Error(`The timezone ID "${properties.tzid}" is not recognized or is invalid.`);
      }
      setSelectedTimeZoneInfo({
        name: properties.name || "Unknown Region",
        tzid: properties.tzid,
        currentTime: nowInZone.toFormat('HH:mm:ss ZZZZ (ccc, MMM dd)'),
      });
    } catch (e: any) {
      console.error(`Error processing timezone click for ${properties?.tzid || 'unknown tzid'}:`, e);
      setError(e.message || "An unexpected error occurred while fetching timezone data.");
      setSelectedTimeZoneInfo(null); // Clear previous info on error
      setSelectedPosition(null); // Clear popup position
    }
  }, []);
  
  const geoJsonData = useMemo(() => illustrativeTimezoneMapData, []);

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <MapPin className="h-8 w-8 text-primary" /> Interactive Time Zone Map
          </CardTitle>
          <CardDescription className="text-md">
            Click on a region to see its current time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Developer Note</AlertTitle>
            <AlertDescription>
              This map uses illustrative GeoJSON data. For a production application, a comprehensive timezone boundary file would be required.
              Ensure you have installed Leaflet dependencies: <code className="font-mono bg-muted px-1 rounded">leaflet</code>, <code className="font-mono bg-muted px-1 rounded">react-leaflet</code>, and <code className="font-mono bg-muted px-1 rounded">@types/leaflet</code>.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Map Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="relative h-[500px] w-full border rounded-md overflow-hidden">
            {mapReady && LeafletMapComponent ? ( // Check for MapComponent to be loaded
              <LeafletMapComponent
                geoJsonData={geoJsonData}
                onFeatureClick={handleFeatureClick}
                selectedPosition={selectedPosition}
                selectedInfo={selectedTimeZoneInfo}
              />
            ) : (
              // This will show the loading state from dynamic import, or a fallback
              <div className="h-[500px] w-full flex items-center justify-center bg-muted rounded-md shadow-lg"><p>Loading map...</p></div>
            )}
          </div>

          {selectedTimeZoneInfo && !error && (
            <Card className="mt-4 bg-card shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Selected Timezone Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Region:</strong> {selectedTimeZoneInfo.name}</p>
                <p><strong>Timezone ID:</strong> {selectedTimeZoneInfo.tzid}</p>
                <p><strong>Current Time:</strong> <span className="text-accent font-semibold">{selectedTimeZoneInfo.currentTime}</span></p>
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          Map data &copy; OpenStreetMap contributors. Timezone boundaries are illustrative.
        </CardFooter>
      </Card>
    </div>
  );
};

export default TimeZoneMap;
