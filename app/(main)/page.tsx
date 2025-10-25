import OtherImages from "@/components/main/landing/OtherImages/OtherImages";
import Slider from "@/components/main/landing/Slider/Slider";
import React from "react";
import WhyChooseUs from "./landing/components/WhyChooseUs/WhyChooseUs";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-8">
        {/* Desktop Layout - Large screens and up */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Side - Slider (2/3 width) */}
            <div className="col-span-2 mt-7 h-[490px]">
              <Slider />
            </div>
            
            {/* Right Side - Other Images (1/3 width) */}
            <div className="col-span-1 mt-7">
              <OtherImages />
            </div>
          </div>
        </div>

        {/* Mobile Layout - Below lg breakpoint */}
        <div className="lg:hidden space-y-6">
          {/* Mobile: Slider first */}
          <div>
            <Slider />
          </div>
          
          {/* Mobile: Other Images below */}
          <div>
            <OtherImages />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <WhyChooseUs />
      </div>
    </div>
  );
}
