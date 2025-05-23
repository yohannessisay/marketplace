"use client";

import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Maximize2, Minimize2, Pencil } from "lucide-react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

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
  options?: google.maps.MapOptions;
  center?: { lat: number; lng: number } | null;
  onPolygonComplete?: (coords: PolygonCoord[]) => void;
  onPolygonDelete?: () => void;
  className?: string;
};

export interface MapRef {
  resetPolygonData: (newPolygonsData: PolygonCoord[][]) => void;
  deleteCurrentShape: () => void;
  enableDrawing: () => void;
  setPolygonsData: (data: PolygonCoord[][]) => void;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const libraries: "drawing"[] = ["drawing"];

const calculatePolygonCentroid = (
  polygons: PolygonCoord[][],
): { lat: number; lng: number } | null => {
  if (!polygons || polygons.length === 0 || polygons[0].length === 0) {
    return null;
  }

  let totalLat = 0;
  let totalLng = 0;
  let totalPoints = 0;

  polygons.forEach((polygon) => {
    polygon.forEach((coord) => {
      totalLat += coord.lat;
      totalLng += coord.lng;
      totalPoints += 1;
    });
  });

  if (totalPoints === 0) return null;

  return {
    lat: totalLat / totalPoints,
    lng: totalLng / totalPoints,
  };
};

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
    const { isLoaded } = useJsApiLoader({
      id: "google-map-script",
      googleMapsApiKey: apiKey,
      libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [drawingManager, setDrawingManager] =
      useState<google.maps.drawing.DrawingManager | null>(null);
    const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);
    const [polygonPaths, setPolygonPaths] =
      useState<PolygonCoord[][]>(parentData);
    const [isDrawingMode, setIsDrawingMode] = useState(false);

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

    useEffect(() => {
      if (JSON.stringify(parentData) !== JSON.stringify(polygonPaths)) {
        setPolygonPaths(parentData);
        if (map && parentData.length > 0) {
          const centroid = calculatePolygonCentroid(parentData);
          if (centroid) {
            map.setCenter(centroid);
          }
        }
      }
    }, [parentData, map]);

    const mapRef = useRef<google.maps.Map | null>(null);

    const onLoad = (map: google.maps.Map) => {
      mapRef.current = map;
      setMap(map);

      if (polygonPaths.length > 0) {
        const centroid = calculatePolygonCentroid(polygonPaths);
        if (centroid) {
          map.setCenter(centroid);
        }
      }
    };

    const onUnmount = () => {
      mapRef.current = null;
      setMap(null);
    };

    useEffect(() => {
      if (!isLoaded || !map) return;

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

      dm.setMap(map);
      setDrawingManager(dm);
      setIsDrawingMode(!isReadOnly && polygonPaths.length === 0);

      window.google.maps.event.addListener(
        dm,
        "overlaycomplete",
        (event: {
          type: google.maps.drawing.OverlayType;
          overlay: google.maps.Polygon;
        }) => {
          if (event.type === window.google.maps.drawing.OverlayType.POLYGON) {
            dm.setDrawingMode(null);
            dm.setOptions({
              drawingControl: false,
            });
            setIsDrawingMode(false);

            const polygon = event.overlay as google.maps.Polygon;
            const polygonPath = polygon.getPath();
            const pathArray: PolygonCoord[] = [];

            for (let i = 0; i < polygonPath.getLength(); i++) {
              const point = polygonPath.getAt(i);
              pathArray.push({
                lat: point.lat(),
                lng: point.lng(),
              });
            }

            const newPolygonPaths = [pathArray];
            setPolygonPaths(newPolygonPaths);
            if (setParentData) setParentData(newPolygonPaths);
            if (onPolygonComplete) onPolygonComplete(pathArray);

            const centroid = calculatePolygonCentroid([pathArray]);
            if (centroid && map) {
              map.setCenter(centroid);
            }

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

              const centroid = calculatePolygonCentroid([updatedPath]);
              if (centroid && map) {
                map.setCenter(centroid);
              }
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

            setPolygons([polygon]);
          }
        },
      );

      return () => {
        dm.setMap(null);
        window.google.maps.event.clearInstanceListeners(dm);
      };
    }, [isLoaded, map, isReadOnly, setParentData, onPolygonComplete]);

    useEffect(() => {
      if (!isLoaded || !map) return;

      polygons.forEach((polygon) => {
        polygon.setMap(null);
        window.google.maps.event.clearInstanceListeners(polygon);
      });

      if (polygonPaths.length === 0) {
        setPolygons([]);

        if (drawingManager && !isReadOnly) {
          drawingManager.setOptions({
            drawingControl: true,
            drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
          });
          setIsDrawingMode(true);
        }

        return;
      }

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

          const centroid = calculatePolygonCentroid([updatedPath]);
          if (centroid && map) {
            map.setCenter(centroid);
          }
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

      if (drawingManager) {
        drawingManager.setOptions({
          drawingControl: false,
          drawingMode: null,
        });
        setIsDrawingMode(false);
      }

      const centroid = calculatePolygonCentroid(polygonPaths);
      if (centroid && map) {
        map.setCenter(centroid);
      }

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

    useImperativeHandle(ref, () => ({
      resetPolygonData: (newPolygonsData: PolygonCoord[][]) => {
        setPolygonPaths(newPolygonsData);
        if (setParentData) setParentData(newPolygonsData);

        const centroid = calculatePolygonCentroid(newPolygonsData);
        if (centroid && map) {
          map.setCenter(centroid);
        }
      },
      deleteCurrentShape: () => {
        const newPolygonPaths: PolygonCoord[][] = [];
        setPolygonPaths(newPolygonPaths);
        if (setParentData) setParentData(newPolygonPaths);
        if (onPolygonDelete) onPolygonDelete();

        if (map) {
          map.setCenter(defaultCenter);
        }
      },
      enableDrawing: () => {
        if (drawingManager && !isReadOnly) {
          drawingManager.setDrawingMode(
            window.google.maps.drawing.OverlayType.POLYGON,
          );
          setIsDrawingMode(true);
        }
      },
      setPolygonsData: (data: PolygonCoord[][]) => {
        setPolygonPaths(data);
        if (setParentData) setParentData(data);

        const centroid = calculatePolygonCentroid(data);
        if (centroid && map) {
          map.setCenter(centroid);
        }
      },
    }));

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
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm sm:text-base">
          Loading Maps...
        </div>
      );

    return (
      <div className={`flex flex-col h-full w-full ${className}`}>
        {!isReadOnly && (
          <div className="flex justify-between items-center mb-2 sm:mb-3 px-1">
            <div className="flex gap-2">
              {!isDrawingMode && polygonPaths.length === 0 && (
                <button
                  onClick={handleStartDrawing}
                  className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-xs sm:text-sm"
                >
                  <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>Draw Polygon</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="relative h-full w-full overflow-hidden rounded-lg shadow-md">
          {isDrawingMode && (
            <div className="absolute mt-2 sm:mt-4 top-4 left-1/2 transform -translate-x-1/2 bg-white px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-md z-10 text-xs sm:text-sm text-gray-700">
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
          />
        </div>
      </div>
    );
  },
);

GoogleMaps.displayName = "GoogleMaps";

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

  useEffect(() => {
    if (initialPolygons.length > 0 && polygonsData.length === 0) {
      setPolygonsData(initialPolygons);
      onPolygonChange(initialPolygons);
      if (mapRef.current) {
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
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-2 sm:p-3 lg:p-4">
      <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-700 mb-2 sm:mb-0">
        {polygonsData.length > 0 ? "Farm Boundary" : "Draw Farm Boundary"}
      </h2>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={toggleReadOnly}
          className={`${
            isReadOnly
              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          } border-none text-xs sm:text-sm`}
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
              className="text-xs sm:text-sm"
            >
              Draw New Boundary
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleResetMap}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300 border-none text-xs sm:text-sm"
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
            <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
          ) : (
            <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <div className="flex flex-col space-y-3 sm:space-y-4">
        {!isFullScreen && renderControlBar()}
        <div
          className={`w-full rounded-lg overflow-hidden shadow-md transition-all duration-300 ${
            isFullScreen
              ? "fixed inset-0 z-50 bg-white"
              : "h-[300px] sm:h-[400px] lg:h-[500px]"
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
            className={`bg-white ${isFullScreen ? "h-full pt-14 sm:pt-16" : "h-full"}`}
          />
        </div>
        {polygonsData.length > 0 && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Boundary Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 sm:gap-4">
                <div>
                  <span className="text-xs text-gray-500">Approx. Area: </span>
                  <span className="text-xs sm:text-sm font-semibold">
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

const GOOGLE_MAPS_API_KEY = import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
