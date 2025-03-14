import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, BookOpen, MessageSquare, ArrowRight } from "lucide-react"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <>
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Hero section */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6 space-y-6 sm:space-y-8 md:space-y-10 xl:space-y-16">
            <div className="grid gap-4 px-4 sm:px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Educational AI Assistant</div>
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  Learn with{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Zoti</span>{" "}
                  School Slides Teacher
                </h1>
                <p className="max-w-[600px] text-muted-foreground text-sm sm:text-base md:text-xl">
                  Upload your educational slides and let Zoti guide you through the content step by step, explaining
                  complex concepts and testing your understanding along the way.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="font-medium">
                    <Link href="/chat">
                      Start Learning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center mt-6 lg:mt-0">
                <div className="relative w-full max-w-md aspect-[4/3] overflow-hidden rounded-xl border bg-background shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-primary mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold">Upload Your Slides</h3>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                      PDF slides, presentations, and educational materials
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                  How Zoti Helps You Learn
                </h2>
                <p className="max-w-[900px] text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our AI-powered educational assistant makes learning from slides and presentations easier and more
                  effective.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-12 mt-8 sm:mt-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold">Step-by-Step Guidance</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Zoti breaks down complex content into manageable chunks, ensuring you understand each concept before
                  moving on.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold">Interactive Learning</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Ask questions, get clarification, and engage in a dialogue to deepen your understanding of the
                  material.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold">Knowledge Assessment</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Regular quizzes and questions help reinforce your learning and identify areas that need more
                  attention.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                  Ready to Start Learning?
                </h2>
                <p className="max-w-[600px] text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Upload your slides and let Zoti guide you through the content.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="font-medium">
                  <Link href="/chat">
                    Start Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

