'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  MapPin, 
  Shirt, 
  Sparkles, 
  Truck, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Headphones,
  Star,
  ArrowRight,
  Shield,
  Zap,
  Award,
  Users,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  ChevronLeft,
  ChevronRight,
  User,
  ShoppingBag,
  LogOut,
  ChevronDown,
  Package,
  Bell,
  Menu,
  X
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import React from 'react'
import { useAuthStore } from '@/store/authStore'
import { useHomepageStats } from '@/hooks/useStats'
import BookingModal from '@/components/BookingModal'
import { useRouter } from 'next/navigation'

// Hero Carousel Component
function HeroCarousel({
  isAuthenticated,
  user,
  onBookNow,
}: {
  isAuthenticated: boolean
  user: any
  onBookNow: () => void
}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [previousSlide, setPreviousSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const [isAnimating, setIsAnimating] = useState(false)

  const slides: Array<{
    id: number
    title: string
    subtitle: string
    description: string
    features: Array<{ icon: any; text: string }>
    image: string
    video?: string
    discount: string
    primaryButton: { text: string; icon: any; action: string }
    secondaryButton: { text: string; icon: any; href: string }
  }> = [
    {
      id: 1,
      title: isAuthenticated
        ? `Welcome back, ${user?.name}!`
        : 'Welcome to LaundryLobby',
      subtitle: "India's #1 Laundry Service",
      description: isAuthenticated
        ? "Ready to schedule your next laundry pickup? We're here to make your life easier!"
        : 'Serving across 20+ Cities with over 20+ Outlets across the nation.',
      features: [
        { icon: Clock, text: 'Schedule Collection Days' },
        { icon: Truck, text: '24-48 hours Delivery' },
        { icon: CreditCard, text: 'Easy Payment Options' },
        { icon: Headphones, text: 'Dedicated Customer Support' },
      ],
      image: '/images/hero-laundry.jpg',
      discount: '20%',
      primaryButton: { text: 'Book New Order', icon: Truck, action: 'book' },
      secondaryButton: { text: 'Chat on WhatsApp', icon: Phone, href: '#' },
    },
    {
      id: 2,
      title: 'Premium Dry Cleaning',
      subtitle: 'Professional Care for Your Clothes',
      description:
        'Expert dry cleaning services with advanced technology and eco-friendly solutions.',
      features: [
        { icon: Shield, text: '100% Safe & Secure' },
        { icon: Sparkles, text: 'Premium Quality Care' },
        { icon: Award, text: 'Certified Professionals' },
        { icon: Star, text: '5-Star Rated Service' },
      ],
      image: '/images/hero-slide-2.jpg',
      discount: '15%',
      primaryButton: { text: 'Book Dry Cleaning', icon: Sparkles, action: 'book' },
      secondaryButton: { text: 'View Services', icon: ArrowRight, href: '#services' },
    },
  ]

  const nextSlide = () => {
    if (isAnimating) return
    setSlideDirection('right')
    setIsAnimating(true)
    setPreviousSlide(currentSlide)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setSlideDirection('left')
    setIsAnimating(true)
    setPreviousSlide(currentSlide)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const currentSlideData = slides[currentSlide]
  const previousSlideData = slides[previousSlide]

  return (
    <div
      className="relative overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation Arrows - Only visible on hover */}
      <button
        onClick={prevSlide}
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-gray-500 hover:bg-gray-600 rounded-lg p-3 shadow-lg transition-all duration-300 hover:scale-110 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={nextSlide}
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-gray-500 hover:bg-gray-600 rounded-lg p-3 shadow-lg transition-all duration-300 hover:scale-110 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Slides Container */}
      <div className="relative">
        {/* Previous Slide (exits) */}
        {isAnimating && (
          <div
            className={`absolute inset-0 z-10 ${
              slideDirection === 'right'
                ? 'animate-[slideOutLeft_0.6s_ease-in-out_forwards]'
                : 'animate-[slideOutRight_0.6s_ease-in-out_forwards]'
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-4 items-center">
              <div className="px-4 lg:pl-16">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                  {previousSlideData.title}
                </h1>
                <p className="text-lg font-medium text-gray-800 mb-6">{previousSlideData.description}</p>
                <div className="space-y-3 mb-8">
                  {previousSlideData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white px-6">
                    <Truck className="w-5 h-5 mr-2" />
                    {previousSlideData.primaryButton.text}
                  </Button>
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-6">
                    <Phone className="w-5 h-5 mr-2" />
                    Chat on Whatsapp
                  </Button>
                </div>
              </div>
              <div className="relative flex justify-center items-end overflow-visible">
                {previousSlideData.video ? (
                  <video
                    src={previousSlideData.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-auto max-h-[520px] object-contain object-bottom"
                    style={{ 
                      filter: 'hue-rotate(-50deg) saturate(0.8)',
                      mixBlendMode: 'multiply'
                    }}
                  />
                ) : (
                  <img
                    src={previousSlideData.image}
                    alt={previousSlideData.title}
                    className="w-auto max-h-[500px] object-contain object-bottom"
                    style={{ 
                      mixBlendMode: 'multiply'
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Current Slide (enters) */}
        <div
          className={`relative z-20 ${
            isAnimating
              ? slideDirection === 'right'
                ? 'animate-[slideInRight_0.6s_ease-in-out_forwards]'
                : 'animate-[slideInLeft_0.6s_ease-in-out_forwards]'
              : ''
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-4 items-center">
            <div className="px-4 lg:pl-16">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                {currentSlideData.title}
              </h1>
              <p className="text-lg font-medium text-gray-800 mb-6">{currentSlideData.description}</p>
              <div className="space-y-3 mb-8">
                {currentSlideData.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6"
                  onClick={onBookNow}
                >
                  <Truck className="w-5 h-5 mr-2" />
                  {currentSlideData.primaryButton.text}
                </Button>
                <Link href="https://wa.me/919876543210" target="_blank">
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-6">
                    <Phone className="w-5 h-5 mr-2" />
                    Chat on Whatsapp
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center items-end overflow-visible">
              {currentSlideData.video ? (
                <video
                  src={currentSlideData.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-auto max-h-[520px] object-contain object-bottom"
                  style={{ 
                    filter: 'hue-rotate(-50deg) saturate(0.8)',
                    mixBlendMode: 'multiply'
                  }}
                />
              ) : (
                <img
                  src={currentSlideData.image}
                  alt={currentSlideData.title}
                  className="w-auto max-h-[500px] object-contain object-bottom"
                  style={{ 
                    mixBlendMode: 'multiply'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// Testimonials Carousel Component
function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: 'Divya K.',
      review: 'I gave them my silk saree and was honestly worried. But they handled it with such care. Impressive service and safe for delicate fabrics!',
      rating: 5
    },
    {
      id: 2,
      name: 'Rajat T.',
      review: 'Very smooth process — booked on the app, got a confirmation instantly, and pickup arrived right on time. Great for busy people like me.',
      rating: 5
    },
    {
      id: 3,
      name: 'Tanvi M.',
      review: 'Affordable prices and great quality. Clothes were perfectly ironed and smelled so fresh. 10/10 for service!',
      rating: 5
    },
    {
      id: 4,
      name: 'Karan V.',
      review: "This is my third time using LaundryLobby and I'm never going back to hand washing or dry cleaning shops. So easy and dependable!",
      rating: 5
    },
    {
      id: 5,
      name: 'Priya S.',
      review: 'Best laundry service in the city! My curtains came back looking brand new. Will definitely recommend to friends and family.',
      rating: 5
    },
    {
      id: 6,
      name: 'Amit R.',
      review: 'The pickup and delivery is so convenient. No more weekend trips to the dry cleaner. Excellent quality every single time!',
      rating: 5
    },
    {
      id: 7,
      name: 'Sneha P.',
      review: 'I was skeptical at first but the quality exceeded my expectations. My formal suits look professionally cleaned. Highly recommended!',
      rating: 5
    },
    {
      id: 8,
      name: 'Vikram J.',
      review: 'Fast, reliable, and affordable. The customer support is also very responsive. Been using for 6 months now, never disappointed.',
      rating: 5
    }
  ]

  // Create extended array for infinite scroll effect
  const extendedTestimonials = [...testimonials, ...testimonials, ...testimonials]

  // Infinite scroll
  const nextSlide = () => {
    setCurrentIndex(prev => prev + 1)
  }

  const prevSlide = () => {
    setCurrentIndex(prev => prev - 1)
  }

  // Reset position for seamless loop
  useEffect(() => {
    if (currentIndex >= testimonials.length) {
      setTimeout(() => {
        setCurrentIndex(0)
      }, 500)
    }
    if (currentIndex < 0) {
      setTimeout(() => {
        setCurrentIndex(testimonials.length - 1)
      }, 500)
    }
  }, [currentIndex, testimonials.length])

  // Responsive: 1 item on mobile, 2 on tablet, 4 on desktop
  const getSlideWidth = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 100 // mobile: 1 item
      if (window.innerWidth < 1024) return 50 // tablet: 2 items
      return 25 // desktop: 4 items
    }
    return 25
  }

  const [slideWidth, setSlideWidth] = useState(25)

  useEffect(() => {
    const handleResize = () => {
      setSlideWidth(getSlideWidth())
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center transition-all hover:border-teal-500 hover:text-teal-500"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center transition-all hover:border-teal-500 hover:text-teal-500"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Testimonials Container */}
      <div className="overflow-hidden mx-6 sm:mx-8">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${(currentIndex + testimonials.length) * slideWidth}%)`,
          }}
        >
          {extendedTestimonials.map((testimonial, index) => (
            <div 
              key={`${testimonial.id}-${index}`} 
              className="flex-shrink-0 px-2"
              style={{ width: `${slideWidth}%` }}
            >
              <div className="bg-white rounded-xl p-6 text-center h-full">
                {/* Quote Icon */}
                <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Stars */}
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 text-base mb-4 leading-relaxed">
                  {testimonial.review}
                </p>

                {/* Name */}
                <p className="font-bold text-gray-800 text-lg">{testimonial.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Scroll Banner & Image Gallery Section
function ScrollBannerSection({ isAuthenticated, onGalleryVisible }: { isAuthenticated: boolean; onGalleryVisible?: (visible: boolean) => void }) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [imageRowOffset, setImageRowOffset] = useState(0)
  const [bannerScrolledUp, setBannerScrolledUp] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const sectionTop = rect.top
      
      // Calculate progress - SLOWER growth, takes longer to reach 100%
      // Progress from 0 to 1 over the entire section height
      const progress = Math.max(0, Math.min(1, (windowHeight - sectionTop) / (windowHeight * 1.2)))
      setScrollProgress(progress)
      
      // Pin the section when it enters viewport and progress is between 0.1 and 0.95
      const shouldPin = progress > 0.1 && progress < 0.95
      setIsPinned(shouldPin)
      
      // Check if banner has scrolled up past the viewport (negative top means it's above screen)
      if (bannerRef.current) {
        const bannerRect = bannerRef.current.getBoundingClientRect()
        // Banner is considered "scrolled up" when its bottom edge goes above viewport
        setBannerScrolledUp(bannerRect.bottom < 0)
      }
      
      // Image row offset - directly based on scroll position for continuous movement
      const scrollY = window.scrollY
      setImageRowOffset(scrollY * 0.5) // Move at half the scroll speed
      
      // Notify parent when gallery becomes visible (progress > 0.8)
      const showGallery = progress > 0.8
      if (onGalleryVisible) {
        onGalleryVisible(showGallery)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onGalleryVisible])

  // Banner starts SMALL and GROWS to FULL WIDTH - SLOWER
  // Starts at 40% width, grows to 100%
  const bannerWidth = 40 + (scrollProgress * 60) // 40% to 100%
  
  // Padding grows as banner expands
  const bannerPaddingY = 30 + (scrollProgress * 80) // 30px to 110px
  const bannerPaddingX = 24 + (scrollProgress * 40) // 24px to 64px
  
  // Border radius - top corners become 0, bottom corners stay rounded
  // Top radius: 20px to 0px as it grows
  const topRadius = Math.max(0, 20 - (scrollProgress * 20)) // 20px to 0px
  // Bottom radius: stays at 20px always for pinned effect
  const bottomRadius = 20
  
  // Color transition - starts light teal, becomes darker teal (theme color)
  // RGB values: light teal (204, 251, 241) to teal-500 (20, 184, 166)
  const colorR = 204 - (scrollProgress * 184) // 204 to 20
  const colorG = 251 - (scrollProgress * 67) // 251 to 184
  const colorB = 241 - (scrollProgress * 75) // 241 to 166
  
  // Image gallery visibility - shows when banner is 80% grown
  const showGallery = scrollProgress > 0.8
  const galleryOpacity = Math.max(0, (scrollProgress - 0.8) * 5) // 0 to 1 after 80%
  const galleryTranslateY = Math.max(0, (1 - galleryOpacity) * 30) // slides up

  // Laundry images for the gallery
  const topRowImages = [
    'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop',
  ]

  const bottomRowImages = [
    'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1469504512102-900f29606341?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400&h=300&fit=crop',
  ]

  // Background color transition - white to black as gallery appears
  const bgColorProgress = Math.max(0, (scrollProgress - 0.6) * 2.5) // 0 to 1 after 60%
  const bgR = Math.round(255 - (bgColorProgress * 238)) // 255 to 17 (gray-900)
  const bgG = Math.round(255 - (bgColorProgress * 231)) // 255 to 24
  const bgB = Math.round(255 - (bgColorProgress * 216)) // 255 to 39

  return (
    <div ref={sectionRef} className="relative" style={{ minHeight: isPinned ? '200vh' : 'auto' }}>
      {/* Background Section - Transitions from white to black */}
      <section 
        ref={bannerRef}
        className={`py-16 min-h-[100vh] flex items-center justify-center overflow-hidden transition-colors duration-300 ${isPinned ? 'sticky top-0' : ''}`}
        style={{ 
          zIndex: isPinned ? 10 : 1,
          backgroundColor: `rgb(${bgR}, ${bgG}, ${bgB})`
        }}
      >
        <div className="w-full flex justify-center">
          <div 
            className="transition-all duration-300 ease-out relative"
            style={{ 
              width: `${bannerWidth}%`,
              padding: `${bannerPaddingY}px ${bannerPaddingX}px`,
              borderRadius: `${topRadius}px ${topRadius}px ${bottomRadius}px ${bottomRadius}px`,
              backgroundColor: `rgb(${colorR}, ${colorG}, ${colorB})`,
              textAlign: scrollProgress < 0.5 ? 'left' : 'center',
            }}
          >
            {/* Fixed Bottom Corners - visible when banner is growing */}
            {scrollProgress > 0.3 && scrollProgress < 0.95 && (
              <>
                <div 
                  className="fixed bottom-0 left-0 w-8 h-8 z-50 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at top right, transparent 70%, rgb(${colorR}, ${colorG}, ${colorB}) 70%)`,
                    opacity: scrollProgress > 0.5 ? 1 : (scrollProgress - 0.3) * 5,
                  }}
                />
                <div 
                  className="fixed bottom-0 right-0 w-8 h-8 z-50 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at top left, transparent 70%, rgb(${colorR}, ${colorG}, ${colorB}) 70%)`,
                    opacity: scrollProgress > 0.5 ? 1 : (scrollProgress - 0.3) * 5,
                  }}
                />
              </>
            )}
            {/* "Schedule today to" - always on top, smoothly grows */}
            <p 
              className="font-bold tracking-[0.2em] uppercase text-gray-600 transition-all duration-300 ease-out"
              style={{ 
                fontSize: `${10 + scrollProgress * 6}px`,
                marginBottom: `${8 + scrollProgress * 16}px`,
              }}
            >
              Schedule today to
            </p>
            
            {/* Main heading - smoothly grows */}
            <h2 
              className="leading-tight transition-all duration-300 ease-out"
              style={{
                fontSize: `${22 + scrollProgress * 44}px`,
                marginBottom: `${16 + scrollProgress * 16}px`,
              }}
            >
              <span className="font-extrabold text-gray-900">
                Get 20% off{' '}
              </span>
              <span className="font-semibold text-teal-600">
                your first order
              </span>
            </h2>
            
            {/* Button */}
            <Link href={isAuthenticated ? "/customer/orders/new" : "/auth/login?redirect=/customer/orders/new"}>
              <Button 
                className="rounded-full font-bold transition-all duration-300 ease-out bg-teal-500 hover:bg-teal-600 text-white"
                style={{
                  padding: `${10 + scrollProgress * 6}px ${24 + scrollProgress * 20}px`,
                  fontSize: `${13 + scrollProgress * 3}px`,
                }}
              >
                Schedule your first pickup
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Image Gallery with Dark Background - Hidden until banner is mostly grown */}
      {showGallery && (
        <section 
          className="bg-gray-900 py-8 overflow-hidden transition-all duration-500"
          style={{ 
            opacity: galleryOpacity,
            transform: `translateY(${galleryTranslateY}px)`,
          }}
        >
          {/* Top Row - Moves Right to Left on Scroll Down */}
          <div className="mb-4 overflow-hidden">
            <div 
              className="flex gap-4"
              style={{ 
                width: 'max-content',
                transform: `translateX(-${imageRowOffset % 1000}px)`,
              }}
            >
              {[...topRowImages, ...topRowImages, ...topRowImages].map((img, index) => (
                <div 
                  key={`top-${index}`} 
                  className="w-72 h-48 flex-shrink-0 rounded-xl overflow-hidden"
                >
                  <img 
                    src={img} 
                    alt={`Laundry ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row - Moves Left to Right on Scroll Down (Reverse Direction) */}
          <div className="overflow-hidden">
            <div 
              className="flex gap-4"
              style={{ 
                width: 'max-content',
                transform: `translateX(-${1000 - (imageRowOffset % 1000)}px)`,
              }}
            >
              {[...bottomRowImages, ...bottomRowImages, ...bottomRowImages].map((img, index) => (
                <div 
                  key={`bottom-${index}`} 
                  className="w-72 h-48 flex-shrink-0 rounded-xl overflow-hidden"
                >
                  <img 
                    src={img} 
                    alt={`Laundry ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee Section */}
          <div className="container mx-auto px-4 py-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  The LaundryLobby<br />
                  <span className="text-teal-400">Guarantee.</span>
                </h2>
              </div>
              <div className="text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Every order is backed by our industry-leading guarantee. If you're not satisfied with the 
                  cleaning of your clothes, we will re-clean them – free of charge.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore()
  const { stats, loading: statsLoading, error: statsError } = useHomepageStats()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const router = useRouter()

  const handleBookNow = () => {
    // If not logged in, redirect to login, then come back to home with modal
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/?openBooking=true')
      return
    }
    setShowBookingModal(true)
  }

  // Check URL params to auto-open booking modal after login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('openBooking') === 'true' && isAuthenticated) {
        setShowBookingModal(true)
        // Clean up URL
        window.history.replaceState({}, '', '/')
      }
    }
  }, [isAuthenticated])

  const handleLoginRequired = () => {
    setShowBookingModal(false)
    router.push('/auth/login?redirect=/?openBooking=true')
  }

  const handleGalleryVisible = (visible: boolean) => {
    setIsDarkTheme(visible)
  }
  
  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Booking Modal */}
      <BookingModal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        onLoginRequired={handleLoginRequired}
      />
      {/* Navigation - Fixed */}
      <nav className={`shadow-sm border-b fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${isDarkTheme ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold transition-colors duration-500 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>LaundryLobby</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden p-2 rounded-lg transition-colors duration-500 ${isDarkTheme ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className={`transition-colors duration-500 ${isDarkTheme ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'}`}>Home</Link>
              <Link href="/services" className={`transition-colors duration-500 ${isDarkTheme ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'}`}>Services</Link>
              <Link href="/pricing" className={`transition-colors duration-500 ${isDarkTheme ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'}`}>Pricing</Link>
              <Link href="/help" className={`transition-colors duration-500 ${isDarkTheme ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'}`}>Help</Link>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Dashboard Button */}
                  <Link href="/customer/dashboard">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <div className="relative group">
                    <button className={`flex items-center space-x-2 py-2 transition-colors duration-500 ${isDarkTheme ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'}`}>
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <Link href="/customer/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4 mr-3" />
                          Dashboard
                        </Link>
                        <Link href="/customer/orders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                          <ShoppingBag className="w-4 h-4 mr-3" />
                          My Orders
                        </Link>
                        <Link href="/customer/addresses" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                          <MapPin className="w-4 h-4 mr-3" />
                          Addresses
                        </Link>
                        <Link href="/customer/profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4 mr-3" />
                          Profile
                        </Link>
                        <hr className="my-2" />
                        <button 
                          onClick={() => {
                            useAuthStore.getState().logout()
                            window.location.href = '/'
                          }}
                          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button variant="outline" className={`transition-colors duration-500 ${isDarkTheme ? 'border-teal-400 text-teal-400 hover:bg-teal-400/10' : 'border-teal-500 text-teal-600 hover:bg-teal-50'}`}>
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={`md:hidden border-t mt-4 pt-4 pb-2 transition-colors duration-500 ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col space-y-3">
                <Link href="/" className={`py-2 transition-colors duration-500 ${isDarkTheme ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/services" className={`py-2 transition-colors duration-500 ${isDarkTheme ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'}`} onClick={() => setMobileMenuOpen(false)}>Services</Link>
                <Link href="/pricing" className={`py-2 transition-colors duration-500 ${isDarkTheme ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'}`} onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                <Link href="/help" className={`py-2 transition-colors duration-500 ${isDarkTheme ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'}`} onClick={() => setMobileMenuOpen(false)}>Help</Link>
                
                {isAuthenticated ? (
                  <>
                    <hr className={`my-2 transition-colors duration-500 ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`} />
                    <Link href="/customer/dashboard" className={`py-2 transition-colors duration-500 ${isDarkTheme ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'}`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                    <Link href="/customer/orders" className={`py-2 transition-colors duration-500 ${isDarkTheme ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'}`} onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                    <Link href="/customer/profile" className={`py-2 transition-colors duration-500 ${isDarkTheme ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'}`} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                    <button 
                      onClick={() => {
                        useAuthStore.getState().logout()
                        setMobileMenuOpen(false)
                        window.location.href = '/'
                      }}
                      className="text-left text-red-600 hover:text-red-700 py-2"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className={`w-full transition-colors duration-500 ${isDarkTheme ? 'border-teal-400 text-teal-400 hover:bg-teal-400/10' : 'border-teal-500 text-teal-600 hover:bg-teal-50'}`}>
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Carousel */}
      <section className="relative bg-blue-100 pt-24 pb-0 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <HeroCarousel isAuthenticated={isAuthenticated} user={user} onBookNow={handleBookNow} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-teal-500 font-semibold mb-2">Right to Your Doorstep</p>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              We Collect, Clean, and Deliver Your<br />
              Laundry & Dry Cleaning
            </h2>
            <p className="text-gray-800 font-semibold max-w-3xl mx-auto">
              At LaundryLobby, we offer a seamless laundry and dry cleaning experience tailored 
              to your busy lifestyle. From pickup to delivery, every step is handled with 
              professionalism and care.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {/* Card 1 - Order Online */}
            <div className="text-center group">
              <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-[-28px] relative z-10 shadow-lg border-4 border-white">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-100">
                <div className="h-44 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                    alt="Order Online"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 pt-4">
                  <div className="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center mx-auto mb-3 border border-teal-100">
                    <CreditCard className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Order Online</h3>
                  <p className="text-gray-800 font-medium text-sm">Place your laundry request in just a few clicks.</p>
                </div>
              </div>
            </div>

            {/* Card 2 - Pick Up */}
            <div className="text-center group">
              <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-[-28px] relative z-10 shadow-lg border-4 border-white">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-100">
                <div className="h-44 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                    alt="Pick Up"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 pt-4">
                  <div className="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center mx-auto mb-3 border border-teal-100">
                    <Truck className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Pick Up</h3>
                  <p className="text-gray-800 font-medium text-sm">We collect your clothes right from your doorstep.</p>
                </div>
              </div>
            </div>

            {/* Card 3 - Cleaning */}
            <div className="text-center group">
              <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-[-28px] relative z-10 shadow-lg border-4 border-white">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-100">
                <div className="h-44 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                    alt="Cleaning"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 pt-4">
                  <div className="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center mx-auto mb-3 border border-teal-100">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Cleaning</h3>
                  <p className="text-gray-800 font-medium text-sm">Expert care with advanced cleaning technology.</p>
                </div>
              </div>
            </div>

            {/* Card 4 - Drop Off */}
            <div className="text-center group">
              <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-[-28px] relative z-10 shadow-lg border-4 border-white">
                <span className="text-xl font-bold text-white">4</span>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-100">
                <div className="h-44 overflow-hidden">
                  <img 
                    src="/images/del.jpg" 
                    alt="Drop Off"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 pt-4">
                  <div className="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center mx-auto mb-3 border border-teal-100">
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Drop Off</h3>
                  <p className="text-gray-800 font-medium text-sm">Fresh, clean clothes delivered back to you on time.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left - Features with Icons */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Why Choose Us?</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Quick Pickup & Delivery</span>
                </div>
                <div className="flex items-center space-x-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Affordable Pricing</span>
                </div>
                <div className="flex items-center space-x-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Eco-Friendly Cleaning Solutions</span>
                </div>
                <div className="flex items-center space-x-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Real-Time Order Tracking</span>
                </div>
                <div className="flex items-center space-x-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Dedicated Customer Support</span>
                </div>
              </div>
            </div>

            {/* Right - CTA Card with Video Background */}
            <div className="relative rounded-2xl overflow-hidden min-h-[450px]">
              {/* Video Background */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/images/pricing.mp4" type="video/mp4" />
              </video>
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/85 to-gray-800/90"></div>
              
              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4">Ready to Experience Premium Laundry Service?</h3>
                
                <p className="text-gray-200 text-lg mb-4">
                  Join over 50,000+ satisfied customers who trust LaundryLobby with their laundry needs every day.
                </p>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="w-5 h-5 text-teal-400 mr-2 flex-shrink-0" />
                    Free pickup & delivery at your doorstep
                  </li>
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="w-5 h-5 text-teal-400 mr-2 flex-shrink-0" />
                    24-48 hours turnaround time
                  </li>
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="w-5 h-5 text-teal-400 mr-2 flex-shrink-0" />
                    100% satisfaction guaranteed
                  </li>
                </ul>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {isAuthenticated ? (
                    <Button 
                      size="lg" 
                      className="bg-teal-500 hover:bg-teal-600 text-white w-full sm:w-auto shadow-lg"
                      onClick={handleBookNow}
                    >
                      <Truck className="w-5 h-5 mr-2" />
                      Book New Order
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      className="bg-teal-500 hover:bg-teal-600 text-white w-full sm:w-auto shadow-lg"
                      onClick={handleBookNow}
                    >
                      <Truck className="w-5 h-5 mr-2" />
                      Schedule Free Pickup
                    </Button>
                  )}
                  <Link href="https://wa.me/919876543210" target="_blank">
                    <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto shadow-lg">
                      <Phone className="w-5 h-5 mr-2" />
                      Chat on WhatsApp
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-teal-500 font-semibold mb-2">Premium Laundry And Dry Clean Service in India</p>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Quality Cleaning with Great Savings!</h2>
            <p className="text-gray-800 font-semibold max-w-4xl mx-auto">
              At LaundryLobby, we take care of all your clothing needs — from everyday home wear to formal office attire — ensuring 
              each piece is cleaned with expert care. Our services go beyond garments, offering shoe cleaning, curtain cleaning, 
              carpet cleaning, and more to provide complete home care solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {/* Card 1 - Wash & Fold */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
              <div className="mb-4">
                <Shirt className="w-12 h-12 text-gray-700 mx-auto stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Wash & Fold</h3>
              <p className="text-gray-600 text-sm mb-4 min-h-[40px]">Fresh, clean, neatly folded clothes.<br />Perfect for everyday wear.</p>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-6" onClick={handleBookNow}>
                Book Now
              </Button>
            </div>

            {/* Card 2 - Wash & Iron */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
              <div className="mb-4">
                <Sparkles className="w-12 h-12 text-gray-700 mx-auto stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Wash & Iron</h3>
              <p className="text-gray-600 text-sm mb-4 min-h-[40px]">Clean, crisp, wrinkle-free garments.<br />Ready to wear daily.</p>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-6" onClick={handleBookNow}>
                Book Now
              </Button>
            </div>

            {/* Card 3 - Premium Laundry */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
              <div className="mb-4">
                <Award className="w-12 h-12 text-gray-700 mx-auto stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Premium Laundry</h3>
              <p className="text-gray-600 text-sm mb-4 min-h-[40px]">Gentle care for special fabrics.<br />Extra attention to detail.</p>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-6" onClick={handleBookNow}>
                Book Now
              </Button>
            </div>

            {/* Card 4 - Dry Clean */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
              <div className="mb-4">
                <Shield className="w-12 h-12 text-gray-700 mx-auto stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Dry Clean</h3>
              <p className="text-gray-600 text-sm mb-4 min-h-[40px]">Delicate care for formal wear.<br />Suits, blazers & more.</p>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-6" onClick={handleBookNow}>
                Book Now
              </Button>
            </div>

            {/* Card 5 - Steam Press */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
              <div className="mb-4">
                <Zap className="w-12 h-12 text-gray-700 mx-auto stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Steam Press</h3>
              <p className="text-gray-600 text-sm mb-4 min-h-[40px]">Smooth, polished finish with steam.<br />Professional ironing service.</p>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-6" onClick={handleBookNow}>
                Book Now
              </Button>
            </div>

            {/* Card 6 - Starching */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
              <div className="mb-4">
                <Star className="w-12 h-12 text-gray-700 mx-auto stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Starching</h3>
              <p className="text-gray-600 text-sm mb-4 min-h-[40px]">Perfect, lasting stiffness for clothes.<br />Ideal for cottons & sarees.</p>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-6" onClick={handleBookNow}>
                Book Now
              </Button>
            </div>

            {/* Card 7 - Premium Steam Press */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
              <div className="mb-4">
                <CheckCircle className="w-12 h-12 text-gray-700 mx-auto stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Premium Steam Press</h3>
              <p className="text-gray-600 text-sm mb-4 min-h-[40px]">Extra-fine, careful press service.<br />For premium outfits only.</p>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-6" onClick={handleBookNow}>
                Book Now
              </Button>
            </div>

            {/* Card 8 - Premium Dry Clean */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
              <div className="mb-4">
                <Truck className="w-12 h-12 text-gray-700 mx-auto stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Premium Dry Clean</h3>
              <p className="text-gray-600 text-sm mb-4 min-h-[40px]">Luxury care for branded items.<br />Designer clothing experts.</p>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-6" onClick={handleBookNow}>
                Book Now
              </Button>
            </div>
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button 
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                  onClick={handleBookNow}
                >
                  <Truck className="w-5 h-5 mr-2" />
                  Book New Order
                </Button>
              ) : (
                <Button 
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                  onClick={handleBookNow}
                >
                  <Truck className="w-5 h-5 mr-2" />
                  Schedule Free Pickup
                </Button>
              )}
              <Link href="https://wa.me/919876543210" target="_blank">
                <Button variant="outline" className="border-teal-500 text-teal-500 hover:bg-teal-50">
                  Chat on WhatsApp
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-b from-cyan-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-teal-500 font-semibold mb-2">Best Dry Clean And Laundry Service in India</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">What our Customer have to say...</h2>
          </div>

          <TestimonialsCarousel />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-teal-500 to-cyan-600">
        <div className="container mx-auto px-4">
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group">
                  <div className="text-4xl md:text-5xl font-bold mb-2 animate-pulse bg-white/20 rounded h-12 w-20 mx-auto"></div>
                  <div className="text-teal-100 animate-pulse bg-white/10 rounded h-4 w-24 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : statsError ? (
            <div className="text-center text-white">
              <p className="text-lg mb-4">Unable to load latest statistics</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="group">
                  <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">50K+</div>
                  <div className="text-teal-100">Happy Customers</div>
                </div>
                <div className="group">
                  <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">20+</div>
                  <div className="text-teal-100">Cities Covered</div>
                </div>
                <div className="group">
                  <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">1M+</div>
                  <div className="text-teal-100">Orders Completed</div>
                </div>
                <div className="group">
                  <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">4.9</div>
                  <div className="text-teal-100">Average Rating</div>
                </div>
              </div>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <div className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.overview.totalCustomers.toLocaleString()}+
                </div>
                <div className="text-teal-100">Happy Customers</div>
              </div>
              <div className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.overview.totalCities}+
                </div>
                <div className="text-teal-100">Cities Covered</div>
              </div>
              <div className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.overview.completedOrders.toLocaleString()}+
                </div>
                <div className="text-teal-100">Orders Completed</div>
              </div>
              <div className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.overview.averageRating}
                </div>
                <div className="text-teal-100">Average Rating</div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Ready to Experience Premium Care?</h2>
          <p className="text-xl text-gray-800 font-semibold mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust LaundryLobby for their laundry and dry cleaning needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/customer/orders/new">
                <Button size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Truck className="w-5 h-5 mr-2" />
                  Book New Order
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login?redirect=/customer/orders/new">
                <Button size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Truck className="w-5 h-5 mr-2" />
                  Get Started Now
                </Button>
              </Link>
            )}
            <Link href="tel:+919876543210">
              <Button size="lg" variant="outline" className="border-2 border-teal-500 text-teal-600 hover:bg-teal-50">
                <Phone className="w-5 h-5 mr-2" />
                Call Us Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Scroll Banner & Image Gallery Section */}
      <ScrollBannerSection isAuthenticated={isAuthenticated} onGalleryVisible={handleGalleryVisible} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">LaundryLobby</span>
              </div>
              <p className="text-gray-400 mb-4">Premium laundry and dry cleaning services at your doorstep across India.</p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-colors cursor-pointer">
                  <Facebook className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-colors cursor-pointer">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-colors cursor-pointer">
                  <Twitter className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Wash & Fold</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Dry Cleaning</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Shoe Cleaning</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Curtain Cleaning</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@LaundryLobby.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Available in {stats ? `${stats.overview.totalCities}+` : '20+'} Cities</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LaundryLobby. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
