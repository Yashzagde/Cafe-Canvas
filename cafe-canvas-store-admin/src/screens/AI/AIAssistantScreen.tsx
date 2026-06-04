import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Send, Trash2, Bot, User, AlertCircle } from 'lucide-react'
import { useTenantStore } from '../../store/tenant.store'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIAssistantScreen() {
  const { tenant } = useTenantStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Set up IPC stream listeners
  useEffect(() => {
    // Listen to streamed chunks
    const unsubscribeChunk = window.electronAPI.onAiChunk((chunk: string) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last && last.role === 'assistant') {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...last,
            content: last.content + chunk
          }
          return updated
        }
        return prev
      })
    })

    // Listen to completion
    const unsubscribeDone = window.electronAPI.onAiDone(() => {
      setIsGenerating(false)
    })

    // Listen to errors
    const unsubscribeError = window.electronAPI.onAiError((err: string) => {
      setIsGenerating(false)
      setErrorMsg(err)
      // Append error message to assistant's text
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last && last.role === 'assistant') {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...last,
            content: last.content + '\n\n[Error: ' + err + ']'
          }
          return updated
        }
        return prev
      })
    })

    // Clean up event listeners on unmount
    return () => {
      unsubscribeChunk()
      unsubscribeDone()
      unsubscribeError()
    }
  }, [])

  const systemPrompt = `You are the Cafe Canvas AI, a smart assistant for restaurant management.
You have context about this store:
- Store Name: ${tenant?.name || 'Aether Café'}
- City: ${tenant?.city || 'Pune'}
- Subscription Level: ${tenant?.subscription_tier || 'Pro'}

Help with: menu optimization, staff scheduling, customer feedback analysis, marketing copy, pricing strategy, and operational advice.`

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return

    const userMsg: Message = { role: 'user', content: text.trim() }
    const assistantPlaceholder: Message = { role: 'assistant', content: '' }

    const updatedMessages = [...messages, userMsg]
    setMessages([...updatedMessages, assistantPlaceholder])
    setInputValue('')
    setIsGenerating(true)
    setErrorMsg(null)

    try {
      // Map messages format to match Anthropic message structures
      const formattedMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content
      }))

      await window.electronAPI.sendChatMessage(formattedMessages, systemPrompt)
    } catch (err: any) {
      setIsGenerating(false)
      setErrorMsg(err.message || 'Failed to dispatch AI query.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputValue)
    }
  }

  const clearChat = () => {
    if (confirm('Clear active assistant discussion?')) {
      setMessages([])
      setErrorMsg(null)
    }
  }

  // Pre-configured chip suggestions
  const suggestedPrompts = [
    'Suggest a weekend marketing plan',
    'How can I reduce table waiting times?',
    'Create a summer beverage recipe list',
    'Draft a cashier welcoming speech'
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] select-none font-body">
      
      {/* AI Screen Header */}
      <div className="flex items-center justify-between pb-4 border-b border-canvas-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-canvas-gold text-canvas-brown flex items-center justify-center border border-canvas-gold/30">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-canvas-brown">
              Cafe Canvas AI
            </h2>
            <p className="text-xs text-canvas-brown_mid font-medium">
              Merchant strategy co-pilot powered by Claude 3.5 Sonnet.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-canvas-border bg-white hover:bg-canvas-cream text-canvas-brown_mid font-bold text-xs shadow-sm transition-colors focus:outline-none"
            title="Clear Chat Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Chat
          </button>
        )}
      </div>

      {/* Chat Conversation Canvas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 my-4 bg-canvas-surface/20 rounded-xl border border-canvas-border/40">
        
        {/* Placeholder welcome screen */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-10 space-y-6">
            <div className="w-16 h-16 bg-canvas-surface border border-canvas-border rounded-full flex items-center justify-center animate-bounce shadow-md">
              <Bot className="w-8 h-8 text-canvas-terracotta" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-canvas-brown">
                Consult with your Store Co-Pilot
              </h3>
              <p className="text-xs text-canvas-brown_mid font-semibold mt-1 leading-relaxed">
                Need advice on pricing modifiers? Launching a campaign? Ask me anything about managing your restaurant!
              </p>
            </div>

            {/* suggested chips grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-3 text-xs font-bold text-canvas-brown_mid bg-canvas-surface hover:bg-canvas-surface hover:border-canvas-terracotta border border-canvas-border rounded-xl transition-all shadow-sm text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Logs */}
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user'
          return (
            <div
              key={index}
              className={`flex items-start gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar indicator */}
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-sm border ${
                isUser 
                  ? 'bg-canvas-terracotta text-white border-canvas-terra_dark/25' 
                  : 'bg-canvas-gold text-canvas-brown border-canvas-gold/30'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message bubble */}
              <div className={`p-3.5 rounded-xl text-xs font-bold leading-relaxed whitespace-pre-wrap select-text shadow-sm border ${
                isUser 
                  ? 'bg-canvas-terracotta text-white border-canvas-terra_dark/20 rounded-tr-none' 
                  : 'bg-canvas-surface text-canvas-brown border-canvas-border rounded-tl-none'
              }`}>
                {msg.content || (isGenerating && index === messages.length - 1 ? (
                  <span className="inline-flex gap-1 items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-canvas-terracotta animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-canvas-terracotta animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-canvas-terracotta animate-bounce delay-300"></span>
                  </span>
                ) : 'No response content')}
              </div>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="space-y-2">
        {errorMsg && (
          <div className="p-3 bg-canvas-coral/10 border border-canvas-coral/25 rounded-lg flex items-center gap-2 text-xs text-canvas-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-bold">Error: {errorMsg}</span>
          </div>
        )}

        <div className="flex gap-2.5 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder={isGenerating ? "Consulting AI..." : "Ask your AI co-pilot about store strategy..."}
            className="flex-1 px-4 py-3 rounded-lg border border-canvas-border bg-white text-xs font-bold text-canvas-brown outline-none focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 transition-all placeholder-canvas-brown_light disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isGenerating}
            className="w-11 h-11 rounded-lg bg-canvas-gold hover:bg-canvas-gold_light active:bg-canvas-gold text-canvas-brown flex items-center justify-center shadow-md shadow-canvas-gold/15 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
