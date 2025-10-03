"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const questions: Question[] = [
  {
    id: 1,
    question: "Which instrument on Terra measures air pollution and carbon monoxide levels?",
    options: ["MODIS", "MOPITT", "ASTER", "CERES"],
    correctAnswer: 1,
    explanation:
      "MOPITT (Measurements of Pollution in the Troposphere) specifically measures carbon monoxide and methane in the atmosphere.",
  },
  {
    id: 2,
    question: "What does MODIS stand for?",
    options: [
      "Moderate Resolution Imaging Spectroradiometer",
      "Modern Digital Imaging System",
      "Multi-Orbital Data Integration Sensor",
      "Meteorological Observation and Detection Instrument",
    ],
    correctAnswer: 0,
    explanation:
      "MODIS (Moderate Resolution Imaging Spectroradiometer) captures data in 36 spectral bands to monitor Earth's surface and atmosphere.",
  },
  {
    id: 3,
    question: "Which Terra instrument measures Earth's radiation budget?",
    options: ["MISR", "ASTER", "CERES", "MODIS"],
    correctAnswer: 2,
    explanation:
      "CERES (Clouds and the Earth's Radiant Energy System) measures the energy balance between incoming solar radiation and outgoing thermal radiation.",
  },
  {
    id: 4,
    question: "What year was the Terra satellite launched?",
    options: ["1997", "1999", "2001", "2003"],
    correctAnswer: 1,
    explanation: "Terra was launched on December 18, 1999, as NASA's flagship Earth Observing System (EOS) satellite.",
  },
  {
    id: 5,
    question: "ASTER provides high-resolution images for which purpose?",
    options: [
      "Weather forecasting only",
      "Mapping and monitoring land surface changes",
      "Ocean temperature measurement",
      "Atmospheric pressure tracking",
    ],
    correctAnswer: 1,
    explanation:
      "ASTER (Advanced Spaceborne Thermal Emission and Reflection Radiometer) creates detailed maps of land surface temperature, elevation, and reflectance.",
  },
  {
    id: 6,
    question: "How many cameras does MISR use to view Earth from different angles?",
    options: ["3", "5", "9", "12"],
    correctAnswer: 2,
    explanation:
      "MISR (Multi-angle Imaging SpectroRadiometer) uses 9 cameras at different angles to study clouds, aerosols, and land surface properties.",
  },
  {
    id: 7,
    question: "What type of data does Terra primarily collect?",
    options: [
      "Only ocean temperatures",
      "Atmosphere, land, oceans, and energy balance",
      "Only weather patterns",
      "Only vegetation growth",
    ],
    correctAnswer: 1,
    explanation:
      "Terra's five instruments work together to collect comprehensive data about Earth's atmosphere, land surfaces, oceans, and energy balance.",
  },
  {
    id: 8,
    question: "Which Terra instrument is best for studying vegetation health?",
    options: ["CERES", "MOPITT", "MODIS", "MISR"],
    correctAnswer: 2,
    explanation:
      "MODIS measures vegetation indices and chlorophyll fluorescence, making it ideal for monitoring plant health and photosynthesis.",
  },
]

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    setShowFeedback(true)
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setQuizComplete(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setScore(0)
    setQuizComplete(false)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <main className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-4xl mb-4">Quiz Complete!</CardTitle>
                <CardDescription className="text-xl">
                  You scored {score} out of {questions.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-4">{percentage}%</div>
                  <p className="text-lg text-muted-foreground">
                    {percentage >= 80
                      ? "Excellent! You're a Terra expert!"
                      : percentage >= 60
                        ? "Great job! You know your Terra facts!"
                        : "Good effort! Try again to learn more!"}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={handleRestart} size="lg" className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </Button>
                  <Button asChild size="lg" variant="outline" className="w-full bg-transparent">
                    <Link href="/city-builder">
                      Continue to City Builder
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="w-full">
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    )
  }

  const question = questions[currentQuestion]
  const isCorrect = selectedAnswer === question.correctAnswer

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium">
              Score: {score}/{questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl leading-relaxed">{question.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index
                    const isCorrectAnswer = index === question.correctAnswer
                    const showCorrect = showFeedback && isCorrectAnswer
                    const showIncorrect = showFeedback && isSelected && !isCorrect

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showFeedback}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          showCorrect
                            ? "border-green-500 bg-green-500/10"
                            : showIncorrect
                              ? "border-red-500 bg-red-500/10"
                              : isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                        } ${showFeedback ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base">{option}</span>
                          {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                          {showIncorrect && <XCircle className="w-5 h-5 text-red-500" />}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold mb-1">{isCorrect ? "Correct!" : "Incorrect"}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-4">
                  {!showFeedback ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      size="lg"
                      className="w-full"
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button onClick={handleNextQuestion} size="lg" className="w-full">
                      {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
