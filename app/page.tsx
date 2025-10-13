"use client"
import { useState } from "react"
import ChatUIStyled from "@/components/ChatUIStyled"

interface Phone {
  id: number;
  brand: string;
  model: string;
  price: number;
  camera: string;
  battery: string;
  charging: string;
  os: string;
  screen: string;
}

interface Message {
  from: 'user' | 'bot';
  text: string;
  data?: Phone[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([{ 
    from: "bot", 
    text: "👋 Hey there! I'm your AI mobile assistant. I can help you find the perfect phone based on your budget, preferred brand, or specific features. What kind of phone are you looking for today?" 
  }])

  async function sendMessage(text: string) {
    const userMsg = { from: "user" as const, text }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      const botMsg = { from: "bot" as const, text: data.reply, data: data.data }
      setMessages(prev => [...prev, botMsg])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMsg = { 
        from: "bot" as const, 
        text: "Sorry, I'm having trouble connecting. Please try again." 
      }
      setMessages(prev => [...prev, errorMsg])
    }
  }

  return <ChatUIStyled messages={messages} onSend={sendMessage} />
}
