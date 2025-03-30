import Link from "next/link"
import { ArrowRight, CheckCircle, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { RedirectToProfile } from "@/components/redirect-profile"

export default async function LandingPage() {
  const session = await getServerSession()
  let userProfile = null
  
  // If user is already logged in, get their profile info
  if (session?.user?.email) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email
        },
        select: {
          id: true
        }
      })
      
      if (user) {
        userProfile = user
      }
    } catch (error) {
      console.error("Error finding user", error)
    }
  }

  return (
    <>
      {/* Add a client component for redirection if user is logged in */}
      {userProfile && (
        <RedirectToProfile userId={userProfile.id} />
      )}
      
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold">
                PortfolioHub
              </Link>
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-4">
              {userProfile ? (
                <Link href={`/${userProfile.id}`}>
                  <Button>Go to My Portfolio</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">
                Your Professional Portfolio, Made Simple
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Create a stunning online portfolio to showcase your work, skills, and professional journey.
                Join thousands of professionals who stand out with PortfolioHub.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full">
                    Create Your Portfolio
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose PortfolioHub?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="space-y-1">
                  <CheckCircle className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Professional Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Stand out with a beautifully designed portfolio that looks great on any device.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="space-y-1">
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Easy to Customize</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Update your portfolio with a simple interface, no coding skills required.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="space-y-1">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Connect & Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Share your portfolio with recruiters, colleagues, and your network to advance your career.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Showcase Your Work?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who've elevated their online presence with PortfolioHub.
            </p>
            <Link href="/register">
              <Button size="lg">Create Your Free Portfolio</Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 mt-auto">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 PortfolioHub. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  About
                </Link>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy
                </Link>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

