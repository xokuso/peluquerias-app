'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SalonTemplate } from '@/data/salon-templates'
import TemplateCard from './TemplateCard'
import { cn } from '@/lib/utils'

interface TemplateCarouselProps {
  templates: SalonTemplate[]
  onSelectTemplate: (templateId: string) => void
  selectedTemplateId?: string | undefined
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  className?: string
}

/**
 * TemplateCarousel - Optimized for conversion with psychology-based navigation
 * Implements the UX specifications for template discovery and selection
 */
export default function TemplateCarousel({
  templates,
  onSelectTemplate,
  selectedTemplateId,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  className
}: TemplateCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0) // For animation direction
  const [isManualNavigation, setIsManualNavigation] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const carouselRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout>()
  const progressRef = useRef<HTMLDivElement>(null)

  // Responsive slides calculation based on screen size
  const [slidesToShow, setSlidesToShow] = useState(3)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateSlidesToShow = () => {
      const width = window.innerWidth
      if (width < 768) {
        setSlidesToShow(1)
        setIsMobile(true)
      } else if (width < 1024) {
        setSlidesToShow(2)
        setIsMobile(false)
      } else {
        setSlidesToShow(3)
        setIsMobile(false)
      }
    }

    updateSlidesToShow()
    window.addEventListener('resize', updateSlidesToShow)
    return () => window.removeEventListener('resize', updateSlidesToShow)
  }, [])

  // Total slides calculation
  const totalSlides = Math.ceil(templates.length / slidesToShow)
  const maxIndex = totalSlides - 1

  // Navigation functions
  const goToSlide = useCallback((index: number, dir: number = 0) => {
    setDirection(dir)
    setCurrentIndex(Math.max(0, Math.min(maxIndex, index)))
    setIsManualNavigation(true)

    // Reset manual navigation flag after a delay
    setTimeout(() => setIsManualNavigation(false), 1000)
  }, [maxIndex])

  const nextSlide = useCallback(() => {
    const nextIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1
    goToSlide(nextIndex, 1)
  }, [currentIndex, maxIndex, goToSlide])

  const prevSlide = useCallback(() => {
    const prevIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1
    goToSlide(prevIndex, -1)
  }, [currentIndex, maxIndex, goToSlide])

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isManualNavigation) {
      autoPlayRef.current = setInterval(() => {
        nextSlide()
      }, autoPlayInterval)
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [autoPlay, autoPlayInterval, isManualNavigation, nextSlide])

  // Touch/Swipe handling for mobile
  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0]?.clientX || 0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX || 0)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        prevSlide()
        break
      case 'ArrowRight':
        e.preventDefault()
        nextSlide()
        break
      case 'Home':
        e.preventDefault()
        goToSlide(0)
        break
      case 'End':
        e.preventDefault()
        goToSlide(maxIndex)
        break
    }
  }

  // Drag handling for desktop
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50
    if (info.offset.x > threshold) {
      prevSlide()
    } else if (info.offset.x < -threshold) {
      nextSlide()
    }
  }

  // Get templates for current slide
  const getCurrentSlideTemplates = () => {
    const startIndex = currentIndex * slidesToShow
    return templates.slice(startIndex, startIndex + slidesToShow)
  }

  // Slide animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  return (
    <div
      className={cn('relative w-full', className)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Galería de plantillas de peluquería"
      aria-describedby="carousel-description"
    >
      {/* Screen reader description */}
      <div id="carousel-description" className="sr-only">
        Navega entre {templates.length} plantillas usando las flechas del teclado o los botones de navegación.
        Plantilla {currentIndex + 1} de {totalSlides} grupos mostrada actualmente.
      </div>

      {/* Main carousel container */}
      <div
        ref={carouselRef}
        className="overflow-hidden rounded-xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag={!isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              'grid gap-6',
              slidesToShow === 1 && 'grid-cols-1',
              slidesToShow === 2 && 'grid-cols-2',
              slidesToShow === 3 && 'grid-cols-3'
            )}
          >
            {getCurrentSlideTemplates().map((template, index) => {
              // Calculate if this template should be prioritized for loading
              const isInFirstSlide = currentIndex === 0
              const isPriority = isInFirstSlide && index < slidesToShow

              return (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={onSelectTemplate}
                  isActive={selectedTemplateId === template.id}
                  priority={isPriority}
                  className="h-full"
                />
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {totalSlides > 1 && (
        <>
          {/* Desktop Navigation Arrows */}
          <div className="hidden md:block">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2 z-10',
                'w-12 h-12 rounded-full bg-white shadow-lg',
                'flex items-center justify-center',
                'transition-all duration-200',
                'hover:bg-gray-50 hover:shadow-xl',
                'focus:outline-none focus:ring-2 focus:ring-orange-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Plantillas anteriores"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <button
              onClick={nextSlide}
              disabled={currentIndex === maxIndex}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 z-10',
                'w-12 h-12 rounded-full bg-white shadow-lg',
                'flex items-center justify-center',
                'transition-all duration-200',
                'hover:bg-gray-50 hover:shadow-xl',
                'focus:outline-none focus:ring-2 focus:ring-orange-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Siguientes plantillas"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Mobile Navigation Buttons */}
          <div className="flex md:hidden justify-center gap-4 mt-6">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={cn(
                'px-4 py-2 rounded-lg bg-gray-100',
                'flex items-center gap-2',
                'transition-all duration-200',
                'hover:bg-gray-200',
                'focus:outline-none focus:ring-2 focus:ring-orange-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Plantilla anterior"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Anterior</span>
            </button>

            <button
              onClick={nextSlide}
              disabled={currentIndex === maxIndex}
              className={cn(
                'px-4 py-2 rounded-lg bg-gray-100',
                'flex items-center gap-2',
                'transition-all duration-200',
                'hover:bg-gray-200',
                'focus:outline-none focus:ring-2 focus:ring-orange-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Siguiente plantilla"
            >
              <span className="text-sm">Siguiente</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots Navigation */}
          {showDots && totalSlides > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'w-3 h-3 rounded-full transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1',
                    currentIndex === index
                      ? 'bg-orange-500 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  )}
                  aria-label={`Ir al grupo de plantillas ${index + 1}`}
                  aria-current={currentIndex === index ? 'true' : 'false'}
                />
              ))}
            </div>
          )}

          {/* Progress Indicator for Auto-play */}
          {autoPlay && !isManualNavigation && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  ref={progressRef}
                  className="h-full bg-orange-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: autoPlayInterval / 1000,
                    ease: 'linear'
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Swipe Hint for Mobile */}
      {isMobile && totalSlides > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-xs"
            >
              👆
            </motion.div>
            <span>Desliza para ver más plantillas</span>
          </div>
        </div>
      )}

      {/* Keyboard Navigation Hint */}
      <div className="sr-only">
        Usa las flechas del teclado para navegar entre plantillas.
        Presiona Tab para navegar por los elementos de cada plantilla.
      </div>
    </div>
  )
}