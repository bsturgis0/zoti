"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught in error boundary:", error)
      setHasError(true)
      setError(error.error)
    }

    window.addEventListener("error", errorHandler)
    return () => window.removeEventListener("error", errorHandler)
  }, [])

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          We're sorry, but there was an error loading this page. Please try refreshing.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh page
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setHasError(false)
              setError(null)
            }}
          >
            Try again
          </Button>
        </div>
        {error && process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-muted rounded-md text-left overflow-auto max-w-full">
            <p className="font-mono text-xs">{error.toString()}</p>
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
}

