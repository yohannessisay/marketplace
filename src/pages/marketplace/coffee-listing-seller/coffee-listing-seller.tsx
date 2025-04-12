"use client";

import { useState } from "react";
import {
  Star,
  MessageCircle,
  DollarSign,
  BarChart2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "./stat-card";
import { useMobile } from "@/hooks/useMobile";
import { MessageThreadList } from "./message-thread-list";
import { MessageThread } from "./message-thread";
import { MockData } from "@/types/coffee-listing";
import Header from "@/components/layout/header";
const mockData: MockData = {
  listing: {
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
      balance: "Well-balanced",
    },
    status: "active",
    createdAt: "2024-03-15T10:30:00Z",
    readinessDate: "2024-05-10",
    photos: [
      "/placeholder.svg?height=500&width=800",
      "/placeholder.svg?height=500&width=800",
      "/placeholder.svg?height=500&width=800",
    ],
    description:
      "This exceptional Ethiopian Heirloom coffee is grown at high altitude in the renowned Yirgacheffe region. The careful washed processing brings out bright, citrusy notes with a delicate floral aroma. The Abadega family has been growing coffee for generations using traditional methods that respect the environment.",
    discounts: [
      { minimumQuantity: 500, percentage: 5 },
      { minimumQuantity: 1000, percentage: 10 },
    ],
  },

  bids: [
    {
      id: "ord-123456",
      buyerName: "Global Coffee Imports",
      quantity: 500,
      totalAmount: 4375,
      status: "pending",
      date: "2024-04-06T14:22:00Z",
    },
    {
      id: "ord-123457",
      buyerName: "Specialty Roasters Co.",
      quantity: 250,
      totalAmount: 2187.5,
      status: "confirmed",
      date: "2024-04-04T09:15:00Z",
    },
    {
      id: "ord-123458",
      buyerName: "Bean Lovers Ltd",
      quantity: 1000,
      totalAmount: 7875,
      status: "pending",
      date: "2024-03-28T16:40:00Z",
    },
  ],

  messageThreads: [
    {
      id: 1,
      buyerName: "Global Coffee Imports",
      buyerCompany: "Global Coffee Imports Inc.",
      buyerAvatar: null,
      unread: 2,
      lastMessageTime: "10 min ago",
      messages: [
        {
          id: 101,
          sender: "buyer",
          message:
            "Hi, I'm interested in your Ethiopian Heirloom coffee. Do you have any cupping notes you can share?",
          timestamp: "2 days ago",
        },
        {
          id: 102,
          sender: "seller",
          message:
            "Hello! Thanks for your interest. Yes, our Ethiopian Heirloom scored 86.5 points with notes of jasmine, citrus, and honey sweetness.",
          timestamp: "1 day ago",
        },
        {
          id: 103,
          sender: "buyer",
          message:
            "That sounds great. Is this coffee available for immediate shipping?",
          timestamp: "1 day ago",
        },
        {
          id: 104,
          sender: "seller",
          message:
            "Yes, we can arrange shipping within 7 days of order confirmation.",
          timestamp: "1 day ago",
        },
        {
          id: 105,
          sender: "buyer",
          message:
            "Perfect. I'm looking to order around 500kg. Is there any discount for this quantity?",
          timestamp: "10 min ago",
        },
        {
          id: 106,
          sender: "buyer",
          message:
            "Also, could you provide a sample before we place the full order?",
          timestamp: "10 min ago",
        },
      ],
    },
    {
      id: 2,
      buyerName: "Jane Rodriguez",
      buyerCompany: "Specialty Roasters Co.",
      buyerAvatar: null,
      unread: 0,
      lastMessageTime: "5 hours ago",
      messages: [
        {
          id: 201,
          sender: "buyer",
          message:
            "Hello, we're a small-batch specialty roaster interested in your coffee. What's the minimum order quantity?",
          timestamp: "2 days ago",
        },
        {
          id: 202,
          sender: "seller",
          message:
            "Hello Jane, thanks for reaching out! Our minimum order is 100kg for international shipments.",
          timestamp: "2 days ago",
        },
        {
          id: 203,
          sender: "buyer",
          message:
            "Great, that works for us. How does the coffee perform for espresso roasts?",
          timestamp: "1 day ago",
        },
        {
          id: 204,
          sender: "seller",
          message:
            "This coffee works beautifully for espresso. The citrus notes become more caramelized, and you get a wonderful balance with the honey sweetness.",
          timestamp: "1 day ago",
        },
        {
          id: 205,
          sender: "buyer",
          message:
            "Sounds perfect. We'll be placing an order for 250kg soon. Thanks for the information!",
          timestamp: "5 hours ago",
        },
      ],
    },
    {
      id: 3,
      buyerName: "Michael Chen",
      buyerCompany: "Artisan Coffee House",
      buyerAvatar: null,
      unread: 1,
      lastMessageTime: "Yesterday",
      messages: [
        {
          id: 301,
          sender: "buyer",
          message: "Hi there, do you have any certifications for this coffee?",
          timestamp: "Yesterday",
        },
        {
          id: 302,
          sender: "buyer",
          message:
            "We're especially interested in knowing if it's Rainforest Alliance or Fair Trade certified.",
          timestamp: "Yesterday",
        },
      ],
    },
  ],

  listingStats: {
    views: 324,
    inquiries: 3,
    totalBids: 3,
    totalRevenue: 14437.5,
  },
};

