"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Search, UserCheck, Clock, MessageSquare, Activity, Ban, Shield, Heart } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  status: "online" | "offline" | "away"
  lastActive: Date
  totalSessions: number
  totalMessages: number
  joinDate: Date
  role: "user" | "admin" | "moderator"
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")

  useEffect(() => {
    // Simulate user data - in real app, this would come from your database
    const mockUsers: User[] = [
      {
        id: "1",
        name: "Current User",
        email: "user@amorya.com",
        status: "online",
        lastActive: new Date(),
        totalSessions: 5,
        totalMessages: 47,
        joinDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        role: "user",
      },
      {
        id: "2",
        name: "Admin User",
        email: "admin@amorya.com",
        status: "online",
        lastActive: new Date(Date.now() - 30 * 60 * 1000),
        totalSessions: 15,
        totalMessages: 234,
        joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        role: "admin",
      },
      {
        id: "3",
        name: "Jane Smith",
        email: "jane@example.com",
        status: "away",
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        totalSessions: 8,
        totalMessages: 92,
        joinDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        role: "user",
      },
    ]
    setUsers(mockUsers)
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    if (selectedTab === "all") return matchesSearch
    if (selectedTab === "online") return matchesSearch && user.status === "online"
    if (selectedTab === "admins") return matchesSearch && user.role !== "user"

    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-primary text-white"
      case "moderator":
        return "bg-secondary-600 text-white"
      case "user":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-gray-100"
    }
  }

  return (
    <div className="p-6 space-y-6 bg-white/80 backdrop-blur-sm h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Heart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">User Management</h1>
            <p className="text-gray-600">Manage users and monitor activity</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{users.length}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{users.filter((u) => u.status === "online").length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {users.reduce((sum, user) => sum + user.totalSessions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Chat sessions</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {users.reduce((sum, user) => sum + user.totalMessages, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Messages sent</p>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">Users</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 border-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="admins">Admins</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="border-primary/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-secondary text-secondary-foreground">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(user.status)}`}
                            />
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-primary">{user.name}</h3>
                              <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Last active: {user.lastActive.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-primary">{user.totalSessions}</div>
                            <div className="text-xs text-gray-500">Sessions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-primary">{user.totalMessages}</div>
                            <div className="text-xs text-gray-500">Messages</div>
                          </div>

                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-primary/20">
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="border-red-200 text-red-600">
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
