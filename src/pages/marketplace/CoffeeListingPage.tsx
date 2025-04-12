import React, { useState, useEffect } from 'react';
import { 
  Star, MessageCircle, ArrowLeft, ChevronDown, Check, X, MapPin, 
  Coffee, Droplet, Sunrise, Award, TrendingUp, Send, Calendar, 
  Download, Truck, Package, Clock, CheckCircle, FileText, AlertTriangle
} from 'lucide-react';

// Order status types
type OrderStatus = 'none' | 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'completed' | 'cancelled';

// Main component
const CoffeeListingPagev1 = () => {
  const [activeTab, setActiveTab] = useState('details');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [quantity, setQuantity] = useState(100);
  const [chatMessage, setChatMessage] = useState('');
  
  // For demo/testing purposes - this would be removed in production
  const [demoOrderStatus, setDemoOrderStatus] = useState<OrderStatus>('none');
  
  // Derive order data based on selected demo status
  const orderStatus = React.useMemo(() => {
    if (demoOrderStatus === 'none') {
      return null;
    }
    
    // Base order data
    const baseOrder = {
      quantity: 500,
      totalPrice: 4375,
      orderedDate: '2024-04-01',
      estimatedDelivery: '2024-06-15',
    };
    
    // Steps configuration based on order status
    const getSteps = () => {
      const allSteps = [
        { name: 'Order Placed', key: 'orderPlaced' },
        { name: 'Contract Signed', key: 'contractSigned' },
        { name: 'Processing Completed', key: 'processingCompleted' },
        { name: 'Ready for Shipment', key: 'readyForShipment' },
        { name: 'Sample Approved', key: 'sampleApproved' },
        { name: 'Container Loaded', key: 'containerLoaded' },
        { name: 'Shipped', key: 'shipped' },
        { name: 'Delivered', key: 'delivered' }
      ];
      
      let completedSteps: string[] = [];
      
      switch (demoOrderStatus) {
        case 'pending':
          completedSteps = ['orderPlaced'];
          break;
        case 'confirmed':
          completedSteps = ['orderPlaced', 'contractSigned'];
          break;
        case 'processing':
          completedSteps = ['orderPlaced', 'contractSigned', 'processingCompleted'];
          break;
        case 'shipping':
          completedSteps = ['orderPlaced', 'contractSigned', 'processingCompleted', 
                           'readyForShipment', 'sampleApproved', 'containerLoaded', 'shipped'];
          break;
        case 'delivered':
        case 'completed':
          completedSteps = ['orderPlaced', 'contractSigned', 'processingCompleted', 
                          'readyForShipment', 'sampleApproved', 'containerLoaded', 'shipped', 'delivered'];
          break;
        default:
          completedSteps = [];
      }
      
      return allSteps.map(step => ({
        ...step,
        completed: completedSteps.includes(step.key)
      }));
    };
    
    const getDocuments = () => {
      if (['completed', 'delivered', 'shipping'].includes(demoOrderStatus)) {
        return [
          { name: 'Bill of Lading', date: '2024-05-15' },
          { name: 'Quality Certificate', date: '2024-05-10' },
          { name: 'Export License', date: '2024-05-08' },
        ];
      }
      
      if (['confirmed', 'processing'].includes(demoOrderStatus)) {
        return [
          { name: 'Purchase Agreement', date: '2024-04-03' },
        ];
      }
      
      return [];
    };
    
    return {
      status: demoOrderStatus,
      ...baseOrder,
      steps: getSteps(),
      documents: getDocuments(),
      needsReview: demoOrderStatus === 'delivered',
      hasIssue: demoOrderStatus === 'cancelled',
      issueDescription: demoOrderStatus === 'cancelled' ? 'Cancelled due to quality concerns' : null,
    };
  }, [demoOrderStatus]);
  
  // Mock data - in a real app this would come from an API call
  const listing = {
    id: "eb7f3456-c9d8-4a12-b456-789012345678",
    title: "Ethiopian Heirloom",
    score: 86.5,
    price: 8.75,
    isOrganic: true,
    farmName: "Abadega Family Farm",
    region: "Yirgacheffe",
    country: "Ethiopia",
    processing: "Washed",
    beanType: "Green beans",
    availableQuantity: 1250,
    cropYear: "2024",
    variety: "Ethiopian Heirloom",
    altitude: 1900,
    cupProfile: {
      acidity: "Bright, citrusy",
      body: "Medium",
      sweetness: "High, honey-like",
      aftertaste: "Long, clean",
      aroma: "Floral, jasmine",
      balance: "Well-balanced"
    },
    sellerRating: 4.8,
    sellerReviews: 24,
    sellerName: "Tadesse Abadega",
    farmingPractice: "Sustainable, traditional",
    readinessDate: "2024-05-10",
    photos: [
      "/api/placeholder/800/500",
      "/api/placeholder/800/500",
      "/api/placeholder/800/500"
    ],
    description: "This exceptional Ethiopian Heirloom coffee is grown at high altitude in the renowned Yirgacheffe region. The careful washed processing brings out bright, citrusy notes with a delicate floral aroma. The Abadega family has been growing coffee for generations using traditional methods that respect the environment."
  };
  
  // Mock chat data
  const chatMessages = [
    { id: 1, sender: 'seller', message: 'Thank you for your interest in our coffee!', timestamp: '2 days ago' },
    { id: 2, sender: 'buyer', message: 'Is this coffee available for immediate shipping?', timestamp: '1 day ago' },
    { id: 3, sender: 'seller', message: 'Yes, we can arrange shipping within 7 days of order confirmation.', timestamp: '1 day ago' }
  ];
  
  const handleOrderSubmit = () => {
    // In a real app, this would submit the order to an API
    console.log('Placing order for', quantity, 'kg');
    setShowOrderModal(false);
    // Update the status to reflect the newly placed order
    setDemoOrderStatus('pending');
  };
  
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // In a real app, this would send the message to an API
      console.log('Sending message:', chatMessage);
      setChatMessage('');
    }
  };
  
  const handleSubmitReview = () => {
    // In a real app, this would submit the review
    console.log('Submitting review');
    // Update the status to completed after review
    setDemoOrderStatus('completed');
  };
  
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex  items-center">
            <button 
              onClick={() => window.history.back()} 
              className="flex bg-white items-center text-gray-700 mr-4 hover:text-green-600"
            >
              <ArrowLeft size={20} className="mr-1" />
              <span>Back to Marketplace</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900 flex-1">Coffee Details</h1>
            
            {/* Demo Mode Selector - Remove in production */}
            <div className="mr-4">
              <select 
                value={demoOrderStatus}
                onChange={(e) => setDemoOrderStatus(e.target.value as OrderStatus)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="none">No Order (Demo)</option>
                <option value="pending">Pending Order (Demo)</option>
                <option value="confirmed">Confirmed Order (Demo)</option>
                <option value="processing">Processing Order (Demo)</option>
                <option value="shipping">Shipping Order (Demo)</option>
                <option value="delivered">Delivered Order (Demo)</option>
                <option value="completed">Completed Order (Demo)</option>
                <option value="cancelled">Cancelled Order (Demo)</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <span className="text-sm text-gray-500">Listed by</span>
              <span className="text-sm font-medium text-gray-900">{listing.sellerName}</span>
              <div className="flex items-center">
                <Star size={16} className="text-yellow-400 fill-current" />
                <span className="text-sm ml-1">{listing.sellerRating} ({listing.sellerReviews})</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Photos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="relative aspect-w-16 aspect-h-10 bg-gray-100">
                <img 
                  src={listing.photos[activePhotoIndex]} 
                  alt={listing.title} 
                  className="w-full h-full object-cover"
                />
                {listing.isOrganic && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Organic
                    </span>
                  </div>
                )}
              </div>
              <div className="flex p-2 space-x-2 overflow-x-auto">
                {listing.photos.map((photo, index) => (
                  <button 
                    key={index}
                    className={`flex-shrink-0 bg-white w-20 h-20 rounded border-2 ${index === activePhotoIndex ? 'border-green-500' : 'border-transparent'}`}
                    onClick={() => setActivePhotoIndex(index)}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover rounded" />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b">
                <button
                  className={`px-4 py-3 bg-white font-medium text-sm focus:outline-none ${
                    activeTab === 'details' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  Coffee Details
                </button>
                <button
                  className={`px-4 py-3 bg-white font-medium text-sm focus:outline-none ${
                    activeTab === 'farm' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('farm')}
                >
                  Farm Information
                </button>
                <button
                  className={`px-4 py-3 bg-white font-medium text-sm focus:outline-none ${
                    activeTab === 'cup' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('cup')}
                >
                  Cup Profile
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700 text-sm">{listing.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Variety</h4>
                        <p className="text-gray-900">{listing.variety}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Processing</h4>
                        <p className="text-gray-900">{listing.processing}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Bean Type</h4>
                        <p className="text-gray-900">{listing.beanType}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Crop Year</h4>
                        <p className="text-gray-900">{listing.cropYear}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Quantity Available</h4>
                        <p className="text-gray-900">{listing.availableQuantity} kg</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Ready By</h4>
                        <p className="text-gray-900">{listing.readinessDate}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Farming Practice</h4>
                        <p className="text-gray-900">{listing.farmingPractice}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Organic</h4>
                        <p className="text-gray-900">{listing.isOrganic ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'farm' && (
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <MapPin size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{listing.farmName}</h3>
                        <p className="text-gray-700">{listing.region}, {listing.country}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Altitude</h4>
                        <p className="text-gray-900">{listing.altitude} meters</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Region</h4>
                        <p className="text-gray-900">{listing.region}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-2">About the Farm</h3>
                      <p className="text-gray-700 text-sm">
                        The Abadega Family Farm is located in the highlands of Yirgacheffe, one of Ethiopia's most 
                        renowned coffee-growing regions. The farm has been in the family for three generations, with 
                        traditional cultivation methods passed down and refined over time. The high altitude and rich 
                        soil contribute to the exceptional quality of their coffee.
                      </p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'cup' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="bg-yellow-100 rounded-full p-2">
                        <Award size={24} className="text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-gray-900">{listing.score}</div>
                        <div className="text-xs text-gray-500">Cup Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Acidity</h4>
                          <p className="text-sm text-gray-600">{listing.cupProfile.acidity}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Body</h4>
                          <p className="text-sm text-gray-600">{listing.cupProfile.body}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Sweetness</h4>
                          <p className="text-sm text-gray-600">{listing.cupProfile.sweetness}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Aftertaste</h4>
                          <p className="text-sm text-gray-600">{listing.cupProfile.aftertaste}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Aroma</h4>
                          <p className="text-sm text-gray-600">{listing.cupProfile.aroma}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Balance</h4>
                          <p className="text-sm text-gray-600">{listing.cupProfile.balance}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Documents Section - Visible only when an order exists */}
            {orderStatus && orderStatus.documents && orderStatus.documents.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FileText size={20} className="mr-2 text-green-600" />
                    Order Documents
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {orderStatus.documents.map((doc, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <FileText size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                            <p className="text-xs text-gray-500">Added {doc.date}</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
                          <Download size={16} className="mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Chat Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MessageCircle size={20} className="mr-2 text-green-600" />
                  Messages with Seller
                </h3>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No messages yet. Start a conversation with the seller.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map(message => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                            message.sender === 'buyer' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'buyer' ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-white focus:ring-green-500 focus:border-green-500 block w-full rounded-md sm:text-sm border-gray-300"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Order Info & Order Status */}
          <div className="lg:col-span-1">
            {/* Purchase Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{listing.title}</h2>
                <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
                  <Star size={16} className="text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm font-medium text-yellow-800">{listing.score}</span>
                </div>
              </div>
              
              <div className="flex items-baseline mb-6">
                <span className="text-2xl font-bold text-green-600">${listing.price}</span>
                <span className="ml-1 text-gray-500">/kg</span>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Available Quantity</span>
                  <span className="text-sm font-medium text-gray-900">{listing.availableQuantity} kg</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Processing Method</span>
                  <span className="text-sm font-medium text-gray-900">{listing.processing}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Region</span>
                  <span className="text-sm font-medium text-gray-900">{listing.region}, {listing.country}</span>
                </div>
              </div>
              
              {/* Conditional Order Status Display */}
              {orderStatus ? (
                <div>
                  {/* Order details section */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">Your Order</h3>
                      
                      {/* Order status badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                        orderStatus.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        orderStatus.status === 'completed' || orderStatus.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        orderStatus.status === 'shipping' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {orderStatus.status}
                      </span>
                    </div>
                    
                    {/* Issue warning (for cancelled orders) */}
                    {orderStatus.hasIssue && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                              Order Cancelled
                            </h3>
                            <div className="mt-1 text-sm text-red-700">
                              <p>{orderStatus.issueDescription}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Order details */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Quantity</span>
                        <span className="text-sm font-medium text-gray-900">{orderStatus.quantity} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Price</span>
                        <span className="text-sm font-medium text-gray-900">${orderStatus.totalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Order Date</span>
                        <span className="text-sm font-medium text-gray-900">{orderStatus.orderedDate}</span>
                      </div>
                      {orderStatus.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Est. Delivery</span>
                          <span className="text-sm font-medium text-gray-900">{orderStatus.estimatedDelivery}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Call to action for delivered orders needing review */}
                  {orderStatus.needsReview && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Star className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Coffee Received?
                          </h3>
                          <div className="mt-1 text-sm text-blue-700">
                            <p>Please leave a review for the seller.</p>
                          </div>
                          <div className="mt-2">
                            <button
                              onClick={() => setShowReviewModal(true)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Leave Review
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Order Progress */}
                  {!orderStatus.hasIssue && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">Order Progress</h4>
                      {orderStatus.steps.map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`}>
                            {step.completed ? (
                              <Check size={12} className="text-white" />
                            ) : (
                              <span className="h-2 w-2 bg-white rounded-full"></span>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm ${
                              step.completed ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {step.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Tracking information for shipping orders */}
                  {orderStatus.status === 'shipping' && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-md">
                      <div className="flex items-center mb-2">
                        <Truck size={18} className="text-blue-600 mr-2" />
                        <h4 className="text-sm font-medium text-blue-900">Shipping Information</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Tracking Number</span>
                          <span className="font-mono text-blue-900">CLD783940127</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Carrier</span>
                          <span className="text-blue-900">Express Freight</span>
                        </div>
                        <button className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                          <Truck size={16} className="mr-2" />
                          Track Shipment
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Buttons for various order actions */}
                  {(orderStatus.status === 'pending' || orderStatus.status === 'confirmed' || orderStatus.status === 'processing') && (
                    <button
                      className="mt-4 w-full bg-red-100 text-red-700 py-2 px-4 border border-transparent rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel Order
                    </button>
                  )}
                  
                  {orderStatus.status === 'delivered' && !orderStatus.needsReview && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="mt-4 w-full bg-green-600 text-white py-2 px-4 border border-transparent rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Leave Review
                    </button>
                  )}
                </div>
              ) : (
                /* No order - show "Place Order" button */
                <button
                  onClick={() => setShowOrderModal(true)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Place Order
                </button>
              )}
            </div>
            
            {/* Discount info card - only shown when no order exists */}
            {!orderStatus && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Volume Discounts</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-md">
                    <span className="text-sm text-gray-700">Order 500+ kg</span>
                    <span className="text-sm font-medium text-green-700">5% off</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-md">
                    <span className="text-sm text-gray-700">Order 1000+ kg</span>
                    <span className="text-sm font-medium text-green-700">10% off</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Volume discounts are automatically applied at checkout.
                </div>
              </div>
            )}
            
            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">About the Seller</h3>
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                  {listing.sellerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">{listing.sellerName}</h4>
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-400 fill-current" />
                    <span className="text-xs ml-1 text-gray-500">{listing.sellerRating} ({listing.sellerReviews} reviews)</span>
                  </div>
                </div>
              </div>
              <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                View Seller Profile
              </button>
            </div>
            
            {/* Coffee Certificate Card - Optional for completed orders */}
            {(orderStatus && (orderStatus.status === 'completed' || orderStatus.status === 'delivered')) && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <div className="flex items-center mb-3">
                  <Award size={20} className="text-green-600 mr-2" />
                  <h3 className="text-md font-medium text-gray-900">Purchase Certificate</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Download your certificate of purchase for this premium coffee lot.
                </p>
                <button className="w-full bg-green-50 text-green-700 py-2 px-4 border border-green-200 rounded-md text-sm font-medium hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center">
                  <Download size={16} className="mr-2" />
                  Download Certificate
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span className="sr-only">Close</span>
                  <X size={20} />
                </button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Place Your Order</h3>
                
                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity (kg)
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="10"
                    max={listing.availableQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="focus:ring-green-500 focus:border-green-500 block w-full rounded-md sm:text-sm border-gray-300"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Available: {listing.availableQuantity} kg
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Price per kg</span>
                      <span className="text-sm font-medium text-gray-900">${listing.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Quantity</span>
                      <span className="text-sm font-medium text-gray-900">{quantity} kg</span>
                    </div>
                    
                    {/* Display volume discount if applicable */}
                    {quantity >= 1000 && (
                      <div className="flex justify-between text-green-700">
                        <span className="text-sm">Volume discount (10%)</span>
                        <span className="text-sm font-medium">-${(listing.price * quantity * 0.1).toFixed(2)}</span>
                      </div>
                    )}
                    {quantity >= 500 && quantity < 1000 && (
                      <div className="flex justify-between text-green-700">
                        <span className="text-sm">Volume discount (5%)</span>
                        <span className="text-sm font-medium">-${(listing.price * quantity * 0.05).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">Total</span>
                        <span className="text-sm font-medium text-green-600">
                          ${quantity >= 1000 
                            ? (listing.price * quantity * 0.9).toFixed(2)
                            : quantity >= 500
                              ? (listing.price * quantity * 0.95).toFixed(2)
                              : (listing.price * quantity).toFixed(2)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="shipping" className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Address
                  </label>
                  <textarea
                    id="shipping"
                    rows={3}
                    className="focus:ring-green-500 focus:border-green-500 block w-full rounded-md sm:text-sm border-gray-300"
                    placeholder="Enter your shipping address and any special instructions"
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleOrderSubmit}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span className="sr-only">Close</span>
                  <X size={20} />
                </button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Your Experience</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you rate this seller and their coffee?
                  </label>
                  <div className="flex space-x-2 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star 
                          size={32} 
                          className={`${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Selected: {rating} star{rating !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                  </label>
                  <textarea
                    id="review"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="focus:ring-green-500 focus:border-green-500 block w-full rounded-md sm:text-sm border-gray-300"
                    placeholder="Share your experience with this coffee and seller..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoffeeListingPagev1;