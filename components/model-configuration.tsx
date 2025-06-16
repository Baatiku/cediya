"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Settings, Brain, Zap, Shield, Save, RotateCcw, Heart, AlertTriangle } from "lucide-react"

interface ModelConfig {
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  moderationEnabled: boolean
  responseFiltering: boolean
  customInstructions: string
}

export function ModelConfiguration() {
  const [config, setConfig] = useState<ModelConfig>({
    model: "deepseek/deepseek-r1-0528:free",
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt:
      "You are Amorya, a helpful and romantic AI assistant. Be warm, caring, and supportive in all your interactions.",
    moderationEnabled: true,
    responseFiltering: true,
    customInstructions: "",
  })

  const [savedConfig, setSavedConfig] = useState<ModelConfig>(config)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load saved configuration
    const saved = localStorage.getItem("amoryaModelConfig")
    if (saved) {
      const parsedConfig = JSON.parse(saved)
      setConfig(parsedConfig)
      setSavedConfig(parsedConfig)
    }
  }, [])

  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== JSON.stringify(savedConfig))
  }, [config, savedConfig])

  const saveConfiguration = () => {
    localStorage.setItem("amoryaModelConfig", JSON.stringify(config))
    setSavedConfig(config)
    setHasChanges(false)
  }

  const resetConfiguration = () => {
    setConfig(savedConfig)
  }

  const availableModels = [
    {
      id: "deepseek/deepseek-r1-0528:free",
      name: "DeepSeek R1 (Free)",
      description: "Advanced reasoning model with excellent performance",
      status: "active",
    },
    {
      id: "deepseek/deepseek-chat",
      name: "DeepSeek Chat",
      description: "Optimized for conversational interactions",
      status: "available",
    },
    {
      id: "anthropic/claude-3-haiku",
      name: "Claude 3 Haiku",
      description: "Fast and efficient for quick responses",
      status: "available",
    },
  ]

  return (
    <div className="p-6 space-y-6 bg-white/80 backdrop-blur-sm h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Heart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Model Configuration</h1>
            <p className="text-gray-600">Configure AI models and behavior</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Button variant="outline" onClick={resetConfiguration} className="border-primary/20">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          <Button onClick={saveConfiguration} disabled={!hasChanges} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Brain className="h-5 w-5 mr-2" />
                Available Models
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableModels.map((model) => (
                <Card
                  key={model.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    config.model === model.id ? "ring-2 ring-primary bg-secondary/30" : "hover:bg-secondary/20"
                  }`}
                  onClick={() => setConfig({ ...config, model: model.id })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-primary">{model.name}</h3>
                          <Badge
                            variant={model.status === "active" ? "default" : "secondary"}
                            className={model.status === "active" ? "bg-primary" : ""}
                          >
                            {model.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                      </div>
                      {config.model === model.id && <div className="w-4 h-4 rounded-full bg-primary" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Zap className="h-5 w-5 mr-2" />
                Model Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature: {config.temperature}</Label>
                <Slider
                  id="temperature"
                  min={0}
                  max={2}
                  step={0.1}
                  value={[config.temperature]}
                  onValueChange={(value) => setConfig({ ...config, temperature: value[0] })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Controls randomness. Lower values make responses more focused and deterministic.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens: {config.maxTokens}</Label>
                <Slider
                  id="maxTokens"
                  min={100}
                  max={4000}
                  step={100}
                  value={[config.maxTokens]}
                  onValueChange={(value) => setConfig({ ...config, maxTokens: value[0] })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Maximum length of the AI response. Higher values allow longer responses.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Settings className="h-5 w-5 mr-2" />
                System Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={config.systemPrompt}
                  onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                  rows={4}
                  className="border-primary/20 focus:border-primary"
                  placeholder="Enter the system prompt that defines the AI's behavior..."
                />
                <p className="text-xs text-gray-500">
                  This prompt defines the AI's personality and behavior across all conversations.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customInstructions">Custom Instructions</Label>
                <Textarea
                  id="customInstructions"
                  value={config.customInstructions}
                  onChange={(e) => setConfig({ ...config, customInstructions: e.target.value })}
                  rows={3}
                  className="border-primary/20 focus:border-primary"
                  placeholder="Add any additional instructions or constraints..."
                />
                <p className="text-xs text-gray-500">
                  Additional instructions that will be appended to the system prompt.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Shield className="h-5 w-5 mr-2" />
                Content Moderation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="moderation">Enable Content Moderation</Label>
                  <p className="text-sm text-gray-500">Automatically filter inappropriate content and responses</p>
                </div>
                <Switch
                  id="moderation"
                  checked={config.moderationEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, moderationEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="filtering">Response Filtering</Label>
                  <p className="text-sm text-gray-500">Filter AI responses for potentially harmful content</p>
                </div>
                <Switch
                  id="filtering"
                  checked={config.responseFiltering}
                  onCheckedChange={(checked) => setConfig({ ...config, responseFiltering: checked })}
                />
              </div>

              {(config.moderationEnabled || config.responseFiltering) && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Moderation Active</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Content moderation is enabled. Some messages may be filtered or blocked.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
