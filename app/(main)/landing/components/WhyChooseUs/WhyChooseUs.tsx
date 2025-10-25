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
      title: "Fastest Delivery"
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
    <div className="w-full">
      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-lg px-6 py-4 hover:bg-gray-100 transition-all duration-300 hover:shadow-md">
            <div className={`p-1 rounded-lg ${feature.bgColor} shadow-sm`}>
              <feature.icon className={`w-6 h-6 ${feature.color}`} />
            </div>
            <span className="text-gray-800 font-semibold text-sm md:text-base whitespace-nowrap">
              {feature.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
