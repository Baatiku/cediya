"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Square, Play, Pause, Trash2, Send, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onVoiceMessage: (audioBlob: Blob, duration: number, waveform: number[]) => void
  onClose: () => void
  isOpen: boolean
}

export function VoiceRecorder({ onVoiceMessage, onClose, isOpen }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [waveform, setWaveform] = useState<number[]>([])
  const [volume, setVolume] = useState(0)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  useEffect(() => {
    if (isOpen) {
      checkMicrophonePermission()
    }
    return () => {
      cleanup()
    }
  }, [isOpen])

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRecording, isPaused])

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setHasPermission(true)
      stream.getTracks().forEach((track) => track.stop())
    } catch (error) {
      console.error("Microphone permission denied:", error)
      setHasPermission(false)
    }
  }

  const setupAudioAnalysis = (stream: MediaStream) => {
    audioContextRef.current = new AudioContext()
    analyserRef.current = audioContextRef.current.createAnalyser()
    const source = audioContextRef.current.createMediaStreamSource(stream)
    source.connect(analyserRef.current)

    analyserRef.current.fftSize = 256
    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateWaveform = () => {
      if (analyserRef.current && isRecording && !isPaused) {
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
        setVolume(average)

        // Create waveform data
        const waveformData = Array.from(dataArray.slice(0, 32)).map((value) => (value / 255) * 100)
        setWaveform((prev) => [...prev.slice(-50), ...waveformData].slice(-100))

        animationRef.current = requestAnimationFrame(updateWaveform)
      }
    }

    updateWaveform()
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream
      setupAudioAnalysis(stream)

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm;codecs=opus" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setWaveform([])
    } catch (error) {
      console.error("Error starting recording:", error)
      setHasPermission(false)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    setAudioUrl("")
    setRecordingTime(0)
    setWaveform([])
    setVolume(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  const sendVoiceMessage = () => {
    if (audioBlob) {
      onVoiceMessage(audioBlob, recordingTime, waveform)
      deleteRecording()
      onClose()
    }
  }

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!isOpen) return null

  if (hasPermission === false) {
    return (
      <Card className="p-6 m-4 border-primary/20 bg-white/90 backdrop-blur-sm">
        <div className="text-center space-y-4">
          <MicOff className="h-12 w-12 mx-auto text-red-500" />
          <div>
            <h3 className="font-semibold text-primary">Microphone Access Required</h3>
            <p className="text-sm text-gray-600 mt-2">
              Please allow microphone access to record voice messages. Check your browser settings and try again.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={checkMicrophonePermission} className="bg-primary hover:bg-primary/90">
              Try Again
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 m-4 border-primary/20 bg-white/90 backdrop-blur-sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="font-semibold text-primary">Voice Message</h3>
          <p className="text-sm text-gray-600">Record and send a voice message</p>
        </div>

        {/* Waveform Visualization */}
        <div className="h-20 flex items-end justify-center space-x-1 bg-secondary/20 rounded-lg p-4">
          {waveform.length > 0 ? (
            waveform.slice(-20).map((height, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 bg-primary rounded-full transition-all duration-150",
                  isRecording && !isPaused ? "animate-pulse" : "",
                )}
                style={{
                  height: `${Math.max(height * 0.8, 4)}px`,
                  opacity: isRecording && !isPaused ? 0.8 + (volume / 255) * 0.2 : 0.6,
                }}
              />
            ))
          ) : (
            <div className="text-gray-400 text-sm">
              {isRecording ? "Recording..." : audioBlob ? "Recording complete" : "Ready to record"}
            </div>
          )}
        </div>

        {/* Recording Time */}
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-primary">{formatTime(recordingTime)}</div>
          {isRecording && (
            <div className="flex items-center justify-center space-x-2 mt-2">
              <div className={cn("w-2 h-2 rounded-full bg-red-500", isPaused ? "" : "animate-pulse")} />
              <span className="text-sm text-gray-600">{isPaused ? "Paused" : "Recording"}</span>
            </div>
          )}
        </div>

        {/* Volume Indicator */}
        {isRecording && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Volume</span>
              <Volume2 className="h-4 w-4" />
            </div>
            <Progress value={(volume / 255) * 100} className="h-2" />
          </div>
        )}

        {/* Audio Playback */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setRecordingTime(Math.floor(audioRef.current.duration))
              }
            }}
          />
        )}

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full h-16 w-16"
            >
              <Mic className="h-6 w-6" />
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                onClick={pauseRecording}
                variant="outline"
                size="lg"
                className="rounded-full h-12 w-12 border-primary/20"
              >
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </Button>
              <Button onClick={stopRecording} size="lg" className="bg-red-500 hover:bg-red-600 rounded-full h-16 w-16">
                <Square className="h-6 w-6" />
              </Button>
            </>
          )}

          {audioBlob && !isRecording && (
            <>
              <Button
                onClick={playRecording}
                variant="outline"
                size="lg"
                className="rounded-full h-12 w-12 border-primary/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                onClick={deleteRecording}
                variant="outline"
                size="lg"
                className="rounded-full h-12 w-12 border-red-200 text-red-600"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              <Button
                onClick={sendVoiceMessage}
                size="lg"
                className="bg-primary hover:bg-primary/90 rounded-full h-16 w-16"
              >
                <Send className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
}
