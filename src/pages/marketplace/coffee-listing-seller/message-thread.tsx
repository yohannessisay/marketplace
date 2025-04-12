/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { MessageCircle, User, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { MessageThread as MessageThreadType } from "@/types/coffee-listing" 
import { useMobile } from "@/hooks/useMobile"

interface MessageThreadProps {
  messageThreads: MessageThreadType[]
  activeMessageThread: number | null
  setActiveMessageThread: (id: number | null) => void
}

export function MessageThread({ messageThreads, activeMessageThread, setActiveMessageThread }: MessageThreadProps) {
  const [chatMessage, setChatMessage] = useState("")
  const isMobile = useMobile()

  const thread = messageThreads.find((t) => t.id === activeMessageThread)

  const handleSendMessage = () => {
    if (chatMessage.trim() && activeMessageThread) {
      // In a real app, this would send the message to an API
      console.log("Sending message:", chatMessage, "to thread:", activeMessageThread)
      setChatMessage("")
    }
  }

  if (!thread) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <MessageCircle size={48} className="text-gray-300 mb-4" />
        <p>Select a conversation to view messages</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gray-200 text-gray-600">{thread.buyerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-900">{thread.buyerName}</h4>
            <p className="text-xs text-gray-500">{thread.buyerCompany}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <User size={18} />
            <span className="sr-only">View profile</span>
          </Button>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setActiveMessageThread(null)}>
              <X size={18} />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thread.messages.map((message:any) => (
          <div key={message.id} className={`flex ${message.sender === "seller" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                message.sender === "seller" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm">{message.message}</p>
              <p className={`text-xs mt-1 ${message.sender === "seller" ? "text-emerald-100" : "text-gray-500"}`}>
                {message.timestamp}
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
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!chatMessage.trim()}
            className="ml-3 bg-emerald-600 hover:bg-emerald-700"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
