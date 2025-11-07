"use client";

import React from "react";
import {
  Calculator,
  Truck,
  RotateCcw,
  ThumbsUp,
  Headphones,
} from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: Calculator,
      iconColor: "text-purple-600",
      bgGradient: "from-purple-500 to-purple-600",
      title: "36 Months EMI",
      description: "Spread your payments with flexible EMI plans up to 36 months. Zero hidden fees, transparent terms."
    },
    {
      icon: Truck,
      iconColor: "text-yellow-600",
      bgGradient: "from-yellow-500 to-yellow-600",
      title: "Fastest Delivery",
      description: "Priority dispatch and real-time tracking on every order. Get your products delivered quickly and safely."
    },
    {
      icon: RotateCcw,
      iconColor: "text-green-600",
      bgGradient: "from-green-500 to-green-600",
      title: "Exchange Facility",
      description: "Upgrade with confidence using our hassle-free exchange program. Easy returns and replacements."
    },
    {
      icon: ThumbsUp,
      iconColor: "text-red-600",
      bgGradient: "from-red-500 to-red-600",
      title: "Best Price Deals",
      description: "Curated offers from top brands, verified by our experts. Get the best prices guaranteed."
    },
    {
      icon: Headphones,
      iconColor: "text-orange-600",
      bgGradient: "from-orange-500 to-orange-600",
      title: "After Sell Service",
      description: "Dedicated specialists to help you long after checkout. Premium support when you need it most."
    },
  ];

  return (
    <section className="w-full">
      <div className="rounded-3xl border border-white/70 bg-white/95 p-8 sm:p-10 lg:p-12 shadow-[0_30px_90px_-60px_rgba(5,150,145,0.45)]">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            Experience Premium Shopping
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Every purchase comes with premium service, competitive pricing, and dedicated support to keep your devices performing at their best.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative flex flex-col rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-white to-gray-50/30 p-6 transition-all duration-300 hover:border-[#02C1BE]/40 hover:shadow-[0_20px_50px_-30px_rgba(5,150,145,0.5)] hover:-translate-y-1"
            >
              {/* Icon Container */}
              <div className="relative mb-4">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`} />
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.bgGradient} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#02C1BE] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {feature.description}
                </p>
              </div>

              {/* Hover Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#02C1BE] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
