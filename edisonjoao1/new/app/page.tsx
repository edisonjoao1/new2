"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { ArrowRight, Play, Send, X, Minimize2, Maximize2, Star, ExternalLink, Mail, Menu, Brain, Smartphone, Zap, Plug, Globe, Rocket, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

export default function LandingPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [ideaForm, setIdeaForm] = useState({ name: "", email: "", idea: "" })
  const [activeSection, setActiveSection] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isIdeaSubmitting, setIsIdeaSubmitting] = useState(false)
  const [ideaSubmitSuccess, setIdeaSubmitSuccess] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [sectionsLoaded, setSectionsLoaded] = useState<{[key: string]: boolean}>({})
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 })
  const chatEndRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content:
          "Hi! I'm AI 4U's assistant. I can help you learn about our AI consulting services, mobile apps, and how we can transform your business. What would you like to know?",
      },
    ],
  })

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Enhanced scroll handling for navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50
      setIsScrolled(scrolled)

      // Update active section based on scroll position
      const sections = ["services", "products", "results", "insights", "ideas", "contact"]
      let currentSection = ""

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentSection = section
            break
          }
        }
      }
      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Call once on mount
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Mouse parallax effect for hero section
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
        setMousePosition({ x, y })
      }
    }

    const heroElement = heroRef.current
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove)
      return () => heroElement.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Page loading, section intersection effects, and touch device detection
  useEffect(() => {
    // Detect touch device
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    checkTouchDevice()
    window.addEventListener('resize', checkTouchDevice)

    // Simulate page loading
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 1000)

    // Set up intersection observer for sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSectionsLoaded(prev => ({
              ...prev,
              [entry.target.id]: true
            }))
          }
        })
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )

    // Observe all main sections
    const sections = ['services', 'products', 'results', 'insights', 'ideas', 'contact']
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId)
      if (element) observer.observe(element)
    })

    return () => {
      clearTimeout(timer)
      observer.disconnect()
      window.removeEventListener('resize', checkTouchDevice)
    }
  }, [])

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.x && !touchStart.y) return
    
    const touch = e.touches[0]
    setTouchEnd({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return
    
    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y
    const minSwipeDistance = 50
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        setSwipeDirection('left')
        // Handle swipe left (next section)
        const sections = ["services", "products", "results", "insights", "ideas", "contact"]
        const currentIndex = sections.indexOf(activeSection)
        if (currentIndex < sections.length - 1) {
          scrollToSection(sections[currentIndex + 1])
        }
      } else {
        setSwipeDirection('right')
        // Handle swipe right (previous section)
        const sections = ["services", "products", "results", "insights", "ideas", "contact"]
        const currentIndex = sections.indexOf(activeSection)
        if (currentIndex > 0) {
          scrollToSection(sections[currentIndex - 1])
        }
      }
      
      // Reset swipe direction after animation
      setTimeout(() => setSwipeDirection(null), 300)
    }
    
    // Reset touch positions
    setTouchStart({ x: 0, y: 0 })
    setTouchEnd({ x: 0, y: 0 })
  }

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false) // Close mobile menu on navigation
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = isTouchDevice ? 70 : 80 // Smaller header on mobile
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerHeight
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsIdeaSubmitting(true)
    
    // Simulate loading state with enhanced UX
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const subject = encodeURIComponent("New Idea Submission")
    const body = encodeURIComponent(`Name: ${ideaForm.name}\nEmail: ${ideaForm.email}\n\nIdea:\n${ideaForm.idea}`)
    
    setIdeaSubmitSuccess(true)
    setIsIdeaSubmitting(false)
    
    // Reset form after success animation
    setTimeout(() => {
      window.location.href = `mailto:ideas@ai4u.space?subject=${subject}&body=${body}`
      setIdeaForm({ name: "", email: "", idea: "" })
      setIdeaSubmitSuccess(false)
    }, 2000)
  }

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AI 4U Labs",
    "alternateName": "AI 4U",
    "url": "https://ai4u.space",
    "logo": "https://ai4u.space/ai-assistant-mockup.png",
    "description": "AI 4U is a cutting-edge AI consulting studio specializing in custom AI app development, automation, API integration, and rapid MVP development.",
    "foundingDate": "2023",
    "foundingLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Naples",
        "addressRegion": "Florida",
        "addressCountry": "US"
      }
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-XXX-XXX-XXXX",
      "contactType": "customer service",
      "email": "info@ai4u.space",
      "availableLanguage": ["English", "Spanish"]
    },
    "sameAs": [
      "https://twitter.com/AI4ULabs",
      "https://linkedin.com/company/ai4ulabs"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "AI Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Strategy Consulting",
            "description": "Business-specific AI integration plans and competitive analysis"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Custom AI App Development",
            "description": "iOS/Swift apps, web applications, and SaaS dashboards with AI integration"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Automation & Workflow",
            "description": "Email/CRM automation and intelligent document parsing"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "150"
    }
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Page Loading Overlay */}
      {isPageLoading && (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-sm animate-pulse" style={{animationDelay: '0s'}}></div>
                <div className="w-4 h-4 bg-gradient-to-br from-purple-600 to-purple-700 rounded-sm animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-4 h-4 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-sm animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <div className="w-4 h-4 bg-gradient-to-br from-teal-600 to-teal-700 rounded-sm animate-pulse" style={{animationDelay: '0.6s'}}></div>
              </div>
              <div className="h-2 w-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4 font-medium">Loading AI 4U Experience...</p>
          </div>
        </div>
      )}
      
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden"
      onTouchStart={isTouchDevice ? handleTouchStart : undefined}
      onTouchMove={isTouchDevice ? handleTouchMove : undefined}
      onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
    >
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-1/3 left-1/6 w-80 h-80 bg-gradient-to-br from-cyan-400/20 via-teal-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '10s', animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-orange-400/20 via-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '12s', animationDelay: '4s'}}></div>
      </div>
      {/* Enhanced Navigation with mobile optimizations */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        isScrolled 
          ? "border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-xl shadow-gray-200/25" 
          : "border-gray-200/30 bg-white/90 backdrop-blur-xl shadow-lg shadow-gray-200/20"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center transition-all duration-300 ${
            isScrolled ? (isTouchDevice ? "py-2" : "py-3") : (isTouchDevice ? "py-3" : "py-4")
          }`}>
            {/* Enhanced Logo with mobile optimization */}
            <div className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="grid grid-cols-2 gap-1 transition-transform duration-300 group-hover:scale-110">
                <div className={`${isTouchDevice ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-gradient-to-br from-blue-600 to-blue-700 rounded-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-400/50`}></div>
                <div className={`${isTouchDevice ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-gradient-to-br from-purple-600 to-purple-700 rounded-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-400/50`} style={{animationDelay: '0.1s'}}></div>
                <div className={`${isTouchDevice ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-400/50`} style={{animationDelay: '0.2s'}}></div>
                <div className={`${isTouchDevice ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-gradient-to-br from-teal-600 to-teal-700 rounded-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-teal-400/50`} style={{animationDelay: '0.3s'}}></div>
              </div>
              <div className="h-4 sm:h-6 w-px bg-gradient-to-b from-gray-400 to-gray-600"></div>
              <span className={`${isTouchDevice ? 'text-lg' : 'text-xl'} font-semibold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent`}>AI 4U</span>
              <div className="h-4 sm:h-6 w-px bg-gradient-to-b from-gray-400 to-gray-600"></div>
              <span className={`${isTouchDevice ? 'text-xs' : 'text-sm'} font-medium bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent hidden sm:block`}>Labs</span>
            </div>

            {/* Enhanced Navigation Pills */}
            <div className="hidden lg:flex items-center space-x-2">
              {[
                { label: "SERVICES", id: "services" },
                { label: "PRODUCTS", id: "products" },
                { label: "RESULTS", id: "results" },
                { label: "INSIGHTS", id: "insights" },
                { label: "IDEAS", id: "ideas" },
                { label: "CONTACT", id: "contact" },
              ].map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-400/25"
                        : "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:shadow-lg hover:shadow-blue-400/25"
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>

            {/* Enhanced Mobile Menu Button with touch feedback */}
            <div className="lg:hidden flex items-center space-x-3">
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 active:scale-95 transition-transform duration-150 p-2 rounded-xl hover:bg-gray-100/50"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className={`${isTouchDevice ? 'w-6 h-6' : 'w-5 h-5'} flex flex-col justify-center items-center`}>
                  <span className={`block ${isTouchDevice ? 'w-5 h-0.5' : 'w-4 h-0.5'} bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''}`}></span>
                  <span className={`block ${isTouchDevice ? 'w-5 h-0.5' : 'w-4 h-0.5'} bg-current mt-1 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`block ${isTouchDevice ? 'w-5 h-0.5' : 'w-4 h-0.5'} bg-current mt-1 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                </div>
              </Button>
            </div>

            <div className="hidden lg:flex items-center space-x-3">
              <Button
                onClick={() => setIsChatOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6 shadow-lg shadow-blue-400/25 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-400/40 group"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span className="mr-2">Chat with AI</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse group-hover:scale-110 transition-transform"></div>
              </Button>
            </div>
            
            {/* Mobile Chat Button */}
            <div className="lg:hidden">
              <Button
                onClick={() => setIsChatOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-4 py-2 shadow-lg shadow-blue-400/25 transition-all duration-300 active:scale-95"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Brain className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Mobile Menu with touch interactions */}
          <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}>
            <div className="py-4 border-t border-gray-200/30 bg-white/95 backdrop-blur-xl">
              <div className="flex flex-col space-y-3">
                {[
                  { label: "SERVICES", id: "services" },
                  { label: "PRODUCTS", id: "products" },
                  { label: "RESULTS", id: "results" },
                  { label: "INSIGHTS", id: "insights" },
                  { label: "IDEAS", id: "ideas" },
                  { label: "CONTACT", id: "contact" },
                ].map((item, index) => {
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-6 py-4 text-base font-medium rounded-xl transition-all duration-300 text-left active:scale-95 ${
                        isActive
                          ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-400/25"
                          : "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:shadow-lg hover:shadow-blue-400/25 hover:scale-105"
                      }`}
                      style={{ 
                        WebkitTapHighlightColor: 'transparent',
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      {item.label}
                    </button>
                  )
                })}
                {/* Mobile Chat Button in Menu */}
                <div className="pt-4 border-t border-gray-200/30">
                  <Button
                    onClick={() => {
                      setIsChatOpen(true)
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-4 text-base font-medium shadow-lg shadow-blue-400/25 transition-all duration-300 active:scale-95"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    Chat with AI
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2"></div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section with 3D Parallax */}
      <section ref={heroRef} className="relative py-16 lg:py-24 overflow-hidden cursor-none">
        {/* Advanced 3D Background Elements with Parallax */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Layer 1 - Deep background */}
          <div 
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse transition-transform duration-100"
            style={{
              animationDuration: '6s',
              transform: `translate3d(${mousePosition.x * 15}px, ${mousePosition.y * 15}px, 0) scale(${1 + mousePosition.x * 0.05})`
            }}
          ></div>
          <div 
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-cyan-500/30 via-teal-500/30 to-emerald-500/30 rounded-full blur-3xl animate-pulse transition-transform duration-150"
            style={{
              animationDuration: '8s', 
              animationDelay: '2s',
              transform: `translate3d(${mousePosition.x * -20}px, ${mousePosition.y * -10}px, 0) scale(${1 + mousePosition.y * 0.03})`
            }}
          ></div>
          <div 
            className="absolute top-1/2 right-1/2 w-64 h-64 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse transition-transform duration-200"
            style={{
              animationDuration: '10s', 
              animationDelay: '4s',
              transform: `translate3d(${mousePosition.x * 10}px, ${mousePosition.y * 25}px, 0) rotate(${mousePosition.x * 5}deg)`
            }}
          ></div>
          
          {/* Layer 2 - Mid-ground floating elements */}
          <div 
            className="absolute top-1/3 left-1/3 w-32 h-32 bg-gradient-to-br from-violet-400/40 to-fuchsia-400/40 rounded-3xl blur-xl rotate-45 animate-pulse transition-transform duration-100"
            style={{
              animationDuration: '7s',
              transform: `translate3d(${mousePosition.x * 30}px, ${mousePosition.y * -20}px, 0) rotate(${45 + mousePosition.x * 10}deg) scale(${1 + mousePosition.y * 0.1})`
            }}
          ></div>
          <div 
            className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-emerald-400/50 to-cyan-400/50 rounded-2xl blur-lg -rotate-12 animate-pulse transition-transform duration-150"
            style={{
              animationDuration: '9s', 
              animationDelay: '1s',
              transform: `translate3d(${mousePosition.x * -25}px, ${mousePosition.y * 30}px, 0) rotate(${-12 + mousePosition.y * 15}deg)`
            }}
          ></div>
          
          {/* Layer 3 - Foreground interactive elements */}
          <div 
            className="absolute top-1/6 right-1/6 w-16 h-16 bg-gradient-to-br from-pink-500/60 to-rose-500/60 rounded-full shadow-lg transition-transform duration-75"
            style={{
              transform: `translate3d(${mousePosition.x * 40}px, ${mousePosition.y * -30}px, 0) scale(${1 + mousePosition.x * 0.2})`
            }}
          ></div>
          <div 
            className="absolute bottom-1/6 left-1/6 w-12 h-12 bg-gradient-to-br from-blue-500/70 to-indigo-500/70 rounded-lg shadow-md transition-transform duration-100"
            style={{
              transform: `translate3d(${mousePosition.x * -35}px, ${mousePosition.y * 40}px, 0) rotate(${mousePosition.x * 20}deg)`
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 ${isTouchDevice ? 'min-h-[400px] sm:h-[500px] lg:h-[600px]' : 'h-[600px]'}`}>
            {/* Enhanced Top Row - Full Width Headline with mobile optimization */}
            <Card className={`lg:col-span-3 border-gray-200/30 bg-white/70 backdrop-blur-md ${isTouchDevice ? 'rounded-2xl' : 'rounded-3xl'} overflow-hidden relative shadow-xl shadow-gray-200/20 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-300/30 group mobile-card`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Interactive background pattern */}
              <div className="absolute inset-0 overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-full h-full opacity-10 transition-transform duration-200"
                  style={{
                    background: `radial-gradient(circle at ${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%, rgba(59, 130, 246, 0.3) 0%, transparent 70%)`,
                    transform: `translate3d(${mousePosition.x * 5}px, ${mousePosition.y * 5}px, 0)`
                  }}
                ></div>
              </div>
              
              <CardContent className={`${isTouchDevice ? 'p-6 sm:p-8 lg:p-12' : 'p-12 lg:p-16'} flex items-center justify-center h-full relative z-10`}>
                <div className="text-center">
                  <h1 
                    className={`hero-title ${isTouchDevice ? 'text-3xl sm:text-4xl lg:text-6xl' : 'text-5xl lg:text-7xl'} font-light bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight transition-all duration-300`}
                    style={!isTouchDevice ? {
                      transform: `perspective(1000px) rotateX(${mousePosition.y * 2}deg) rotateY(${mousePosition.x * 2}deg)`,
                      textShadow: `${mousePosition.x * 2}px ${mousePosition.y * 2}px 10px rgba(59, 130, 246, 0.1)`
                    } : {}}
                  >
                    Transform your business with{" "}
                    <span 
                      className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block transition-all duration-200"
                      style={!isTouchDevice ? {
                        transform: `scale(${1 + Math.abs(mousePosition.x) * 0.05}) rotate(${mousePosition.x * 1}deg)`
                      } : {}}
                    >
                      AI
                    </span>
                  </h1>
                  
                  {/* Floating accent elements */}
                  <div className="relative mt-8">
                    <div 
                      className="absolute left-1/2 top-0 w-2 h-2 bg-blue-500 rounded-full opacity-60 transition-all duration-100"
                      style={{
                        transform: `translate(${mousePosition.x * 30 - 50}%, ${mousePosition.y * -20}px)`
                      }}
                    ></div>
                    <div 
                      className="absolute left-1/2 top-0 w-1 h-1 bg-purple-500 rounded-full opacity-80 transition-all duration-150"
                      style={{
                        transform: `translate(${mousePosition.x * -40 + 30}%, ${mousePosition.y * 25}px)`
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Bottom Left - Subhead and Buttons */}
            <Card className="lg:col-span-2 border-gray-200/30 bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl shadow-gray-200/20 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-300/30 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 lg:p-12 flex flex-col justify-center h-full relative z-10">
                <p className="text-xl lg:text-2xl text-gray-700 mb-8 leading-relaxed transition-all duration-300 group-hover:text-gray-800">
                  We're entering a new era of business transformation — one where <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI unlocks deeper insights</span>, faster growth, and life-changing solutions. At AI 4U, we're building that future.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-4 text-lg font-medium group shadow-lg shadow-blue-400/25 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-400/40"
                  >
                    Start Your AI Project
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 rounded-full px-8 py-4 text-lg font-medium bg-white/80 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <Play className="mr-2 w-5 h-5 transition-all duration-300 group-hover:text-blue-600" />
                    View Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Bottom Right - Interactive 3D Shape */}
            <Card className="border-gray-200/30 bg-white/70 backdrop-blur-md rounded-3xl overflow-visible relative shadow-xl shadow-gray-200/20 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-300/30 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <CardContent className="p-0 h-full relative">
                {/* Interactive 3D Organic Shape with Parallax */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="relative w-80 h-80 transform scale-150 transition-transform duration-300"
                    style={{
                      transform: `scale(${1.5 + mousePosition.x * 0.1}) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
                      perspective: '1000px'
                    }}
                  >
                    {/* Interactive organic blobs */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-[3rem] opacity-90 animate-pulse shadow-xl shadow-blue-400/30 transition-transform duration-200"
                      style={{
                        clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        animationDuration: "8s",
                        transform: `rotate(${12 + mousePosition.x * 10}deg) scale(${1 + mousePosition.y * 0.1})`
                      }}
                    ></div>
                    <div
                      className="absolute inset-4 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-[2.5rem] opacity-85 animate-pulse shadow-lg shadow-purple-400/25 transition-transform duration-250"
                      style={{
                        clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                        animationDuration: "10s",
                        animationDelay: "2s",
                        transform: `rotate(${-6 + mousePosition.y * 8}deg) scale(${1 + mousePosition.x * 0.05})`
                      }}
                    ></div>
                    <div
                      className="absolute inset-8 bg-gradient-to-br from-pink-400 via-pink-500 to-orange-500 rounded-[2rem] opacity-75 animate-pulse shadow-lg shadow-pink-400/25 transition-transform duration-300"
                      style={{
                        clipPath: "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)",
                        animationDuration: "12s",
                        animationDelay: "4s",
                        transform: `rotate(${3 + mousePosition.x * 6}deg) scale(${1 + Math.abs(mousePosition.y) * 0.08})`
                      }}
                    ></div>

                    {/* Interactive floating elements */}
                    <div 
                      className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl opacity-80 animate-bounce shadow-lg shadow-cyan-400/30 transition-transform duration-100"
                      style={{
                        animationDuration: '3s',
                        transform: `rotate(${45 + mousePosition.x * 15}deg) translate3d(${mousePosition.x * 10}px, ${mousePosition.y * -15}px, 0) scale(${1 + mousePosition.x * 0.1})`
                      }}
                    ></div>
                    <div 
                      className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl opacity-75 animate-bounce shadow-md shadow-yellow-400/30 transition-transform duration-150"
                      style={{
                        animationDuration: '3.5s', 
                        animationDelay: '0.5s',
                        transform: `rotate(${-12 + mousePosition.y * 20}deg) translate3d(${mousePosition.x * -12}px, ${mousePosition.y * 18}px, 0)`
                      }}
                    ></div>
                    <div 
                      className="absolute top-1/2 -left-4 w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg opacity-70 animate-bounce shadow-md shadow-green-400/30 transition-transform duration-200"
                      style={{
                        animationDuration: '4s', 
                        animationDelay: '1s',
                        transform: `rotate(${30 + mousePosition.x * 25}deg) translate3d(${mousePosition.x * 15}px, ${mousePosition.y * -10}px, 0)`
                      }}
                    ></div>
                    <div 
                      className="absolute top-0 left-1/2 w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl opacity-60 animate-bounce shadow-md shadow-indigo-400/30 transition-transform duration-100"
                      style={{
                        animationDuration: '4.5s', 
                        animationDelay: '1.5s',
                        transform: `rotate(${-45 + mousePosition.y * 30}deg) translate3d(${mousePosition.x * 8}px, ${mousePosition.y * 12}px, 0) scale(${1 + Math.abs(mousePosition.y) * 0.15})`
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      <section id="services" className="py-24 bg-gradient-to-br from-white/80 via-blue-50/50 to-purple-50/50 backdrop-blur-sm relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/6 w-48 h-48 bg-gradient-to-br from-cyan-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 transition-all duration-500 hover:scale-105">
              Complete <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Solutions</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              From strategy to deployment, we handle every aspect of your <span className="font-semibold text-blue-600">AI transformation</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                Icon: Brain,
                iconColor: "from-blue-500 to-indigo-600",
                title: "AI Strategy Consulting",
                description: "**Business-specific** roadmaps and competitive analysis.",
                features: ["Strategic Planning", "ROI Analysis", "Implementation Roadmap"]
              },
              {
                Icon: Smartphone,
                iconColor: "from-purple-500 to-pink-600",
                title: "Custom AI App Development",
                description: "**iOS/Swift**, web apps, SaaS dashboards.",
                features: ["iOS Development", "Web Applications", "SaaS Platforms"]
              },
              {
                Icon: Zap,
                iconColor: "from-orange-500 to-red-600",
                title: "Automation & Workflow AI",
                description: "**Email/CRM** automation and document parsing.",
                features: ["Process Automation", "CRM Integration", "Document AI"]
              },
              {
                Icon: Plug,
                iconColor: "from-green-500 to-emerald-600",
                title: "AI API Integration",
                description: "**GPT-4o**, Claude, Llama 3.1 with RAG pipelines.",
                features: ["API Development", "RAG Systems", "Model Integration"]
              },
              {
                Icon: Globe,
                iconColor: "from-cyan-500 to-teal-600",
                title: "Localization & Personas",
                description: "**Spanish** markets and niche GPTs.",
                features: ["Market Research", "Cultural Adaptation", "Persona GPTs"]
              },
              {
                Icon: Rocket,
                iconColor: "from-violet-500 to-purple-600",
                title: "Rapid MVP Development",
                description: "Launch an **MVP in days**, not months.",
                features: ["Quick Prototyping", "Agile Development", "Fast Deployment"]
              },
            ].map((service, index) => {
              const isLoaded = sectionsLoaded.services
              const isHovered = hoveredCard === `service-${index}`
              
              return (
              <Card
                key={index}
                onMouseEnter={() => setHoveredCard(`service-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`border-gray-200/30 hover:border-blue-300/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-200/25 bg-white/70 backdrop-blur-md rounded-2xl group hover:-translate-y-2 relative overflow-hidden cursor-pointer ${
                  isLoaded ? 'animate-in slide-in-from-bottom-8 fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Enhanced card background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${service.iconColor} opacity-20 blur-sm`}></div>
                </div>
                
                <CardHeader className="pb-6 relative z-10">
                  {/* Enhanced icon with gradient background and loading state */}
                  <div className="relative mb-6">
                    {!isLoaded ? (
                      <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse mb-4 shadow-lg"></div>
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${service.iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl relative overflow-hidden`}>
                        {/* Shimmer effect */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000`}></div>
                        <service.Icon className={`w-8 h-8 text-white transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`} />
                      </div>
                    )}
                    {/* Floating accent dot with enhanced animation */}
                    <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-r ${service.iconColor} opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 ${isHovered ? 'animate-bounce' : ''}`}></div>
                    
                    {/* Loading indicator */}
                    {!isLoaded && (
                      <div className="absolute top-0 left-0 w-16 h-16 rounded-2xl border-2 border-gray-300 border-t-blue-500 animate-spin"></div>
                    )}
                  </div>
                  
                  {!isLoaded ? (
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                  ) : (
                    <CardTitle className="text-gray-900 text-xl font-semibold mb-3 group-hover:text-blue-700 transition-colors duration-300">
                      {service.title}
                    </CardTitle>
                  )}
                  
                  {!isLoaded ? (
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                  ) : (
                    <CardDescription
                      className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 mb-4"
                      dangerouslySetInnerHTML={{ __html: service.description }}
                    />
                  )}
                  
                  {/* Feature list with enhanced loading states */}
                  <div className="space-y-2">
                    {!isLoaded ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((_, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse flex-1"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      service.features.map((feature, featureIndex) => (
                        <div 
                          key={featureIndex}
                          className={`flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 ${
                            isHovered ? 'animate-in slide-in-from-left-2 fade-in' : ''
                          }`}
                          style={{ transitionDelay: `${featureIndex * 100}ms` }}
                        >
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.iconColor} ${isHovered ? 'animate-pulse' : ''}`}></div>
                          <span className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                            {feature}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Enhanced progress bar animation with loading state */}
                  {!isLoaded ? (
                    <div className="mt-4 h-1 bg-gray-200 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div 
                        className={`h-full bg-gradient-to-r ${service.iconColor} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out`}
                        style={{ transitionDelay: '300ms' }}
                      ></div>
                    </div>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Live Products Section */}
      <section id="products" className="py-24 bg-gradient-to-br from-gray-50/80 via-blue-50/60 to-purple-50/80 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/5 w-72 h-72 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/5 w-56 h-56 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-6 transition-all duration-500 hover:scale-105">
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Live</span> Products
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">Real AI applications serving <span className="font-semibold text-purple-600">thousands of users</span> worldwide</p>
          </div>

          {/* Featured Product Showcase */}
          <div className="mb-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-gray-200/20 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-purple-200/30">
                  <div className="flex items-center justify-center">
                    <img 
                      src="/ai-assistant-mockup.png" 
                      alt="AI Assistant App Screenshots" 
                      className="max-w-full h-auto transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="text-5xl">🤖</div>
                  <div>
                    <h3 className="text-3xl font-semibold text-gray-900 mb-2">AI Amigo</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-lg font-semibold text-gray-900">4.9</span>
                      </div>
                      <span className="text-gray-600">3,200+ users</span>
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">Featured</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-lg text-gray-700 leading-relaxed">
                  Your bilingual AI companion that understands both English and Spanish. Perfect for productivity, learning, and daily assistance with intelligent conversation capabilities.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Real-time bilingual conversations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">Productivity-focused AI assistance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">Spanish market optimization</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-6 shadow-lg shadow-purple-400/25 transition-all duration-300 transform hover:scale-105"
                  >
                    <a href="https://apps.apple.com/us/app/ai-amigo/id6670725604" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on App Store
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-full px-6 transition-all duration-300"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🤖",
                title: "AI Amigo",
                rating: "4.9",
                users: "3,200+",
                url: "https://apps.apple.com/us/app/ai-amigo/id6670725604",
                featured: true,
              },
              {
                icon: "🧠",
                title: "Inteligencia Artificial",
                rating: "4.6",
                users: "1,500+",
                url: "https://apps.apple.com/us/app/inteligencia-artificial-ia/id6743879085",
                featured: true,
              },
              {
                icon: "💪",
                title: "Accountability Buddie",
                rating: "4.8",
                users: "900+",
                url: "https://apps.apple.com/us/app/accountability-buddie/id6742691299",
              },
              {
                icon: "🌟",
                title: "SheGPT",
                rating: "4.9",
                users: "2,100+",
                url: "https://apps.apple.com/us/app/shegpt/id6744063469",
              },
              {
                icon: "🛡️",
                title: "Sober AI",
                rating: "4.7",
                users: "1,800+",
                url: "https://apps.apple.com/us/app/sober-ai/id6740759999",
              },
              {
                icon: "🎨",
                title: "AI Image Create",
                rating: "4.5",
                users: "1,200+",
                url: "https://apps.apple.com/us/app/ai-image-create/id6744127405",
              },
            ].map((product, index) => (
              <Card
                key={index}
                className={`border-gray-200/30 hover:border-purple-300/50 transition-all duration-500 hover:shadow-xl hover:shadow-purple-200/25 bg-white/70 backdrop-blur-md rounded-2xl group hover:-translate-y-2 relative overflow-hidden ${
                  product.featured ? "ring-2 ring-purple-200 border-purple-300/50 shadow-lg shadow-purple-100/30" : ""
                }`}
              >
                {/* Card background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl group-hover:scale-125 transition-all duration-500 filter group-hover:drop-shadow-lg">
                      {product.icon}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-gray-900 font-medium">{product.rating}</span>
                      </div>
                      <div className="text-gray-500 text-sm">{product.users} users</div>
                    </div>
                  </div>
                  <CardTitle className="text-gray-900 text-xl font-semibold mb-4 group-hover:text-purple-700 transition-colors duration-300">{product.title}</CardTitle>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-2 border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 rounded-full bg-white/80 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <a href={product.url} target="_blank" rel="noopener noreferrer">
                      View on App Store
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          {/* App Store Showcase */}
          <div className="mt-20 text-center">
            <div className="relative group inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-gray-200/20 transition-all duration-500 group-hover:shadow-2xl">
                <img 
                  src="/app-store-template.jpg" 
                  alt="App Store Presentation" 
                  className="max-w-full h-auto rounded-2xl transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
            <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
              Professional App Store presentation with optimized screenshots, compelling descriptions, and conversion-focused design.
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Results Section */}
      <section id="results" className="py-24 bg-gradient-to-br from-white/80 via-gray-50/60 to-blue-50/80 backdrop-blur-sm relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-200/15 to-cyan-200/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-teal-200/15 to-emerald-200/15 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-gray-900 via-blue-900 to-teal-900 bg-clip-text text-transparent mb-6 transition-all duration-500 hover:scale-105">
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Proven</span> Results
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">Real outcomes delivered for our <span className="font-semibold text-blue-600">clients and users</span></p>
          </div>

          {/* Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {[
              { value: "$2M+", label: "client savings" },
              { value: "10+", label: "apps live" },
              { value: "10,000+", label: "users onboarded" },
              { value: "40%", label: "efficiency gain" },
            ].map((stat, index) => (
              <Card key={index} className="border-gray-200/30 bg-white/70 backdrop-blur-md rounded-2xl text-center p-8 shadow-lg shadow-gray-200/20 transition-all duration-500 hover:shadow-xl hover:shadow-blue-200/25 hover:-translate-y-1 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-teal-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="p-0 relative z-10">
                  <div className="text-4xl font-light bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-3 transition-all duration-300 group-hover:scale-110">{stat.value}</div>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                content:
                  "AI 4U transformed our business operations. The custom automation saved us 30% on routine tasks and streamlined our entire workflow process.",
                author: "Maria Rodriguez",
                role: "CEO, Tech Startup",
                image: "/testimonial-maria.png",
                company: "TechFlow Solutions",
                rating: 5,
              },
              {
                content:
                  "The Spanish-language AI tools opened up entirely new markets for us. Phenomenal localization and cultural understanding.",
                author: "Carlos Gutierrez",
                role: "Director, Marketing Agency",
                image: "/testimonial-carlos.png",
                company: "Global Reach Marketing",
                rating: 5,
              },
              {
                content: "From idea to App Store in just weeks. The rapid development process was incredible and exceeded our expectations.",
                author: "Jennifer Lee",
                role: "Founder, Health App",
                image: "/testimonial-jennifer.png",
                company: "WellnessFirst",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-gray-200/30 bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg shadow-gray-200/20 transition-all duration-500 hover:shadow-xl hover:shadow-blue-200/25 hover:-translate-y-2 group relative overflow-hidden">
                {/* Enhanced background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Quote decoration */}
                <div className="absolute top-4 right-4 text-6xl text-blue-200/30 font-serif transition-all duration-500 group-hover:text-blue-300/50 group-hover:scale-110">&ldquo;</div>
                
                <CardContent className="p-0 relative z-10">
                  {/* Rating stars */}
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 text-yellow-400 fill-current transition-all duration-300 group-hover:text-yellow-500 group-hover:scale-110" 
                        style={{animationDelay: `${i * 0.1}s`}} 
                      />
                    ))}
                  </div>
                  
                  {/* Testimonial content */}
                  <p className="text-gray-700 leading-relaxed mb-8 text-lg group-hover:text-gray-800 transition-colors duration-300">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  
                  {/* Author info with enhanced layout */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                      <img
                        src={testimonial.image}
                        alt={testimonial.author}
                        className="w-14 h-14 rounded-full object-cover transition-all duration-500 group-hover:scale-110 shadow-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-semibold text-lg group-hover:text-blue-700 transition-colors duration-300">
                        {testimonial.author}
                      </p>
                      <p className="text-gray-600 text-sm mb-1 group-hover:text-gray-700 transition-colors duration-300">
                        {testimonial.role}
                      </p>
                      <p className="text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-300">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                  
                  {/* Verified badge */}
                  <div className="mt-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-1 bg-white rounded-full transform rotate-45 origin-left"></div>
                    </div>
                    <span className="text-green-600 text-sm font-medium">Verified Client</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Insights & Updates */}
      <section id="insights" className="py-24 bg-gradient-to-br from-blue-50/70 via-indigo-50/60 to-purple-50/70 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/6 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/6 w-72 h-72 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6 transition-all duration-500 hover:scale-105">
              <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Insights</span> & Updates
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">Latest thoughts on <span className="font-semibold text-indigo-600">AI</span>, business transformation, and innovation</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "The Future of AI in Small Business",
                date: "December 15, 2024",
                excerpt:
                  "How small businesses can leverage AI to compete with larger enterprises and drive unprecedented growth.",
              },
              {
                title: "Spanish-Language AI: Untapped Opportunities",
                date: "December 10, 2024",
                excerpt:
                  "Exploring the massive potential of AI applications designed specifically for Spanish-speaking markets.",
              },
              {
                title: "From Idea to App Store in 7 Days",
                date: "December 5, 2024",
                excerpt:
                  "Our proven methodology for rapid AI app development and what it means for your business timeline.",
              },
              {
                title: "AI Automation ROI: Real Numbers",
                date: "November 28, 2024",
                excerpt:
                  "Breaking down the actual cost savings and efficiency gains our clients have achieved through AI automation.",
              },
            ].map((article, index) => (
              <Card
                key={index}
                className="border-gray-200/50 hover:border-gray-300/50 transition-all duration-300 hover:shadow-lg bg-white/60 backdrop-blur-sm rounded-2xl group hover:-translate-y-1"
              >
                <CardHeader className="relative z-10">
                  <div className="text-sm text-gray-500 mb-2 group-hover:text-gray-600 transition-colors duration-300">{article.date}</div>
                  <CardTitle className="text-gray-900 text-xl font-semibold mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">{article.excerpt}</CardDescription>
                  <Button
                    variant="ghost"
                    className="text-indigo-600 hover:text-indigo-700 p-0 h-auto font-semibold justify-start transition-all duration-300 group-hover:translate-x-1"
                  >
                    Read more →
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Got an Idea Section */}
      <section id="ideas" className="py-24 bg-gradient-to-br from-white/80 via-blue-50/50 to-purple-50/80 backdrop-blur-sm relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-br from-blue-200/10 via-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 transition-all duration-500 hover:scale-105">
              Got an <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">idea</span>?
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              We'd love to hear about your vision. Share your <span className="font-semibold text-blue-600">AI project ideas</span> with us and let's explore what's possible.
            </p>
          </div>

          <Card className="border-gray-200/30 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl shadow-gray-200/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-200/25 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <CardContent className="p-8 relative z-10">
              <form onSubmit={handleIdeaSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      value={ideaForm.name}
                      onChange={(e) => setIdeaForm({ ...ideaForm, name: e.target.value })}
                      className="border-gray-300 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={ideaForm.email}
                      onChange={(e) => setIdeaForm({ ...ideaForm, email: e.target.value })}
                      className="border-gray-300 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Idea
                  </label>
                  <Textarea
                    id="idea"
                    value={ideaForm.idea}
                    onChange={(e) => setIdeaForm({ ...ideaForm, idea: e.target.value })}
                    className="border-gray-300 rounded-xl min-h-[120px]"
                    placeholder="Tell us about your AI project idea..."
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isIdeaSubmitting || ideaSubmitSuccess}
                  className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full py-3 text-lg font-semibold shadow-lg shadow-blue-400/25 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-400/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    ideaSubmitSuccess ? 'from-green-600 to-emerald-600' : ''
                  }`}
                >
                  {isIdeaSubmitting ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      <span className="animate-pulse">Processing...</span>
                    </>
                  ) : ideaSubmitSuccess ? (
                    <>
                      <CheckCircle className="mr-2 w-5 h-5 animate-in zoom-in-50" />
                      <span className="animate-in slide-in-from-left-2">Success! Opening Email...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 w-5 h-5" />
                      Send Idea
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer id="contact" className="border-t border-gray-200/30 bg-gradient-to-br from-white/90 via-gray-50/80 to-blue-50/80 backdrop-blur-xl py-16 relative overflow-hidden">
        {/* Footer background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-96 h-48 bg-gradient-to-br from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-36 bg-gradient-to-br from-cyan-200/10 to-teal-200/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-2 h-2 bg-gray-900 rounded-sm"></div>
                  <div className="w-2 h-2 bg-gray-700 rounded-sm"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-sm"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-sm"></div>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <span className="text-lg font-medium text-gray-900">AI 4U</span>
              </div>
              <p className="text-gray-600 mb-4">AI Consulting & Solutions That Work for You</p>
              <p className="text-gray-500 text-sm">Naples, Florida • Founded 2023</p>
            </div>

            <div>
              <h3 className="text-gray-900 font-medium mb-4">Services</h3>
              <ul className="space-y-3 text-gray-600">
                <li>AI Strategy Consulting</li>
                <li>Custom App Development</li>
                <li>Automation Solutions</li>
                <li>API Integration</li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-900 font-medium mb-4">Resources</h3>
              <ul className="space-y-3 text-gray-600">
                <li>Case Studies</li>
                <li>Blog & Insights</li>
                <li>App Portfolio</li>
                <li>Documentation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-900 font-medium mb-4">Contact</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <a href="mailto:info@ai4u.space" className="hover:text-gray-900 transition-colors">
                    info@ai4u.space
                  </a>
                </li>
                <li>
                  <a href="mailto:ideas@ai4u.space" className="hover:text-gray-900 transition-colors">
                    ideas@ai4u.space
                  </a>
                </li>
                <li>Naples, Florida</li>
                <li>ai4u.space</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200/50 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; 2024 AI 4U Labs. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Enhanced Chat Interface */}
      {isChatOpen && (
        <div
          className={`fixed bottom-8 right-8 w-96 transition-all duration-500 z-50 transform ${
            isMinimized 
              ? "h-16 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg" 
              : "h-[520px] bg-white/95 backdrop-blur-xl border border-gray-200/30 rounded-3xl shadow-2xl shadow-gray-200/40 hover:shadow-3xl hover:shadow-gray-300/50"
          } animate-in slide-in-from-bottom-4 fade-in-0`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200/30">
            <div className="flex items-center space-x-3">
              {/* Enhanced AI Avatar */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold">AI 4U Assistant</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-green-600 text-xs font-medium">Online & Ready</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 fade-in-0`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start space-x-3 max-w-[85%]">
                        {message.role === "assistant" && (
                          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mt-1 shadow-md">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`group relative ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-md p-3 shadow-lg"
                              : "bg-white text-gray-800 border border-gray-200/50 rounded-2xl rounded-bl-md p-3 shadow-md hover:shadow-lg transition-shadow duration-200"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          
                          {/* Message timestamp on hover */}
                          <div className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="text-xs text-gray-400">
                              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        
                        {message.role === "user" && (
                          <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                            <span className="text-white text-xs font-semibold">U</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start animate-in slide-in-from-bottom-2 fade-in-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                          <Brain className="w-4 h-4 text-white animate-pulse" />
                        </div>
                        <div className="bg-white border border-gray-200/50 p-4 rounded-2xl rounded-bl-md shadow-md">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span className="text-xs text-gray-500 ml-2">AI is typing...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-gray-200/30">
                <form onSubmit={handleSubmit} className="flex space-x-3">
                  <div className="relative flex-1">
                    <Input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask about our AI services..."
                      className="w-full border-gray-300 rounded-full px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      disabled={isLoading}
                    />
                    {/* Character count indicator */}
                    {input.length > 50 && (
                      <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                        <span className={`text-xs ${
                          input.length > 200 ? 'text-red-500' : input.length > 150 ? 'text-yellow-500' : 'text-gray-400'
                        }`}>
                          {input.length}/250
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full px-4 py-3 shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
                
                {/* Quick action suggestions */}
                {messages.length <= 1 && !isLoading && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Our Services', 'Pricing', 'Portfolio', 'Get Started'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleInputChange({ target: { value: `Tell me about ${suggestion.toLowerCase()}` } } as any)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
    </>
  )
}
