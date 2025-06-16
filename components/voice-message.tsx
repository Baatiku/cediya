"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Volume2, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceMessageProps {
  audioUrl: string
  duration: number
  waveform: number[]
  timestamp: Date
  isOwn?: boolean
  onDownload?: () => void
}

export function VoiceMessage({
  audioUrl,
  duration,
  waveform,
  timestamp,
  isOwn = false,
  onDownload,
}: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    const handleLoadedData = () => setIsLoaded(true)
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener("loadeddata", handleLoadedData)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
      audio.pause()
    }
  }, [audioUrl])

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && isLoaded) {
      const rect = event.currentTarget.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const percentage = clickX / rect.width
      const newTime = percentage * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Card
      className={cn(
        "p-4 max-w-sm transition-all duration-200",
        isOwn ? "bg-primary text-white ml-auto" : "bg-white border-primary/20",
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className={cn("h-4 w-4", isOwn ? "text-white" : "text-primary")} />
            <span className={cn("text-sm font-medium", isOwn ? "text-white" : "text-primary")}>Voice Message</span>
          </div>
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className={cn("h-6 w-6 p-0", isOwn ? "text-white hover:bg-white/20" : "text-primary hover:bg-primary/10")}
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Waveform Visualization */}
        <div
          className="h-12 flex items-end justify-center space-x-1 cursor-pointer rounded-lg p-2 hover:bg-black/5 transition-colors"
          onClick={handleSeek}
        >
          {waveform.length > 0 ? (
            waveform.slice(0, 30).map((height, index) => {
              const isActive = progress > 0 && (index / 30) * 100 <= progress
              return (
                <div
                  key={index}
                  className={cn(
                    "w-1 rounded-full transition-all duration-150",
                    isOwn ? (isActive ? "bg-white" : "bg-white/40") : isActive ? "bg-primary" : "bg-primary/40",
                  )}
                  style={{
                    height: `${Math.max(height * 0.6, 3)}px`,
                  }}
                />
              )
            })
          ) : (
            <div className="flex space-x-1">
              {Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className={cn("w-1 h-3 rounded-full", isOwn ? "bg-white/40" : "bg-primary/40")} />
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <Button
            onClick={togglePlayback}
            disabled={!isLoaded}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 rounded-full",
              isOwn
                ? "text-white hover:bg-white/20 disabled:text-white/50"
                : "text-primary hover:bg-primary/10 disabled:text-primary/50",
            )}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="flex-1 mx-3">
            <Progress
              value={progress}
              className={cn("h-1", isOwn ? "[&>div]:bg-white [&]:bg-white/30" : "[&>div]:bg-primary [&]:bg-primary/20")}
            />
          </div>

          <div className={cn("text-xs font-mono", isOwn ? "text-white/80" : "text-gray-500")}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Timestamp */}
        <div className={cn("text-xs text-right", isOwn ? "text-white/60" : "text-gray-400")}>
          {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </Card>
  )
}
