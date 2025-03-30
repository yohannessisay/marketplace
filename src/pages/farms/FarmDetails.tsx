import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Add custom CSS for transparent but visible-on-selection headings
const styles = `
  .select-visible::selection {
    background-color: #e2e8f0;
    color: #1a202c;
  }
`;

// Define types
type FormData = {
  farmLocation: string;
  region: string;
  totalFarmSize: string;
  coffeeCoveredLand: string;
  longitude: string;
  latitude: string;
  cropType: string;
  cropSource: string;
  origin: string;
  cropCapacity: string;
  treeType: string;
  treeVariety: string;
  averageTemperature: string;
  soilType: string;
  altitude: string;
  annualRainfall: string;
  farmName: string;
};

const FarmDetailsPage: React.FC = () => {
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    farmLocation: 'Adama',
    region: 'Sidama',
    totalFarmSize: '23',
    coffeeCoveredLand: '18',
    longitude: '38.2537',
    latitude: '8.1678',
    cropType: 'Coffee Arabica',
    cropSource: 'Grown on farm',
    origin: 'Ethiopia',
    cropCapacity: '25,000',
    treeType: 'Shade-grown',
    treeVariety: 'Heirloom',
    averageTemperature: '18°C',
    soilType: 'Volcanic loam',
    altitude: '1,900',
    annualRainfall: '1,500',
    farmName: 'Adama, Sidama, 23 hectars',
  });

  // Handle file upload - placeholder function
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selected:', e.target.files);
  };

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    // Add API call here
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-green-800 text-xl font-bold">Afrovalley</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-sm text-green-600 flex items-center">
              <span className="mr-1">🏠</span> My dashboard
            </Link>
            <Link to="/marketplace" className="text-sm text-gray-600 flex items-center">
              <span className="mr-1">🛒</span> Marketplace
            </Link>
            <Link to="/chats" className="text-sm text-gray-600 flex items-center">
              <span className="mr-1">💬</span> Chats
            </Link>
            <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">
              <span>👤</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mb-1">
                1
              </div>
              <p className="text-xs text-gray-600">Add Farms to your profile</p>
            </div>
            <div className="h-0.5 bg-gray-200 flex-1 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-gray-500 flex items-center justify-center mb-1">
                2
              </div>
              <p className="text-xs text-gray-600">Add your coffee crops to sell</p>
            </div>
            <div className="h-0.5 bg-gray-200 flex-1 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-gray-500 flex items-center justify-center mb-1">
                3
              </div>
              <p className="text-xs text-gray-600">Provide your bank information</p>
            </div>
            <div className="h-0.5 bg-gray-200 flex-1 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-gray-500 flex items-center justify-center mb-1">
                4
              </div>
              <p className="text-xs text-gray-600">Upload your beautiful avatar</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Document Upload Section */}
          <div className="mb-10">
            <div className="mb-2">
              <h2 className="text-green-600 font-medium">Step 1</h2>
              <h3 className="text-xl text-gray-900 font-semibold">Upload your farm documents</h3>
              <p className="text-sm text-gray-600">Upload a clear government registration and land rights document. Make sure text is readable and high-quality</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border border-gray-300 rounded p-4">
                <h4 className="font-medium mb-2 text-gray-400">Government registration document</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <div className="w-10 h-10 text-green-500">📄</div>
                  </div>
                  <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full mb-2">PDF DOCUMENT</div>
                  <p className="text-sm mb-2">Drop your file here or <span className="text-green-500">browse</span></p>
                  <p className="text-xs text-gray-500">Maximum files allowed: 5</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    id="governmentDoc"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png" 
                  />
                </div>
              </div>

              <div className="border border-gray-300 rounded p-4">
                <h4 className="font-medium mb-2 text-gray-400">Land rights documents</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <div className="w-10 h-10 text-green-500">📄</div>
                  </div>
                  <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full mb-2">PDF DOCUMENT</div>
                  <p className="text-sm mb-2">Drop your file here or <span className="text-green-500">browse</span></p>
                  <p className="text-xs text-gray-500">Maximum files allowed: 5</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    id="landRightsDoc"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Farm Information Section */}
          <div className="mb-10">
            <h3 className="text-xl text-gray-900 font-semibold mb-2">Check the farm information</h3>
            <p className="text-sm text-gray-600 mb-6">Check and fill in details about your farm's location, size, climate, and crops</p>

            {/* Farm Location */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Town or Farm Location</label>
                  <input
                    type="text"
                    name="farmLocation"
                    value={formData.farmLocation}
                    onChange={handleInputChange}
                    className="w-full p-2 border bg-white text-black border-gray-300 rounded  "
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full p-2 border  border-gray-300 rounded bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total farm size (hectar)</label>
                  <input
                    type="text"
                    name="totalFarmSize"
                    value={formData.totalFarmSize}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
              </div>
            </div>

            {/* Coffee Land Details */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coffee Covered Land (hectar)</label>
                  <input
                    type="text"
                    name="coffeeCoveredLand"
                    value={formData.coffeeCoveredLand}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
              </div>
            </div>

            {/* Crop Environment */}
            <div className="mb-6">
              <h4 className="font-medium mb-4  text-gray-700 select-visible">Crop environment</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop type</label>
                  <input
                    type="text"
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Source</label>
                  <input
                    type="text"
                    name="cropSource"
                    value={formData.cropSource}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
              </div>
            </div>

            {/* Crop Capacity */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Capacity (kg)</label>
                  <input
                    type="text"
                    name="cropCapacity"
                    value={formData.cropCapacity}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
              </div>
            </div>

            {/* Tree Information */}
            <div className="mb-6">
              <h4 className="font-medium mb-4 text-gray-700 select-visible">Tree information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tree Type</label>
                  <select
                    name="treeType"
                    value={formData.treeType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  >
                    <option value="Shade-grown">Shade-grown</option>
                    <option value="Sun-grown">Sun-grown</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tree Variety</label>
                  <select
                    name="treeVariety"
                    value={formData.treeVariety}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  >
                    <option value="Heirloom">Heirloom</option>
                    <option value="Typica">Typica</option>
                    <option value="Bourbon">Bourbon</option>
                    <option value="Geisha">Geisha</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Growing Conditions */}
            <div className="mb-6">
              <h4 className="font-medium mb-4 text-gray-700 select-visible">Growing Conditions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Average Annual Temperature</label>
                  <input
                    type="text"
                    name="averageTemperature"
                    value={formData.averageTemperature}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soil type</label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  >
                    <option value="Volcanic loam">Volcanic loam</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Silty">Silty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Altitude (m)</label>
                  <input
                    type="text"
                    name="altitude"
                    value={formData.altitude}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Rainfall (mm)</label>
                  <input
                    type="text"
                    name="annualRainfall"
                    value={formData.annualRainfall}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
              </div>
            </div>

            {/* Farm Name */}
            <div className="mb-6">
              <h4 className="font-medium mb-4 text-gray-700 select-visible">Name your farm</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <input
                    type="text"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mb-8">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              Save and continue
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default FarmDetailsPage;