"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { MessageThreadList } from "../marketplace/coffee-listing-seller/message-thread-list";
import { MessageThread } from "../marketplace/coffee-listing-seller/message-thread";
import { apiService } from "@/services/apiService";
import { useMobile } from "@/hooks/useMobile";
import { useNotification } from "@/hooks/useNotification";
import { getFromLocalStorage } from "@/lib/utils";
import {
  Message,
  MessageThread as MessageThreadType,
} from "@/types/coffee-listing";
import Header from "@/components/layout/header";
import { useAuth } from "@/hooks/useAuth";

interface ChatsPageProps {
  listingId?: string;
}

export default function ChatsPage({ listingId }: ChatsPageProps) {
  const [activeMessageThread, setActiveMessageThread] = useState<string | null>(
    null,
  );
  const [messageFilter, setMessageFilter] = useState("all");
  const [messageThreads, setMessageThreads] = useState<MessageThreadType[]>([]);
  const [loading, setLoading] = useState(true);
  const { errorMessage } = useNotification();
  const isMobile = useMobile();
  const { user, loading: authLoading } = useAuth();

  const memoizedErrorMessage = useMemo(() => errorMessage, []);

  let fmrId = null;
  if (user && user.userType === "agent") {
    const farmer: any = getFromLocalStorage("farmer-profile", {});
    fmrId = farmer ? farmer.id : null;
  }

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const messagesResponse: any = await apiService().get(
          listingId
            ? `/chats/listing-messages?listingId=${listingId}`
            : `/chats/listing-messages`,
          fmrId ? fmrId : "",
        );

        const groupedThreads: { [key: string]: MessageThreadType } = {};
        messagesResponse.data.messages.forEach((msg: Message) => {
          const otherPartyId =
            msg.sender.id === user.id ? msg.recipient.id : msg.sender.id;
          const threadId = otherPartyId; // Group by otherPartyId only

          if (!groupedThreads[threadId]) {
            const otherParty =
              msg.sender.id === user.id ? msg.recipient : msg.sender;
            const isOtherPartyBuyer = otherParty.userType === "buyer";

            groupedThreads[threadId] = {
              id: threadId,
              buyerName: otherParty.name,
              buyerCompany: isOtherPartyBuyer ? otherParty.company_name : null,
              buyerAvatar: otherParty.avatar_url_csv,
              unread: 0,
              lastMessageTime: msg.createdAt,
              messages: [],
            };
          }

          groupedThreads[threadId].messages.push({
            id: msg.id,
            sender: msg.sender,
            recipient: msg.recipient,
            recipientType: msg.recipientType,
            message: msg.message,
            listingId: msg.listingId,
            createdAt: msg.createdAt,
          });

          if (
            new Date(msg.createdAt) >
            new Date(groupedThreads[threadId].lastMessageTime)
          ) {
            groupedThreads[threadId].lastMessageTime = msg.createdAt;
          }
        });

        const threadsArray = Object.values(groupedThreads)
          .map((thread) => ({
            ...thread,
            messages: thread.messages.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            ),
          }))
          .sort(
            (a, b) =>
              new Date(b.lastMessageTime).getTime() -
              new Date(a.lastMessageTime).getTime(),
          );

        setMessageThreads(threadsArray);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        memoizedErrorMessage(error as any);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [listingId, user?.id, authLoading, memoizedErrorMessage]);

  const filteredThreads = messageThreads.filter((thread) => {
    if (messageFilter === "unread") {
      return thread.unread > 0;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-primary/5 p-8 mt-5">
      <Header />
      <main className="container px-4 md:px-24 py-8">
        <Card>
          <div className="flex h-[700px]">
            <div
              className={`${activeMessageThread && isMobile ? "hidden" : ""} w-full md:w-1/3 border-r`}
            >
              <div className="h-full p-4">
                <div className="mb-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"></div>
                </div>
                <MessageThreadList
                  messageThreads={filteredThreads}
                  activeMessageThread={activeMessageThread}
                  setActiveMessageThread={setActiveMessageThread}
                  messageFilter={messageFilter}
                  setMessageFilter={setMessageFilter}
                  senderId={user?.id as string}
                  loading={loading}
                />
              </div>
            </div>
            <div
              className={`${!activeMessageThread && isMobile ? "hidden" : ""} md:w-2/3 w-full`}
            >
              <div className="h-full">
                <MessageThread
                  messageThreads={messageThreads}
                  activeMessageThread={activeMessageThread}
                  setActiveMessageThread={setActiveMessageThread}
                  senderId={user?.id as string}
                  updateThreads={setMessageThreads}
                />
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
