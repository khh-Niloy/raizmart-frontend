"use client";

import React from "react";
import Link from "next/link";
import { useGetAllOffersQuery } from "@/app/redux/features/offer/offer.api";
import { Image as ImageIcon, Tag, Clock, ExternalLink } from "lucide-react";
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
      <div className="rounded-full bg-red-100 px-4 py-2 text-center">
        <div className="text-sm font-semibold text-red-600">Offer Expired</div>
      </div>
    );
  }

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-br from-[#02C1BE] to-[#01b1ae] rounded-lg px-3 py-2 min-w-[48px] sm:min-w-[56px] text-center shadow-md border border-[#02C1BE]/30">
        <span className="text-white text-base sm:text-xl font-extrabold">{String(value).padStart(2, "0")}</span>
      </div>
      <span className="text-slate-600 text-[10px] sm:text-xs mt-1.5 font-bold uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <TimeBox value={timeLeft.days} label="Day" />
      <TimeBox value={timeLeft.hours} label="Hrs" />
      <TimeBox value={timeLeft.minutes} label="Min" />
      <TimeBox value={timeLeft.seconds} label="Sec" />
    </div>
  );
}

export default function OffersPage() {
  const { data, isLoading, isError } = useGetAllOffersQuery(undefined);
  const offers = (data?.data as any[]) || [];

  // Helper function to check if offer is expired
  const isOfferExpired = (endAt: string | undefined): boolean => {
    if (!endAt) return false;
    const endDate = new Date(endAt).getTime();
    const now = new Date().getTime();
    return endDate <= now;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 pt-8 lg:pt-12 pb-16">
            <div className="mb-12">
              <Skeleton className="h-10 w-48 mb-4" />
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-3xl border border-gray-200 overflow-hidden bg-white">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 pt-8 lg:pt-12 pb-16">
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-red-600 font-semibold">Failed to load offers. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter to show only active offers
  const activeOffers = offers.filter((offer: any) => offer.status === "active");

  return (
    <div className="min-h-screen bg-slate-50 pt-10">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
        <div className="relative flex flex-col gap-16 pb-16">
          {/* Header Section */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 pt-8 lg:pt-12">
            <section className="rounded-3xl border border-white/70 bg-white/95 p-6 sm:p-8 lg:p-12 shadow-[0_30px_90px_-60px_rgba(5,150,145,0.45)]">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#02C1BE]/10 px-4 py-2 mb-4">
                  <Tag className="h-4 w-4 text-[#02C1BE]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#02C1BE]">Special Offers</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                  Exclusive Deals & Promotions
                </h1>
                <p className="text-base sm:text-lg text-slate-600">
                  Discover limited-time offers, flash sales, and special discounts on premium products. Don't miss out!
                </p>
              </div>
            </section>
          </div>

          {/* Offers Grid */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14">
            {activeOffers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#02C1BE]/30 bg-[#f7fffe] p-12 text-center">
                <Tag className="h-12 w-12 text-[#02C1BE] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No offers available</h3>
                <p className="text-slate-600">Check back soon for exciting deals and promotions!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOffers.map((offer: any) => {
                  const expired = isOfferExpired(offer.endAt);
                  
                  return (
                    <div
                      key={offer._id}
                      className={`group relative flex flex-col rounded-3xl border border-white/70 bg-white/95 overflow-hidden shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)] transition ${
                        expired ? "opacity-75" : "hover:-translate-y-1 hover:shadow-[0_30px_90px_-55px_rgba(5,150,145,0.6)]"
                      }`}
                    >
                      {/* Image Container */}
                      <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        <img
                          src={offer.imageUrl}
                          alt={offer.title || "Special offer"}
                          className={`w-full h-full object-cover transition-transform duration-500 ${
                            expired ? "" : "group-hover:scale-110"
                          }`}
                        />
                        
                        {/* Expired Badge - Overlay on Image (only if expired) */}
                        {offer.endAt && expired && (
                          <div className="absolute top-4 left-4 right-4 z-10">
                            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/95 backdrop-blur-sm px-4 py-2 shadow-lg border border-red-400">
                              <Clock className="h-4 w-4 text-white" />
                              <span className="text-sm font-bold text-white">Expired</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="flex flex-col flex-1 p-6">
                        {offer.title && (
                          <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{offer.title}</h3>
                        )}
                        {offer.description && (
                          <p className="text-sm text-slate-600 mb-5 line-clamp-2 leading-relaxed">{offer.description}</p>
                        )}

                        {/* Countdown Timer - Above Button (only if not expired) */}
                        {offer.endAt && !expired && (
                          <div className="mb-4">
                            <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-3 shadow-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2.5">
                                <Clock className="h-3.5 w-3.5 text-[#02C1BE]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Ends in</span>
                              </div>
                              <CountdownTimer endAt={offer.endAt} />
                            </div>
                          </div>
                        )}

                        {/* View Details Button */}
                        <div className="mt-auto">
                          {expired ? (
                            <Button
                              disabled
                              className="w-full bg-gray-200 text-gray-500 font-semibold rounded-xl py-3 cursor-not-allowed shadow-none"
                            >
                              <span>Offer Expired</span>
                            </Button>
                          ) : offer.urlLink ? (
                            <Link
                              href={offer.urlLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button className="w-full bg-gradient-to-r from-[#02C1BE] to-[#01b1ae] hover:from-[#01b1ae] hover:to-[#02C1BE] text-white font-semibold rounded-xl py-3 shadow-[0_8px_20px_-8px_rgba(5,150,145,0.6)] transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(5,150,145,0.7)]">
                                <span>View Offer</span>
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              disabled
                              className="w-full bg-gray-200 text-gray-500 font-semibold rounded-xl py-3 cursor-not-allowed shadow-none"
                            >
                              View Offer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
