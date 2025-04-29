import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Pencil } from "lucide-react";

// Type definitions
export type PolygonCoord = {
  lat: number;
  lng: number;
};

export type CropLocation = {
  cropId?: string;
  address?: string | null;
  lat?: string | number | null;
  lng?: string | number | null;
  price?: string | number | null;
};

export type MapProps = {
  cropLocations?: CropLocation[];
  zoomLevel?: number;
  apiKey: string;
  isReadOnly?: boolean;
  polygonsData?: PolygonCoord[][];
  setPolygonsData?: (data: PolygonCoord[][]) => void;
  options?: any;
  center?: { lat: number; lng: number } | null;
  onPolygonComplete?: (coords: PolygonCoord[]) => void;
  onPolygonDelete?: () => void;
  className?: string;
};

export interface MapRef {
  resetPolygonData: (newPolygonsData: PolygonCoord[][]) => void;
  deleteCurrentShape: () => void;
  enableDrawing: () => void;
}

// Custom Marker component
const LocationMarker: React.FC<{
  position: google.maps.LatLngLiteral;
  label: string;
  price: string | number;
}> = ({ position, label, price }) => {
  return (
    <Marker
      position={position}
      label={{
        text: `$${typeof price === "number" ? price.toFixed(2) : parseFloat(String(price)) ? parseFloat(String(price)).toFixed(2) : "N/A"}`,
        className:
          "bg-emerald-500 text-white px-2 py-1 rounded-md text-sm font-medium",
      }}
      title={label}
    />
  );
};

// Map Container Component
const containerStyle = {
  width: "100%",
  height: "100%",
};

