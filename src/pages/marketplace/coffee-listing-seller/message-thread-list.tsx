"use client";

import { Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageThread } from "@/types/coffee-listing";

interface MessageThreadListProps {
  messageThreads: MessageThread[];
  activeMessageThread: string | null;
  setActiveMessageThread: (id: string | null) => void;
  messageFilter: string;
  setMessageFilter: (filter: string) => void;
}

export function MessageThreadList({
  messageThreads,
  activeMessageThread,
  setActiveMessageThread,
  messageFilter,
  setMessageFilter,
}: MessageThreadListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b pb-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Messages</h3>
          <Select value={messageFilter} onValueChange={setMessageFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Messages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input placeholder="Search messages..." className="pl-8" />
        </div>
      </div>

      <div className="overflow-y-auto flex-grow">
        {messageThreads.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No messages matching your filter.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {messageThreads.map((thread) => (
              <li key={thread.id}>
                <button
                  onClick={() => setActiveMessageThread(thread.id)}
                  className={`w-full flex py-4 px-2 hover:bg-gray-50 focus:outline-none ${
                    activeMessageThread === thread.id ? "bg-emerald-50" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    {thread.buyerAvatar ? (
                      <img
                        src={thread.buyerAvatar.split(",")[0]}
                        alt={thread.buyerName}
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-200 text-gray-600">
                        {thread.buyerName.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="ml-3 flex-1 flex flex-col text-left">
                    <div className="flex items-baseline justify-between">
                      <p
                        className={`text-sm font-medium ${
                          thread.unread > 0
                            ? "text-emerald-900"
                            : "text-gray-900"
                        }`}
                      >
                        {thread.buyerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(thread.lastMessageTime).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          },
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {thread.buyerCompany || "Unknown"}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 truncate">
                      {thread.messages[thread.messages.length - 1]?.message}
                    </p>
                    {thread.unread > 0 && (
                      <div className="mt-1">
                        <Badge variant="default">
                          {thread.unread} new{" "}
                          {thread.unread === 1 ? "message" : "messages"}
                        </Badge>
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
}
