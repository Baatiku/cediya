"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Plus,
  Search,
  BarChart3,
  Trash2,
  Archive,
  Users,
  Settings,
  Download,
  Star,
  Leaf,
} from "lucide-react"
import { formatTime } from "@/lib/utils"

interface ChatSession {
  id: string
  title: string
  messages: any[]
  lastMessage: Date
  consultantId?: string
  consultantName?: string
  archived?: boolean
  starred?: boolean
}

interface SidebarProps {
  onViewChange: (view: "chat" | "admin" | "users" | "models") => void
  currentView: "chat" | "admin" | "users" | "models"
  onNewChat: () => void
}

export function Sidebar({ onViewChange, currentView, onNewChat }: SidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
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
    }
  }, [])

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.consultantName && session.consultantName.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesArchive = showArchived ? session.archived : !session.archived
    return matchesSearch && matchesArchive
  })

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter((s) => s.id !== sessionId)
    setSessions(updatedSessions)
    localStorage.setItem("chatSessions", JSON.stringify(updatedSessions))
  }

  const archiveSession = (sessionId: string) => {
    const updatedSessions = sessions.map((s) => (s.id === sessionId ? { ...s, archived: !s.archived } : s))
    setSessions(updatedSessions)
    localStorage.setItem("chatSessions", JSON.stringify(updatedSessions))
  }

  const starSession = (sessionId: string) => {
    const updatedSessions = sessions.map((s) => (s.id === sessionId ? { ...s, starred: !s.starred } : s))
    setSessions(updatedSessions)
    localStorage.setItem("chatSessions", JSON.stringify(updatedSessions))
  }

  const exportSessions = () => {
    const dataStr = JSON.stringify(sessions, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "amorya-consultations.json"
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Leaf className="h-6 w-6 text-primary" />
              <Leaf className="h-6 w-6 text-primary -ml-3 rotate-45" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Amorya</h1>
              <p className="text-xs text-gray-500">Professional Consultations</p>
            </div>
          </div>
          <Button size="sm" onClick={onNewChat} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant={currentView === "chat" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("chat")}
            className={currentView === "chat" ? "bg-primary hover:bg-primary/90" : ""}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button
            variant={currentView === "admin" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("admin")}
            className={currentView === "admin" ? "bg-primary hover:bg-primary/90" : ""}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Admin
          </Button>
          <Button
            variant={currentView === "users" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("users")}
            className={currentView === "users" ? "bg-primary hover:bg-primary/90" : ""}
          >
            <Users className="h-4 w-4 mr-2" />
            Users
          </Button>
          <Button
            variant={currentView === "models" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("models")}
            className={currentView === "models" ? "bg-primary hover:bg-primary/90" : ""}
          >
            <Settings className="h-4 w-4 mr-2" />
            Models
          </Button>
        </div>
      </div>

      {currentView === "chat" && (
        <>
          {/* Search and Controls */}
          <div className="p-4 border-b border-primary/20 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search consultations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setShowArchived(!showArchived)} className="text-primary">
                <Archive className="h-4 w-4 mr-2" />
                {showArchived ? "Active" : "Archived"}
              </Button>
              <Button variant="ghost" size="sm" onClick={exportSessions} className="text-primary">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Sessions */}
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.map((session) => (
              <Card
                key={session.id}
                className={`m-2 p-3 cursor-pointer hover:bg-secondary/50 transition-all duration-200 border-primary/20 ${
                  currentSessionId === session.id ? "ring-2 ring-primary bg-secondary/30" : ""
                } ${session.archived ? "opacity-60" : ""}`}
                onClick={() => {
                  setCurrentSessionId(session.id)
                  onViewChange("chat")
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium truncate text-primary">{session.title}</h3>
                      {session.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                    </div>
                    {session.consultantName && (
                      <p className="text-sm text-gray-600 mb-1">with {session.consultantName}</p>
                    )}
                    <p className="text-sm text-gray-600 truncate">
                      {session.messages.length > 0
                        ? session.messages[session.messages.length - 1].content
                        : "No messages yet"}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="text-xs bg-secondary/50 text-secondary-foreground">
                        {session.messages.length} messages
                      </Badge>
                      <span className="text-xs text-gray-400">{formatTime(session.lastMessage)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        starSession(session.id)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Star
                        className={`h-3 w-3 ${session.starred ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        archiveSession(session.id)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Archive className="h-3 w-3 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSession(session.id)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredSessions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>{showArchived ? "No archived consultations" : "No consultations found"}</p>
                <p className="text-sm">Start a new consultation with an expert!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
