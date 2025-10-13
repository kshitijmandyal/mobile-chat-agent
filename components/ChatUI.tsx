"use client"
import { useState, useEffect, useRef } from "react"

interface Phone {
  id: string | number;
  brand: string;
  model: string;
  price?: number;
  camera?: string;
  primaryCamera?: number;
  battery?: string;
  batteryMah?: number;
  charging?: string;
  os?: string;
  screen?: string;
  display?: string;
}

interface Message {
  from: 'user' | 'bot';
  text: string;
  data?: Phone[];
}

interface ChatUIProps {
  messages: Message[];
  onSend: (text: string) => Promise<void> | void;
}

export default function ChatUI({ messages, onSend }: ChatUIProps) {
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (input.trim()) {
      setIsTyping(true)
      await onSend(input)
      setInput("")
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-6xl mx-auto bg-[linear-gradient(135deg,_#abbaab_0%,_#ffffff_100%)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[linear-gradient(135deg,_#abbaab_0%,_#ffffff_100%)] blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[linear-gradient(135deg,_#abbaab_0%,_#ffffff_100%)] blur-3xl"></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/80 border border-gray-200 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-gray-800 text-xl">📱</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Mobile Chat Assistant
            </h1>
            <p className="text-gray-600 text-sm">Find your perfect phone</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
            <div className={`max-w-xs lg:max-w-md ${msg.from === "user" ? "order-2" : "order-1"}`}>
              {msg.from === "bot" && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-white/80 border border-gray-200 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-gray-800 text-sm">🤖</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">AI Assistant</span>
                </div>
              )}
              
              <div className={`p-4 rounded-2xl shadow-lg backdrop-blur-sm ${
                msg.from === "user" 
                  ? "bg-[linear-gradient(135deg,_#abbaab_0%,_#ffffff_100%)] text-gray-900 ml-4" 
                  : "bg-white/80 text-gray-900 mr-4 border border-gray-200"
              }`}>
                {msg.text}
              </div>
              
              {msg.data && (
                <div className="mt-4 space-y-3 mr-4">
                  {msg.data.map((phone, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 mb-1">
                            {phone.brand} {phone.model}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-3xl font-bold text-green-600">{typeof phone.price === 'number' ? `₹${phone.price.toLocaleString()}` : 'Price TBD'}</span>
                            <span className="text-sm text-gray-700 bg-white/60 px-2 py-1 rounded-full">{phone.os || '—'}</span>
                          </div>
                        </div>
                        <div className="text-5xl group-hover:animate-bounce">
                          {phone.brand.toLowerCase() === 'apple' ? '📱' : 
                           phone.brand.toLowerCase() === 'samsung' ? '📲' : 
                           phone.brand.toLowerCase().includes('oneplus') ? '📱' : '📲'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-3 bg-white/70 rounded-lg p-3 border border-gray-200">
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-800">📸</div>
                          <div>
                            <div className="font-semibold text-gray-900">Camera</div>
                            <div className="text-gray-600">{phone.camera ?? (phone.primaryCamera ? `${phone.primaryCamera}MP` : '—')}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-white/70 rounded-lg p-3 border border-gray-200">
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-800">🔋</div>
                          <div>
                            <div className="font-semibold text-gray-900">Battery</div>
                            <div className="text-gray-600">{phone.battery ?? (phone.batteryMah ? `${phone.batteryMah} mAh` : '—')}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-white/70 rounded-lg p-3 border border-gray-200">
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-800">⚡</div>
                          <div>
                            <div className="font-semibold text-gray-900">Charging</div>
                            <div className="text-gray-600">{phone.charging ?? '—'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-white/70 rounded-lg p-3 border border-gray-200">
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-800">📺</div>
                          <div>
                            <div className="font-semibold text-gray-900">Display</div>
                            <div className="text-gray-600">{phone.screen ?? phone.display ?? '—'}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>ID: {phone.id}</span>
                          <span className="bg-[linear-gradient(135deg,_#abbaab_0%,_#ffffff_100%)] border border-gray-300 text-gray-900 px-3 py-1 rounded-full text-xs font-medium shadow-md">
                            Recommended ✨
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {msg.from === "user" && (
                <div className="flex items-center justify-end space-x-2 mt-2 mr-4">
                  <span className="text-sm text-gray-600 font-medium">You</span>
                  <div className="w-8 h-8 bg-white/80 border border-gray-200 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-gray-800 text-sm">👤</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-white/80 border border-gray-200 rounded-full flex items-center justify-center shadow-md">
                <span className="text-gray-800 text-sm">🤖</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative z-10 p-6 bg-white/80 backdrop-blur-lg border-t border-gray-200">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about phones... 📱"
              className="w-full bg-white/70 backdrop-blur-sm border border-gray-300 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent shadow-lg placeholder-gray-500 text-gray-900"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isTyping) {
                  handleSend();
                }
              }}
              disabled={isTyping}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-[linear-gradient(135deg,_#abbaab_0%,_#ffffff_100%)] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <span>Send</span>
            <span className="text-lg">🚀</span>
          </button>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {[
            { text: "Samsung under ₹20,000", icon: "🎯" },
            { text: "iPhone latest models", icon: "🍎" },
            { text: "Best camera phones", icon: "📸" },
            { text: "Gaming phones", icon: "🎮" },
            { text: "Budget phones under ₹15,000", icon: "💰" },
            { text: "5G phones", icon: "📡" }
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setInput(suggestion.text)}
              className="bg-white/70 hover:bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-900 hover:text-gray-900 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2 group"
            >
              <span className="group-hover:animate-bounce">{suggestion.icon}</span>
              <span className="font-medium">{suggestion.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
