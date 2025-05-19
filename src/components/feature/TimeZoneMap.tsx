
"use client";

import { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { DateTime } from 'luxon';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, Clock, Info } from "lucide-react";
import type { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import type { LatLngExpression, LeafletMouseEvent, PathOptions, Layer, LatLng } from 'leaflet'; // Added LatLng
import { illustrativeTimezoneMapData, TimezoneFeatureProperties } from '@/lib/data/timezone-map-data';

// Dynamically import Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), {
  ssr: false,
  loading: () => <MapLoadingPlaceholder message="Loading Map..." />,
});
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface LeafletMapComponentProps {
  geoJsonData: FeatureCollection<any, TimezoneFeatureProperties>;
  onFeatureClick: (event: LeafletMouseEvent, feature: Feature<any, TimezoneFeatureProperties>) => void;
  selectedPosition: LatLngExpression | null; // Kept as LatLngExpression for flexibility
  popupContent: ReactNode | null;
}

const MapLoadingPlaceholder: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex justify-center items-center h-[500px] w-full">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
    <p className="ml-2">{message}</p>
  </div>
);

const LeafletMapComponent: React.FC<LeafletMapComponentProps> = React.memo(({
  geoJsonData,
  onFeatureClick,
  selectedPosition,
  popupContent,
}) => {
  const geoJsonStyle = useMemo((): PathOptions => ({
    fillColor: 'hsl(var(--primary))',
    weight: 1,
    opacity: 1,
    color: 'white', // Border color of polygons
    fillOpacity: 0.5,
  }), []);

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
        event.target.setStyle(geoJsonStyle); // Reset to original style
      },
    });
  }, [onFeatureClick, geoJsonStyle]);

  // Ensure selectedPosition is valid before rendering Popup
  const isValidPosition = (pos: LatLngExpression | null): pos is LatLngExpression => {
    if (!pos) return false;
    if (Array.isArray(pos)) { // LatLngTuple: [number, number]
      return pos.length === 2 && typeof pos[0] === 'number' && typeof pos[1] === 'number';
    }
    // LatLngLiteral or Leaflet's LatLng object
    return typeof (pos as any).lat === 'number' && (typeof (pos as any).lng === 'number' || typeof (pos as any).lon === 'number');
  };
  
  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '500px', width: '100%' }} className="rounded-md shadow-lg bg-muted">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geoJsonData && <GeoJSON key="geojson-layer" data={geoJsonData as GeoJsonObject} style={geoJsonStyle} onEachFeature={onEachFeature} />}
      
      {isValidPosition(selectedPosition) && popupContent && (
        <Popup position={selectedPosition}>
          {popupContent}
        </Popup>
      )}
    </MapContainer>
  );
});
LeafletMapComponent.displayName = 'LeafletMapComponent';


const TimeZoneMap = () => {
  const [mapReady, setMapReady] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null); // Store as Leaflet LatLng object
  const [selectedTimeZoneInfo, setSelectedTimeZoneInfo] = useState<string | null>(null);
  const [selectedTimeZoneName, setSelectedTimeZoneName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const geoJsonData = useMemo(() => illustrativeTimezoneMapData, []);
  
  useEffect(() => {
    // Ensure Leaflet CSS is imported only on the client
    import('leaflet/dist/leaflet.css')
      .then(() => {
        setMapReady(true);
      })
      .catch(err => {
        console.error("Failed to load Leaflet CSS", err);
        setError("Failed to load map styles. Please refresh.");
      });
  }, []);

  const handleFeatureClick = useCallback((event: LeafletMouseEvent, feature: Feature<any, TimezoneFeatureProperties>) => {
    setError(null);
    
    const clickLatLng = event.latlng; // This is L.LatLng object from Leaflet
    
    // Validate clickLatLng before using it
    if (!clickLatLng || typeof clickLatLng.lat !== 'number' || typeof clickLatLng.lng !== 'number') {
      console.warn("Invalid LatLng received from click event:", clickLatLng);
      setError("Could not determine the clicked location accurately.");
      setSelectedPosition(null);
      setSelectedTimeZoneInfo(null);
      setSelectedTimeZoneName(null);
      return;
    }
    
    setSelectedPosition(clickLatLng); // Set position for popup

    const tzid = feature.properties?.tzid;
    const displayName = feature.properties?.name || tzid || "Unknown Region";
    setSelectedTimeZoneName(displayName); // Set name immediately for popup context

    if (!tzid) {
      const msg = `Timezone ID not found for ${displayName}.`;
      console.warn(msg, feature.properties);
      setError(msg);
      setSelectedTimeZoneInfo("Timezone data not available for this region.");
      return;
    }

    try {
      const nowInZone = DateTime.now().setZone(tzid);
      if (!nowInZone.isValid) {
        throw new Error(nowInZone.invalidReason || `Invalid timezone ID: ${tzid}`);
      }
      const formattedTime = nowInZone.toFormat("HH:mm:ss, MMM dd, yyyy (ZZZZ)");
      setSelectedTimeZoneInfo(formattedTime);
    } catch (e: any) {
      console.error(`Error processing timezone ${tzid} for ${displayName}:`, e);
      setError(`Could not get time for ${displayName}: ${e.message}`);
      setSelectedTimeZoneInfo(`Error: ${e.message}`);
    }
  }, []);
  
  const popupContent = useMemo(() => {
    if (!selectedTimeZoneName) return null;
    return (
      <div className="space-y-1 p-1">
        <p className="font-semibold text-foreground text-base">{selectedTimeZoneName}</p>
        <p className="text-sm text-muted-foreground">{error ? error : (selectedTimeZoneInfo || "Loading...")}</p>
      </div>
    );
  }, [selectedTimeZoneName, selectedTimeZoneInfo, error]);

  if (!mapReady) {
    return (
      <Card className="w-full max-w-4xl shadow-xl my-8 mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <MapPin className="h-8 w-8 text-primary" /> Interactive Time Zone Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MapLoadingPlaceholder message="Preparing Map..." />
        </CardContent>
         <CardFooter className="text-xs text-muted-foreground text-center block">
            <p>Ensure Leaflet and React-Leaflet are installed. Map data &copy; OpenStreetMap.</p>
          </CardFooter>
      </Card>
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
            Click on a region to view its current time. (Uses illustrative timezone boundaries)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LeafletMapComponent 
            geoJsonData={geoJsonData}
            onFeatureClick={handleFeatureClick}
            selectedPosition={selectedPosition} // Pass L.LatLng or null
            popupContent={popupContent}
          />

          {error && !selectedPosition && ( // Show general error if no popup is active
            <Alert variant="destructive" className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Map Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {selectedTimeZoneName && !error && selectedPosition && ( // Show info if popup is active and no error state for current click
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
