"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Sparkles, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { predictEnvironmentalImpact, calculateCityMetrics, type PredictionResponse } from "@/lib/ai-prediction"

type ElementType = "house" | "factory" | "tree" | "solar" | "wind" | "waste"

interface GameElement {
  id: string
  type: ElementType
  x: number
  y: number
}

interface EnvironmentalStats {
  airQuality: number
  temperature: number
  vegetation: number
  energy: number
  atmosphere: number
}

const ELEMENT_TYPES = {
  house: {
    name: "House",
    impact: { airQuality: -2, temperature: 1, vegetation: -1, energy: -3, atmosphere: -1 },
    emoji: "🏠",
    description: "Residential building"
  },
  factory: {
    name: "Factory",
    impact: { airQuality: -8, temperature: 3, vegetation: -2, energy: -8, atmosphere: -5 },
    emoji: "🏭",
    description: "Industrial facility"
  },
  tree: {
    name: "Tree",
    impact: { airQuality: 5, temperature: -2, vegetation: 8, energy: 1, atmosphere: 4 },
    emoji: "🌳",
    description: "Natural vegetation"
  },
  solar: {
    name: "Solar Panel",
    impact: { airQuality: 3, temperature: -1, vegetation: 0, energy: 6, atmosphere: 3 },
    emoji: "☀️",
    description: "Clean energy source"
  },
  wind: {
    name: "Wind Turbine",
    impact: { airQuality: 3, temperature: 0, vegetation: 0, energy: 7, atmosphere: 3 },
    emoji: "💨",
    description: "Renewable energy"
  },
  waste: {
    name: "Waste Dump",
    impact: { airQuality: -10, temperature: 2, vegetation: -5, energy: -2, atmosphere: -6 },
    emoji: "🗑️",
    description: "Waste disposal site"
  }
}

const TERRA_INSTRUMENTS = [
  {
    name: "MODIS",
    stat: "vegetation" as const,
    description: "Monitors vegetation and green cover",
    icon: "🌿"
  },
  {
    name: "MOPITT",
    stat: "airQuality" as const,
    description: "Tracks air quality and carbon monoxide",
    icon: "🌫️"
  },
  {
    name: "CERES",
    stat: "energy" as const,
    description: "Measures energy balance",
    icon: "⚡"
  },
  {
    name: "ASTER",
    stat: "temperature" as const,
    description: "Monitors land surface heat",
    icon: "🌡️"
  },
  {
    name: "MISR",
    stat: "atmosphere" as const,
    description: "Analyzes atmospheric particles",
    icon: "☁️"
  }
]

