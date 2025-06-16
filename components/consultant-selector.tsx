"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Star, Clock, MessageSquare, Filter, Leaf } from "lucide-react"
import { consultants, type Consultant } from "@/lib/consultants"
import { cn } from "@/lib/utils"

interface ConsultantSelectorProps {
  onSelectConsultant: (consultant: Consultant) => void
  onClose: () => void
}

export function ConsultantSelector({ onSelectConsultant, onClose }: ConsultantSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    "all",
    "medical",
    "technology",
    "business",
    "education",
    "wellness",
    "creative",
    "legal",
    "engineering",
  ]

  const filteredConsultants = consultants.filter((consultant) => {
    const matchesSearch =
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.specialization.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" ||
      consultant.profession.toLowerCase().includes(selectedCategory) ||
      consultant.specialization.toLowerCase().includes(selectedCategory)

    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "away":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Available now"
      case "busy":
        return "Busy"
      case "away":
        return "Away"
      default:
        return "Offline"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col border-primary/20">
        <div className="p-6 border-b border-primary/20 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Leaf className="h-6 w-6 text-primary" />
                <Leaf className="h-6 w-6 text-primary -ml-3 rotate-45" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">Choose Your Expert</h2>
                <p className="text-gray-600">Connect with professional consultants from around the world</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-primary hover:bg-primary/10">
              ✕
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, profession, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-primary/20 focus:border-primary"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="border-primary/20">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "capitalize",
                      selectedCategory === category
                        ? "bg-primary hover:bg-primary/90"
                        : "border-primary/20 hover:bg-primary/10",
                    )}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Consultants Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-secondary/20 to-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConsultants.map((consultant) => (
              <Card
                key={consultant.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-primary/20 hover:border-primary/40 bg-white/80 backdrop-blur-sm"
                onClick={() => onSelectConsultant(consultant)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-white font-semibold">
                              {consultant.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                              getStatusColor(consultant.status),
                            )}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary">{consultant.name}</h3>
                          <p className="text-sm text-gray-600">{consultant.profession}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{consultant.rating}</span>
                      </div>
                    </div>

                    {/* Specialization */}
                    <div>
                      <p className="text-sm font-medium text-gray-700">{consultant.specialization}</p>
                      <p className="text-xs text-gray-500 mt-1">{consultant.location}</p>
                    </div>

                    {/* Languages */}
                    <div className="flex flex-wrap gap-1">
                      {consultant.languages.slice(0, 3).map((language) => (
                        <Badge key={language} variant="secondary" className="text-xs bg-secondary/50">
                          {language}
                        </Badge>
                      ))}
                      {consultant.languages.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-secondary/50">
                          +{consultant.languages.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{consultant.consultations.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{consultant.experience}</span>
                      </div>
                    </div>

                    {/* Status and Rate */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(consultant.status))} />
                        <span className="text-sm text-gray-600">{getStatusText(consultant.status)}</span>
                      </div>
                      <span className="text-sm font-medium text-primary">{consultant.hourlyRate}</span>
                    </div>

                    {/* Response Time */}
                    <p className="text-xs text-gray-500">{consultant.responseTime}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredConsultants.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No consultants found matching your criteria</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
