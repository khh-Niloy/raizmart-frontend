import OtherImages from "@/components/main/landing/OtherImages/OtherImages";
import Slider from "@/components/main/landing/Slider/Slider";
import React from "react";
import WhyChooseUs from "@/components/main/landing/whyChooseUs/WhyChooseUs";
import FeaturedProducts from "@/components/main/landing/FeaturedProducts/FeaturedProducts";
import BrandProducts from "@/components/main/landing/BrandProducts/BrandProducts";
import NewArrivals from "@/components/main/landing/NewArrivals/NewArrivals";
import TrendingProducts from "@/components/main/landing/TrendingProducts/TrendingProducts";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative pt-10">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
        <div className="relative flex flex-col gap-16 pb-16">
          {/* Hero Section */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 md:pt-8 mt-20 md:mt-0 lg:pt-12">
            <section className="rounded-3xl border border-white/80 bg-white/95 shadow-[0_50px_120px_-60px_rgba(5,150,145,0.55)] backdrop-blur-sm transition">
              <div className="flex flex-col gap-10 p-6 sm:p-8 lg:p-12">
                <div className="flex md:flex-row flex-col gap-10 md:gap-0 justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#02C1BE]">
                      Your trusted marketplace
                    </p>

                    <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl">
                      Shop with flexible payment options, fast delivery, and
                      dedicated after-sales support.
                    </p>
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                      <Button className="inline-flex items-center gap-2 rounded-full bg-[#02C1BE] px-6 py-3 text-sm font-semibold text-white shadow-[0_25px_45px_-25px_rgba(5,150,145,0.7)] hover:bg-[#01b1ae]">
                        Explore collections
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <div className="flex gap-6 text-sm text-slate-600">
                        <div>
                          <p className="font-semibold text-slate-900">50K+</p>
                          <p>Happy customers</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">1.2K</p>
                          <p>Trusted brands</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="">
                    <h1 className="text-3xl sm:text-4xl md:text-right text-left lg:text-5xl font-bold text-slate-900 leading-tight">
                      Discover premium tech and lifestyle essentials
                    </h1>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                  <div className="order-1 space-y-6 lg:order-none">
                    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_40px_90px_-60px_rgba(5,150,145,0.5)]">
                      <Slider />
                    </div>
                  </div>
                  <div className="order-2 flex flex-col gap-4 lg:order-none lg:self-stretch">
                    <div className="flex-1 min-h-[260px]">
                      <OtherImages />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>


          <div className="mx-auto w-[95%]">
            <div className="flex flex-col gap-4 ">
              <div className="">
                <FeaturedProducts />
              </div>
              <div className="">
                <TrendingProducts />
              </div>
              <div className="">
                <NewArrivals />
              </div>
              <div className="">
                <BrandProducts />
              </div>
            </div>
          </div>

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14">
            <WhyChooseUs />
          </div>
        </div>
      </div>
    </div>
  );
}
