"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, Clock, MessageSquare, Award, BookOpen, Globe, DollarSign, X, Leaf } from "lucide-react"
import type { Consultant } from "@/lib/consultants"
import { cn } from "@/lib/utils"

interface ConsultantProfileProps {
  consultant: Consultant
  onStartChat: () => void
  onClose: () => void
}

export function ConsultantProfile({ consultant, onStartChat, onClose }: ConsultantProfileProps) {
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
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/20 border-b border-primary/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                    {consultant.avatar}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white",
                    getStatusColor(consultant.status),
                  )}
                />
              </div>
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl font-bold text-primary">{consultant.name}</h1>
                  <p className="text-lg text-gray-700">{consultant.profession}</p>
                  <p className="text-gray-600">{consultant.specialization}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{consultant.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{consultant.experience} experience</span>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-primary hover:bg-primary/10">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Status and Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className={cn("w-3 h-3 rounded-full", getStatusColor(consultant.status))} />
                  <span className="font-medium">{getStatusText(consultant.status)}</span>
                </div>
                <p className="text-xs text-gray-500">{consultant.responseTime}</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-bold text-lg">{consultant.rating}</span>
                </div>
                <p className="text-xs text-gray-500">Rating</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-bold text-lg">{consultant.consultations.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">Consultations</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-lg">
                    {consultant.hourlyRate.replace("$", "").replace("/hour", "")}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Per hour</p>
              </CardContent>
            </Card>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">About</h3>
            <p className="text-gray-700 leading-relaxed">{consultant.bio}</p>
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {consultant.languages.map((language) => (
                <Badge key={language} variant="secondary" className="bg-secondary/50 text-secondary-foreground">
                  {language}
                </Badge>
              ))}
            </div>
          </div>

          {/* Expertise */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {consultant.expertise.map((skill) => (
                <Badge key={skill} variant="outline" className="border-primary/20">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Education
            </h3>
            <p className="text-gray-700">{consultant.education}</p>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Key Achievements
            </h3>
            <ul className="space-y-2">
              {consultant.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cultural Background */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">Cultural Background</h3>
            <p className="text-gray-700">{consultant.culturalBackground}</p>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">Working Hours</h3>
            <p className="text-gray-700">{consultant.workingHours}</p>
          </div>

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Leaf className="h-5 w-5 text-primary" />
                <Leaf className="h-5 w-5 text-primary -ml-2 rotate-45" />
              </div>
              <span className="text-sm text-gray-600">Amorya Professional Network</span>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="border-primary/20">
                Close Profile
              </Button>
              <Button
                onClick={onStartChat}
                className="bg-primary hover:bg-primary/90"
                disabled={consultant.status === "away"}
              >
                Start Consultation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
