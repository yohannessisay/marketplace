"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Maximize2, Minimize2 } from "lucide-react";
import GoogleMaps, { MapRef, PolygonCoord, CropLocation } from "./GoogleMaps";

const GOOGLE_MAPS_API_KEY = import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

export default function CropFieldManager({
  onPolygonChange,
  initialPolygons = [],
  center = { lat: 7.67, lng: 36.83 },
  farmName = "Farm",
  disableButtons = false,
}: {
  onPolygonChange: (data: PolygonCoord[][]) => void;
  initialPolygons?: PolygonCoord[][];
  center?: { lat: number; lng: number };
  farmName?: string;
  disableButtons?: boolean;
}) {
  const [cropLocations, setCropLocations] = useState<CropLocation[]>([
    {
      cropId: "farm-center",
      address: farmName,
      lat: center.lat,
      lng: center.lng,
      price: "N/A",
    },
  ]);
  const [polygonsData, setPolygonsData] =
    useState<PolygonCoord[][]>(initialPolygons);
  const [isReadOnly, setIsReadOnly] = useState(disableButtons);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const mapRef = useRef<MapRef>(null);

  // Update cropLocations when farmName prop changes
  useEffect(() => {
    setCropLocations([
      {
        cropId: "farm-center",
        address: farmName,
        lat: center.lat,
        lng: center.lng,
        price: "N/A",
      },
    ]);
  }, [farmName, center.lat, center.lng]);

  // Ensure initial polygons are drawn when component mounts in edit mode
  useEffect(() => {
    if (initialPolygons.length > 0 && polygonsData.length === 0) {
      setPolygonsData(initialPolygons);
      onPolygonChange(initialPolygons);
      if (mapRef.current) {
        // Assuming GoogleMaps has a method to set polygons directly
        mapRef.current.setPolygonsData?.(initialPolygons);
      }
    }
  }, [initialPolygons, onPolygonChange]);

  const handlePolygonChange = (data: PolygonCoord[][]) => {
    setPolygonsData(data);
    onPolygonChange(data);
  };

  const handlePolygonComplete = (coords: PolygonCoord[]) => {
    console.log("Polygon drawing completed:", coords);
  };

  const handlePolygonDelete = () => {
    console.log("Polygon deleted");
    setPolygonsData([]);
    onPolygonChange([]);
    if (mapRef.current) {
      mapRef.current.resetPolygonData([]);
    }
  };

  const handleResetMap = () => {
    if (mapRef.current) {
      mapRef.current.resetPolygonData([]);
    }
  };

  const handleStartDrawing = () => {
    if (mapRef.current) {
      mapRef.current.enableDrawing();
    }
  };

  const toggleReadOnly = () => {
    if (!disableButtons) {
      setIsReadOnly(!isReadOnly);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullScreen]);

  const renderControlBar = () => (
    <div className="flex items-center justify-between bg-white p-4">
      <h2 className="text-lg font-medium text-gray-700">
        {polygonsData.length > 0 ? "Farm Boundary" : "Draw Farm Boundary"}
      </h2>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={toggleReadOnly}
          className={`${
            isReadOnly
              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          } border-none`}
          disabled={disableButtons && isReadOnly}
        >
          {isReadOnly ? "Edit Mode" : "View Mode"}
        </Button>
        {!isReadOnly && !disableButtons && (
          <>
            <Button
              size="sm"
              type="button"
              onClick={handleStartDrawing}
              disabled={polygonsData.length > 0}
            >
              Draw New Boundary
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleResetMap}
              className="bg-grayummary-200 text-gray-800 hover:bg-gray-300 border-none"
            >
              Reset Map
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={toggleFullScreen}
          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
        >
          {isFullScreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex flex-col space-y-4">
        {!isFullScreen && renderControlBar()}
        <div
          className={`w-full rounded-lg overflow-hidden shadow-md transition-all duration-300 ${
            isFullScreen ? "fixed inset-0 z-50 bg-white" : "h-[400px]"
          }`}
        >
          {isFullScreen && (
            <div className="absolute top-0 left-0 right-0 z-50">
              {renderControlBar()}
            </div>
          )}

          <GoogleMaps
            ref={mapRef}
            apiKey={GOOGLE_MAPS_API_KEY}
            cropLocations={cropLocations}
            zoomLevel={12}
            isReadOnly={isReadOnly}
            polygonsData={polygonsData}
            setPolygonsData={handlePolygonChange}
            onPolygonComplete={handlePolygonComplete}
            onPolygonDelete={handlePolygonDelete}
            center={center}
            options={{
              mapTypeId: "satellite",
              mapTypeControl: true,
              mapTypeControlOptions: {
                style: 2, // DROPDOWN_MENU
                position: 3, // TOP_RIGHT
              },
            }}
            className={`bg-white ${isFullScreen ? "h-full pt-16" : "h-full"}`}
          />
        </div>
        {polygonsData.length > 0 && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                Boundary Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div>
                  <span className="text-xs text-gray-500">Approx. Area: </span>
                  <span className="text-sm font-semibold">
                    ~{calculateApproxArea(polygonsData[0]).toFixed(2)} hectares
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function calculateApproxArea(coords: PolygonCoord[]): number {
  if (!coords || coords.length < 3) return 0;

  const R = 6371000;
  let area = 0;

  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const lat1 = (coords[i].lat * Math.PI) / 180;
    const lng1 = (coords[i].lng * Math.PI) / 180;
    const lat2 = (coords[j].lat * Math.PI) / 180;
    const lng2 = (coords[j].lng * Math.PI) / 180;
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * R * R) / 2);
  return area / 10000;
}
