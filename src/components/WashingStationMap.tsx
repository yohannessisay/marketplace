import React, { useState } from "react";
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";

interface WashingStation {
  id: string;
  station_name: string;
  town_location: string;
  region: string;
  country: string;
  longitude: number | null;
  latitude: number | null;
  processing_capacity_kg_per_day: number | null;
  water_source: string | null;
  processing_methods: string[] | null;
  certification: string[] | null;
  year_established: number | null;
}

const WashingStationInfo: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<WashingStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<WashingStation | null>(
    null,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 9.145, lng: 40.489 });

  const [newStation, setNewStation] = useState<Partial<WashingStation>>({
    station_name: "",
    town_location: "",
    region: "",
    country: "Ethiopia",
    longitude: null,
    latitude: null,
    processing_capacity_kg_per_day: null,
    water_source: "",
    processing_methods: [],
    certification: [],
    year_established: null,
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "",
    libraries: ["places"],
  });

  const searchWashingStations = (term: string) => {
    setIsSearching(true);
    setTimeout(() => {
      const mockResults: WashingStation[] = [
        {
          id: "1",
          station_name: "a Washing Station",
          town_location: "a",
          region: "Gedeo Zone",
          country: "Ethiopia",
          longitude: 6.1306,
          latitude: 38.2069,
          processing_capacity_kg_per_day: 5000,
          water_source: "Spring",
          processing_methods: ["Washed", "Natural"],
          certification: ["Organic", "Fair Trade"],
          year_established: 2005,
        },
        {
          id: "2",
          station_name: "b Coffee Processors",
          town_location: "b",
          region: "Sidama",
          country: "Ethiopia",
          longitude: 7.0504,
          latitude: 38.4955,
          processing_capacity_kg_per_day: 8000,
          water_source: "River",
          processing_methods: ["Washed", "Honey"],
          certification: ["Organic"],
          year_established: 2010,
        },
      ].filter(
        (station) =>
          station.station_name.toLowerCase().includes(term.toLowerCase()) ||
          station.region.toLowerCase().includes(term.toLowerCase()) ||
          station.town_location.toLowerCase().includes(term.toLowerCase()),
      );

      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchWashingStations(searchTerm);
    }
  };

  const handleSelectStation = (station: WashingStation) => {
    setSelectedStation(station);
    setShowCreateForm(false);
    if (station.latitude && station.longitude) {
      setMapCenter({ lat: station.latitude, lng: station.longitude });
    }
  };

  const handleCreateNewClick = () => {
    setShowCreateForm(true);
    setSelectedStation(null);
    setSearchResults([]);
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng && showCreateForm) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setNewStation({
        ...newStation,
        latitude: lat,
        longitude: lng,
      });
      setMapCenter({ lat, lng });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewStation({
      ...newStation,
      [name]: value,
    });
  };

  const handleCreateStation = () => {
    setSelectedStation(newStation as WashingStation);
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800">
            Select your coffee washing station
          </h2>
          <p className="text-gray-600 mt-1">
            Search for your washing station or create a new one if it doesn't
            exist
          </p>

          {/* Search Section */}
          {!showCreateForm && !selectedStation && (
            <div className="mt-8">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by station name or region..."
                    className="w-full p-3 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={isSearching}
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
                <button
                  onClick={handleCreateNewClick}
                  className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                >
                  Create New
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-6 border border-gray-200 rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                    Search Results ({searchResults.length})
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {searchResults.map((station) => (
                      <li
                        key={station.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectStation(station)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">
                              {station.station_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {station.town_location}, {station.region}
                            </p>
                            <p className="text-xs text-gray-500">
                              Processing:{" "}
                              {station.processing_methods?.join(", ")}
                            </p>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {searchTerm && searchResults.length === 0 && !isSearching && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
                  <p className="text-gray-700">
                    No washing stations found matching "{searchTerm}"
                  </p>
                  <button
                    onClick={handleCreateNewClick}
                    className="mt-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 text-sm"
                  >
                    Create a new washing station
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Selected Station Details */}
          {selectedStation && !showCreateForm && (
            <div className="mt-8 border border-gray-200 rounded-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedStation.station_name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedStation.town_location}, {selectedStation.region}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStation(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Processing Capacity
                  </p>
                  <p className="text-gray-800">
                    {selectedStation.processing_capacity_kg_per_day} kg/day
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Water Source
                  </p>
                  <p className="text-gray-800">
                    {selectedStation.water_source}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Processing Methods
                  </p>
                  <p className="text-gray-800">
                    {selectedStation.processing_methods?.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Certification
                  </p>
                  <p className="text-gray-800">
                    {selectedStation.certification?.join(", ") || "None"}
                  </p>
                </div>
              </div>

              {isLoaded &&
                selectedStation.latitude &&
                selectedStation.longitude && (
                  <div className="mt-4 h-64 rounded-md overflow-hidden">
                    <GoogleMap
                      mapContainerClassName="w-full h-full"
                      center={{
                        lat: selectedStation.latitude,
                        lng: selectedStation.longitude,
                      }}
                      zoom={14}
                    >
                      <Marker
                        position={{
                          lat: selectedStation.latitude,
                          lng: selectedStation.longitude,
                        }}
                      />
                    </GoogleMap>
                  </div>
                )}
            </div>
          )}

          {/* Create New Washing Station Form */}
          {showCreateForm && (
            <div className="mt-8 border border-gray-200 rounded-md p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800">
                  Create New Washing Station
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label
                    htmlFor="station_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Station Name*
                  </label>
                  <input
                    type="text"
                    id="station_name"
                    name="station_name"
                    value={newStation.station_name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="town_location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Town/Village*
                  </label>
                  <input
                    type="text"
                    id="town_location"
                    name="town_location"
                    value={newStation.town_location}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Region*
                  </label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    value={newStation.region}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={newStation.country}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                    readOnly
                  />
                </div>
                <div>
                  <label
                    htmlFor="water_source"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Water Source
                  </label>
                  <select
                    id="water_source"
                    name="water_source"
                    value={newStation.water_source || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="">Select water source</option>
                    <option value="River">River</option>
                    <option value="Spring">Spring</option>
                    <option value="Well">Well</option>
                    <option value="Lake">Lake</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <p className="block text-sm font-medium text-gray-700 mb-1">
                    Location (click on map to set coordinates)
                  </p>
                  {isLoaded && (
                    <div className="h-64 rounded-md overflow-hidden border border-gray-300">
                      <GoogleMap
                        mapContainerClassName="w-full h-full"
                        center={mapCenter}
                        zoom={6}
                        onClick={handleMapClick}
                      >
                        {newStation.latitude && newStation.longitude && (
                          <Marker
                            position={{
                              lat: newStation.latitude,
                              lng: newStation.longitude,
                            }}
                          />
                        )}
                      </GoogleMap>
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="latitude"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Latitude
                  </label>
                  <input
                    type="text"
                    id="latitude"
                    value={
                      newStation.latitude !== null ? newStation.latitude : ""
                    }
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                    readOnly
                  />
                </div>
                <div>
                  <label
                    htmlFor="longitude"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Longitude
                  </label>
                  <input
                    type="text"
                    id="longitude"
                    value={
                      newStation.longitude !== null ? newStation.longitude : ""
                    }
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                    readOnly
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleCreateStation}
                  className="w-full py-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 font-medium"
                  disabled={
                    !newStation.station_name ||
                    !newStation.town_location ||
                    !newStation.region
                  }
                >
                  Create Washing Station
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WashingStationInfo;
