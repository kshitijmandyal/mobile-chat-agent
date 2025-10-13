"use client"
import { useState, useEffect, useRef } from "react"

interface Phone {
  id: string | number;
  brand: string;
  model: string;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  storagePriceMap?: Record<string, number>;
  camera?: string;
  primaryCamera?: number;
  battery?: string;
  batteryMah?: number;
  charging?: string;
  os?: string;
  screen?: string;
  display?: string;
  storage?: string;
  storageOptions?: string[];
  cameraSummary?: string;
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleSend = async () => {
    if (input.trim()) {
      setIsTyping(true)
      await onSend(input)
      setInput("")
      setIsTyping(false)
    }
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    position: 'relative',
    overflow: 'hidden',
    background: 'transparent',
    minHeight: '100vh'
  }

  // Responsive width for content
  const getResponsiveWidth = () => {
    if (windowWidth < 640) return '99vw';  // Mobile
    if (windowWidth < 1024) return '96vw'; // Tablet
    if (windowWidth < 1400) return '90vw'; // Desktop
    return '75vw'; // Large screens
  }

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: getResponsiveWidth(),
    maxWidth: 1400,
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
    transition: 'width 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
  }

  const headerStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(60px) saturate(180%)',
    WebkitBackdropFilter: 'blur(60px) saturate(180%)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    borderRadius: '0 0 28px 28px',
    margin: '0 16px 0 16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderTop: 'none',
    color: '#1a1a1a'
  }

  const messagesStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 40px',
    gap: '16px',
    display: 'flex',
    flexDirection: 'column'
  }

  const userMessageStyle: React.CSSProperties = {
    background: 'rgba(171, 186, 171, 0.4)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    color: '#1a1a1a',
    padding: '16px 20px',
    borderRadius: '24px 24px 6px 24px',
    maxWidth: '80%',
    alignSelf: 'flex-end',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
    marginLeft: '20%',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    textShadow: 'none'
  }

  const botMessageStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    color: '#1a1a1a',
    padding: '16px 20px',
    borderRadius: '24px 24px 24px 6px',
    maxWidth: '80%',
    alignSelf: 'flex-start',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    marginRight: '20%',
    textShadow: 'none'
  }

  const phoneCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.28)',
    backdropFilter: 'blur(50px) saturate(180%)',
    WebkitBackdropFilter: 'blur(50px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    borderRadius: '24px',
    padding: '24px',
    margin: '12px 0',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
    cursor: 'pointer'
  }

  const inputContainerStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(60px) saturate(180%)',
    WebkitBackdropFilter: 'blur(60px) saturate(180%)',
    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '24px',
    borderRadius: '28px 28px 0 0',
    margin: '0 16px 0 16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderBottom: 'none',
    boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.35)',
    backdropFilter: 'blur(30px) saturate(180%)',
    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '22px',
    padding: '16px 24px',
    fontSize: '16px',
    outline: 'none',
    marginRight: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
    color: '#1a1a1a',
    fontWeight: 500,
    transition: 'all 0.3s ease'
  }

  const buttonStyle: React.CSSProperties = {
    background: 'rgba(171, 186, 171, 0.5)',
    backdropFilter: 'blur(30px) saturate(180%)',
    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
    color: '#1a1a1a',
    fontWeight: 700,
    opacity: 1,
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '22px',
    padding: '14px 24px',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
    textShadow: 'none',
    position: 'relative',
    overflow: 'hidden',
    letterSpacing: 0.5
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(171, 186, 171, 0.35)',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
          }}>
            📱
          </div>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              margin: 0,
              textShadow: 'none'
            }}>
              Mobile Chat Assistant
            </h1>
            <p style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '14px', margin: 0, textShadow: 'none' }}>Find your perfect phone</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={messagesStyle}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={msg.from === "user" ? userMessageStyle : botMessageStyle}>
              {msg.text}
            </div>
            
            {msg.data && (
              <div style={{ marginTop: '16px' }}>
                {msg.data.map((phone, i) => (
                  <div 
                    key={i} 
                    style={phoneCardStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 16px 56px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#1a1a1a',
                          margin: '0 0 8px 0'
                        }}>
                          <strong>{phone.brand}</strong> {phone.model}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>
                            {typeof phone.priceMin === 'number' && typeof phone.priceMax === 'number' && phone.priceMin !== phone.priceMax
                              ? `₹${phone.priceMin.toLocaleString()} – ₹${phone.priceMax.toLocaleString()}`
                              : typeof phone.priceMin === 'number'
                                ? `₹${phone.priceMin.toLocaleString()}`
                                : 'Price TBD'}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            background: '#DCFCE7',
                            color: '#065F46',
                            padding: '4px 8px',
                            borderRadius: '12px'
                          }}>
                            {phone.os || '—'}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '48px' }}>📱</div>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      fontSize: '14px'
                    }}>
                      {[
                        { icon: '📸', label: 'Camera', value: phone.cameraSummary || phone.camera || (phone.primaryCamera ? `${phone.primaryCamera}MP` : '—'), color: '#3B82F6' },
                        { icon: '🔋', label: 'Battery', value: phone.battery ?? (phone.batteryMah ? `${phone.batteryMah} mAh` : '—'), color: '#10B981' },
                        { icon: '💾', label: 'Storage', value: Array.isArray(phone.storageOptions) && phone.storageOptions.length ? phone.storageOptions.join(', ') : (phone.storage ?? '—'), color: '#8B5CF6' },
                        { icon: '📺', label: 'Display', value: phone.screen ?? phone.display ?? '—', color: '#6366F1' }
                      ].map((feature, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: 'rgba(255, 255, 255, 0.35)',
                          backdropFilter: 'blur(20px) saturate(160%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                          padding: '12px',
                          borderRadius: '14px',
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'rgba(255, 255, 255, 0.5)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.6)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                          }}>
                            {feature.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{feature.label}</div>
                            <div style={{ color: '#666' }}>{feature.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      <span>ID: {phone.id}</span>
                      <span style={{
                        background: 'rgba(171, 186, 171, 0.4)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        color: '#1a1a1a',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                      }}>
                        Recommended ✨
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div style={botMessageStyle}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', background: '#abbaab', borderRadius: '50%', animation: 'bounce 1s infinite' }}></div>
              <div style={{ width: '8px', height: '8px', background: '#666', borderRadius: '50%', animation: 'bounce 1s infinite 0.1s' }}></div>
              <div style={{ width: '8px', height: '8px', background: '#abbaab', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={inputContainerStyle}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about phones... 📱"
            style={inputStyle}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isTyping) {
                handleSend();
              }
            }}
            disabled={isTyping}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            style={{
              ...buttonStyle,
              opacity: (!input.trim() || isTyping) ? 0.5 : 1,
              cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!(!input.trim() || isTyping)) {
                e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                e.currentTarget.style.background = 'rgba(171, 186, 171, 0.7)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0px)';
              e.currentTarget.style.background = 'rgba(171, 186, 171, 0.5)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7)';
            }}
          >
            Send 🚀
          </button>
        </div>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center'
        }}>
          {[ 
            { text: "Lightweight phones", icon: "🏋️" },
            { text: "iPhone latest models", icon: "🍎" },
            { text: "Best camera phones", icon: "📸" },
            { text: "Budget phones under ₹20,000", icon: "💰" },
            { text: "Long battery life", icon: "🔋" },
            { text: "Latest 2025 phones", icon: "🆕" }
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setInput(suggestion.text)}
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '18px',
                padding: '10px 16px',
                fontSize: '14px',
                color: '#1a1a1a',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                textShadow: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(171, 186, 171, 0.45)';
                e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1) translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)';
              }}
            >
              <span>{suggestion.icon}</span>
              <span>{suggestion.text}</span>
            </button>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
      `}</style>
      </div>
    </div>
  )
}