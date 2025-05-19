
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
import L, { type LatLng, type LeafletMouseEvent, type Layer, type GeoJsonObject } from 'leaflet'; // Import L for L.latLng

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
  Info
} from "lucide-react";

import { illustrativeTimezoneMapData, type TimezoneGeoJSON, type TimezoneFeatureProperties } from '@/lib/data/timezone-map-data';
import { cn } from '@/lib/utils';

// Type for GeoJSON features specific to our data
interface TimezoneFeature extends GeoJSON.Feature<GeoJSON.Geometry, TimezoneFeatureProperties> {}

const MapLoadingPlaceholder: FC<{ message: string }> = ({ message }) => (
  <div className="flex justify-center items-center h-[500px] w-full bg-background border border-border rounded-md">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
    <p className="ml-3 text-muted-foreground">{message}</p>
  </div>
);

// Dynamically import Leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  {
    ssr: false,
    loading: () => <MapLoadingPlaceholder message="Loading Map Component..." />,
  }
);

const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });


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
  const geoJsonStyle = useMemo(() => ({
    fillColor: 'hsl(var(--primary))',
    weight: 1,
    opacity: 1,
    color: 'hsl(var(--card-foreground))',
    fillOpacity: 0.4,
  }), []);

  const onEachFeature = useCallback((feature: GeoJSON.Feature, layer: Layer) => {
    layer.on({
      click: (event: LeafletMouseEvent) => {
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
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%' }} // MapContainer takes full size of its parent
      className="rounded-md shadow-lg border border-border overflow-hidden" // Styling applied here
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {geoJsonData && (
        <GeoJSON
          data={geoJsonData as GeoJsonObject}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />
      )}
      {selectedPosition && popupContent && (
        <Popup position={selectedPosition}>
          {popupContent}
        </Popup>
      )}
    </MapContainer>
  );
});
LeafletMapComponent.displayName = 'LeafletMapComponent';


const TimeZoneMap: FC = () => {
  const [mapReady, setMapReady] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null);
  const [selectedTimeZoneInfo, setSelectedTimeZoneInfo] = useState<string | null>(null);
  const [selectedTimeZoneName, setSelectedTimeZoneName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const currentGeoJsonData = useMemo(() => illustrativeTimezoneMapData, []);

  useEffect(() => {
    import('leaflet/dist/leaflet.css')
      .then(() => {
        setMapReady(true);
      })
      .catch(err => {
        console.error("Failed to load Leaflet CSS:", err);
        setError("Failed to load map styles. Please ensure Leaflet is correctly installed and refresh the page.");
        setMapReady(false); // Explicitly set to false on error
      });
  }, []);

  const handleFeatureClick = useCallback((event: LeafletMouseEvent, feature: TimezoneFeature) => {
    setError(null);
    setSelectedTimeZoneInfo(null);
    setSelectedTimeZoneName(null);

    if (event.latlng && typeof event.latlng.lat === 'number' && typeof event.latlng.lng === 'number') {
      setSelectedPosition(L.latLng(event.latlng.lat, event.latlng.lng));
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
      console.warn("tzid not found for feature:", feature.properties);
      setError(`Timezone ID (tzid) not found for ${displayName}.`);
      setSelectedTimeZoneInfo(null); // Clear info if tzid is missing
      return;
    }

    try {
      const nowInZone = DateTime.now().setZone(tzid);
      if (nowInZone.isValid) {
        const formattedTime = nowInZone.toFormat("HH:mm:ss, MMM dd, yyyy (ZZZZ)");
        setSelectedTimeZoneInfo(formattedTime);
      } else {
        console.warn("Luxon DateTime is invalid for tzid:", tzid, "Reason:", nowInZone.invalidReason, "Offset:", nowInZone.offset);
        setError(`Could not get a valid time for ${displayName}. Timezone: ${tzid}. Reason: ${nowInZone.invalidReason || 'Unknown'}.`);
        setSelectedTimeZoneInfo(null);
      }
    } catch (e: any) {
      console.error(`Error setting timezone for ${displayName} (tzid: ${tzid}):`, e);
      setError(`Error processing timezone for ${displayName}: ${e.message}.`);
      setSelectedTimeZoneInfo(null);
    }
  }, [setSelectedPosition, setSelectedTimeZoneInfo, setSelectedTimeZoneName, setError]);

  const popupContent = useMemo(() => {
    if (!selectedTimeZoneName && !error) return null; // Don't render if nothing selected and no general error for popup
    
    let content;
    if (error && selectedTimeZoneName) { // Error related to the current selection
        content = <span className="text-destructive">{error}</span>;
    } else if (selectedTimeZoneInfo) {
        content = selectedTimeZoneInfo;
    } else if (selectedTimeZoneName) { // A region was clicked, but info/error is not yet set (or was cleared)
        content = "Loading time or data unavailable...";
    } else { // General error, not tied to a specific selection being shown in popup
      return null;
    }

    return (
      <div className="space-y-1 p-1 text-sm min-w-[150px]">
        {selectedTimeZoneName && <p className="font-semibold text-foreground">{selectedTimeZoneName}</p>}
        <p className={cn("text-xs", error && selectedTimeZoneName ? "text-destructive" : "text-muted-foreground")}>
          {content}
        </p>
      </div>
    );
  }, [selectedTimeZoneName, selectedTimeZoneInfo, error]);

  if (!mapReady && error) { // Critical error: CSS failed to load
    return (
       <Card className="w-full max-w-4xl mx-auto my-8 shadow-xl">
        <CardHeader className="text-center">
           <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2 text-destructive">
            <MapPin className="h-8 w-8" />
            Map Load Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Failed to load map styles</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
        {/* This div now provides the explicit size for the MapContainer */}
        <div className="h-[500px] w-full"> 
          {mapReady ? (
            <LeafletMapComponent
              geoJsonData={currentGeoJsonData}
              onFeatureClick={handleFeatureClick}
              selectedPosition={selectedPosition}
              popupContent={popupContent}
            />
          ) : (
            <MapLoadingPlaceholder message="Loading map assets..." />
          )}
        </div>
        {error && !selectedPosition && ( // Display general errors not tied to a popup
          <Alert variant="destructive" className="mt-4">
             <Info className="h-4 w-4" />
            <AlertTitle>Map Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground text-center block">
        <p>Map data is illustrative. Uses OpenStreetMap tiles by CARTO.</p>
      </CardFooter>
    </Card>
  );
};

export default TimeZoneMap;
