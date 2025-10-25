"use client";

import React from 'react';
import { Calculator, Truck, RotateCcw, ThumbsUp, Headphones } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: Calculator,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      title: "36 Months EMI"
    },
    {
      icon: Truck,
      color: "text-yellow-600", 
      bgColor: "bg-yellow-50",
      title: "Fastest Home Delivery"
    },
    {
      icon: RotateCcw,
      color: "text-green-600",
      bgColor: "bg-green-50", 
      title: "Exchange Facility"
    },
    {
      icon: ThumbsUp,
      color: "text-red-600",
      bgColor: "bg-red-50",
      title: "Best Price Deals"
    },
    {
      icon: Headphones,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      title: "After Sell Service"
    }
  ];

  return (
    <div className="w-full bg-gray-100 rounded-lg p-8">
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center gap-3">
            <div className={`p-4 rounded-full ${feature.bgColor}`}>
              <feature.icon className={`w-8 h-8 ${feature.color}`} />
            </div>
            <span className="text-gray-700 font-medium text-sm md:text-base text-center">
              {feature.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
