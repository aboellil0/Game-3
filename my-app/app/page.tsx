import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Rocket, Brain, Building2 } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/earth-from-space-nasa-satellite-view-blue-planet.jpg"
            alt="Earth from space"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
              Explore Earth with NASA&apos;s Terra Satellite
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              Learn about Earth observation through an interactive quiz and build your own city while discovering how
              human activities impact our planet&apos;s climate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link href="/quiz">Start Quiz</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg bg-transparent">
                <Link href="/city-builder">Build City</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Two Ways to Learn</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Quiz Game</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Test your knowledge about Terra&apos;s mission, instruments like MODIS and ASTER, and the vital data
                  they collect about our planet.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• Learn about 5 key instruments</li>
                  <li>• Understand climate data collection</li>
                  <li>• Track your score and progress</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/quiz">Take the Quiz</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <Building2 className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">City Builder</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Build a city and see real-time environmental impacts. Use AI to predict future climate changes based
                  on your decisions.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• Place buildings, factories, and trees</li>
                  <li>• Track pollution and green space</li>
                  <li>• AI-powered climate predictions</li>
                </ul>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/city-builder">Start Building</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Terra Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Rocket className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About NASA&apos;s Terra Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Launched in 1999, Terra is NASA&apos;s flagship Earth-observing satellite. It carries five instruments
              that monitor Earth&apos;s atmosphere, land, oceans, and energy balance. Terra&apos;s data helps scientists
              understand climate change, natural disasters, and environmental trends.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
