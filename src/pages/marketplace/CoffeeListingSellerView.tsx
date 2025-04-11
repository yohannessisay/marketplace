import React, { useState, useEffect } from 'react';
import { 
  Star, MessageCircle, ArrowLeft, ChevronDown, Check, X, MapPin, 
  Coffee, Droplet, Calendar, Edit, Trash, Users, User, Bell, 
  DollarSign, BarChart2, Package, Truck, Download, Upload, AlertTriangle
} from 'lucide-react';

// Seller's view of a coffee listing page
const CoffeeListingSellerView = () => {
  // State for active tabs and display options
  const [activeTab, setActiveTab] = useState('overview');
  const [activeMessageThread, setActiveMessageThread] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  
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
    status: "active",
    createdAt: "2024-03-15T10:30:00Z",
    readinessDate: "2024-05-10",
    photos: [
      "/api/placeholder/800/500",
      "/api/placeholder/800/500",
      "/api/placeholder/800/500"
    ],
    description: "This exceptional Ethiopian Heirloom coffee is grown at high altitude in the renowned Yirgacheffe region. The careful washed processing brings out bright, citrusy notes with a delicate floral aroma. The Abadega family has been growing coffee for generations using traditional methods that respect the environment.",
    discounts: [
      { minimumQuantity: 500, percentage: 5 },
      { minimumQuantity: 1000, percentage: 10 }
    ]
  };
  
  // Mock data for bids
  const bids = [
    {
      id: "ord-123456",
      buyerName: "Global Coffee Imports",
      quantity: 500,
      totalAmount: 4375,
      status: "pending",
      date: "2024-04-06T14:22:00Z"
    },
    {
      id: "ord-123457",
      buyerName: "Specialty Roasters Co.",
      quantity: 250,
      totalAmount: 2187.5,
      status: "confirmed",
      date: "2024-04-04T09:15:00Z"
    },
    {
      id: "ord-123458",
      buyerName: "Bean Lovers Ltd",
      quantity: 1000,
      totalAmount: 7875,
      status: "pending",
      date: "2024-03-28T16:40:00Z"
    }
  ];
  
  // Mock data for messages (multiple conversations with different buyers)
  const messageThreads = [
    {
      id: 1,
      buyerName: "Global Coffee Imports",
      buyerCompany: "Global Coffee Imports Inc.",
      buyerAvatar: null,
      unread: 2,
      lastMessageTime: "10 min ago",
      messages: [
        { id: 101, sender: 'buyer', message: "Hi, I'm interested in your Ethiopian Heirloom coffee. Do you have any cupping notes you can share?", timestamp: "2 days ago" },
        { id: 102, sender: 'seller', message: "Hello! Thanks for your interest. Yes, our Ethiopian Heirloom scored 86.5 points with notes of jasmine, citrus, and honey sweetness.", timestamp: "1 day ago" },
        { id: 103, sender: 'buyer', message: "That sounds great. Is this coffee available for immediate shipping?", timestamp: "1 day ago" },
        { id: 104, sender: 'seller', message: "Yes, we can arrange shipping within 7 days of order confirmation.", timestamp: "1 day ago" },
        { id: 105, sender: 'buyer', message: "Perfect. I'm looking to order around 500kg. Is there any discount for this quantity?", timestamp: "10 min ago" },
        { id: 106, sender: 'buyer', message: "Also, could you provide a sample before we place the full order?", timestamp: "10 min ago" }
      ]
    },
    {
      id: 2,
      buyerName: "Jane Rodriguez",
      buyerCompany: "Specialty Roasters Co.",
      buyerAvatar: null,
      unread: 0,
      lastMessageTime: "5 hours ago",
      messages: [
        { id: 201, sender: 'buyer', message: "Hello, we're a small-batch specialty roaster interested in your coffee. What's the minimum order quantity?", timestamp: "2 days ago" },
        { id: 202, sender: 'seller', message: "Hello Jane, thanks for reaching out! Our minimum order is 100kg for international shipments.", timestamp: "2 days ago" },
        { id: 203, sender: 'buyer', message: "Great, that works for us. How does the coffee perform for espresso roasts?", timestamp: "1 day ago" },
        { id: 204, sender: 'seller', message: "This coffee works beautifully for espresso. The citrus notes become more caramelized, and you get a wonderful balance with the honey sweetness.", timestamp: "1 day ago" },
        { id: 205, sender: 'buyer', message: "Sounds perfect. We'll be placing an order for 250kg soon. Thanks for the information!", timestamp: "5 hours ago" }
      ]
    },
    {
      id: 3,
      buyerName: "Michael Chen",
      buyerCompany: "Artisan Coffee House",
      buyerAvatar: null,
      unread: 1,
      lastMessageTime: "Yesterday",
      messages: [
        { id: 301, sender: 'buyer', message: "Hi there, do you have any certifications for this coffee?", timestamp: "Yesterday" },
        { id: 302, sender: 'buyer', message: "We're especially interested in knowing if it's Rainforest Alliance or Fair Trade certified.", timestamp: "Yesterday" }
      ]
    }
  ];
  
  // Stats for the seller dashboard
  const listingStats = {
    views: 324,
    inquiries: messageThreads.length,
    totalBids: bids.length,
    totalRevenue: bids.reduce((sum, order) => sum + order.totalAmount, 0)
  };
  
  // Filter for messages (All, Unread, etc.)
  const [messageFilter, setMessageFilter] = useState('all');
  const filteredThreads = messageThreads.filter(thread => {
    if (messageFilter === 'unread') {
      return thread.unread > 0;
    }
    return true;
  });
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (chatMessage.trim() && activeMessageThread) {
      // In a real app, this would send the message to an API
      console.log('Sending message:', chatMessage, 'to thread:', activeMessageThread);
      setChatMessage('');
      
      // For demo purposes, we can simulate adding the message to the current thread
      const updatedThreads = messageThreads.map(thread => {
        if (thread.id === activeMessageThread) {
          return {
            ...thread,
            messages: [
              ...thread.messages,
              {
                id: Math.max(...thread.messages.map(m => m.id)) + 1,
                sender: 'seller',
                message: chatMessage,
                timestamp: 'Just now'
              }
            ]
          };
        }
        return thread;
      });
      
    }
  };
  
  // Component for rendering the message thread list
  const MessageThreadList = () => (
    <div className="h-full flex flex-col">
      <div className="border-b pb-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Messages</h3>
          <select
            value={messageFilter}
            onChange={(e) => setMessageFilter(e.target.value)}
            className="block pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
          </select>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages..."
            className="bg-white w-full pl-9 pr-4 py-2 border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {filteredThreads.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No messages matching your filter.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredThreads.map(thread => (
              <li key={thread.id}>
                <button
                  onClick={() => setActiveMessageThread(thread.id)}
                  className={`w-full flex py-4 px-2 hover:bg-gray-50 focus:outline-none ${activeMessageThread === thread.id ? 'bg-green-50' : ''}`}
                >
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                    {thread.buyerAvatar ? (
                      <img src={thread.buyerAvatar} alt={thread.buyerName} className="h-10 w-10 rounded-full" />
                    ) : (
                      thread.buyerName.charAt(0)
                    )}
                  </div>
                  <div className="ml-3 flex-1 flex flex-col text-left">
                    <div className="flex items-baseline justify-between">
                      <p className={`text-sm font-medium ${thread.unread > 0 ? 'text-green-900' : 'text-gray-900'}`}>{thread.buyerName}</p>
                      <p className="text-xs text-gray-500">{thread.lastMessageTime}</p>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{thread.buyerCompany}</p>
                    <p className="mt-1 text-sm text-gray-600 truncate">
                      {thread.messages[thread.messages.length - 1]?.message}
                    </p>
                    {thread.unread > 0 && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {thread.unread} new {thread.unread === 1 ? 'message' : 'messages'}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
  
  // Component for rendering the active message thread
  const MessageThread = () => {
    const thread = messageThreads.find(t => t.id === activeMessageThread);
    
    if (!thread) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          <MessageCircle size={48} className="text-gray-300 mb-4" />
          <p>Select a conversation to view messages</p>
        </div>
      );
    }
    
    return (
      <div className="h-full flex flex-col">
        <div className="border-b p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              {thread.buyerAvatar ? (
                <img src={thread.buyerAvatar} alt={thread.buyerName} className="h-10 w-10 rounded-full" />
              ) : (
                thread.buyerName.charAt(0)
              )}
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">{thread.buyerName}</h4>
              <p className="text-xs text-gray-500">{thread.buyerCompany}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none">
              <User size={18} />
            </button>
            <button 
              onClick={() => setActiveMessageThread(null)}
              className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none md:hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {thread.messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'seller' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                  message.sender === 'seller' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'seller' ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message..."
              className="bg-white flex-1 focus:ring-green-500 focus:border-green-500 block rounded-md sm:text-sm border-gray-300"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  };
  interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    hasIncrease?: boolean;
    increaseValue?: number | null;
  }
  
  // Statistic Card Component
  const StatCard = ({ icon, title, value, hasIncrease = false, increaseValue = null }: StatCardProps) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className="rounded-full p-2 bg-green-100 mr-3">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-semibold text-gray-900">{value}</p>
          {increaseValue && (
            <div className={`flex items-center text-xs ${hasIncrease ? 'text-green-600' : 'text-red-600'}`}>
              {hasIncrease ? (
                <span>&#9650; {increaseValue}% from last month</span>
              ) : (
                <span>&#9660; {increaseValue}% from last month</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center bg-white text-gray-700 mr-6 hover:text-green-600"
            >
              <ArrowLeft size={20} className="mr-1" />
              <span>Back to Listings</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900 flex-1">Manage Coffee Listing</h1>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {listing.status === 'active' ? 'Active' : 'Draft'}
              </span>
              
              <button 
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Edit size={16} className="mr-1" />
                Edit Listing
              </button>
              
              <button 
                onClick={() => setShowDeleteConfirmModal(true)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash size={16} className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs for different sections */}
        <div className="mb-6">
          <div className="border-b border-gray-200 ">
            <nav className="-mb-px flex space-x-8 " aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`
                  bg-white whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`
                  bg-white whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center
                  ${activeTab === 'messages'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                Messages
                {messageThreads.some(thread => thread.unread > 0) && (
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                    {messageThreads.reduce((sum, thread) => sum + thread.unread, 0)}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('bids')}
                className={`
                  bg-white whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'bids'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                Bids
              </button>

            </nav>
          </div>
        </div>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>

          
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coffee details section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Listing photo */}
                  <div className="aspect-w-16 aspect-h-10 bg-gray-200">
                    <img 
                      src={listing.photos[0]} 
                      alt={listing.title} 
                      className="w-full h-64 object-cover"
                    />
                    {listing.isOrganic && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Organic
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="p-6">
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
                      <p className="text-gray-700">{listing.description}</p>
                      
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
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-md font-medium text-gray-900 mb-2">Volume Discounts</h3>
                      <div className="space-y-2">
                        {listing.discounts.map((discount, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-green-50 rounded-md">
                            <span className="text-sm text-gray-700">Order {discount.minimumQuantity}+ kg</span>
                            <span className="text-sm font-medium text-green-700">{discount.percentage}% off</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent bids */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Recent bids</h3>
                      <button 
                        onClick={() => setActiveTab('bids')}
                        className="bg-white text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {bids.slice(0, 3).map(order => (
                      <div key={order.id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium text-gray-900">{order.buyerName}</h4>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(order.date).toLocaleDateString()} • {order.quantity} kg
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">${order.totalAmount}</p>
                            <button className="bg-white text-sm text-green-600 hover:text-green-800">View Details</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Recent Messages */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
                      <button 
                        onClick={() => setActiveTab('messages')}
                        className=" bg-white text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {messageThreads.slice(0, 3).map(thread => (
                      <div key={thread.id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                              {thread.buyerName.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="flex items-center">
                                <h4 className="text-sm font-medium text-gray-900">{thread.buyerName}</h4>
                                {thread.unread > 0 && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {thread.unread} new
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{thread.buyerCompany}</p>
                              <p className="mt-1 text-sm text-gray-600">
                                {thread.messages[thread.messages.length - 1]?.message.length > 50 ? 
                                  thread.messages[thread.messages.length - 1]?.message.substring(0, 50) + '...' : 
                                  thread.messages[thread.messages.length - 1]?.message}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{thread.lastMessageTime}</p>
                            <button 
                              onClick={() => {
                                setActiveTab('messages');
                                setActiveMessageThread(thread.id);
                              }}
                              className="bg-white text-sm text-green-600 hover:text-green-800 mt-1"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Listing Info Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Listing Info</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {listing.status === 'active' ? 'Active' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Created On</h4>
                      <p className="text-gray-900">{new Date(listing.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Ready By</h4>
                      <p className="text-gray-900">{listing.readinessDate}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Quantity Available</h4>
                      <p className="text-gray-900">{listing.availableQuantity} kg</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Views</h4>
                      <p className="text-gray-900">{listingStats.views}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <button 
                      onClick={() => setShowEditModal(true)}
                      className="w-full bg-green-600 text-white py-2 px-4 border border-transparent rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Edit Listing
                    </button>
                    
                    {listing.status === 'active' ? (
                      <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Pause Listing
                      </button>
                    ) : (
                      <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Activate Listing
                      </button>
                    )}
                    
                    <button 
                      onClick={() => setShowDeleteConfirmModal(true)}
                      className="w-full bg-white border border-gray-300 text-red-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete Listing
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
        
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow">
            <div className="flex h-[700px]">
              {/* Message Thread List - Shown on larger screens, or when no thread is selected */}
              <div className={`${
                activeMessageThread ? 'hidden md:block' : ''
              } w-full md:w-1/3 border-r`}>
                <div className="h-full p-4">
                  <MessageThreadList />
                </div>
              </div>
              
              {/* Message Thread Detail */}
              <div className={`${
                activeMessageThread ? 'w-full' : 'hidden'
              } md:w-2/3`}>
                <div className="h-full">
                  <MessageThread />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* bids Tab */}
        {activeTab === 'bids' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Bids</h3>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search bids..."
                    className="bg-white w-full pl-9 pr-4 py-2 border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <select 
                    className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option>All Statuses</option>
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Processing</option>
                    <option>Shipping</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                  
                  <select 
                    className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option>Sort by Latest</option>
                    <option>Sort by Oldest</option>
                    <option>Sort by Amount (High to Low)</option>
                    <option>Sort by Amount (Low to High)</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Buyer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bids.map(order => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.buyerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.quantity} kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.totalAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="bg-white text-green-600 hover:text-green-900 mr-3">View</button>
                          {order.status === 'pending' && (
                            <button className="bg-white text-green-600 hover:text-green-900 mr-3">Accept</button>
                          )}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button className="bg-white text-red-600 hover:text-red-900">Cancel</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{bids.length}</span> of <span className="font-medium">{bids.length}</span> bids
                </div>
                <div className="flex-1 flex justify-end">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
        

      </main>
      
      {/* Edit Listing Modal */}
      {showEditModal && (
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
                  onClick={() => setShowEditModal(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span className="sr-only">Close</span>
                  <X size={20} />
                </button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Coffee Listing</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Coffee Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      defaultValue={listing.title}
                      className="focus:ring-green-500 focus:border-green-500 block w-full rounded-md sm:text-sm border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price per kg (USD)
                    </label>
                    <input
                      type="number"
                      id="price"
                      defaultValue={listing.price}
                      className="focus:ring-green-500 focus:border-green-500 block w-full rounded-md sm:text-sm border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Available Quantity (kg)
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      defaultValue={listing.availableQuantity}
                      className="focus:ring-green-500 focus:border-green-500 block w-full rounded-md sm:text-sm border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      defaultValue={listing.description}
                      className="focus:ring-green-500 focus:border-green-500 block w-full rounded-md sm:text-sm border-gray-300"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-1">
                        Variety
                      </label>
                      <input
                        type="text"
                        id="variety"
                        defaultValue={listing.variety}
                        className="focus:ring-green-500 focus:border-green-500 block w-full rounded-md sm:text-sm border-gray-300"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="processing" className="block text-sm font-medium text-gray-700 mb-1">
                        Processing Method
                      </label>
                      <select
                        id="processing"
                        defaultValue={listing.processing}
                        className="focus:ring-green-500 focus:border-green-500 block w-full rounded-md sm:text-sm border-gray-300"
                      >
                        <option>Washed</option>
                        <option>Natural</option>
                        <option>Honey</option>
                        <option>Anaerobic</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="crop-year" className="block text-sm font-medium text-gray-700 mb-1">
                        Crop Year
                      </label>
                      <input
                        type="text"
                        id="crop-year"
                        defaultValue={listing.cropYear}
                        className="focus:ring-green-500 focus:border-green-500 block w-full rounded-md sm:text-sm border-gray-300"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="readiness" className="block text-sm font-medium text-gray-700 mb-1">
                        Ready By
                      </label>
                      <input
                        type="date"
                        id="readiness"
                        defaultValue={listing.readinessDate}
                        className="focus:ring-green-500 focus:border-green-500 block w-full rounded-md sm:text-sm border-gray-300"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="organic"
                      type="checkbox"
                      defaultChecked={listing.isOrganic}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="organic" className="ml-2 block text-sm text-gray-900">
                      Organic Certified
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Listing
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this coffee listing? This action cannot be undone.
                      All associated bids, messages will remain in the system.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Eye = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

export default CoffeeListingSellerView;