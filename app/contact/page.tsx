"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Code, Mail, Phone, MapPin, MessageSquare, HelpCircle, Send } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-accent/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 text-sm font-medium">
              Get in Touch
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
              Contact <span className="text-accent">CodePVG</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
              Have questions, suggestions, or need help? We're here to support your learning journey. Reach out to us
              anytime!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <ContactInfo />

      {/* Contact Form & FAQ */}
      <ContactFormSection />

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
              <Link href="/team" className="text-muted-foreground hover:text-accent transition-colors">
                Team
              </Link>
              <Link href="/contact" className="text-foreground hover:text-accent transition-colors">
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

function ContactInfo() {
  const contactMethods = [
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Email Us",
      primary: "contact@codepvg.edu",
      secondary: "support@codepvg.edu",
      description: "Send us an email and we'll respond within 24 hours",
      action: "Send Email",
    },
    {
      icon: <Phone className="h-8 w-8" />,
      title: "Call Us",
      primary: "+91 98765 43210",
      secondary: "+91 87654 32109",
      description: "Call us during business hours for immediate assistance",
      action: "Call Now",
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Visit Us",
      primary: "CodePVG Campus",
      secondary: "Pune, Maharashtra 411001",
      description: "Visit our campus for in-person meetings and workshops",
      action: "Get Directions",
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Live Chat",
      primary: "Available 24/7",
      secondary: "Instant responses",
      description: "Chat with our support team for quick help",
      action: "Start Chat",
    },
  ]

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">How to Reach Us</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the method that works best for you. We're committed to responding quickly and helpfully.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center"
            >
              <CardHeader>
                <div className="text-accent mb-4 flex justify-center">{method.icon}</div>
                <CardTitle className="text-lg font-heading">{method.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="font-medium text-foreground">{method.primary}</p>
                  <p className="text-sm text-muted-foreground">{method.secondary}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{method.description}</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  {method.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactFormSection() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const faqs = [
    {
      question: "How do I get started with CodePVG?",
      answer:
        "Simply click the 'Get Started' button on our homepage to create your free account. You'll take a quick assessment to determine your skill level, and we'll create a personalized learning path for you.",
    },
    {
      question: "Is CodePVG free to use?",
      answer:
        "Yes! CodePVG offers a comprehensive free tier with access to hundreds of problems and basic progress tracking. We also offer premium features for advanced analytics and personalized mentoring.",
    },
    {
      question: "What programming languages are supported?",
      answer:
        "We support all major programming languages including C++, Java, Python, JavaScript, C#, and more. You can switch between languages for any problem.",
    },
    {
      question: "How is CodePVG different from other coding platforms?",
      answer:
        "CodePVG is specifically designed for students with personalized learning paths, peer collaboration features, and progress tracking that focuses on understanding rather than just problem count.",
    },
    {
      question: "Do you offer placement preparation?",
      answer:
        "We have dedicated tracks for placement preparation with company-specific problem sets, mock interviews, and resume building guidance.",
    },
    {
      question: "Can I use CodePVG for competitive programming?",
      answer:
        "Yes! We have contest preparation tracks, regular coding competitions, and practice problems from various competitive programming platforms.",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-6">Send us a Message</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Fill out the form below with your inquiry, and we'll get back to you as soon as possible. For urgent
              matters, please call us directly.
            </p>

            <Card className="border-border">
              <CardContent className="p-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">First Name *</label>
                      <Input
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Last Name *</label>
                      <Input
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email Address *</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                    <Select onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Subject *</label>
                    <Input
                      placeholder="Brief description of your inquiry"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Message *</label>
                    <Textarea
                      placeholder="Please provide details about your inquiry..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                    />
                  </div>

                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting this form, you agree to our privacy policy and terms of service.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Find quick answers to common questions. If you don't see your question here, feel free to contact us
              directly.
            </p>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-4">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-accent">
                    <div className="flex items-center space-x-2">
                      <HelpCircle className="h-4 w-4 text-accent" />
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-8 p-6 bg-card border border-border rounded-lg">
              <h3 className="font-heading font-semibold text-foreground mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">
                Our support team is here to help. Contact us directly for personalized assistance.
              </p>
              <Button variant="outline" className="w-full bg-transparent">
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Live Chat
              </Button>
            </div>
          </div>
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
            <h4 className="font-heading font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Help Center
                </Link>
              </li>
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
                  href="/community"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Community
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
