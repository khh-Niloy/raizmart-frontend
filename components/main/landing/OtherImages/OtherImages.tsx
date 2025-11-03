"use client";

import React from "react";
import { useGetOthersImagesQuery } from "@/app/redux/features/other-images/other-images.api";
import { ExternalLink } from "lucide-react";

export default function OtherImages() {
  const { data, isLoading, error } = useGetOthersImagesQuery(undefined);

  // Debug logging
  // console.log('Other Images data:', data);
  // console.log('Other Images loading:', isLoading);
  // console.log('Other Images error:', error);

  const othersImages = data?.data || [];

  // Filter only active other images
  const activeOthersImages = othersImages.filter(
    (image: any) => image.status === "active"
  );

  // console.log('All other images:', othersImages);
  // console.log('Active other images:', activeOthersImages);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-[232px] bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || activeOthersImages.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-[232px] bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">
            {error ? `Error: ${error}` : "No active other images available"}
          </div>
        </div>
        <div className="h-[232px] bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">
            {error ? `Error: ${error}` : "No active other images available"}
          </div>
        </div>
      </div>
    );
  }

  // Take only the first 2 images
  const displayImages = activeOthersImages.slice(0, 2);

  console.log("Display images:", displayImages);
  displayImages.forEach(
    (
      image: { imageUrl: string; redirectUrl: string; _id: string },
      index: number
    ) => {
      console.log(`Other Image ${index + 1}:`, image);
      console.log(`Other Image ${index + 1} URL:`, image.imageUrl);
    }
  );

  return (
    <div className="space-y-4">
      {displayImages.map(
        (
          image: { imageUrl: string; redirectUrl: string; _id: string },
          index: number
        ) => (
          <div
            key={image._id}
            className="relative h-[232px] rounded-lg overflow-hidden"
          >
            <img
              src={image.imageUrl}
              alt={`Other image ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("❌ Other image failed to load:", image.imageUrl);
              }}
              onLoad={() => {
                console.log(
                  "✅ Other image loaded successfully:",
                  image.imageUrl
                );
              }}
              onLoadStart={() => {
                console.log("🔄 Starting to load other image:", image.imageUrl);
              }}
            />

            {/* Clickable overlay if redirect URL exists */}
            {image.redirectUrl && (
              <a
                href={image.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0"
              />
            )}
          </div>
        )
      )}

      {/* Fill empty slots if less than 2 images */}
      {displayImages.length < 2 && (
        <div className="h-[232px] bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Additional content coming soon</div>
        </div>
      )}
    </div>
  );
}
