"use client";

import React from "react";
import { Calculator, Truck, RotateCcw, ThumbsUp, Headphones } from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: Calculator,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      title: "Flexible EMI Plans",
      description: "Spread your payments up to 36 months with zero hidden fees."
    },
    {
      icon: Truck,
      color: "text-yellow-600", 
      bgColor: "bg-yellow-50",
      title: "Fastest Home Delivery",
      description: "Priority dispatch and real-time tracking on every order."
    },
    {
      icon: RotateCcw,
      color: "text-green-600",
      bgColor: "bg-green-50", 
      title: "Exchange Facility",
      description: "Upgrade with confidence using our hassle-free exchange program."
    },
    {
      icon: ThumbsUp,
      color: "text-red-600",
      bgColor: "bg-red-50",
      title: "Best Price Deals",
      description: "Curated offers from top brands, verified by our experts."
    },
    {
      icon: Headphones,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      title: "After-Sales Support",
      description: "Dedicated specialists to help you long after checkout."
    }
  ];

  return (
    <section className="rounded-3xl border border-gray-100 bg-white shadow-[0_35px_90px_-60px_rgba(5,150,145,0.45)]">
      <div className="px-6 sm:px-10 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-[#02C1BE] uppercase tracking-[0.25em]">Why choose raizmart</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
              Experience tailor-made shopping support
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
              Every purchase comes with premium service, competitive pricing, and a dedicated team to keep your devices performing at their best.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-slate-50/60 p-5 transition hover:-translate-y-1 hover:border-[#02C1BE]/40 hover:bg-white hover:shadow-lg"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${feature.bgColor} transition group-hover:scale-105`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
