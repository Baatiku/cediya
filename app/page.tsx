"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { Sidebar } from "@/components/sidebar"
import { AdminDashboard } from "@/components/admin-dashboard"
import { UserManagement } from "@/components/user-management"
import { ModelConfiguration } from "@/components/model-configuration"
import { ConsultantSelector } from "@/components/consultant-selector"
import { ConsultantProfile } from "@/components/consultant-profile"
import { Button } from "@/components/ui/button"
import { Settings, MessageSquare, Leaf } from "lucide-react"
import type { Consultant } from "@/lib/consultants"

export default function Home() {
  const [currentView, setCurrentView] = useState<"chat" | "admin" | "users" | "models">("chat")
  const [isMobile, setIsMobile] = useState(false)
  const [showConsultantSelector, setShowConsultantSelector] = useState(false)
  const [showConsultantProfile, setShowConsultantProfile] = useState(false)
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [hasActiveSessions, setHasActiveSessions] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    // Check if there are any existing chat sessions
    const savedSessions = localStorage.getItem("chatSessions")
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions)
      setHasActiveSessions(sessions.length > 0)
    }
  }, [])

  const handleSelectConsultant = (consultant: Consultant) => {
    setSelectedConsultant(consultant)
    setShowConsultantSelector(false)
    setShowConsultantProfile(true)
  }

  const handleStartChat = () => {
    setShowConsultantProfile(false)
    setCurrentView("chat")
    // The chat interface will handle creating a new session with the selected consultant
  }

  const handleNewChat = () => {
    setShowConsultantSelector(true)
  }

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col romantic-gradient">
        {currentView === "chat" ? (
          <>
            <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-primary/20">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Leaf className="h-6 w-6 text-primary" />
                  <Leaf className="h-6 w-6 text-primary -ml-3 rotate-45" />
                </div>
                <h1 className="text-xl font-bold text-primary">Amorya</h1>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCurrentView("admin")}>
                <Settings className="h-5 w-5 text-primary" />
              </Button>
            </div>
            <ChatInterface isMobile={true} selectedConsultant={selectedConsultant} onNewChat={handleNewChat} />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-primary/20">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView("chat")}>
                <MessageSquare className="h-5 w-5 text-primary" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Leaf className="h-6 w-6 text-primary" />
                  <Leaf className="h-6 w-6 text-primary -ml-3 rotate-45" />
                </div>
                <h1 className="text-xl font-bold text-primary">Amorya Admin</h1>
              </div>
              <div className="w-10" />
            </div>
            {currentView === "admin" && <AdminDashboard />}
            {currentView === "users" && <UserManagement />}
            {currentView === "models" && <ModelConfiguration />}
          </>
        )}

        {/* Modals */}
        {showConsultantSelector && (
          <ConsultantSelector
            onSelectConsultant={handleSelectConsultant}
            onClose={() => setShowConsultantSelector(false)}
          />
        )}

        {showConsultantProfile && selectedConsultant && (
          <ConsultantProfile
            consultant={selectedConsultant}
            onStartChat={handleStartChat}
            onClose={() => setShowConsultantProfile(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="h-screen flex romantic-gradient">
      <div className="w-80 border-r border-primary/20 bg-white/80 backdrop-blur-sm">
        <Sidebar onViewChange={setCurrentView} currentView={currentView} onNewChat={handleNewChat} />
      </div>
      <div className="flex-1">
        {currentView === "chat" && (
          <ChatInterface isMobile={false} selectedConsultant={selectedConsultant} onNewChat={handleNewChat} />
        )}
        {currentView === "admin" && <AdminDashboard />}
        {currentView === "users" && <UserManagement />}
        {currentView === "models" && <ModelConfiguration />}
      </div>

      {/* Modals */}
      {showConsultantSelector && (
        <ConsultantSelector
          onSelectConsultant={handleSelectConsultant}
          onClose={() => setShowConsultantSelector(false)}
        />
      )}

      {showConsultantProfile && selectedConsultant && (
        <ConsultantProfile
          consultant={selectedConsultant}
          onStartChat={handleStartChat}
          onClose={() => setShowConsultantProfile(false)}
        />
      )}
    </div>
  )
}
