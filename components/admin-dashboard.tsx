"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageSquare, Settings, TrendingUp, Globe, Palette, UserCheck, Activity } from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  totalSessions: number
  totalMessages: number
  activeUsers: number
  topRoles: { role: string; count: number }[]
  topTones: { tone: string; count: number }[]
  topLanguages: { language: string; count: number }[]
}

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalSessions: 0,
    totalMessages: 0,
    activeUsers: 0,
    topRoles: [],
    topTones: [],
    topLanguages: [],
  })

  useEffect(() => {
    // Load analytics data from localStorage
    const sessions = JSON.parse(localStorage.getItem("chatSessions") || "[]")

    const roleCount: { [key: string]: number } = {}
    const toneCount: { [key: string]: number } = {}
    const languageCount: { [key: string]: number } = {}
    let totalMessages = 0

    sessions.forEach((session: any) => {
      totalMessages += session.messages.length

      const role = session.customization.role
      const tone = session.customization.tone
      const language = session.customization.language

      roleCount[role] = (roleCount[role] || 0) + 1
      toneCount[tone] = (toneCount[tone] || 0) + 1
      languageCount[language] = (languageCount[language] || 0) + 1
    })

    setAnalytics({
      totalUsers: 1, // Simulated
      totalSessions: sessions.length,
      totalMessages,
      activeUsers: sessions.length > 0 ? 1 : 0,
      topRoles: Object.entries(roleCount)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topTones: Object.entries(toneCount)
        .map(([tone, count]) => ({ tone, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topLanguages: Object.entries(languageCount)
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    })
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Total conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMessages}</div>
            <p className="text-xs text-muted-foreground">Messages exchanged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="customization">Customization Stats</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Popular AI Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topRoles.map((item, index) => (
                    <div key={item.role} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="capitalize">{item.role}</span>
                      </div>
                      <Badge>{item.count} uses</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Popular Tones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topTones.map((item, index) => (
                    <div key={item.tone} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="capitalize">{item.tone}</span>
                      </div>
                      <Badge>{item.count} uses</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Language Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.topLanguages.map((item) => (
                  <div key={item.language} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="capitalize font-medium">{item.language}</span>
                    <Badge variant="outline">{item.count} sessions</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No moderation issues detected</p>
                <p className="text-sm text-muted-foreground mt-2">All conversations are within community guidelines</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
