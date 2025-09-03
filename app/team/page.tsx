"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Github, Linkedin, Twitter, Mail, Users, Heart, Target } from "lucide-react"
import Link from "next/link"

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-accent/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 text-sm font-medium">
              Meet Our Team
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
              The People Behind <span className="text-accent">CodePVG</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
              A passionate group of students and educators dedicated to revolutionizing how students learn Data
              Structures and Algorithms.
            </p>
          </div>
        </div>
      </section>

      {/* Team Values */}
      <TeamValues />

      {/* Leadership Team */}
      <CoreTeam />

      {/* Development Team */}
      <DevelopmentTeam />

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
              <Link href="/about" className="text-muted-foreground hover:text-accent transition-colors">
                What is CodePVG
              </Link>
              <Link href="/team" className="text-foreground hover:text-accent transition-colors">
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

function TeamValues() {
  const values = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Student-First",
      description: "Every decision we make is centered around what's best for student learning and growth.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Passion-Driven",
      description: "We're not just building a platform; we're pursuing our passion for education and technology.",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Excellence-Focused",
      description: "We strive for excellence in everything we do, from code quality to user experience.",
    },
  ]

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Our Values</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The principles that guide everything we do at CodePVG
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="border-border text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="text-accent mb-4 flex justify-center">{value.icon}</div>
                <CardTitle className="text-xl font-heading">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed text-base">
                  {value.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CoreTeam() {
  const leadership = [
    {
      name: "Dr. Manoj V. Bhalerao",
      role: "Principal",
      bio: "Experienced educator with 15+ years in computer science education. Passionate about innovative learning methodologies and student success.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        github: "#",
        linkedin: "#",
        twitter: "#",
        email: "principal@codepvg.edu",
      },
      expertise: ["Educational Leadership", "Leadership", "Innovation"],
    },
    {
      name: "Prof. Indrajit Sonawane",
      role: "Training & Placement Officer",
      bio: "Senior TPO with expertise in industry connections and student career development. Helps bridge the gap between academia and industry.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        github: "#",
        linkedin: "#",
        twitter: "#",
        email: "tpo1@codepvg.edu",
      },
      expertise: ["Career Guidance", "Industry Relations", "Student Development"],
    },
    {
      name: "Prof. Lalit Patil",
      role: "Training & Placement Officer",
      bio: "Dedicated TPO focused on technical skill development and placement preparation. Strong background in competitive programming.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        github: "#",
        linkedin: "#",
        twitter: "#",
        email: "tpo2@codepvg.edu",
      },
      expertise: ["Technical Training", "Placement Strategy", "Competitive Programming"],
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Leadership Team</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The academic leadership guiding CodePVG's vision and student success
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-8">
          {leadership.map((member, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-accent/20"
                  />
                </div>
                <CardTitle className="text-xl font-heading">{member.name}</CardTitle>
                <CardDescription className="text-accent font-medium">{member.role}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4 leading-relaxed">{member.bio}</p>

                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {member.expertise.map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-center space-x-3">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Github className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function DevelopmentTeam() {
  const devTeam = [
    {
      name: "Atharva Rahate",
      role: "Frontend & AI Developer",
      bio: "Final Year Computer Engineering Student, specializing in frontend technologies and AI integration. Creates intuitive user experiences and implements intelligent features.",
      image: "/placeholder.svg?height=250&width=250",
      expertise: ["React", "TypeScript", "AI/ML", "Frontend Development"],
    },
    {
      name: "Shivam Thorat",
      role: "Backend Developer",
      bio: "Final Year Computer Engineering Studen, Backend specialist focused on building robust and scalable server-side applications. Ensures smooth data flow and system reliability.",
      image: "/placeholder.svg?height=250&width=250",
      expertise: ["Java SpringBoot", "Database Design", "API Development", "System Architecture"],
    },
    {
      name: "Rameshwar Bhumbhar",
      role: "FullStack Developer",
      bio: "Final Year Computer Engineering Student, specializing in FullStack Development focused on building React apps and Java based backend applications.",
      image: "/placeholder.svg?height=250&width=250",
      expertise: ["React", "Java", "Backend", "Frontend Development"],
    }
  ]

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Development Team</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The talented developers who bring CodePVG to life through innovative technology
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-8xl mx-auto">
          {devTeam.map((member, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-3">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-accent/20"
                  />
                </div>
                <CardTitle className="text-xl font-heading">{member.name}</CardTitle>
                <CardDescription className="text-accent font-medium">{member.role}</CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-muted-foreground mb-4 leading-relaxed">{member.bio}</p>

                <div className="flex flex-wrap gap-2 justify-center">
                  {member.expertise.map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
