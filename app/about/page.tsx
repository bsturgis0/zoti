import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BookOpen, FileText, MessageSquare } from "lucide-react"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <>
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Hero section */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                  About{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Zoti</span>
                </h1>
                <p className="max-w-[700px] text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Your personal AI-powered educational assistant designed to make learning from slides and presentations
                  more effective.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About content */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
              <div className="space-y-4">
                <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter">Our Mission</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  At Zoti, we believe that education should be accessible, engaging, and personalized. Our mission is to
                  leverage the power of artificial intelligence to create a learning experience that adapts to your
                  needs and helps you master complex subjects with ease.
                </p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Whether you're a student trying to understand lecture slides, a professional reviewing training
                  materials, or an educator looking for a teaching assistant, Zoti is designed to support your learning
                  journey.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter">
                  How Zoti Works
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Zoti uses advanced AI technology to analyze educational content and break it down into manageable
                  chunks. Our system is designed to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li>Guide you through content page by page</li>
                  <li>Explain complex concepts in simple terms</li>
                  <li>Answer your specific questions about the material</li>
                  <li>Test your understanding with regular assessments</li>
                  <li>Adapt to your learning pace and preferences</li>
                  <li>Provide summaries and key takeaways</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter">
                  Key Features
                </h2>
                <p className="max-w-[700px] text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover what makes Zoti an effective learning companion.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-12 mt-8 sm:mt-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-background">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold">PDF Analysis</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Upload your PDF slides and Zoti will analyze the content, extracting key information and organizing it
                  for effective learning.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-background">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold">Structured Learning</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Zoti breaks down complex topics into manageable sections, ensuring you build a solid foundation before
                  moving to advanced concepts.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-background">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold">Interactive Q&A</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Ask questions at any point in your learning journey and get clear, concise answers tailored to your
                  level of understanding.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter">
                  Experience Zoti Today
                </h2>
                <p className="max-w-[600px] text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Ready to transform how you learn from educational content?
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="font-medium">
                  <Link href="/chat">
                    Start Learning
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

