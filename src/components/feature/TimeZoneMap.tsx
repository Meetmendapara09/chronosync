
"use client";

import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Info } from "lucide-react";
import type { Layer, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { illustrativeTimezoneMapData, TimezoneFeatureProperties } from '@/lib/data/timezone-map-data';
import dynamic from 'next/dynamic';

// Dynamically import react-leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });


interface MapComponentProps {
  geoJsonData: typeof illustrativeTimezoneMapData;
  onFeatureClick: (properties: TimezoneFeatureProperties, latlng: { lat: number, lng: number }) => void;
  children?: React.ReactNode; // Added to allow Popup as a child
}

const LeafletMapComponent: React.FC<MapComponentProps> = ({ geoJsonData, onFeatureClick, children }) => {
  const onEachFeature = (feature: any, layer: Layer) => {
    layer.on({
      click: (e: LeafletMouseEvent) => {
        onFeatureClick(feature.properties as TimezoneFeatureProperties, e.latlng);
      }
    });
  };

  const geoJsonStyle = {
    fillColor: 'hsl(var(--primary))',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.5
  };

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '500px', width: '100%' }} className="rounded-md shadow-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON data={geoJsonData as any} style={geoJsonStyle} onEachFeature={onEachFeature} />
      {children}
    </MapContainer>
  );
};


const TimeZoneMap = () => {
  const [selectedTimeZoneInfo, setSelectedTimeZoneInfo] = useState<{ name: string; tzid: string; currentTime: string; latlng: {lat: number, lng: number} } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true); 
  }, []);

  const handleFeatureClick = (properties: TimezoneFeatureProperties, latlng: { lat: number, lng: number }) => {
    try {
      const nowInZone = DateTime.now().setZone(properties.tzid);
      if (!nowInZone.isValid) {
        console.warn(`Invalid timezone ID from GeoJSON: ${properties.tzid}`);
        setSelectedTimeZoneInfo({
          name: properties.name,
          tzid: properties.tzid,
          currentTime: 'Invalid Timezone',
          latlng: latlng
        });
        return;
      }
      setSelectedTimeZoneInfo({
        name: properties.name,
        tzid: properties.tzid,
        currentTime: nowInZone.toFormat('HH:mm:ss ZZZZ (ccc, MMM dd)'),
        latlng: latlng
      });
    } catch (error) {
      console.error(`Error processing timezone ${properties.tzid}:`, error);
      setSelectedTimeZoneInfo({
        name: properties.name,
        tzid: properties.tzid,
        currentTime: 'Error getting time',
        latlng: latlng
      });
    }
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <MapPin className="h-8 w-8 text-primary" /> Interactive Time Zone Map
          </CardTitle>
          <CardDescription className="text-md">
            Click on a (very simplified) region to see its current time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Developer Note</AlertTitle>
            <AlertDescription>
              This map uses illustrative GeoJSON data. For a full experience, a comprehensive timezone boundary file is needed.
              Ensure you have run <code className="font-mono bg-muted px-1 rounded">pnpm install leaflet react-leaflet @types/leaflet</code>.
            </AlertDescription>
          </Alert>
          
          <div className="relative h-[500px]">
            {mapReady ? (
              <LeafletMapComponent
                geoJsonData={illustrativeTimezoneMapData}
                onFeatureClick={handleFeatureClick}
              >
                {selectedTimeZoneInfo && Popup && (
                  <Popup position={selectedTimeZoneInfo.latlng}>
                    <div className="text-sm">
                        <p className="font-semibold">{selectedTimeZoneInfo.name}</p>
                        <p>({selectedTimeZoneInfo.tzid})</p>
                        <p className="text-lg text-accent">{selectedTimeZoneInfo.currentTime.split('(')[0].trim()}</p>
                        <p className="text-xs text-muted-foreground">{selectedTimeZoneInfo.currentTime.match(/\((.*?)\)/)?.[1]}</p>
                    </div>
                  </Popup>
                )}
              </LeafletMapComponent>
            ) : (
              <div className="h-[500px] w-full flex items-center justify-center bg-muted rounded-md shadow-lg"><p>Loading map...</p></div>
            )}
          </div>

          {selectedTimeZoneInfo && (
            <Card className="mt-4">
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
