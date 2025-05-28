import { Search, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageThread } from "@/types/coffee-listing";
import { useState } from "react";

interface MessageThreadListProps {
  messageThreads: MessageThread[];
  activeMessageThread: string | null;
  setActiveMessageThread: (id: string | null) => void;
  messageFilter: string;
  setMessageFilter: (filter: string) => void;
  senderId: string;
  loading: boolean;
}

export function MessageThreadList({
  messageThreads,
  activeMessageThread,
  setActiveMessageThread,
  messageFilter,
  setMessageFilter,
  senderId,
  loading,
}: MessageThreadListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredThreads = messageThreads.filter((thread) =>
    thread.buyerName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Skeleton loader for loading state
  const renderLoadingCards = () => (
    <div className="space-y-3 sm:space-y-4">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className="rounded-sm">
          <CardContent className="p-3 sm:p-4 flex items-start space-x-2 sm:space-x-3 animate-pulse">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200" />
            <div className="flex-1 flex flex-col space-y-1 sm:space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="h-3 sm:h-4 w-1/3 bg-gray-200 rounded" />
                <div className="h-2 sm:h-3 w-1/4 bg-gray-200 rounded" />
              </div>
              <div className="h-2 sm:h-3 w-1/2 bg-gray-200 rounded" />
              <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      <div className="border-b pb-2 sm:pb-3 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Messages
          </h3>
          <Select value={messageFilter} onValueChange={setMessageFilter}>
            <SelectTrigger className="w-full sm:w-[140px] text-xs sm:text-sm">
              <SelectValue placeholder="All Messages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
          {searchQuery && (
            <button
              className="absolute right-2.5 top-2.5 h-3 sm:h-4 w-3 sm:w-4 text-gray-500"
              onClick={() => setSearchQuery("")}
            >
              <X size={12} className="sm:h-4 sm:w-4" />
            </button>
          )}
          <Input
            placeholder="Search by sender..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 sm:pl-8 pr-7 sm:pr-8 text-xs sm:text-sm h-8 sm:h-10"
          />
        </div>
      </div>
      <div className="overflow-y-auto flex-grow p-2 sm:p-4 space-y-3 sm:space-y-4">
        {loading ? (
          renderLoadingCards()
        ) : filteredThreads.length === 0 ? (
          <div className="text-center py-8 sm:py-10 text-gray-500 text-xs sm:text-sm">
            No messages found.
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const lastMessage = thread.messages[thread.messages.length - 1];
            const isSenderMe = lastMessage?.sender.id === senderId;
            const messagePreview = lastMessage
              ? `${isSenderMe ? "You: " : ""}${lastMessage.message}`
              : "";

            return (
              <Card
                key={thread.id}
                className={`cursor-pointer hover:bg-gray-50 rounded-sm ${
                  activeMessageThread === thread.id ? "bg-emerald-50" : ""
                }`}
                onClick={() => setActiveMessageThread(thread.id)}
              >
                <CardContent className="p-3 sm:p-4 flex items-start space-x-2 sm:space-x-3">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    {thread.buyerAvatar ? (
                      <img
                        src={thread.buyerAvatar.split(",")[0]}
                        alt={thread.buyerName}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xs sm:text-sm">
                        {thread.buyerName.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-baseline justify-between">
                      <p
                        className={`text-xs sm:text-sm font-medium ${
                          thread.unread > 0
                            ? "text-emerald-900"
                            : "text-gray-900"
                        }`}
                      >
                        {thread.buyerName}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                        {new Date(thread.lastMessageTime).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
                      </p>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                      {thread.buyerCompany || "Farmer"}
                    </p>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-600 truncate">
                      {messagePreview}
                    </p>
                    {thread.unread > 0 && (
                      <div className="mt-1 sm:mt-2">
                        <Badge variant="default" className="text-xs sm:text-sm">
                          {thread.unread} new{" "}
                          {thread.unread === 1 ? "message" : "messages"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
