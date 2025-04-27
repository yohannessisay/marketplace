import { useState, useRef } from 'react';
import PolygonMap, { MapRef, PolygonCoord, CropLocation } from './GoogleMaps';

// Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = "";

export default function CropFieldManager() {
  // Sample crop locations
  const [cropLocations, setCropLocations] = useState<CropLocation[]>([
    {
      cropId: "crop-1",
      address: "Jimma, Ethiopia",
      lat: 7.67,
      lng: 36.83,
      price: "5.49"
    },
    {
      cropId: "crop-2",
      address: "Fremont Farm",
      lat: 7.7,
      lng: 36.91,
      price: "12.35"
    }
  ]);

  // State for polygon data
  const [polygonsData, setPolygonsData] = useState<PolygonCoord[][]>([]);
  
  // Reference to map component methods
  const mapRef = useRef<MapRef>(null);
  
  // Read-only mode state
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  // Handle polygon change
  const handlePolygonChange = (data: PolygonCoord[][]) => {
    setPolygonsData(data);
    console.log("Updated polygon data:", data);
  };
  
  // Handle polygon completion
  const handlePolygonComplete = (coords: PolygonCoord[]) => {
    console.log("Polygon drawing completed:", coords);
    // You could save this to your database or perform other actions
  };
  
  // Handle polygon deletion
  const handlePolygonDelete = () => {
    console.log("Polygon deleted");
    // Clean up related data or perform other actions
  };
  
  // Reset map to initial state
  const handleResetMap = () => {
    if (mapRef.current) {
      mapRef.current.resetPolygonData([]);
    }
  };
  
  // Start new polygon drawing
  const handleStartDrawing = () => {
    if (mapRef.current) {
      mapRef.current.enableDrawing();
    }
  };
  
  // Toggle between edit and read-only modes
  const toggleReadOnly = () => {
    setIsReadOnly(!isReadOnly);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Crop Field Manager</h1>
          <div className="flex gap-3">
            <button
              onClick={toggleReadOnly}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isReadOnly 
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              {isReadOnly ? 'Switch to Edit Mode' : 'Switch to View Mode'}
            </button>
            
            {!isReadOnly && (
              <>
                <button
                  onClick={handleStartDrawing}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={polygonsData.length > 0}
                >
                  Draw New Area
                </button>
                
                <button
                  onClick={handleResetMap}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Reset Map
                </button>
              </>
            )}
          </div>
        </div>

        {/* Map container with fixed height */}
        <div className="h-[600px] w-full">
          <PolygonMap
            ref={mapRef}
            apiKey={GOOGLE_MAPS_API_KEY}
            cropLocations={cropLocations}
            zoomLevel={10}
            isReadOnly={isReadOnly}
            polygonsData={polygonsData}
            setPolygonsData={handlePolygonChange}
            onPolygonComplete={handlePolygonComplete}
            onPolygonDelete={handlePolygonDelete}
            options={{
              mapTypeId: 'satellite',
              mapTypeControl: true,
              mapTypeControlOptions: {
                style: 2, // DROPDOWN_MENU
                position: 3 // TOP_RIGHT
              }
            }}
          />
        </div>

        {/* Field data display */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Field Data</h2>
          
          {polygonsData.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Number of Vertices</h3>
                  <p className="text-lg font-semibold text-gray-900">{polygonsData[0]?.length || 0}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Total Area</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {/* Calculate approximate area in hectares */}
                    {polygonsData[0] ? `~${calculateApproxArea(polygonsData[0]).toFixed(2)} hectares` : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Coordinates</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(polygonsData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No field area defined. Draw a polygon on the map to see data.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate approximate area of polygon in hectares
function calculateApproxArea(coords: PolygonCoord[]): number {
  if (!coords || coords.length < 3) return 0;
  
  // Earth's radius in meters
  const R = 6371000;
  
  // Calculate area using Shoelace formula
  let area = 0;
  
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    
    // Convert to radians
    const lat1 = coords[i].lat * Math.PI / 180;
    const lng1 = coords[i].lng * Math.PI / 180;
    const lat2 = coords[j].lat * Math.PI / 180;
    const lng2 = coords[j].lng * Math.PI / 180;
    
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  
  area = Math.abs(area * R * R / 2);
  
  // Convert square meters to hectares
  return area / 10000;
}