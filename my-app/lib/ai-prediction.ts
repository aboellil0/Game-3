import * as tf from "@tensorflow/tfjs"
import Papa from "papaparse"

// API configuration
const API_BASE_URL = "http://10.20.164.134:5000"

export interface CityMetrics {
  concrete_coverage: number
  vegetation_coverage: number
  water_coverage: number
  building_density: number
  industrial_buildings: number
  tree_coverage: number
  solar_panel_coverage: number
  wind_turbine_density: number
  residential_buildings: number
  traffic_density: number
  latitude: number
  longitude: number
  hour_of_day: number
}

export interface PredictionResponse {
  temperature: {
    predicted: number
    uhi_intensity: number
    base: number
    factors: Record<string, number>
  }
  air_quality: {
    aqi: number
    category: string
    sinks: Record<string, number>
    sources: Record<string, number>
    recommendations: string[]
  }
  energy: {
    balance: number
    production: {
      solar: number
      wind: number
      total: number
    }
    consumption: number
    sustainability: number
  }
  scores: {
    overall: number
    temperature: number
    air_quality: number
    energy: number
  }
  data_sources: string[]
  status: string
  improvement_suggestions: string[]
}

export async function predictEnvironmentalImpact(metrics: CityMetrics): Promise<PredictionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metrics),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Environmental prediction error:", error)
    throw error
  }
}

// Helper function to calculate city metrics from game elements
export function calculateCityMetrics(
  elements: Array<{ type: string }>,
  latitude: number = 30.0444, // Cairo, Egypt default
  longitude: number = 31.2357
): CityMetrics {
  const totalElements = Math.max(elements.length, 1) // Avoid division by zero

  const counts = {
    house: 0,
    factory: 0,
    tree: 0,
    solar: 0,
    wind: 0,
    waste: 0,
  }

  elements.forEach((el) => {
    if (el.type in counts) {
      counts[el.type as keyof typeof counts]++
    }
  })

  // Calculate coverage/density values (0-1 range)
  // Assuming a grid can hold max 100 elements for normalization
  const maxElements = 100

  const residential_buildings = Math.min(counts.house / maxElements, 1)
  const industrial_buildings = Math.min(counts.factory / maxElements, 1)
  const tree_coverage = Math.min(counts.tree / maxElements, 1)
  const solar_panel_coverage = Math.min(counts.solar / maxElements, 1)
  const wind_turbine_density = Math.min(counts.wind / maxElements, 1)
  const waste_density = Math.min(counts.waste / maxElements, 1)

  // Calculate derived metrics
  const building_density = residential_buildings + industrial_buildings
  const concrete_coverage = building_density + waste_density * 0.5
  const vegetation_coverage = tree_coverage * 0.8 // Trees contribute to vegetation
  const water_coverage = 0.1 // Default small water coverage
  const traffic_density = (residential_buildings + industrial_buildings) * 0.3 // Traffic correlates with buildings

  // Get current hour
  const hour_of_day = new Date().getHours()

  return {
    concrete_coverage: Math.min(concrete_coverage, 1),
    vegetation_coverage: Math.min(vegetation_coverage, 1),
    water_coverage,
    building_density: Math.min(building_density, 1),
    industrial_buildings,
    tree_coverage,
    solar_panel_coverage,
    wind_turbine_density,
    residential_buildings,
    traffic_density: Math.min(traffic_density, 1),
    latitude,
    longitude,
    hour_of_day,
  }
}

// Legacy function for backward compatibility
export async function trainAndPredict(pollutionOffset = 0): Promise<string> {
  // This is now a simplified wrapper
  const defaultMetrics: CityMetrics = {
    concrete_coverage: 0.3 + pollutionOffset * 0.1,
    vegetation_coverage: 0.4 - pollutionOffset * 0.1,
    water_coverage: 0.1,
    building_density: 0.5,
    industrial_buildings: 0.2,
    tree_coverage: 0.25,
    solar_panel_coverage: 0.15,
    wind_turbine_density: 0.05,
    residential_buildings: 0.3,
    traffic_density: 0.1,
    latitude: 30.0444,
    longitude: 31.2357,
    hour_of_day: 14,
  }

  try {
    const result = await predictEnvironmentalImpact(defaultMetrics)
    return result.temperature.predicted.toFixed(2)
  } catch (error) {
    console.error("Prediction error:", error)
    return "N/A"
  }
}
