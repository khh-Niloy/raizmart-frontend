"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useGetSlidersQuery } from '@/app/redux/features/slider/slider.api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Slider() {
  const { data, isLoading, error } = useGetSlidersQuery(undefined);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Debug logging
  // console.log('Slider data:', data);
  // console.log('Slider loading:', isLoading);
  // console.log('Slider error:', error);

  const sliders = data?.data || [];
  
  // Filter only active sliders
  interface Slider {
    _id: string;
    imageUrl: string;
    status?: string;
    [key: string]: unknown;
  }

  const activeSliders = (sliders as Slider[]).filter((slider: Slider) => slider.status === 'active');
  
  // console.log('All sliders:', sliders);
  // console.log('Active sliders:', activeSliders);

  // Auto-slide functionality
  useEffect(() => {
    if (activeSliders.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeSliders.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [activeSliders.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSliders.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSliders.length) % activeSliders.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[600px] bg-gray-200 rounded-lg animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">Loading slider...</div>
        </div>
      </div>
    );
  }

  if (error || activeSliders.length === 0) {
    return (
      <div className="relative w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">
          {error ? `Error: ${error}` : 'No active slider images available'}
        </div>
      </div>
    );
  }

  const currentSlider = activeSliders[currentSlide];
  
  // Debug: Show image URL for testing
  // console.log('🔗 Test this image URL in browser:', currentSlider.imageUrl);
  
  // console.log('Current slider:', currentSlider);
  // console.log('Current slider imageUrl:', currentSlider?.imageUrl);
  
  // Test if image URL is accessible
  if (currentSlider?.imageUrl) {
    fetch(currentSlider.imageUrl, { method: 'HEAD' })
      .then(response => {
        // console.log('🔍 Image URL accessibility test:', response.status, response.ok);
        if (!response.ok) {
          // console.error('❌ Image URL not accessible:', currentSlider.imageUrl);
        }
      })
      .catch(() => {
        // console.error('❌ Image URL fetch error:', currentSlider.imageUrl);
      });
  }

  return (
    <div className="relative w-full h-[480px] rounded-lg overflow-hidden group">
      {/* Main Slider Image */}
      <div className="relative w-full h-full">
        <Image
          src={currentSlider.imageUrl}
          alt={`Slider ${currentSlide + 1}`}
          fill
          className="object-cover"
          onError={() => {
            // console.error('❌ Image failed to load:', currentSlider.imageUrl);
          }}
          onLoad={() => {
            // console.log('✅ Image loaded successfully:', currentSlider.imageUrl);
          }}
          onLoadStart={() => {
            // console.log('🔄 Starting to load image:', currentSlider.imageUrl);
          }}
        />
        
        {/* Clickable overlay if redirect URL exists */}
        {typeof currentSlider.redirectUrl === "string" && currentSlider.redirectUrl !== "" && (
          <a 
            href={currentSlider.redirectUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute inset-0"
          />
        )}
      </div>

      {/* Navigation Arrows */}
      {activeSliders.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {activeSliders.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {activeSliders.map((_: Slider, index: number) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-orange-500 scale-110'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
