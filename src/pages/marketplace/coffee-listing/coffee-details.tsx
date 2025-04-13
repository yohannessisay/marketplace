"use client"

import { useState } from "react"
import { FileText, Download, MessageCircle, Send } from 'lucide-react'
import { OrderStatus } from "@/types/order"
import { CoffeeListing } from "@/types/coffee"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import { PhotoGallery } from "./photo-gallery"
import { CupProfile } from "./cup-profile" 
import { CoffeeDetailsTab } from "./coffee-details-tab" 
import { useOrderStatus } from "@/hooks/useOrderStatus"
import { FarmInformation } from "./farm-information"

interface CoffeeDetailsProps {
  listing: CoffeeListing|null
  demoOrderStatus: OrderStatus
}

export function CoffeeDetails({ listing, demoOrderStatus }: CoffeeDetailsProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [chatMessage, setChatMessage] = useState("")
  const orderStatus = useOrderStatus(demoOrderStatus)
  
  // Mock chat data
  const chatMessages = [
    { id: 1, sender: 'seller', message: 'Thank you for your interest in our coffee!', timestamp: '2 days ago' },
    { id: 2, sender: 'buyer', message: 'Is this coffee available for immediate shipping?', timestamp: '1 day ago' },
    { id: 3, sender: 'seller', message: 'Yes, we can arrange shipping within 7 days of order confirmation.', timestamp: '1 day ago' }
  ]
  
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      console.log('Sending message:', chatMessage)
      setChatMessage('')
    }
  }

  return (
    <div className="space-y-6">
      <PhotoGallery photos={listing?.coffee_photo??null} isOrganic={listing?.is_organic??false} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Coffee Details</TabsTrigger>
          <TabsTrigger value="farm">Farm Information</TabsTrigger>
          <TabsTrigger value="cup">Cup Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="border rounded-md mt-2">
          <CoffeeDetailsTab listing={listing} />
        </TabsContent>
        
        <TabsContent value="farm" className="border rounded-md mt-2">
          <FarmInformation listing={listing?.farm} />
        </TabsContent>
        
        <TabsContent value="cup" className="border rounded-md mt-2">
          <CupProfile listing={listing} />
        </TabsContent>
      </Tabs>
      
      {/* Order Documents Section - Visible only when an order exists */}
      {orderStatus && orderStatus.documents && orderStatus.documents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <FileText size={20} className="mr-2 text-primary" />
              Order Documents
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {orderStatus.documents.map((doc, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <FileText size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{doc.name}</h4>
                      <p className="text-xs text-muted-foreground">Added {doc.date}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                    <Download size={16} className="mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Chat Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MessageCircle size={20} className="mr-2 text-primary" />
            Messages with Seller
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="max-h-96 overflow-y-auto mb-4">
            {chatMessages.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
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
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'buyer' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="ml-3">
              <Send size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
