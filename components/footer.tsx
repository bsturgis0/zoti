import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col md:flex-row items-center justify-between py-4 sm:py-6 gap-4">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Zoti
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground">Educational AI Assistant</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/about" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
            About
          </Link>
          <Link
            href="/privacy"
            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy
          </Link>
          <Link href="/terms" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms
          </Link>
        </div>

        <div className="text-xs sm:text-sm text-muted-foreground">
          © {new Date().getFullYear()} Zoti. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