export default function CoffeeListingSellerView() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeMessageThread, setActiveMessageThread] = useState<number | null>(
    null
  );
  const [messageFilter, setMessageFilter] = useState("all");
  const isMobile = useMobile();

  const { listing, bids, messageThreads, listingStats } = mockData;

  const filteredThreads = messageThreads.filter((thread) => {
    if (messageFilter === "unread") {
      return thread.unread > 0;
    }
    return true;
  });

  const totalUnreadMessages = messageThreads.reduce(
    (sum, thread) => sum + thread.unread,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header></Header>

      <main className="container px-24 py-8">
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="h-14">Overview</TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 h-14">
              Messages
              {totalUnreadMessages > 0 && (
                <Badge
                  variant="default"
                  className="h-5 min-w-5 px-1 rounded-full"
                >
                  {totalUnreadMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bids" className="h-14">Bids</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coffee details section */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  {/* Listing photo */}
                  <div className="relative">
                    <img
                      src={listing.photos[0] || "/placeholder.svg"}
                      alt={listing.title}
                      className="w-full h-64 object-cover rounded-t-lg"
                    />
                    {listing.isOrganic && (
                      <Badge className="absolute top-4 right-4 bg-emerald-500">
                        Organic
                      </Badge>
                    )}
                  </div>

                  {/* Details */}
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        {listing.title}
                      </h2>
                      <div className="flex items-center bg-amber-100 px-2 py-1 rounded">
                        <Star
                          size={16}
                          className="text-amber-500 fill-current"
                        />
                        <span className="ml-1 text-sm font-medium text-amber-800">
                          {listing.score}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline mb-6">
                      <span className="text-2xl font-bold text-emerald-600">
                        ${listing.price}
                      </span>
                      <span className="ml-1 text-gray-500">/kg</span>
                    </div>

                    <div className="space-y-4 mb-6">
                      <p className="text-gray-700">{listing.description}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Variety
                          </h4>
                          <p className="text-gray-900">{listing.variety}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Processing
                          </h4>
                          <p className="text-gray-900">{listing.processing}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Bean Type
                          </h4>
                          <p className="text-gray-900">{listing.beanType}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Crop Year
                          </h4>
                          <p className="text-gray-900">{listing.cropYear}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Quantity Available
                          </h4>
                          <p className="text-gray-900">
                            {listing.availableQuantity} kg
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Ready By
                          </h4>
                          <p className="text-gray-900">
                            {listing.readinessDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-2">
                        Volume Discounts
                      </h3>
                      <div className="space-y-2">
                        {listing.discounts.map((discount, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-2 bg-emerald-50 rounded-md"
                          >
                            <span className="text-sm text-gray-700">
                              Order {discount.minimumQuantity}+ kg
                            </span>
                            <span className="text-sm font-medium text-emerald-700">
                              {discount.percentage}% off
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent bids */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">Recent Bids</CardTitle>
                    <Button
                      variant="link"
                      className="text-emerald-600 p-0 h-auto"
                      onClick={() => setActiveTab("bids")}
                    >
                      View All
                    </Button>
                  </CardHeader>

                  <CardContent>
                    <div className="divide-y divide-gray-200">
                      {bids.slice(0, 3).map((order) => (
                        <div key={order.id} className="py-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {order.buyerName}
                                </h4>
                                <Badge
                                  variant={
                                    order.status === "completed"
                                      ? "default"
                                      : order.status === "confirmed"
                                      ? "default"
                                      : "outline"
                                  }
                                  className="ml-2"
                                >
                                  {order.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                {new Date(order.date).toLocaleDateString()} •{" "}
                                {order.quantity} kg
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                ${order.totalAmount}
                              </p>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-emerald-600"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Messages */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">Recent Messages</CardTitle>
                    <Button
                      variant="link"
                      className="text-emerald-600 p-0 h-auto"
                      onClick={() => setActiveTab("messages")}
                    >
                      View All
                    </Button>
                  </CardHeader>

                  <CardContent>
                    <div className="divide-y divide-gray-200">
                      {messageThreads.slice(0, 3).map((thread) => (
                        <div key={thread.id} className="py-4">
                          <div className="flex justify-between items-start">
                            <div className="flex">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gray-200 text-gray-600">
                                  {thread.buyerName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <div className="flex items-center">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {thread.buyerName}
                                  </h4>
                                  {thread.unread > 0 && (
                                    <Badge variant="default" className="ml-2">
                                      {thread.unread} new
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {thread.buyerCompany}
                                </p>
                                <p className="mt-1 text-sm text-gray-600 truncate max-w-[300px]">
                                  {
                                    thread.messages[thread.messages.length - 1]
                                      ?.message
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {thread.lastMessageTime}
                              </p>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-emerald-600 mt-1"
                                onClick={() => {
                                  setActiveTab("messages");
                                  setActiveMessageThread(thread.id);
                                }}
                              >
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Listing Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Listing Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Status
                      </h4>
                      <div className="mt-1 flex items-center">
                        <Badge
                          variant={
                            listing.status === "active" ? "default" : "outline"
                          }
                        >
                          {listing.status === "active" ? "Active" : "Draft"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Created On
                      </h4>
                      <p className="text-gray-900">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Ready By
                      </h4>
                      <p className="text-gray-900">{listing.readinessDate}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Quantity Available
                      </h4>
                      <p className="text-gray-900">
                        {listing.availableQuantity} kg
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Views
                      </h4>
                      <p className="text-gray-900">{listingStats.views}</p>
                    </div>

                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Edit Listing
                    </Button>
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4">
                  <StatCard
                    icon={<BarChart2 size={18} className="text-emerald-600" />}
                    title="Total Views"
                    value={listingStats.views}
                    hasIncrease={true}
                    increaseValue={12}
                  />

                  <StatCard
                    icon={
                      <MessageCircle size={18} className="text-emerald-600" />
                    }
                    title="Inquiries"
                    value={listingStats.inquiries}
                    hasIncrease={true}
                    increaseValue={8}
                  />

                  <StatCard
                    icon={<DollarSign size={18} className="text-emerald-600" />}
                    title="Total Revenue"
                    value={`$${listingStats.totalRevenue}`}
                    hasIncrease={false}
                    increaseValue={5}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <div className="flex h-[700px]">
                {/* Message Thread List - Shown on larger screens, or when no thread is selected */}
                <div
                  className={`${
                    activeMessageThread && isMobile ? "hidden" : ""
                  } w-full md:w-1/3 border-r`}
                >
                  <div className="h-full p-4">
                    <MessageThreadList
                      messageThreads={filteredThreads}
                      activeMessageThread={activeMessageThread}
                      setActiveMessageThread={setActiveMessageThread}
                      messageFilter={messageFilter}
                      setMessageFilter={setMessageFilter}
                    />
                  </div>
                </div>

                {/* Message Thread Detail */}
                <div
                  className={`${
                    !activeMessageThread && isMobile ? "hidden" : ""
                  } md:w-2/3 w-full`}
                >
                  <div className="h-full">
                    <MessageThread
                      messageThreads={messageThreads}
                      activeMessageThread={activeMessageThread}
                      setActiveMessageThread={setActiveMessageThread}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="bids">
            <Card>
              <CardHeader>
                <CardTitle>All Bids</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search bids..."
                      className="pl-8 w-full md:w-[250px]"
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipping">Shipping</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select defaultValue="latest">
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Sort by Latest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Sort by Latest</SelectItem>
                        <SelectItem value="oldest">Sort by Oldest</SelectItem>
                        <SelectItem value="high-low">
                          Amount (High to Low)
                        </SelectItem>
                        <SelectItem value="low-high">
                          Amount (Low to High)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bids.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell>{order.buyerName}</TableCell>
                          <TableCell>
                            {new Date(order.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{order.quantity} kg</TableCell>
                          <TableCell>${order.totalAmount}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "completed"
                                  ? "default"
                                  : order.status === "confirmed"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-600 h-8"
                              >
                                View
                              </Button>
                              {order.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-emerald-600 h-8"
                                >
                                  Accept
                                </Button>
                              )}
                              {(order.status === "pending" ||
                                order.status === "confirmed") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 h-8"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{bids.length}</span> of{" "}
                    <span className="font-medium">{bids.length}</span> bids
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-emerald-50"
                    >
                      1
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
