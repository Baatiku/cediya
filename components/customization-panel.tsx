"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface CustomizationPanelProps {
  customization: {
    role: string
    tone: string
    language: string
  }
  onUpdate: (customization: any) => void
  onClose: () => void
}

const ROLES = [
  { id: "teacher", name: "Teacher", description: "Educational and patient" },
  { id: "poet", name: "Poet", description: "Creative and artistic" },
  { id: "doctor", name: "Doctor", description: "Medical knowledge" },
  { id: "mentor", name: "Mentor", description: "Wise guidance" },
  { id: "friend", name: "Friend", description: "Casual and supportive" },
  { id: "historian", name: "Historian", description: "Historical insights" },
  { id: "scientist", name: "Scientist", description: "Analytical thinking" },
  { id: "chef", name: "Chef", description: "Culinary expertise" },
  { id: "therapist", name: "Therapist", description: "Emotional support" },
  { id: "comedian", name: "Comedian", description: "Humorous responses" },
]

const TONES = [
  { id: "formal", name: "Formal", description: "Professional and structured" },
  { id: "empathetic", name: "Empathetic", description: "Warm and understanding" },
  { id: "casual", name: "Casual", description: "Relaxed and informal" },
  { id: "humorous", name: "Humorous", description: "Witty and playful" },
  { id: "poetic", name: "Poetic", description: "Artistic and expressive" },
]

const LANGUAGES = [
  { id: "english", name: "English", flag: "🇺🇸" },
  { id: "arabic", name: "Arabic", flag: "🇸🇦" },
  { id: "french", name: "French", flag: "🇫🇷" },
  { id: "yoruba", name: "Yoruba", flag: "🇳🇬" },
  { id: "hausa", name: "Hausa", flag: "🇳🇬" },
]

export function CustomizationPanel({ customization, onUpdate, onClose }: CustomizationPanelProps) {
  const [localCustomization, setLocalCustomization] = useState(customization)

  const handleUpdate = (key: string, value: string) => {
    const updated = { ...localCustomization, [key]: value }
    setLocalCustomization(updated)
    onUpdate(updated)
  }

  return (
    <Card className="m-4 border-2 border-blue-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Customize AI Assistant</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Roles */}
        <div>
          <h3 className="font-semibold mb-3">AI Role</h3>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((role) => (
              <Button
                key={role.id}
                variant={localCustomization.role === role.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleUpdate("role", role.id)}
                className="justify-start h-auto p-3"
              >
                <div className="text-left">
                  <div className="font-medium">{role.name}</div>
                  <div className="text-xs opacity-70">{role.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Tones */}
        <div>
          <h3 className="font-semibold mb-3">Conversation Tone</h3>
          <div className="grid grid-cols-1 gap-2">
            {TONES.map((tone) => (
              <Button
                key={tone.id}
                variant={localCustomization.tone === tone.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleUpdate("tone", tone.id)}
                className="justify-start h-auto p-3"
              >
                <div className="text-left">
                  <div className="font-medium">{tone.name}</div>
                  <div className="text-xs opacity-70">{tone.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <h3 className="font-semibold mb-3">Language</h3>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((language) => (
              <Button
                key={language.id}
                variant={localCustomization.language === language.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleUpdate("language", language.id)}
                className="justify-start"
              >
                <span className="mr-2">{language.flag}</span>
                {language.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Settings */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Current Settings</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Role: {ROLES.find((r) => r.id === localCustomization.role)?.name}</Badge>
            <Badge variant="secondary">Tone: {TONES.find((t) => t.id === localCustomization.tone)?.name}</Badge>
            <Badge variant="secondary">
              Language: {LANGUAGES.find((l) => l.id === localCustomization.language)?.name}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