//const libraries: ("drawing" | "places" | "geometry" | "visualization" | "localContext")[] = ["drawing"];
const libraries = ["drawing"] as any;
const GoogleMaps = forwardRef<MapRef, MapProps>(
  (
    {
      cropLocations = [],
      zoomLevel = 10,
      apiKey,
      isReadOnly = false,
      polygonsData: parentData = [],
      setPolygonsData: setParentData,
      options = {},
      center = null,
      onPolygonComplete,
      onPolygonDelete,
      className = "",
    },
    ref,
  ) => {
    // Load Google Maps API
    const { isLoaded } = useJsApiLoader({
      id: "google-map-script",
      googleMapsApiKey: apiKey,
      libraries,
    });

    // Map states
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [drawingManager, setDrawingManager] =
      useState<google.maps.drawing.DrawingManager | null>(null);
    const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);
    const [polygonPaths, setPolygonPaths] = useState<PolygonCoord[][]>(
      parentData || [],
    );
    const [isDrawingMode, setIsDrawingMode] = useState(false);

    // Default center location
    const defaultCenter =
      center ||
      (cropLocations &&
      cropLocations[0] &&
      cropLocations[0].lat &&
      cropLocations[0].lng
        ? {
            lat:
              typeof cropLocations[0].lat === "string"
                ? parseFloat(cropLocations[0].lat)
                : (cropLocations[0].lat as number),
            lng:
              typeof cropLocations[0].lng === "string"
                ? parseFloat(cropLocations[0].lng)
                : (cropLocations[0].lng as number),
          }
        : { lat: 0, lng: 0 });

    // Sync with parent data
    useEffect(() => {
      if (JSON.stringify(parentData) !== JSON.stringify(polygonPaths)) {
        setPolygonPaths(parentData);
      }
    }, [parentData]);

    // Map reference
    const mapRef = useRef<google.maps.Map | null>(null);

    // Initialize map
    const onLoad = (map: google.maps.Map) => {
      mapRef.current = map;
      setMap(map);
    };

    const onUnmount = () => {
      mapRef.current = null;
      setMap(null);
    };

    // Initialize drawing manager
    useEffect(() => {
      if (!isLoaded || !map) return;

      // Clear any existing drawing manager
      if (drawingManager) {
        drawingManager.setMap(null);
      }

      const dm = new window.google.maps.drawing.DrawingManager({
        drawingMode:
          isReadOnly || polygonPaths.length > 0
            ? null
            : window.google.maps.drawing.OverlayType.POLYGON,
        drawingControl: !isReadOnly && polygonPaths.length === 0,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          fillColor: "#4f46e5",
          fillOpacity: 0.35,
          strokeColor: "#4f46e5",
          strokeWeight: 2,
          editable: !isReadOnly,
          zIndex: 1,
        },
      });

      // Add drawing manager to map
      dm.setMap(map);
      setDrawingManager(dm);
      setIsDrawingMode(!isReadOnly && polygonPaths.length === 0);

      // Event listener for polygon complete
      window.google.maps.event.addListener(
        dm,
        "overlaycomplete",
        (event: {
          type: google.maps.drawing.OverlayType;
          overlay: google.maps.Polygon;
        }) => {
          if (event.type === window.google.maps.drawing.OverlayType.POLYGON) {
            // Switch drawing manager off
            dm.setDrawingMode(null);
            dm.setOptions({
              drawingControl: false,
            });
            setIsDrawingMode(false);

            // Get polygon path
            const polygon = event.overlay as google.maps.Polygon;
            const polygonPath = polygon.getPath();
            const pathArray: PolygonCoord[] = [];

            // Convert path to array of coordinates
            for (let i = 0; i < polygonPath.getLength(); i++) {
              const point = polygonPath.getAt(i);
              pathArray.push({
                lat: point.lat(),
                lng: point.lng(),
              });
            }

            // Update polygon paths
            const newPolygonPaths = [pathArray];
            setPolygonPaths(newPolygonPaths);
            if (setParentData) setParentData(newPolygonPaths);
            if (onPolygonComplete) onPolygonComplete(pathArray);

            // Add event listeners for path changes
            const updatePath = () => {
              const updatedPath: PolygonCoord[] = [];
              for (let i = 0; i < polygonPath.getLength(); i++) {
                const point = polygonPath.getAt(i);
                updatedPath.push({
                  lat: point.lat(),
                  lng: point.lng(),
                });
              }
              const updatedPolygonPaths = [updatedPath];
              setPolygonPaths(updatedPolygonPaths);
              if (setParentData) setParentData(updatedPolygonPaths);
            };

            window.google.maps.event.addListener(
              polygonPath,
              "insert_at",
              updatePath,
            );
            window.google.maps.event.addListener(
              polygonPath,
              "remove_at",
              updatePath,
            );
            window.google.maps.event.addListener(
              polygonPath,
              "set_at",
              updatePath,
            );

            // Store polygon reference
            setPolygons([polygon]);
          }
        },
      );

      return () => {
        dm.setMap(null);
        window.google.maps.event.clearInstanceListeners(dm);
      };
    }, [isLoaded, map, isReadOnly, setParentData, onPolygonComplete]);

    // Create polygons based on data
    useEffect(() => {
      if (!isLoaded || !map) return;

      // Clear existing polygons
      polygons.forEach((polygon) => {
        polygon.setMap(null);
        window.google.maps.event.clearInstanceListeners(polygon);
      });

      if (polygonPaths.length === 0) {
        setPolygons([]);

        // Enable drawing controls if not in read-only mode
        if (drawingManager && !isReadOnly) {
          drawingManager.setOptions({
            drawingControl: true,
            drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
          });
          setIsDrawingMode(true);
        }

        return;
      }

      // Create new polygons
      const newPolygons = polygonPaths.map((path) => {
        const polygon = new window.google.maps.Polygon({
          paths: path,
          fillColor: "#4f46e5",
          fillOpacity: 0.35,
          strokeColor: "#4f46e5",
          strokeWeight: 2,
          editable: !isReadOnly,
          zIndex: 1,
        });

        polygon.setMap(map);

        // Add event listeners for path changes
        const updatePath = () => {
          const updatedPath: PolygonCoord[] = [];
          const currentPolygonPath = polygon.getPath();
          for (let i = 0; i < currentPolygonPath.getLength(); i++) {
            const point = currentPolygonPath.getAt(i);
            updatedPath.push({
              lat: point.lat(),
              lng: point.lng(),
            });
          }
          const updatedPolygonPaths = [updatedPath];
          setPolygonPaths(updatedPolygonPaths);
          if (setParentData) setParentData(updatedPolygonPaths);
        };

        const polygonEventPath = polygon.getPath();
        window.google.maps.event.addListener(
          polygonEventPath,
          "insert_at",
          updatePath,
        );
        window.google.maps.event.addListener(
          polygonEventPath,
          "remove_at",
          updatePath,
        );
        window.google.maps.event.addListener(
          polygonEventPath,
          "set_at",
          updatePath,
        );

        return polygon;
      });

      setPolygons(newPolygons);

      // Disable drawing controls
      if (drawingManager) {
        drawingManager.setOptions({
          drawingControl: false,
          drawingMode: null,
        });
        setIsDrawingMode(false);
      }

      // Clean up on unmount
      return () => {
        newPolygons.forEach((polygon) => {
          polygon.setMap(null);
          window.google.maps.event.clearInstanceListeners(polygon);
        });
      };
    }, [
      isLoaded,
      map,
      polygonPaths,
      isReadOnly,
      drawingManager,
      setParentData,
    ]);

    // Expose methods to parent through ref
    useImperativeHandle(ref, () => ({
      resetPolygonData: (newPolygonsData: PolygonCoord[][]) => {
        setPolygonPaths(newPolygonsData);
      },
      deleteCurrentShape: () => {
        const newPolygonPaths: PolygonCoord[][] = [];
        setPolygonPaths(newPolygonPaths);
        if (setParentData) setParentData(newPolygonPaths);
        if (onPolygonDelete) onPolygonDelete();
      },
      enableDrawing: () => {
        if (drawingManager && !isReadOnly) {
          drawingManager.setDrawingMode(
            window.google.maps.drawing.OverlayType.POLYGON,
          );
          setIsDrawingMode(true);
        }
      },
    }));

    // Handle drawing mode
    const handleStartDrawing = () => {
      if (drawingManager && !isReadOnly) {
        drawingManager.setDrawingMode(
          window.google.maps.drawing.OverlayType.POLYGON,
        );
        setIsDrawingMode(true);
      }
    };

    if (!isLoaded)
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          Loading Maps...
        </div>
      );

    return (
      <div className={`flex flex-col h-full w-full ${className}`}>
        {!isReadOnly && (
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex gap-2">
              {!isDrawingMode && polygonPaths.length === 0 && (
                <button
                  onClick={handleStartDrawing}
                  className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  <span>Draw Polygon</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="relative h-full w-full overflow-hidden rounded-lg shadow-md">
          {isDrawingMode && (
            <div className="absolute mt-4  top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-md z-10 text-sm text-gray-700">
              Click on the map to draw a polygon
            </div>
          )}

          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={zoomLevel}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              fullscreenControl: false,
              zoomControl: true,
              mapTypeControl: true,
              streetViewControl: false,
              ...options,
            }}
          >
            {/* Render location markers */}
            {cropLocations.map((location, index) => {
              if (!location.lat || !location.lng) return null;

              const lat =
                typeof location.lat === "string"
                  ? parseFloat(location.lat)
                  : location.lat;
              const lng =
                typeof location.lng === "string"
                  ? parseFloat(location.lng)
                  : location.lng;

              return (
                <LocationMarker
                  key={location.cropId || `location-${index}`}
                  position={{ lat, lng }}
                  label={location.address || "Location"}
                  price={location.price || "N/A"}
                />
              );
            })}
          </GoogleMap>
        </div>
      </div>
    );
  },
);

GoogleMaps.displayName = "GoogleMaps";
export default GoogleMaps;
