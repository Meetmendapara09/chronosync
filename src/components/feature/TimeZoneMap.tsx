
"use client";

import * as React from 'react';
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
  FC
} from 'react';

import dynamic from 'next/dynamic';
import { DateTime } from 'luxon';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import {
  Loader2,
  MapPin,
  Clock,
  Info
} from "lucide-react";

// Import the missing data
import { illustrativeTimezoneMapData, TimezoneGeoJSON, TimezoneFeatureProperties } from '@/lib/data/timezone-map-data';

// Leaflet types (assuming @types/leaflet is installed)
import type { LatLng, LeafletMouseEvent, Layer, GeoJsonObject } from 'leaflet';

// Leaflet components (SSR-disabled)
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  {
    ssr: false,
    loading: () => <MapLoadingPlaceholder message="Loading Map..." />,
  }
);

const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });


// Loading Placeholder
const MapLoadingPlaceholder: FC<{ message: string }> = ({ message }) => (
  <div className="flex justify-center items-center h-[500px] w-full bg-muted rounded-md">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
    <p className="ml-2 text-muted-foreground">{message}</p>
  </div>
);

interface TimezoneFeature extends GeoJSON.Feature<GeoJSON.Geometry, TimezoneFeatureProperties> {}

interface LeafletMapComponentProps {
  geoJsonData: TimezoneGeoJSON;
  onFeatureClick: (event: LeafletMouseEvent, feature: TimezoneFeature) => void;
  selectedPosition: LatLng | null;
  popupContent: ReactNode | null;
}

const LeafletMapComponent: React.FC<LeafletMapComponentProps> = React.memo(({
  geoJsonData,
  onFeatureClick,
  selectedPosition,
  popupContent,
}) => {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const geoJsonStyle = useMemo(() => ({
    fillColor: 'hsl(var(--primary))',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.5,
  }), []);

  const onEachFeature = useCallback((feature: GeoJSON.Feature, layer: Layer) => {
    layer.on({
      click: (event: LeafletMouseEvent) => {
         // Type assertion needed as react-leaflet's onEachFeature is generic
        onFeatureClick(event, feature as TimezoneFeature);
      },
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
    <div className="h-[500px] w-full relative">
      {!mapInstance && <MapLoadingPlaceholder message="Initializing map..." />}
      <MapContainer
        whenCreated={setMapInstance}
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="rounded-md shadow-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoJsonData && <GeoJSON data={geoJsonData as GeoJsonObject} style={geoJsonStyle} onEachFeature={onEachFeature} />}
        
        {selectedPosition && popupContent && (
          <Popup position={selectedPosition}>
            {popupContent}
          </Popup>
        )}
      </MapContainer>
    </div>
  );
});
LeafletMapComponent.displayName = 'LeafletMapComponent';


const TimeZoneMap: FC = () => {
  const [mapReady, setMapReady] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null);
  const [selectedTimeZoneInfo, setSelectedTimeZoneInfo] = useState<string | null>(null);
  const [selectedTimeZoneName, setSelectedTimeZoneName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Local state for the GeoJSON data to ensure it's available for LeafletMapComponent
  const [currentGeoJsonData] = useState<TimezoneGeoJSON>(illustrativeTimezoneMapData);


  useEffect(() => {
    // Ensure Leaflet CSS is loaded
    import('leaflet/dist/leaflet.css')
      .then(() => setMapReady(true))
      .catch(err => {
        console.error("Failed to load Leaflet CSS:", err);
        setError("Failed to load map styles. Please refresh the page.");
      });
  }, []);

  const handleFeatureClick = useCallback((event: LeafletMouseEvent, feature: TimezoneFeature) => {
    setError(null);
    setSelectedTimeZoneInfo(null);
    setSelectedTimeZoneName(null);

    if (event.latlng && typeof event.latlng.lat === 'number' && typeof event.latlng.lng === 'number') {
      setSelectedPosition(event.latlng);
    } else {
      console.warn("Invalid LatLng in click event:", event.latlng);
      setError("Could not determine click location.");
      setSelectedPosition(null);
      return;
    }
    
    const tzid = feature.properties?.tzid;
    const displayName = feature.properties?.name || tzid || "Unknown Region";
    setSelectedTimeZoneName(displayName);

    if (!tzid) {
      console.warn("tzid not found for feature:", feature);
      setError(`Timezone ID not found for ${displayName}.`);
      return;
    }

    try {
      const nowInZone = DateTime.now().setZone(tzid);
      if (nowInZone.isValid) {
        const formattedTime = nowInZone.toFormat("HH:mm:ss, MMM dd, yyyy (ZZZZ)");
        setSelectedTimeZoneInfo(formattedTime);
      } else {
        console.warn("Luxon DateTime is invalid for tzid:", tzid, "Reason:", nowInZone.invalidReason);
        setError(`Could not get a valid time for ${displayName}. Timezone: ${tzid}. Reason: ${nowInZone.invalidReason}.`);
      }
    } catch (e: any) {
      console.error("Error setting timezone for feature:", feature, e);
      setError(`Error processing timezone for ${displayName}: ${e.message}`);
    }
  }, []);

  const popupContent = useMemo(() => {
    if (!selectedTimeZoneName) return null;
    return (
      <div className="space-y-1 p-1">
        <p className="font-semibold text-sm">{selectedTimeZoneName}</p>
        <p className="text-xs text-muted-foreground">
          {error ? (
            <span className="text-red-600">{error}</span>
          ) : selectedTimeZoneInfo ? (
            selectedTimeZoneInfo
          ) : (
            "Loading time..."
          )}
        </p>
      </div>
    );
  }, [selectedTimeZoneName, selectedTimeZoneInfo, error]);

  if (!mapReady) {
    return (
      <Card className="w-full max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <MapPin className="h-6 w-6" />
            Interactive Time Zone Map
          </CardTitle>
          <CardDescription>Explore global time zones by clicking on the map.</CardDescription>
        </CardHeader>
        <CardContent>
          <MapLoadingPlaceholder message="Loading map components..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
          <MapPin className="h-8 w-8 text-primary" />
          Interactive Time Zone Map
        </CardTitle>
        <CardDescription className="text-md">
          Click on a region to view its current time and timezone information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LeafletMapComponent
          geoJsonData={currentGeoJsonData}
          onFeatureClick={handleFeatureClick}
          selectedPosition={selectedPosition}
          popupContent={popupContent}
        />
        {error && !selectedTimeZoneInfo && ( // Show general error only if popup won't show its specific error
          <Alert variant="destructive" className="mt-4">
             <Info className="h-4 w-4" />
            <AlertTitle>Map Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground text-center block">
        <p>Map data is illustrative. Full global timezone data would be used in a production environment.</p>
      </CardFooter>
    </Card>
  );
};

export default TimeZoneMap;
