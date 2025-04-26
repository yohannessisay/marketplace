"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageThread as MessageThreadType,
  Message,
} from "@/types/coffee-listing";
import { useMobile } from "@/hooks/useMobile";
import { chatService } from "@/services/chatService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";

interface MessageThreadProps {
  messageThreads: MessageThreadType[];
  activeMessageThread: string | null;
  setActiveMessageThread: (id: string | null) => void;
  senderId: string;
  updateThreads: (threads: MessageThreadType[]) => void;
}

export function MessageThread({
  messageThreads,
  activeMessageThread,
  setActiveMessageThread,
  senderId,
  updateThreads,
}: MessageThreadProps) {
  const [chatMessage, setChatMessage] = useState("");
  const isMobile = useMobile();
  const { errorMessage } = useNotification();

  const thread = messageThreads.find((t) => t.id === activeMessageThread);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !thread || !activeMessageThread) return;

    const latestMessage = thread.messages[0];
    const recipientId =
      latestMessage.sender.id === senderId
        ? latestMessage.recipient.id
        : latestMessage.sender.id;
    const listingId = latestMessage.listingId;

    const tempId = `temp-${Math.random().toString(36).substring(2)}`;
    const optimisticMessage: Message = {
      id: tempId,
      sender: {
        id: senderId,
        userType: "seller",
        name: "You",
        company_name: null,
        avatar_url_csv: null,
      },
      recipient: {
        id: recipientId,
        userType: thread.buyerCompany ? "buyer" : "seller",
        name: thread.buyerName,
        company_name: thread.buyerCompany,
        avatar_url_csv: thread.buyerAvatar,
      },
      recipientType: thread.buyerCompany ? "buyer" : "seller",
      message: chatMessage,
      listingId: listingId || null,
      createdAt: new Date().toISOString(),
    };

    const updatedThreads = messageThreads.map((t) =>
      t.id === activeMessageThread
        ? {
            ...t,
            messages: [...t.messages, optimisticMessage].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            ),
            lastMessageTime: optimisticMessage.createdAt,
          }
        : t,
    );

    updateThreads(updatedThreads);
    setChatMessage("");

    try {
      await chatService().sendMessage({
        recipientId,
        message: chatMessage,
        listingId: listingId || undefined,
      });
    } catch (error: unknown) {
      console.error("[MessageThread] Send message error:", error);
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);

      const rollbackThreads = messageThreads.map((t) =>
        t.id === activeMessageThread
          ? {
              ...t,
              messages: t.messages.filter((msg) => msg.id !== tempId),
            }
          : t,
      );
      updateThreads(rollbackThreads);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && chatMessage.trim()) {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (!thread || !activeMessageThread) return;

    chatService().connect();

    const unsubscribe = chatService().onMessage((message: any) => {
      if (message.sender.id === senderId || message.recipient.id === senderId) {
        const updatedThreads = messageThreads.map((t) =>
          t.id === activeMessageThread &&
          (t.messages[0].sender.id === message.sender.id ||
            t.messages[0].recipient.id === message.sender.id ||
            t.messages[0].sender.id === message.recipient.id ||
            t.messages[0].recipient.id === message.recipient.id)
            ? {
                ...t,
                messages: [
                  ...t.messages.filter(
                    (msg) =>
                      msg.id !== message.id && !msg.id.startsWith("temp-"),
                  ),
                  {
                    id: message.id,
                    sender: message.sender,
                    recipient: message.recipient,
                    recipientType: message.recipientType,
                    message: message.message,
                    listingId: message.listingId || null,
                    createdAt: message.created_at,
                  },
                ].sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime(),
                ),
                lastMessageTime:
                  new Date(message.created_at) > new Date(t.lastMessageTime)
                    ? message.created_at
                    : t.lastMessageTime,
              }
            : t,
        );

        updateThreads(updatedThreads);
      }
    });

    return () => {
      unsubscribe();
      chatService().disconnect();
    };
  }, [activeMessageThread, thread, senderId, messageThreads, updateThreads]);

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
          <Avatar className="h-10 w-10">
            {thread.buyerAvatar ? (
              <img
                src={thread.buyerAvatar.split(",")[0]}
                alt={thread.buyerName}
              />
            ) : (
              <AvatarFallback className="bg-gray-200 text-gray-600">
                {thread.buyerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-900">
              {thread.buyerName}
            </h4>
            <p className="text-xs text-gray-500">
              {thread.buyerCompany || "Farmer"}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
        
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveMessageThread(null)}
            >
              <X size={18} />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thread.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender.id === senderId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                message.sender.id === senderId
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm">{message.message}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender.id === senderId
                    ? "text-emerald-100"
                    : "text-gray-500"
                }`}
              >
                {new Date(message.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex">
          <Input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!chatMessage.trim()}
            className="ml-3 bg-emerald-600 hover:bg-emerald-700"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
