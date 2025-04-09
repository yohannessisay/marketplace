import React, { useState } from "react";

// Mock data for demonstration
const initialFarmers = [
  { id: 1, email: "john@example.com", phone: "+254712345678" },
  { id: 2, email: "mary@example.com", phone: "+254723456789" },
  { id: 3, email: "david@example.com", phone: "+254734567890" },
  { id: 4, email: "sarah@example.com", phone: "+254745678901" },
  { id: 5, email: "peter@example.com", phone: "+254756789012" },
];

const FarmerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [farmers, setFarmers] = useState(initialFarmers);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newFarmer, setNewFarmer] = useState({
    id: 0,
    email: "",
    phone: "",
    fullName: "",
    location: "",
    crops: "",
  });

  // Filter farmers based on search term
  const filteredFarmers = farmers.filter(
    (farmer) =>
      farmer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle view farmer details
  const handleViewFarmer = (id: number) => {
    alert(`View farmer details for ID: ${id}`);
    // You would typically navigate to a detail page or open a modal here
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFarmer({
      ...newFarmer,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = farmers.length > 0 ? Math.max(...farmers.map(f => f.id)) + 1 : 1;
    
    const farmerToAdd = {
      id: newId,
      email: newFarmer.email,
      phone: newFarmer.phone,
    };
    
    setFarmers([...farmers, farmerToAdd]);
    setNewFarmer({
      id: 0,
      email: "",
      phone: "",
      fullName: "",
      location: "",
      crops: "",
    });
    setShowUploadForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Afrovalley</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Farmer Management</h2>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              onClick={() => setShowUploadForm(!showUploadForm)}
            >
              {showUploadForm ? "Cancel" : "Add Farmer"}
            </button>
          </div>

          {/* Upload Farmer Form */}
          {showUploadForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Upload Farmer Information</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={newFarmer.fullName}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newFarmer.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={newFarmer.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={newFarmer.location}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Crops Grown</label>
                    <input
                      type="text"
                      name="crops"
                      value={newFarmer.crops}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. Maize, Beans, Coffee"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by email or phone"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Farmers Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFarmers.length > 0 ? (
                  filteredFarmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {farmer.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {farmer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {farmer.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewFarmer(farmer.id)}
                          className="text-green-500 hover:text-green-700 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No farmers found with the provided search term.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerManagement;