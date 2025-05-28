"use client";

import { useState, useEffect } from "react";
import { FileText, Download, MessageCircle, Send } from "lucide-react";
import { OrderStatus } from "@/types/order";
import { CoffeeListing } from "@/types/coffee";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhotoGallery } from "./photo-gallery";
import { CupProfile } from "./cup-profile";
import { CoffeeDetailsTab } from "./coffee-details-tab";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { FarmInformation } from "./farm-information";
import { apiService } from "@/services/apiService";
import { chatService } from "@/services/chatService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse, SocketChatMessage } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";

interface CoffeeDetailsProps {
  listing: CoffeeListing | null;
  demoOrderStatus: OrderStatus;
  onRequireAuth: () => void;
}

export function CoffeeDetails({
  listing,
  demoOrderStatus,
  onRequireAuth,
}: CoffeeDetailsProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      sender: string;
      message: string;
      timestamp: string;
    }>
  >([]);
  const orderStatus = useOrderStatus(demoOrderStatus);
  const { errorMessage } = useNotification();
  const { user, loading } = useAuth();

  const handleFetchMessages = async () => {
    if (!listing || !listing.id || !user) return;

    try {
      const senderId = user?.id;
      if (!senderId) {
        throw new Error("No authenticated user found");
      }

      const receiverId = listing.seller_id;
      if (!receiverId) {
        throw new Error("No receiver ID found in listing");
      }

      const response = await apiService().get<{
        data: { messages: Array<any> };
      }>(
        `/chats/messages?senderId=${senderId}&receiverId=${receiverId}&listingId=${listing.id}`,
      );

      const messages = response.data.messages.map((msg: any) => ({
        id: msg.id,
        sender: msg.senderId === senderId ? "buyer" : "seller",
        message: msg.message,
        timestamp: new Date(msg.createdAt).toLocaleDateString(),
      }));

      setChatMessages(messages.reverse());
    } catch (error: unknown) {
      console.error("[CoffeeDetails] Fetch messages error:", error);
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);
    }
  };

  useEffect(() => {
    if (!listing || !listing.id) return;

    if (user) {
      handleFetchMessages();
      chatService().connect();

      const unsubscribe = chatService().onMessage(
        (message: SocketChatMessage) => {
          setChatMessages((prev) => {
            if (prev.some((msg) => msg.id === message.id)) {
              return prev;
            }
            return [
              ...prev,
              {
                id: message.id,
                sender: message.senderId === user?.id ? "buyer" : "seller",
                message: message.message,
                timestamp: new Date(message.created_at).toLocaleDateString(),
              },
            ];
          });
        },
      );

      return () => {
        unsubscribe();
        chatService().disconnect();
      };
    }
  }, [listing?.id, user]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !listing || !user) return;

    try {
      const senderId = user?.id;
      if (!senderId) {
        throw new Error("No authenticated user found");
      }

      const recipientId = listing.seller_id;
      if (!recipientId) {
        throw new Error("No receiver ID found in listing");
      }

      const tempId = Math.random().toString(36).substring(2);
      const timestamp = new Date().toLocaleDateString();

      setChatMessages((prev) => [
        ...prev,
        {
          id: tempId,
          sender: senderId === user?.id ? "buyer" : "seller",
          message: chatMessage,
          timestamp,
        },
      ]);

      await chatService().sendMessage({
        recipientId,
        message: chatMessage,
        listingId: listing.id,
      });

      setChatMessage("");
    } catch (error: unknown) {
      console.error("[CoffeeDetails] Send message error:", error);
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      chatMessage.trim() &&
      user?.onboarding_stage === "completed"
    ) {
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6 px-0.1 sm:px-2 lg:px-0">
      <PhotoGallery
        photos={listing?.coffee_photo ?? []}
        isOrganic={listing?.is_organic ?? false}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 gap-1 w-full sm:w-auto sm:inline-flex sm:gap-2">
          <TabsTrigger
            value="details"
            className="text-xs sm:text-sm px-2 py-1 truncate"
          >
            Coffee Details
          </TabsTrigger>
          <TabsTrigger
            value="farm"
            className="text-xs sm:text-sm px-2 py-1 truncate"
          >
            Farm Info
          </TabsTrigger>
          <TabsTrigger
            value="cup"
            className="text-xs sm:text-sm px-2 py-1 truncate"
          >
            Cup Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="details"
          className="border rounded-md mt-2 p-4 sm:p-6"
        >
          {listing && <CoffeeDetailsTab listing={listing} />}
        </TabsContent>

        <TabsContent value="farm" className="border rounded-md mt-2 p-4 sm:p-6">
          <FarmInformation listing={listing?.farm} />
        </TabsContent>

        <TabsContent value="cup" className="border rounded-md mt-2 p-4 sm:p-6">
          <CupProfile listing={listing} />
        </TabsContent>
      </Tabs>

      {orderStatus &&
        orderStatus.documents &&
        orderStatus.documents.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <FileText size={20} className="mr-2 text-primary" />
                Order Documents
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {orderStatus.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center mb-2 sm:mb-0">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <FileText size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{doc.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Added {doc.date}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 w-full sm:w-auto"
                    >
                      <Download size={16} className="mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      {(!user || user?.userType !== "seller") && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl flex items-center">
              <MessageCircle size={20} className="mr-2 text-primary" />
              Messages with Seller
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-60 overflow-y-auto mb-4 flex flex-col-reverse">
              {user && chatMessages.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground h-full flex items-center justify-center text-sm">
                  No messages yet. Start a conversation with the seller.
                </div>
              ) : !user ? (
                <div className="text-center py-6 text-muted-foreground h-full flex items-center justify-center text-sm">
                  Please sign in to message the seller.
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "buyer"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                          message.sender === "buyer"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "buyer"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  user ? "Type your message..." : "Sign in to send a message"
                }
                className="flex-1 text-sm"
                disabled={
                  !user ||
                  (user?.onboarding_stage !== "completed" &&
                    user?.userType !== "seller")
                }
                onClick={() => !user && onRequireAuth()}
              />
              <Button
                onClick={handleSendMessage}
                className="w-full sm:w-auto"
                disabled={
                  chatMessage === "" ||
                  (loading && user?.onboarding_stage !== "completed") ||
                  (loading &&
                    user?.userType !== "seller" &&
                    user?.verification_status === "pending")
                }
              >
                <Send size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
