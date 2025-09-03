"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter, SheetClose, SheetDescription } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-accent/10 rounded-lg">
              <Image src="/images/codepvg-logo.png" alt="CodePVG Logo" width={32} height={32} className="w-8 h-8" />
            </div>
            <span className="font-heading text-xl font-bold">CodePVG</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-accent transition-colors font-medium">
              Home
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-accent transition-colors font-medium">
              What is CodePVG
            </Link>
            <Link href="/team" className="text-muted-foreground hover:text-accent transition-colors font-medium">
              Team
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-accent transition-colors font-medium">
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                Get Started
              </Button>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden h-10 w-10 p-0 rounded-lg"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="p-4">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>Quick links</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-1 mt-2">
                  <SheetClose asChild>
                    <Link href="/" className="px-2 py-3 rounded-lg text-foreground hover:text-accent hover:bg-muted transition-colors font-medium">
                      Home
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/about" className="px-2 py-3 rounded-lg text-foreground/80 hover:text-accent hover:bg-muted transition-colors font-medium">
                      What is CodePVG
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/team" className="px-2 py-3 rounded-lg text-foreground/80 hover:text-accent hover:bg-muted transition-colors font-medium">
                      Team
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/contact" className="px-2 py-3 rounded-lg text-foreground/80 hover:text-accent hover:bg-muted transition-colors font-medium">
                      Contact
                    </Link>
                  </SheetClose>
                </div>
                <SheetFooter className="pt-2">
                  <Link href="/login" className="w-full">
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 rounded-xl">
                      Get Started
                    </Button>
                  </Link>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
