"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Smile, Settings, MoreVertical, User, Bot, Mic, Users } from "lucide-react"
import { EmojiPicker } from "./emoji-picker"
import { VoiceRecorder } from "./voice-recorder"
import { VoiceMessage } from "./voice-message"
import { ToneSelector } from "./tone-selector"
import { formatTime } from "@/lib/utils"
import type { Consultant } from "@/lib/consultants"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  status: "sending" | "sent" | "delivered" | "read"
  type: "text" | "voice"
  voiceData?: {
    audioUrl: string
    duration: number
    waveform: number[]
  }
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  lastMessage: Date
  consultantId?: string
  consultantName?: string
  customization: {
    role?: string
    tone: string
    language: string
    consultantPrompt?: string
  }
}

interface ChatInterfaceProps {
  isMobile: boolean
  selectedConsultant?: Consultant | null
  onNewChat: () => void
}

export function ChatInterface({ isMobile, selectedConsultant, onNewChat }: ChatInterfaceProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [showToneSelector, setShowToneSelector] = useState(false)
  const [hasVoiceSupport, setHasVoiceSupport] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentSession = sessions.find((s) => s.id === currentSessionId)

  useEffect(() => {
    // Check for voice recording support
    setHasVoiceSupport(
      typeof navigator !== "undefined" &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function",
    )

    // Load sessions from localStorage
    const savedSessions = localStorage.getItem("chatSessions")
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions)
      const sessionsWithDates = parsed.map((session: any) => ({
        ...session,
        lastMessage: new Date(session.lastMessage),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }))
      setSessions(sessionsWithDates)
      if (sessionsWithDates.length > 0) {
        setCurrentSessionId(sessionsWithDates[0].id)
      }
    }
  }, [])

  useEffect(() => {
    // Create new session when consultant is selected
    if (selectedConsultant && (!currentSession || currentSession.consultantId !== selectedConsultant.id)) {
      createNewSessionWithConsultant(selectedConsultant)
    }
  }, [selectedConsultant])

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("chatSessions", JSON.stringify(sessions))
    }
  }, [sessions])

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const createNewSessionWithConsultant = (consultant: Consultant) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `Consultation with ${consultant.name}`,
      messages: [],
      lastMessage: new Date(),
      consultantId: consultant.id,
      consultantName: consultant.name,
      customization: {
        tone: "professional",
        language: "english",
        consultantPrompt: consultant.systemPrompt,
      },
    }
    setSessions((prev) => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
  }

  const sendMessage = async (messageContent?: string, messageType: "text" | "voice" = "text", voiceData?: any) => {
    const content = messageContent || input.trim()
    if ((!content && messageType === "text") || !currentSession) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageType === "voice" ? "Voice message" : content,
      role: "user",
      timestamp: new Date(),
      status: "sending",
      type: messageType,
      voiceData: voiceData,
    }

    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, userMessage],
              lastMessage: new Date(),
              title: session.messages.length === 0 ? content.slice(0, 30) + "..." : session.title,
            }
          : session,
      ),
    )

    if (messageType === "text") {
      setInput("")
    }
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...currentSession.messages, userMessage].map((m) => ({
            role: m.role,
            content: m.type === "voice" ? "User sent a voice message" : m.content,
          })),
          customization: currentSession.customization,
          sessionId: currentSessionId,
        }),
      })

      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages: session.messages.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "sent" } : msg)),
              }
            : session,
        ),
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const aiResponseText = await response.text()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText,
        role: "assistant",
        timestamp: new Date(),
        status: "delivered",
        type: "text",
      }

      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages: [...session.messages, assistantMessage],
              }
            : session,
        ),
      )
    } catch (error) {
      console.error("Error sending message:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
        status: "delivered",
        type: "text",
      }

      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages: [...session.messages, errorMessage],
              }
            : session,
        ),
      )
    } finally {
      setIsTyping(false)
    }
  }

  const handleVoiceMessage = (audioBlob: Blob, duration: number, waveform: number[]) => {
    const audioUrl = URL.createObjectURL(audioBlob)
    const voiceData = {
      audioUrl,
      duration,
      waveform,
    }
    sendMessage("", "voice", voiceData)
  }

  const updateTone = (tone: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId ? { ...session, customization: { ...session.customization, tone } } : session,
      ),
    )
  }

  const addEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const downloadVoiceMessage = (audioUrl: string, messageId: string) => {
    const link = document.createElement("a")
    link.href = audioUrl
    link.download = `voice-message-${messageId}.webm`
    link.click()
  }

  const getCurrentConsultant = () => {
    if (selectedConsultant && currentSession?.consultantId === selectedConsultant.id) {
      return selectedConsultant
    }
    return null
  }

  const consultant = getCurrentConsultant()

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-full bg-white/50 backdrop-blur-sm">
        <div className="text-center space-y-4">
          <Users className="h-16 w-16 mx-auto text-primary/50" />
          <div>
            <h2 className="text-xl font-semibold text-primary mb-2">Welcome to Amorya</h2>
            <p className="text-gray-600 mb-4">Connect with professional consultants from around the world</p>
            <Button onClick={onNewChat} className="bg-primary hover:bg-primary/90">
              <Users className="h-4 w-4 mr-2" />
              Choose a Consultant
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/20 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-white font-semibold">
              {consultant ? consultant.avatar : <Bot className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-primary">{consultant ? consultant.name : "AI Assistant"}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {consultant && (
                <>
                  <span>{consultant.profession}</span>
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  <span>{consultant.location}</span>
                </>
              )}
              <Badge variant="secondary" className="text-xs bg-secondary/50 text-secondary-foreground">
                {currentSession.customization.tone}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowToneSelector(true)}
            className="text-primary hover:bg-primary/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 backdrop-blur-sm">
        {currentSession.messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.type === "voice" && message.voiceData ? (
              <div
                className={`flex items-end space-x-2 ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : consultant ? (
                      consultant.avatar
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <VoiceMessage
                  audioUrl={message.voiceData.audioUrl}
                  duration={message.voiceData.duration}
                  waveform={message.voiceData.waveform}
                  timestamp={message.timestamp}
                  isOwn={message.role === "user"}
                  onDownload={() => downloadVoiceMessage(message.voiceData!.audioUrl, message.id)}
                />
              </div>
            ) : (
              <div
                className={`flex items-end space-x-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : consultant ? (
                      consultant.avatar
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Card
                    className={`p-3 ${message.role === "user" ? "bg-primary text-white" : "bg-white border-primary/20"}`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </Card>
                  <div
                    className={`flex items-center mt-1 text-xs text-gray-500 ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    <span>{formatTime(message.timestamp)}</span>
                    {message.role === "user" && (
                      <span className="ml-1">
                        {message.status === "sending" && "⏳"}
                        {message.status === "sent" && "✓"}
                        {message.status === "delivered" && "✓✓"}
                        {message.status === "read" && "✓✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {consultant ? consultant.avatar : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <Card className="p-3 bg-white border-primary/20">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </Card>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recorder Overlay */}
      {showVoiceRecorder && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <VoiceRecorder
            onVoiceMessage={handleVoiceMessage}
            onClose={() => setShowVoiceRecorder(false)}
            isOpen={showVoiceRecorder}
          />
        </div>
      )}

      {/* Tone Selector */}
      {showToneSelector && (
        <ToneSelector
          currentTone={currentSession.customization.tone}
          onToneChange={updateTone}
          onClose={() => setShowToneSelector(false)}
        />
      )}

      {/* Input */}
      <div className="p-4 border-t border-primary/20 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-primary hover:bg-primary/10"
            >
              <Smile className="h-4 w-4" />
            </Button>
            {showEmojiPicker && <EmojiPicker onEmojiSelect={addEmoji} onClose={() => setShowEmojiPicker(false)} />}
          </div>

          {hasVoiceSupport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVoiceRecorder(true)}
              className="text-primary hover:bg-primary/10"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${consultant ? consultant.name : "AI Assistant"}...`}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 border-primary/20 focus:border-primary"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
