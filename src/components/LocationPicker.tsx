"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Maximize2, Minimize2 } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// Define the libraries array outside of the component
const libraries: ("places" | "geometry" | "drawing")[] = ["drawing"];

interface LocationPickerProps {
  onLocationChange: (coords: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
  farmName?: string;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const ETHIOPIA_BOUNDS = {
  lat: { min: 3, max: 15 },
  lng: { min: 33, max: 48 },
};

export default function LocationPicker({
  onLocationChange,
  initialLocation,
  farmName = "Farm",
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(initialLocation || null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [latInput, setLatInput] = useState<string>(
    initialLocation?.lat.toString() || "",
  );
  const [lngInput, setLngInput] = useState<string>(
    initialLocation?.lng.toString() || "",
  );
  const [lastValidLocation, setLastValidLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(initialLocation || null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries, // Use the constant here
  });

  const defaultCenter = { lat: 9, lng: 40 };
  const initialZoom = 5.7;

  const validateAndSetLocation = useCallback(
    (lat: number, lng: number) => {
      const isValid =
        lat >= ETHIOPIA_BOUNDS.lat.min &&
        lat <= ETHIOPIA_BOUNDS.lat.max &&
        lng >= ETHIOPIA_BOUNDS.lng.min &&
        lng <= ETHIOPIA_BOUNDS.lng.max;

      if (isValid) {
        const newLocation = { lat, lng };
        setSelectedLocation(newLocation);
        setLatInput(lat.toString());
        setLngInput(lng.toString());
        setLastValidLocation(newLocation);
        onLocationChange(newLocation);
        return true;
      }
      return false;
    },
    [onLocationChange],
  );

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      // Remove any bounds restrictions to allow free panning
      map.setOptions({
        minZoom: 4,
        maxZoom: 18,
        restriction: null, // Remove all restrictions
      });

      // Add click listener for setting location
      map.addListener("click", (event: google.maps.MapMouseEvent) => {
        const lat = event.latLng!.lat();
        const lng = event.latLng!.lng();

        if (!validateAndSetLocation(lat, lng)) {
          // If clicked outside Ethiopia, reset to last valid location
          if (lastValidLocation) {
            map.panTo(lastValidLocation);
          } else {
            map.panTo(defaultCenter);
          }
        }
      });

      // Set initial view to show Ethiopia
      map.setCenter(defaultCenter);
      map.setZoom(initialZoom);
    },
    [validateAndSetLocation, lastValidLocation],
  );

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  const debounce = useCallback((fn: () => void, delay: number) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(fn, delay);
  }, []);

  const handleCoordinateChange = useCallback(
    (type: "lat" | "lng", value: string) => {
      // Allow empty input or any valid decimal number
      if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
        if (type === "lat") {
          setLatInput(value);
        } else {
          setLngInput(value);
        }
      } else {
        return;
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;

      let newLat = numValue;
      let newLng = selectedLocation?.lng || defaultCenter.lng;

      if (type === "lng") {
        newLat = selectedLocation?.lat || defaultCenter.lat;
        newLng = numValue;
      }

      // Still enforce Ethiopia bounds for manual input
      newLat = Math.max(
        ETHIOPIA_BOUNDS.lat.min,
        Math.min(ETHIOPIA_BOUNDS.lat.max, newLat),
      );
      newLng = Math.max(
        ETHIOPIA_BOUNDS.lng.min,
        Math.min(ETHIOPIA_BOUNDS.lng.max, newLng),
      );

      const newLocation = { lat: newLat, lng: newLng };
      setSelectedLocation(newLocation);
      setLastValidLocation(newLocation);
      onLocationChange(newLocation);

      debounce(() => {
        mapRef.current?.panTo(newLocation);
      }, 300);
    },
    [selectedLocation, onLocationChange, debounce],
  );

  useEffect(() => {
    if (initialLocation) {
      validateAndSetLocation(initialLocation.lat, initialLocation.lng);
    } else {
      validateAndSetLocation(defaultCenter.lat, defaultCenter.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {selectedLocation ? "Selected Location" : "Select Farm Location"}
      </h2>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => {
            validateAndSetLocation(defaultCenter.lat, defaultCenter.lng);
            mapRef.current?.panTo(defaultCenter);
            mapRef.current?.setZoom(initialZoom);
          }}
          className="bg-gray-200 text-gray-800 hover:bg-gray-300 border-none"
        >
          Reset Location
        </Button>
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

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">
        Loading Maps...
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="text-sm text-gray-600">
              Latitude (3 to 15)
            </label>
            <Input
              id="latitude"
              type="number"
              min={ETHIOPIA_BOUNDS.lat.min}
              max={ETHIOPIA_BOUNDS.lat.max}
              step="any" // Changed from "0.000001" to "any" to allow any precision
              value={latInput}
              onChange={(e) => handleCoordinateChange("lat", e.target.value)}
              placeholder="Enter latitude"
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="text-sm text-gray-600">
              Longitude (33 to 48)
            </label>
            <Input
              id="longitude"
              type="number"
              min={ETHIOPIA_BOUNDS.lng.min}
              max={ETHIOPIA_BOUNDS.lng.max}
              step="any" // Changed from "0.000001" to "any" to allow any precision
              value={lngInput}
              onChange={(e) => handleCoordinateChange("lng", e.target.value)}
              placeholder="Enter longitude"
              className="mt-1"
            />
          </div>
        </div>
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
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={selectedLocation || defaultCenter}
            zoom={initialZoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              fullscreenControl: false,
              zoomControl: true,
              mapTypeControl: true,
              streetViewControl: false,
              mapTypeId: "satellite",
              mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                position: google.maps.ControlPosition.TOP_RIGHT,
              },
              draggableCursor: "pointer",
            }}
          >
            {selectedLocation && (
              <Marker
                position={selectedLocation}
                label={{
                  text: farmName,
                  className:
                    "bg-emerald-500 text-white px-2 py-1 rounded-md text-sm font-medium",
                }}
                title={farmName}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#4f46e5",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                }}
              />
            )}
          </GoogleMap>
        </div>
        {selectedLocation && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div>
                  <span className="text-xs text-gray-500">Latitude: </span>
                  <span className="text-sm font-semibold">
                    {selectedLocation.lat.toFixed(10)}{" "}
                    {/* Increased precision */}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Longitude: </span>
                  <span className="text-sm font-semibold">
                    {selectedLocation.lng.toFixed(10)}{" "}
                    {/* Increased precision */}
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
