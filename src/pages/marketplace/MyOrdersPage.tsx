import React, { useState } from 'react';
import { Calendar, Coffee, Heart, Package, ShoppingBag, Clock, Star, Info, ChevronDown, Filter } from 'lucide-react';

const mockHistoricalOrders = [
  {
    id: "ord-001",
    listing: {
      id: "list-001",
      coffee_variety: "Ethiopian Heirloom",
      farm_name: "Abadega Family Farm",
      region: "Yirgacheffe, Ethiopia",
      processing_method: "Washed",
      bean_type: "Green beans",
      price_per_kg: 8.75,
      cup_score: "86.5",
      is_organic: true
    },
    quantity_kg: 500,
    unit_price: 8.75,
    total_amount: 4375,
    status: "completed",
    created_at: "2024-02-15T10:30:00Z",
    seller: {
      first_name: "Tadesse",
      last_name: "Abadega"
    }
  },
  {
    id: "ord-002",
    listing: {
      id: "list-002",
      coffee_variety: "Bourbon",
      farm_name: "Gelana Highlands",
      region: "Sidamo, Ethiopia",
      processing_method: "Natural",
      bean_type: "Green beans",
      price_per_kg: 9.25,
      cup_score: "88",
      is_organic: true
    },
    quantity_kg: 850,
    unit_price: 9.25,
    total_amount: 7862.5,
    status: "completed",
    created_at: "2024-01-20T14:45:00Z",
    seller: {
      first_name: "Amare",
      last_name: "Gelana"
    }
  }
];

const mockCurrentOrders = [
  {
    id: "ord-003",
    listing: {
      id: "list-003",
      coffee_variety: "SL-28",
      farm_name: "Kafa Cooperative",
      region: "Kafa, Ethiopia",
      processing_method: "Honey",
      bean_type: "Green beans",
      price_per_kg: 7.85,
      cup_score: "84",
      is_organic: false
    },
    quantity_kg: 1000,
    unit_price: 7.85,
    total_amount: 7850,
    status: "confirmed",
    created_at: "2024-03-10T09:15:00Z",
    estimated_delivery: "2024-05-20",
    coffee_processing_completed: true,
    coffee_ready_for_shipment: false,
    pre_shipment_sample_approved: true,
    container_loaded: false,
    seller: {
      first_name: "Kafa",
      last_name: "Cooperative"
    }
  },
  {
    id: "ord-004",
    listing: {
      id: "list-004",
      coffee_variety: "Ethiopian Heirloom",
      farm_name: "Abadega Family Farm",
      region: "Yirgacheffe, Ethiopia",
      processing_method: "Washed",
      bean_type: "Green beans",
      price_per_kg: 8.75,
      cup_score: "86.5",
      is_organic: true
    },
    quantity_kg: 750,
    unit_price: 8.31, // Discounted price
    total_amount: 6232.5,
    status: "pending",
    created_at: "2024-04-02T11:30:00Z",
    contract_signed: true,
    coffee_processing_completed: false,
    coffee_ready_for_shipment: false,
    pre_shipment_sample_approved: false,
    container_loaded: false,
    seller: {
      first_name: "Tadesse",
      last_name: "Abadega"
    }
  }
];

const mockFavorites = [
  {
    id: "list-005",
    coffee_variety: "Typica",
    farm_name: "Jimma Research Center",
    region: "Jimma, Ethiopia",
    processing_method: "Washed",
    bean_type: "Green beans",
    price_per_kg: 8.25,
    quantity_available: 2000,
    cup_score: "85",
    is_organic: false,
    seller: {
      first_name: "Jimma",
      last_name: "Research"
    }
  },
  {
    id: "list-006",
    coffee_variety: "Gesha",
    farm_name: "Bench Maji Estate",
    region: "Bench Maji, Ethiopia",
    processing_method: "Natural",
    bean_type: "Green beans",
    price_per_kg: 12.50,
    quantity_available: 500,
    cup_score: "91",
    is_organic: true,
    seller: {
      first_name: "Tesfa",
      last_name: "Negash"
    }
  }
];



