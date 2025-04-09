import React, { useState, useEffect } from 'react';
import { Search, Filter, Map, Coffee, Droplet, Sun, Star, Tag, Truck } from 'lucide-react';

// Define TypeScript interfaces for our data types
interface CoffeeListing {
  id: string;
  coffee_variety: string;
  bean_type: string;
  farm_name: string;
  region: string;
  country: string;
  processing_method: string;
  quantity_kg: number;
  price_per_kg: number;
  cup_score: string;
  is_organic: boolean;
  photo_url: string;
}

interface FilterState {
  region: string;
  variety: string;
  processing_method: string;
  is_organic: boolean | null;
  min_price: string;
  max_price: string;
  min_cup_score: string;
}

// Mock data based on the schema
const mockListings: CoffeeListing[] = [
  {
    id: "1",
    coffee_variety: "Ethiopian Heirloom",
    bean_type: "Green beans",
    farm_name: "Abadega Family Farm",
    region: "Yirgacheffe",
    country: "Ethiopia",
    processing_method: "Washed",
    quantity_kg: 1250,
    price_per_kg: 8.75,
    cup_score: "86.5",
    is_organic: true,
    photo_url: "/api/placeholder/300/200"
  },
  {
    id: "2",
    coffee_variety: "Bourbon",
    bean_type: "Green beans",
    farm_name: "Gelana Highlands",
    region: "Sidamo",
    country: "Ethiopia",
    processing_method: "Natural",
    quantity_kg: 850,
    price_per_kg: 9.25,
    cup_score: "88",
    is_organic: true,
    photo_url: "/api/placeholder/300/200"
  },
  {
    id: "3",
    coffee_variety: "SL-28",
    bean_type: "Green beans",
    farm_name: "Kafa Cooperative",
    region: "Kafa",
    country: "Ethiopia",
    processing_method: "Honey",
    quantity_kg: 1500,
    price_per_kg: 7.85,
    cup_score: "84",
    is_organic: false,
    photo_url: "/api/placeholder/300/200"
  },
  {
    id: "4",
    coffee_variety: "Typica",
    bean_type: "Green beans",
    farm_name: "Limu Farms",
    region: "Limu",
    country: "Ethiopia",
    processing_method: "Washed",
    quantity_kg: 2200,
    price_per_kg: 7.50,
    cup_score: "85",
    is_organic: false,
    photo_url: "/api/placeholder/300/200"
  },
  {
    id: "5",
    coffee_variety: "Gesha",
    bean_type: "Green beans",
    farm_name: "Bensa Heights",
    region: "Sidamo",
    country: "Ethiopia",
    processing_method: "Natural",
    quantity_kg: 500,
    price_per_kg: 15.75,
    cup_score: "92",
    is_organic: true,
    photo_url: "/api/placeholder/300/200"
  },
  {
    id: "6",
    coffee_variety: "Heirloom",
    bean_type: "Green beans",
    farm_name: "Gedeo Cooperative",
    region: "Gedeo",
    country: "Ethiopia",
    processing_method: "Washed",
    quantity_kg: 1800,
    price_per_kg: 8.25,
    cup_score: "87",
    is_organic: true,
    photo_url: "/api/placeholder/300/200"
  }
];

// Mock filter options based on the schema
const regions = ["Yirgacheffe", "Sidamo", "Kafa", "Limu", "Gedeo"];
const varieties = ["Ethiopian Heirloom", "Bourbon", "SL-28", "Typica", "Gesha"];
const processingMethods = ["Washed", "Natural", "Honey"];

