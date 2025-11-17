"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function ExploreCollectionsButton() {
  const handleScroll = () => {
    document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Button 
      onClick={handleScroll}
      className="inline-flex items-center gap-2 rounded-full bg-[#02C1BE] px-6 py-3 text-sm font-semibold text-white shadow-[0_25px_45px_-25px_rgba(5,150,145,0.7)] hover:bg-[#01b1ae]"
    >
      Explore collections
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