export default function CityBuilderPage() {
  const [elements, setElements] = useState<GameElement[]>([])
  const [stats, setStats] = useState<EnvironmentalStats>({
    airQuality: 50,
    temperature: 50,
    vegetation: 50,
    energy: 50,
    atmosphere: 50
  })
  const [isDragging, setIsDragging] = useState(false)
  const [draggedType, setDraggedType] = useState<ElementType | null>(null)
  const [apiPrediction, setApiPrediction] = useState<PredictionResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  // Count elements by type
  const getElementCount = (type: ElementType) => {
    return elements.filter(el => el.type === type).length
  }

  // Check if can add more of this type
  const canAddElement = (type: ElementType) => {
    return getElementCount(type) < 10
  }

  const handleDragStart = (type: ElementType, e: React.DragEvent) => {
    if (!canAddElement(type)) {
      e.preventDefault()
      return
    }
    setIsDragging(true)
    setDraggedType(type)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggedType(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedType && canAddElement(draggedType)) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      const newElement: GameElement = {
        id: `${draggedType}-${Date.now()}-${Math.random()}`,
        type: draggedType,
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y))
      }
      setElements((prev) => [...prev, newElement])
    }
    handleDragEnd()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id))
  }

  const handlePredictWithAI = async () => {
    if (elements.length === 0) {
      alert("Please add some elements to your city first!")
      return
    }

    setApiError(null)

    try {
      const metrics = calculateCityMetrics(elements)
      const prediction = await predictEnvironmentalImpact(metrics)
      setApiPrediction(prediction)

      // Update stats based on API prediction with safe fallbacks
      // Map AQI to 0-100 scale (lower AQI is better, so invert it)
      // AQI ranges: 0-50 Good, 51-100 Moderate, 101-150 Unhealthy for Sensitive Groups, etc.
      // We'll map 0-150 AQI to 100-0 score (inverted)
      const aqi = prediction.air_quality?.air_quality_index || prediction.air_quality?.aqi || 50
      const airQualityScore = Math.max(0, Math.min(100, 100 - (aqi * 0.67))) // Maps 0-150 AQI to 100-0 score
      
      // Use the overall air quality score from the API (already 0-100)
      const atmosphereScore = prediction.scores?.air_quality_score || prediction.scores?.air_quality || 50
      
      const newStats = {
        airQuality: Math.max(0, Math.min(100, airQualityScore)),
        temperature: Math.max(0, Math.min(100, 100 - ((prediction.temperature?.uhi_intensity || 0) * 10))),
        vegetation: Math.max(0, Math.min(100, (metrics.vegetation_coverage || 0) * 100)),
        energy: Math.max(0, Math.min(100, prediction.energy?.sustainability_score || prediction.energy?.sustainability || 50)),
        atmosphere: Math.max(0, Math.min(100, atmosphereScore))
      }
      
      // Final NaN check
      Object.keys(newStats).forEach((key) => {
        const statKey = key as keyof EnvironmentalStats
        if (isNaN(newStats[statKey]) || !isFinite(newStats[statKey])) {
          newStats[statKey] = 50
        }
      })
      
      setStats(newStats)
    } catch (error) {
      console.error("Failed to fetch prediction:", error)
      setApiError("Unable to connect to prediction server")
      // Fall back to local calculation
      calculateStatsLocally()
    }
  }

  // Fallback local calculation
  const calculateStatsLocally = () => {
    const newStats = {
      airQuality: 50,
      temperature: 50,
      vegetation: 50,
      energy: 50,
      atmosphere: 50
    }

    elements.forEach((element) => {
      const impact = ELEMENT_TYPES[element.type].impact
      newStats.airQuality += impact.airQuality
      newStats.temperature += impact.temperature
      newStats.vegetation += impact.vegetation
      newStats.energy += impact.energy
      newStats.atmosphere += impact.atmosphere
    })

    // Clamp values between 0 and 100
    Object.keys(newStats).forEach((key) => {
      const statKey = key as keyof EnvironmentalStats
      newStats[statKey] = Math.max(
        0,
        Math.min(100, newStats[statKey])
      )
      // Ensure no NaN values
      if (isNaN(newStats[statKey])) {
        newStats[statKey] = 50
      }
    })

    setStats(newStats)
  }

  const handleReset = () => {
    setElements([])
    setStats({
      airQuality: 50,
      temperature: 50,
      vegetation: 50,
      energy: 50,
      atmosphere: 50
    })
    setApiPrediction(null)
    setApiError(null)
  }

  // Helper function to safely render numeric values
  const safeNumber = (value: number): number => {
    if (isNaN(value) || !isFinite(value)) {
      return 0
    }
    return Math.round(value)
  }

  const getStatColor = (value: number) => {
    const safeValue = safeNumber(value)
    if (safeValue >= 70) return "bg-green-500"
    if (safeValue >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getOverallScore = () => {
    const values = Object.values(stats).filter(v => !isNaN(v) && isFinite(v))
    const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 50
    if (average >= 70) return { label: "Excellent", color: "bg-green-500", emoji: "🌟" }
    if (average >= 50) return { label: "Good", color: "bg-blue-500", emoji: "👍" }
    if (average >= 30) return { label: "Fair", color: "bg-yellow-500", emoji: "⚠️" }
    return { label: "Poor", color: "bg-red-500", emoji: "🚨" }
  }

  const overallScore = getOverallScore()

  return (
    <main className="min-h-screen py-8 bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-3xl md:text-4xl mb-2">Terra City Builder</CardTitle>
                  <CardDescription className="text-base">
                    Build your city and analyze environmental impact with AI
                  </CardDescription>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={handlePredictWithAI}
                    size="lg"
                    className="font-bold"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Predict Using AI
                  </Button>

                  <Button onClick={handleReset} size="lg" variant="outline" className="font-bold">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Toolbox */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Building Elements</CardTitle>
                <CardDescription>Drag elements to your city</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(ELEMENT_TYPES).map(([key, value]) => {
                  const count = getElementCount(key as ElementType)
                  const isMaxed = count >= 10
                  return (
                    <div
                      key={key}
                      draggable={!isMaxed}
                      onDragStart={(e) => handleDragStart(key as ElementType, e)}
                      onDragEnd={handleDragEnd}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isMaxed
                          ? "bg-secondary/20 cursor-not-allowed opacity-50"
                          : "bg-secondary/50 hover:bg-secondary cursor-move border-transparent hover:border-primary/50 hover:scale-102 active:scale-98"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{value.emoji}</span>
                        <div className="flex-1">
                          <div className="font-medium">{value.name}</div>
                          <div className="text-xs text-muted-foreground">{value.description}</div>
                        </div>
                        <Badge variant={isMaxed ? "destructive" : "secondary"}>
                          {count}/10
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Build Area */}
          <div className="lg:col-span-6">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Your City</CardTitle>
                <CardDescription>
                  {isDragging
                    ? "Drop element here to place it"
                    : "Drag elements from the toolbox • Click to remove"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`relative w-full h-full rounded-lg border-2 border-dashed transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5 border-4"
                      : "border-border bg-gradient-to-br from-green-100/50 to-blue-100/50 dark:from-green-900/20 dark:to-blue-900/20"
                  }`}
                >
                  {elements.length === 0 && !isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="text-4xl mb-2">🏗️</div>
                        <p className="text-sm">Drag elements here to start building</p>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {elements.map((element) => (
                      <motion.button
                        key={element.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteElement(element.id)}
                        className="absolute text-4xl cursor-pointer hover:brightness-110 transition-all"
                        style={{
                          left: `${element.x}%`,
                          top: `${element.y}%`,
                          transform: "translate(-50%, -50%)"
                        }}
                        title={`Click to remove ${ELEMENT_TYPES[element.type].name}`}
                      >
                        {ELEMENT_TYPES[element.type].emoji}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Panel */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Terra Satellite Data</CardTitle>
                <CardDescription>Environmental monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {TERRA_INSTRUMENTS.map((instrument) => {
                  const value = stats[instrument.stat]
                  return (
                    <div key={instrument.name}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{instrument.icon}</span>
                          <span className="text-sm font-medium">{instrument.name}</span>
                        </div>
                        <Badge variant="secondary">{safeNumber(value)}</Badge>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${getStatColor(value)} transition-colors`}
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{instrument.description}</div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl mb-2">{overallScore.emoji}</div>
                  <Badge className={`${overallScore.color} text-lg px-4 py-2`}>{overallScore.label}</Badge>
                  <p className="text-xs text-muted-foreground mt-3">
                    Based on {elements.length} element{elements.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>

            {apiError && (
              <Card className="border-red-500/50">
                <CardHeader>
                  <CardTitle className="text-red-500">Connection Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{apiError}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
