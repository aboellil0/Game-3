import * as tf from "@tensorflow/tfjs"
import Papa from "papaparse"

interface TemperatureData {
  dt: string
  AverageTemperature: number
  City: string
}

export async function trainAndPredict(pollutionOffset = 0): Promise<string> {
  try {
    // Use a public dataset URL for temperature data
    const csvUrl = "https://raw.githubusercontent.com/datasets/global-temp/master/data/annual.csv"

    const response = await fetch(csvUrl)
    const csvText = await response.text()

    const parsedData = Papa.parse<{ Year: string; Mean: string }>(csvText, {
      header: true,
      dynamicTyping: true,
    }).data

    // Filter and prepare data
    const years: number[] = []
    const temps: number[] = []

    parsedData.forEach((row) => {
      if (row.Year && row.Mean && !isNaN(Number(row.Year)) && !isNaN(Number(row.Mean))) {
        const year = Number(row.Year)
        const temp = Number(row.Mean)
        if (year >= 1950 && year <= 2020) {
          // Focus on recent data
          years.push(year)
          temps.push(temp)
        }
      }
    })

    if (years.length === 0) {
      throw new Error("No valid data found")
    }

    // Create tensors
    const X = tf.tensor2d(years, [years.length, 1])
    const y = tf.tensor2d(temps, [temps.length, 1])

    // Split into training data (80%)
    const trainSize = Math.floor(years.length * 0.8)
    const X_train = X.slice([0, 0], [trainSize, 1])
    const y_train = y.slice([0, 0], [trainSize, 1])

    // Create and compile model
    const model = tf.sequential()
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }))
    model.compile({ optimizer: "sgd", loss: "meanSquaredError" })

    // Train model
    await model.fit(X_train, y_train, {
      epochs: 100,
      verbose: 0,
    })

    // Make prediction for 2030 adjusted by pollution
    const futureYear = tf.tensor2d([[2030 + pollutionOffset]])
    const prediction = model.predict(futureYear) as tf.Tensor
    const predictedTemp = (await prediction.data())[0]

    // Cleanup tensors
    X.dispose()
    y.dispose()
    X_train.dispose()
    y_train.dispose()
    futureYear.dispose()
    prediction.dispose()
    model.dispose()

    return predictedTemp.toFixed(2)
  } catch (error) {
    console.error("AI prediction error:", error)
    throw error
  }
}
