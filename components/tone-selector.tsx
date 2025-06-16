"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface ToneSelectorProps {
  currentTone: string
  onToneChange: (tone: string) => void
  onClose: () => void
}

const tones = [
  {
    id: "professional",
    name: "Professional",
    description: "Formal, structured, and business-focused communication",
    example: "I would recommend conducting a thorough analysis...",
  },
  {
    id: "friendly",
    name: "Friendly",
    description: "Warm, approachable, and conversational tone",
    example: "I'd love to help you with this! Let me share some thoughts...",
  },
  {
    id: "empathetic",
    name: "Empathetic",
    description: "Understanding, supportive, and emotionally aware",
    example: "I understand this can be challenging. Let's work through this together...",
  },
  {
    id: "direct",
    name: "Direct",
    description: "Straightforward, concise, and to-the-point",
    example: "Here's what you need to do: First, analyze the data...",
  },
  {
    id: "encouraging",
    name: "Encouraging",
    description: "Motivational, positive, and confidence-building",
    example: "You're on the right track! This approach will definitely work...",
  },
  {
    id: "detailed",
    name: "Detailed",
    description: "Comprehensive, thorough, and explanatory",
    example: "Let me break this down step by step with full explanations...",
  },
]

export function ToneSelector({ currentTone, onToneChange, onClose }: ToneSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto border-primary/20">
        <CardHeader className="border-b border-primary/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">Choose Communication Style</CardTitle>
            <Button variant="ghost" onClick={onClose} className="text-primary hover:bg-primary/10">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tones.map((tone) => (
              <Card
                key={tone.id}
                className={`cursor-pointer transition-all duration-200 ${
                  currentTone === tone.id
                    ? "ring-2 ring-primary bg-primary/5 border-primary"
                    : "hover:bg-secondary/20 border-primary/20"
                }`}
                onClick={() => onToneChange(tone.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-primary">{tone.name}</h3>
                      {currentTone === tone.id && <Badge className="bg-primary text-white">Selected</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{tone.description}</p>
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Example:</p>
                      <p className="text-sm italic text-gray-700">"{tone.example}"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
              Apply Selection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