const CoffeeMarketplace = () => {
  const [listings, setListings] = useState<CoffeeListing[]>(mockListings);
  const [filteredListings, setFilteredListings] = useState<CoffeeListing[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    region: "",
    variety: "",
    processing_method: "",
    is_organic: null,
    min_price: "",
    max_price: "",
    min_cup_score: ""
  });
  const [activeFilters, setActiveFilters] = useState(false);
  const [detailedView, setDetailedView] = useState<CoffeeListing | null>(null);

  // Effect to filter listings based on search and filters
  useEffect(() => {
    let results = listings;
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(item => 
        item.coffee_variety.toLowerCase().includes(query) ||
        item.farm_name.toLowerCase().includes(query) ||
        item.region.toLowerCase().includes(query)
      );
    }
    
    // Apply filters
    if (filters.region) {
      results = results.filter(item => item.region === filters.region);
    }
    
    if (filters.variety) {
      results = results.filter(item => item.coffee_variety === filters.variety);
    }
    
    if (filters.processing_method) {
      results = results.filter(item => item.processing_method === filters.processing_method);
    }
    
    if (filters.is_organic !== null) {
      results = results.filter(item => item.is_organic === filters.is_organic);
    }
    
    if (filters.min_price) {
      results = results.filter(item => item.price_per_kg >= parseFloat(filters.min_price));
    }
    
    if (filters.max_price) {
      results = results.filter(item => item.price_per_kg <= parseFloat(filters.max_price));
    }
    
    if (filters.min_cup_score) {
      results = results.filter(item => parseFloat(item.cup_score) >= parseFloat(filters.min_cup_score));
    }
    
    setFilteredListings(results);
    
    // Check if any filters are active
    setActiveFilters(
      Object.values(filters).some(value => 
        value !== "" && value !== null
      )
    );
  }, [searchQuery, filters, listings]);

  // Handle search input change
  const handleSearchChange = (e:any) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (name: keyof FilterState, value: string | boolean | null) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      region: "",
      variety: "",
      processing_method: "",
      is_organic: null,
      min_price: "",
      max_price: "",
      min_cup_score: ""
    });
    setSearchQuery("");
  };

  // Show detailed view of a listing
  const showDetailedView = (listing: CoffeeListing) => {
    setDetailedView(listing);
  };

  // Close detailed view
  const closeDetailedView = () => {
    setDetailedView(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-green-800">Afrovalley</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-green-600">My Dashboard</a>
            <a href="#" className="text-green-600 font-medium">Marketplace</a>
            <a href="#" className="text-gray-600 hover:text-green-600">Chats</a>
            <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Coffee Marketplace</h2>
          <p className="text-gray-600 mt-2">Discover premium coffee directly from Ethiopian farmers</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for coffee variety, farm name or region..."
                className="bg-white pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setActiveFilters(!activeFilters)}
              className={`flex items-center px-4 py-2 rounded-md border ${
                Object.values(filters).some(v => v !== "" && v !== null)
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Expanded Filters */}
          {activeFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <select
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500"
                    value={filters.region}
                    onChange={(e) => handleFilterChange("region", e.target.value)}
                  >
                    <option value="">All Regions</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                {/* Variety Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coffee Variety</label>
                  <select
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500"
                    value={filters.variety}
                    onChange={(e) => handleFilterChange("variety", e.target.value)}
                  >
                    <option value="">All Varieties</option>
                    {varieties.map(variety => (
                      <option key={variety} value={variety}>{variety}</option>
                    ))}
                  </select>
                </div>

                {/* Processing Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Processing Method</label>
                  <select
                    className="w-full  border border-gray-300 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500"
                    value={filters.processing_method}
                    onChange={(e) => handleFilterChange("processing_method", e.target.value)}
                  >
                    <option value="">All Methods</option>
                    {processingMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                {/* Organic Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organic</label>
                  <select
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500"
                    value={filters.is_organic === null ? "" : filters.is_organic.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange("is_organic", value === "" ? null : value === "true");
                    }}
                  >
                    <option value="">All</option>
                    <option value="true">Organic</option>
                    <option value="false">Non-Organic</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price ($/kg)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange("min_price", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price ($/kg)</label>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange("max_price", e.target.value)}
                  />
                </div>

                {/* Cup Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Cup Score</label>
                  <input
                    type="number"
                    placeholder="Min Score"
                    className="w-full border bg-white border-gray-300 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500"
                    value={filters.min_cup_score}
                    onChange={(e) => handleFilterChange("min_cup_score", e.target.value)}
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full text-gray-700 bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-md"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
          </p>
        </div>

        {/* Coffee Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <div 
              key={listing.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => showDetailedView(listing)}
            >
              <div className="relative h-48 bg-gray-200">
                <img 
                  src={listing.photo_url} 
                  alt={listing.coffee_variety} 
                  className="w-full h-full object-cover"
                />
                {listing.is_organic && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                    Organic
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{listing.coffee_variety}</h3>
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium text-yellow-700">{listing.cup_score}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{listing.farm_name}</p>
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <Map className="h-4 w-4 mr-1" />
                  <span>{listing.region}, {listing.country}</span>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <Droplet className="h-4 w-4 mr-1" />
                  <span>{listing.processing_method}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <Coffee className="h-4 w-4 mr-1" />
                  <span>{listing.bean_type}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div className="text-green-700 font-bold">
                    ${listing.price_per_kg.toFixed(2)}/kg
                  </div>
                  <div className="text-gray-500 text-sm">
                    {listing.quantity_kg.toLocaleString()} kg available
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mt-8">
            <Coffee className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No coffee listings found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* Detailed View Modal */}
      {detailedView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="relative">
              <img 
                src={detailedView.photo_url} 
                alt={detailedView.coffee_variety} 
                className="w-full h-64 object-cover"
              />
              <button
                onClick={closeDetailedView}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {detailedView.is_organic && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                  Organic
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{detailedView.coffee_variety}</h2>
                  <p className="text-gray-600">{detailedView.farm_name}</p>
                  <div className="flex items-center mt-2">
                    <Map className="h-5 w-5 text-gray-500 mr-1" />
                    <span className="text-gray-600">{detailedView.region}, {detailedView.country}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-start">
                  <div className="bg-yellow-50 px-3 py-2 rounded-lg flex items-center mb-2">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    <div>
                      <span className="text-lg font-semibold text-yellow-700">{detailedView.cup_score}</span>
                      <span className="text-gray-500 text-sm ml-1">cup score</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    ${detailedView.price_per_kg.toFixed(2)}/kg
                  </div>
                  <div className="text-gray-600 text-sm">
                    {detailedView.quantity_kg.toLocaleString()} kg available
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Coffee Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Bean Type</p>
                        <p className="font-medium">{detailedView.bean_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Processing</p>
                        <p className="font-medium">{detailedView.processing_method}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Organic</p>
                        <p className="font-medium">{detailedView.is_organic ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Region</p>
                        <p className="font-medium">{detailedView.region}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Flavor Profile</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-500">Acidity</span>
                          <span className="text-sm font-medium">Bright, Clean</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-green-500 rounded-full" style={{width: '75%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-500">Body</span>
                          <span className="text-sm font-medium">Medium</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-green-500 rounded-full" style={{width: '60%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-500">Sweetness</span>
                          <span className="text-sm font-medium">Honey, Fruity</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-green-500 rounded-full" style={{width: '85%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Farm Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-4">
                    {detailedView.farm_name} is located in the {detailedView.region} region of {detailedView.country} 
                    at high altitude, creating ideal growing conditions for specialty coffee. The farm is dedicated to 
                    sustainable farming practices and producing high-quality coffee.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Altitude</p>
                      <p className="font-medium">1,800 - 2,100 masl</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Harvest Period</p>
                      <p className="font-medium">October - December</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Soil Type</p>
                      <p className="font-medium">Volcanic Loam</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold">
                  Contact Seller
                </button>
                <button className="flex-1 bg-white border border-green-600 text-green-600 hover:bg-green-50 py-3 px-6 rounded-lg font-semibold">
                  Request Samples
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoffeeMarketplace;