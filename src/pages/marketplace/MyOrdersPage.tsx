import React, { useState } from 'react';
import { Calendar, Coffee, Heart, Package, ShoppingBag, Clock, Star, Info, ChevronDown, Filter, User, ArrowRight, CheckCircle, Circle, AlertCircle, Truck, Send } from 'lucide-react';

// Mock data from your original component
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
    order_placed: true,
    contract_signed: true,
    coffee_processing_completed: true,
    coffee_ready_for_shipment: false,
    pre_shipment_sample_approved: true,
    container_loaded: false,
    container_shipped: false,
    delivered: false,
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
    order_placed: true,
    contract_signed: true,
    coffee_processing_completed: false,
    coffee_ready_for_shipment: false,
    pre_shipment_sample_approved: false,
    container_loaded: false,
    container_shipped: false,
    delivered: false,
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
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
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

  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  // Render order status progress
  const renderOrderProgress = (order) => {
    const steps = [
      { key: 'order_placed', label: 'Order Placed', completed: order.order_placed },
      { key: 'contract_signed', label: 'Contract Signed', completed: order.contract_signed },
      { key: 'coffee_processing_completed', label: 'Processing Completed', completed: order.coffee_processing_completed },
      { key: 'coffee_ready_for_shipment', label: 'Ready for Shipment', completed: order.coffee_ready_for_shipment },
      { key: 'pre_shipment_sample_approved', label: 'Sample Approved', completed: order.pre_shipment_sample_approved },
      { key: 'container_loaded', label: 'Container Loaded', completed: order.container_loaded },
      { key: 'container_shipped', label: 'Shipped', completed: order.container_shipped },
      { key: 'delivered', label: 'Delivered', completed: order.delivered }
    ];

    // Find the current step (first incomplete step)
    const currentStepIndex = steps.findIndex(step => !step.completed);
    
    return (
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">Order Progress</h4>
        <div className="space-y-4">
          {steps.map((step, index) => {
            // Determine the step status
            let statusClass = "";
            let StatusIcon = Circle;
            
            if (step.completed) {
              statusClass = "text-green-600";
              StatusIcon = CheckCircle;
            } else if (index === currentStepIndex) {
              statusClass = "text-blue-600";
              StatusIcon = AlertCircle;
            } else {
              statusClass = "text-gray-300";
              StatusIcon = Circle;
            }
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`${statusClass}`}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div className={`ml-3 ${step.completed ? 'text-gray-800' : index === currentStepIndex ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  {step.label}
                </div>
                {step.completed && index < steps.length - 1 && (
                  <div className="ml-auto text-xs text-green-600 font-medium">Completed</div>
                )}
                {!step.completed && index === currentStepIndex && (
                  <div className="ml-auto text-xs text-blue-600 font-medium">In Progress</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Order item component
  const OrderItem = ({ item }) => {
    const isOrderTab = activeTab === 'current' || activeTab === 'historical';
    const isFavorite = activeTab === 'favorites';
    const isExpanded = expandedOrderId === item.id;
    
    return (
      <div className="bg-white rounded-lg shadow p-5 mb-4 border border-gray-100 transition-all duration-200 hover:shadow-md">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="font-bold text-lg text-gray-800">{item.listing?.coffee_variety || item.coffee_variety}</h3>
              {(item.listing?.is_organic || item.is_organic) && (
                <span className="ml-2 text-xs font-semibold bg-green-500 text-white px-2 py-0.5 rounded-full">Organic</span>
              )}
            </div>
            
            <div className="flex items-center mb-3">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-sm text-gray-700 mr-3">{item.listing?.cup_score || item.cup_score}</span>
              <span className="text-sm text-gray-600">
                {item.listing?.farm_name || item.farm_name} • {item.listing?.region || item.region}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-lg text-green-600">
              ${isOrderTab ? item.unit_price.toFixed(2) : item.price_per_kg.toFixed(2)}/kg
            </div>
            <div className="text-sm text-gray-600">
              {isOrderTab ? `${item.quantity_kg.toLocaleString()} kg` : `${item.quantity_available.toLocaleString()} kg available`}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-3">
          <div className="flex items-center">
            <Coffee className="h-4 w-4 mr-1" />
            <span>{item.listing?.processing_method || item.processing_method}</span>
          </div>
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-1" />
            <span>{item.listing?.bean_type || item.bean_type}</span>
          </div>
          {isOrderTab && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Ordered: {new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {isOrderTab && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-sm text-gray-700 font-medium">
                {item.seller.first_name} {item.seller.last_name}
              </span>
              <a href={`/sellers/${item.seller.first_name.toLowerCase()}-${item.seller.last_name.toLowerCase()}`} 
                className="ml-2 text-xs text-green-600 hover:text-green-700 font-medium">
                View Seller
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                item.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                item.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
              <button 
                onClick={() => toggleOrderExpansion(item.id)}
                className="text-gray-500 hover:text-gray-700 transition-colors bg-white"
              >
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}
        
        {/* Expandable section with order details */}
        {isOrderTab && isExpanded && (
          <div className="mt-4 border-t border-gray-100 pt-4 animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Order Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Order ID:</span>
                    <span className="font-medium">{item.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Unit Price:</span>
                    <span className="font-medium">${item.unit_price.toFixed(2)}/kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-medium">{item.quantity_kg.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Amount:</span>
                    <span className="font-bold text-green-600">${item.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Seller Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium">{item.seller.first_name} {item.seller.last_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Farm:</span>
                    <span className="font-medium">{item.listing.farm_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Region:</span>
                    <span className="font-medium">{item.listing.region}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Render order progress for current orders */}
            {activeTab === 'current' && renderOrderProgress(item)}
            
            <div className="mt-4 flex justify-end space-x-3">
              {activeTab === 'current' && (
                <>
                  <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                    Contact Seller
                  </button>
                  <button className="text-sm bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center">
                    <span>View Details</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </>
              )}
              {activeTab === 'historical' && (
                <>
                  <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                    Review Order
                  </button>
                  <button className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center">
                    <span>Order Again</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Actions for favorites */}
        {isFavorite && (
          <div className="mt-4 flex justify-end space-x-3">
            <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
              Remove
            </button>
            <button className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center">
              <span>Place Order</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Empty state component
  const EmptyState = () => {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex justify-center">
          <Info className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No {activeTab === 'current' ? 'active orders' : 
            activeTab === 'historical' ? 'order history' : 'favorites'} found
        </h3>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          {activeTab === 'favorites' 
            ? 'Browse the marketplace to find and save your favorite coffee offerings.'
            : 'Head to the marketplace to place your first order of premium Ethiopian coffee.'}
        </p>
        <div className="mt-6">
          <a href="/marketplace" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors">
            Browse Marketplace
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <a href="/" className="text-green-600 font-bold text-xl">Afrovalley</a>
          <nav className="hidden md:flex space-x-8">
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">My Dashboard</a>
            <a href="/marketplace" className="text-green-700 font-medium">Marketplace</a>
            <a href="/chats" className="text-gray-600 hover:text-gray-900 transition-colors">Chats</a>
          </nav>
          <div className="h-8 w-8 bg-gray-500 rounded-full"></div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 text-center font-medium bg-white ${
                activeTab === 'current' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
              } transition-colors`}
              onClick={() => setActiveTab('current')}
            >
              <div className="flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2" />
                Current Orders
              </div>
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium bg-white ${
                activeTab === 'historical' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
              } transition-colors`}
              onClick={() => setActiveTab('historical')}
            >
              <div className="flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Order History
              </div>
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium bg-white ${
                activeTab === 'favorites' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
              } transition-colors`}
              onClick={() => setActiveTab('favorites')}
            >
              <div className="flex items-center justify-center">
                <Heart className="h-4 w-4 mr-2" />
                Favorites
              </div>
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600 font-medium">
            {getItems().length} {activeTab === 'current' ? 'Active Orders' : 
              activeTab === 'historical' ? 'Past Orders' : 'Favorited Items'}
          </p>
          <button className="flex items-center text-sm text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>

        {/* Order/Favorite items */}
        <div className="space-y-5">
          {getItems().length > 0 ? (
            getItems().map(item => (
              <OrderItem key={item.id} item={item} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
};

export default MyOrdersPage;