const MyOrdersPage = () => {
  // State
  const [activeTab, setActiveTab] = useState('current');
  const [caseSelectorOpen, setCaseSelectorOpen] = useState(false);
  
  // Get orders based on active tab
  const getItems = () => {
    switch (activeTab) {
      case 'historical':
        return mockHistoricalOrders;
      case 'current':
        return mockCurrentOrders;
      case 'favorites':
        return mockFavorites;
      default:
        return [];
    }
  };

  // Render order status steps
  const renderOrderStatus = (order: any) => {
    const steps = [
      { label: 'Contract Signed', completed: order.contract_signed },
      { label: 'Processing Completed', completed: order.coffee_processing_completed },
      { label: 'Sample Approved', completed: order.pre_shipment_sample_approved },
      { label: 'Ready for Shipment', completed: order.coffee_ready_for_shipment },
      { label: 'Container Loaded', completed: order.container_loaded }
    ];
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Order Progress</h4>
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="text-xs text-center max-w-[80px]">{step.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Order item component
  const OrderItem = ({ item }) => {
    const isOrderTab = activeTab === 'current' || activeTab === 'historical';
    const isFavorite = activeTab === 'favorites';
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <h3 className="font-bold text-lg text-gray-800">{item.listing?.coffee_variety || item.coffee_variety}</h3>
              {(item.listing?.is_organic || item.is_organic) && (
                <span className="ml-2 text-xs font-semibold bg-green-500 text-white px-2 py-0.5 rounded-full">Organic</span>
              )}
              <div className="ml-2 flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="ml-1 text-sm text-gray-700">{item.listing?.cup_score || item.cup_score}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">
              {item.listing?.farm_name || item.farm_name} • {item.listing?.region || item.region}
            </p>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-lg text-green-600">
              ${isOrderTab ? item.unit_price : item.price_per_kg}/kg
            </div>
            {isOrderTab && (
              <p className="text-sm text-gray-600">{item.quantity_kg} kg</p>
            )}
            {isFavorite && (
              <p className="text-sm text-gray-600">{item.quantity_available} kg available</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center mt-3 text-sm text-gray-500">
          <Coffee className="h-4 w-4 mr-1" />
          <span>{item.listing?.processing_method || item.processing_method}</span>
          <span className="mx-2">•</span>
          <Package className="h-4 w-4 mr-1" />
          <span>{item.listing?.bean_type || item.bean_type}</span>
        </div>
        
        {isOrderTab && (
          <>
            <div className="mt-3 flex justify-between items-center">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-500">
                  Ordered: {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  item.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  item.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="mt-3 border-t border-gray-100 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-medium">${item.total_amount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Seller:</span>
                <span>{item.seller.first_name} {item.seller.last_name}</span>
              </div>
            </div>
            
            {activeTab === 'current' && renderOrderStatus(item)}
            
            <div className="mt-4 flex justify-end space-x-3">
              {activeTab === 'current' && (
                <>
                  <button className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded">
                    Contact Seller
                  </button>
                  <button className="text-sm bg-gray-800 text-white px-3 py-1 rounded">
                    View Details
                  </button>
                </>
              )}
              {activeTab === 'historical' && (
                <>
                  <button className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded">
                    Review Order
                  </button>
                  <button className="text-sm bg-green-600 text-white px-3 py-1 rounded">
                    Order Again
                  </button>
                </>
              )}
              {activeTab === 'favorites' && (
                <>
                  <button className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded">
                    Remove
                  </button>
                  <button className="text-sm bg-green-600 text-white px-3 py-1 rounded">
                    Place Order
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-green-700 font-bold text-xl">Afrovalley</div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900">My Dashboard</a>
            <a href="#" className="text-green-700 font-medium">Marketplace</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Chats</a>
          </nav>
          <div className="h-8 w-8 bg-gray-600 rounded-full"></div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
          
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 text-center font-medium bg-white ${
                activeTab === 'current' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('current')}
            >
              <div className="flex items-center justify-center bg-white">
                <Clock className="h-4 w-4 mr-2" />
                Current Orders
              </div>
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium bg-white ${
                activeTab === 'historical' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('historical')}
            >
              <div className="flex items-center justify-center bg-white">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Order History
              </div>
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium bg-white ${
                activeTab === 'favorites' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('favorites')}
            >
              <div className="flex items-center justify-center bg-white">
                <Heart className="h-4 w-4 mr-2" />
                Favorites
              </div>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            {getItems().length} {activeTab === 'current' ? 'Active Orders' : 
              activeTab === 'historical' ? 'Past Orders' : 'Favorited Items'}
          </p>
          <button className="flex items-center text-sm text-gray-700 bg-white border border-gray-300 rounded px-3 py-2">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </button>
        </div>

        {/* Order/Favorite items */}
        <div>
          {getItems().length > 0 ? (
            getItems().map(item => (
              <OrderItem key={item.id} item={item} />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="flex justify-center">
                <Info className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No {activeTab === 'current' ? 'active orders' : 
                  activeTab === 'historical' ? 'order history' : 'favorites'} found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'favorites' 
                  ? 'Browse the marketplace to find and save your favorite coffee offerings.'
                  : 'Head to the marketplace to place your first order of premium Ethiopian coffee.'}
              </p>
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                  Browse Marketplace
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyOrdersPage;