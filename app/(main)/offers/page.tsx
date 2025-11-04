"use client";

import React from "react";
import Link from "next/link";
import { useGetAllOffersQuery } from "@/app/redux/features/offer/offer.api";
import { Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface CountdownTimerProps {
  endAt: string;
}

function CountdownTimer({ endAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const endDate = new Date(endAt).getTime();
      const now = new Date().getTime();
      const difference = endDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endAt]);

  if (timeLeft.expired) {
    return (
      <div className="text-center py-2">
        <div className="text-sm text-gray-500">Offer Expired</div>
      </div>
    );
  }

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-3 min-w-[60px] text-center border border-gray-700/50">
        <span className="text-white text-2xl font-bold">{String(value).padStart(2, "0")}</span>
      </div>
      <span className="text-white text-xs mt-1.5 font-medium">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-3">
      <TimeBox value={timeLeft.days} label="DAY" />
      <TimeBox value={timeLeft.hours} label="HRS" />
      <TimeBox value={timeLeft.minutes} label="MIN" />
      <TimeBox value={timeLeft.seconds} label="SEC" />
    </div>
  );
}

export default function OffersPage() {
  const { data, isLoading, isError } = useGetAllOffersQuery(undefined);
  const offers = (data?.data as any[]) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-2xl overflow-hidden bg-white">
              <Skeleton className="h-64 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Offers</h1>
          <p className="text-gray-600">Check out our latest deals and promotions</p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load offers. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Filter to show only active offers
  const activeOffers = offers.filter((offer: any) => offer.status === "active");

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Offers</h1>
        <p className="text-gray-600">Check out our latest deals and promotions</p>
      </div>

      {activeOffers.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No offers available</h3>
          <p className="text-gray-600">Check back soon for exciting deals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOffers.map((offer: any) => (
            <div
              key={offer._id}
              className="relative border rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative w-full h-64 overflow-hidden">
                <img
                  src={offer.imageUrl}
                  alt="Special offer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Gradient overlay for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Countdown Timer */}
                {offer.endAt && (
                  <div className="mb-4">
                    <CountdownTimer endAt={offer.endAt} />
                  </div>
                )}

                {/* View Details Button */}
                {offer.urlLink ? (
                  <Link
                    href={offer.urlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg py-2.5 shadow-lg">
                      View Details
                    </Button>
                  </Link>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-gray-400 text-white font-medium rounded-lg py-2.5 cursor-not-allowed"
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
