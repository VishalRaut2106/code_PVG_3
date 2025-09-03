"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Code, Users, Target, ArrowRight, CheckCircle, TrendingUp, Brain } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Reusing from main page */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-accent/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 text-sm font-medium">
              About CodePVG
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
              What is <span className="text-accent">CodePVG</span>?
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
              CodePVG is a personalized and self-made platform designed specifically for students to master Data
              Structures and Algorithms, combining the best features of LeetCode, HackerRank, and GeeksforGeeks with a
              student-centric approach.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <PlatformOverview />

      {/* How We're Different */}
      <DifferenceSection />

      {/* Learning Methodology */}
      <LearningMethodology />

      {/* Platform Comparison Section */}
      <PlatformComparisonSection />

      {/* Call to Action */}
      <CallToAction />

      {/* Footer */}
      <Footer />
    </div>
  )
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-accent" />
              <span className="font-heading text-xl font-bold text-foreground">CodePVG</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="text-muted-foreground hover:text-accent transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-foreground hover:text-accent transition-colors">
                What is CodePVG
              </Link>
              <Link href="/team" className="text-muted-foreground hover:text-accent transition-colors">
                Team
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-accent transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Get Started</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function PlatformOverview() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
              Built by Students, for Students
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              CodePVG was born from the frustration of students who found existing platforms too generic and impersonal.
              We understand the unique challenges students face when learning Data Structures and Algorithms, from
              academic pressure to placement preparation.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Our platform combines the comprehensive problem sets of LeetCode, the structured learning approach of
              GeeksforGeeks, and the competitive environment of HackerRank, while adding personalized learning paths
              that adapt to your individual progress and learning style.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span className="text-foreground">Personalized learning paths based on your skill level</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span className="text-foreground">Real-time progress tracking and analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span className="text-foreground">Student-focused community and peer learning</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span className="text-foreground">Placement and interview preparation tools</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="/placeholder.svg?height=500&width=600"
              alt="Students learning together"
              className="rounded-lg shadow-lg"
            />
            <div className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground p-4 rounded-lg shadow-lg">
              <div className="text-2xl font-bold">10,000+</div>
              <div className="text-sm">Students Learning</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DifferenceSection() {
  const differences = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Adaptive Learning",
      description: "Our AI-powered system adapts to your learning pace and identifies knowledge gaps automatically.",
      highlight: "Smart & Personalized",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Progress Visualization",
      description: "Beautiful charts and graphs that show your improvement over time, not just problem counts.",
      highlight: "Visual Progress",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Peer Learning",
      description: "Connect with classmates, form study groups, and learn from each other's approaches.",
      highlight: "Community Driven",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Goal-Oriented",
      description: "Set specific goals like 'crack Google interview' and get customized preparation plans.",
      highlight: "Purpose Built",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">How We're Different</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            While other platforms focus on quantity, we focus on quality learning experiences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {differences.map((item, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-accent">{item.icon}</div>
                  <Badge variant="secondary" className="text-xs">
                    {item.highlight}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-heading">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed text-base">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function LearningMethodology() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Our Learning Methodology</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A systematic approach to mastering DSA that actually works for students
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-accent">1</span>
            </div>
            <h3 className="text-xl font-heading font-bold text-foreground mb-4">Assess & Analyze</h3>
            <p className="text-muted-foreground leading-relaxed">
              Take our comprehensive assessment to identify your current skill level and learning preferences. Our
              system analyzes your strengths and areas for improvement.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-accent">2</span>
            </div>
            <h3 className="text-xl font-heading font-bold text-foreground mb-4">Personalized Path</h3>
            <p className="text-muted-foreground leading-relaxed">
              Get a customized learning path with carefully selected problems that build upon each other. No more random
              problem solving - every question has a purpose.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-accent">3</span>
            </div>
            <h3 className="text-xl font-heading font-bold text-foreground mb-4">Track & Improve</h3>
            <p className="text-muted-foreground leading-relaxed">
              Monitor your progress with detailed analytics. See how you're improving over time and get recommendations
              for what to focus on next.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-card border border-border rounded-lg p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-heading font-bold text-foreground mb-4">Real Progress Tracking</h3>
              <p className="text-muted-foreground mb-6">
                Unlike other platforms that just count solved problems, we track your actual understanding and skill
                development across different topics and difficulty levels.
              </p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Arrays & Strings</span>
                    <span className="text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Dynamic Programming</span>
                    <span className="text-muted-foreground">60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Graph Algorithms</span>
                    <span className="text-muted-foreground">40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </div>
            </div>
            <div>
              <img
                src="/placeholder.svg?height=300&width=400"
                alt="Progress Dashboard"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PlatformComparisonSection() {
  const platforms = [
    {
      name: "CodePVG",
      features: {
        "College-Specific": "Yes",
        "Junior-Senior Connect": "Yes",
        "Personalized Learning": "Yes",
        "Progress Tracking": "Yes",
        "Peer Discussions": "Yes",
        "Local Mentorship": "Yes",
        "Campus Integration": "Yes",
        "Free Access": "Yes",
      },
      highlight: true,
    },
    {
      name: "LeetCode",
      features: {
        "College-Specific": "No",
        "Junior-Senior Connect": "No",
        "Personalized Learning": "Limited",
        "Progress Tracking": "Yes",
        "Peer Discussions": "Limited",
        "Local Mentorship": "No",
        "Campus Integration": "No",
        "Free Access": "Limited",
      },
      highlight: false,
    },
    {
      name: "HackerRank",
      features: {
        "College-Specific": "No",
        "Junior-Senior Connect": "No",
        "Personalized Learning": "Limited",
        "Progress Tracking": "Yes",
        "Peer Discussions": "No",
        "Local Mentorship": "No",
        "Campus Integration": "No",
        "Free Access": "Limited",
      },
      highlight: false,
    },
    {
      name: "GeeksforGeeks",
      features: {
        "College-Specific": "No",
        "Junior-Senior Connect": "No",
        "Personalized Learning": "No",
        "Progress Tracking": "Basic",
        "Peer Discussions": "Limited",
        "Local Mentorship": "No",
        "Campus Integration": "No",
        "Free Access": "Yes",
      },
      highlight: false,
    },
  ]

  const featureKeys = Object.keys(platforms[0].features)

  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Platform Comparison
          </Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Why <span className="text-accent">CodePVG</span> is Different
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We built CodePVG specifically for college students, addressing gaps that other platforms simply don't cover
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-6 font-heading font-bold text-foreground">Features</th>
                  {platforms.map((platform, index) => (
                    <th key={index} className={`text-center p-6 ${platform.highlight ? "bg-accent/10" : ""}`}>
                      <div className="flex flex-col items-center space-y-2">
                        <div
                          className={`font-heading font-bold text-lg ${platform.highlight ? "text-accent" : "text-foreground"}`}
                        >
                          {platform.name}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureKeys.map((feature, featureIndex) => (
                  <tr key={featureIndex} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-6 font-medium text-foreground">
                      <div className="flex items-center space-x-2">
                        {feature === "Junior-Senior Connect" && <Users className="h-4 w-4 text-accent" />}
                        {feature === "College-Specific" && <Target className="h-4 w-4 text-accent" />}
                        {feature === "Personalized Learning" && <Brain className="h-4 w-4 text-accent" />}
                        {feature === "Progress Tracking" && <TrendingUp className="h-4 w-4 text-accent" />}
                        {feature === "Peer Discussions" && <Users className="h-4 w-4 text-accent" />}
                        {feature === "Local Mentorship" && <Target className="h-4 w-4 text-accent" />}
                        {feature === "Campus Integration" && <Code className="h-4 w-4 text-accent" />}
                        {feature === "Free Access" && <CheckCircle className="h-4 w-4 text-accent" />}
                        <span>{feature}</span>
                      </div>
                    </td>
                    {platforms.map((platform, platformIndex) => (
                      <td key={platformIndex} className={`text-center p-6 ${platform.highlight ? "bg-accent/5" : ""}`}>
                        <span
                          className={`text-sm font-medium px-3 py-1 rounded-full ${
                            platform.features[feature as keyof typeof platform.features] === "Yes"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : platform.features[feature as keyof typeof platform.features] === "No"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {platform.features[feature as keyof typeof platform.features]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <Card className="border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="bg-accent/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-lg font-heading">Connect with Seniors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get direct mentorship from seniors in your college who have successfully landed internships and
                placements. Learn from their experiences and mistakes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="bg-secondary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-lg font-heading">College-Focused Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Problems and study materials specifically curated based on your college's placement history and the
                companies that visit your campus.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="bg-accent/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-lg font-heading">Campus Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Seamlessly works with your college's academic calendar and placement timeline, helping you prepare at
                the right pace.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-r from-accent/10 to-secondary/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
          Ready to Transform Your DSA Journey?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of students who are already mastering Data Structures and Algorithms with CodePVG's
          personalized approach.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg">
            Start Learning Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-3 text-lg bg-transparent">
            View Demo
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Free to start • No credit card required • Join 10,000+ students
        </p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Code className="h-8 w-8 text-accent" />
              <span className="font-heading text-xl font-bold">CodePVG</span>
            </div>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              Empowering students to master Data Structures and Algorithms through personalized learning experiences.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  What is CodePVG
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/tutorials"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Tutorials
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60">© 2024 CodePVG. All rights reserved. Built with ❤️ for students.</p>
        </div>
      </div>
    </footer>
  )
}
