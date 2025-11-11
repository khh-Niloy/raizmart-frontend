"use client";

import React from "react";
import Image from "next/image";
import { useGetOthersImagesQuery } from "@/app/redux/features/other-images/other-images.api";

export default function OtherImages() {
  const { data, isLoading, error } = useGetOthersImagesQuery(undefined);

  // Debug logging
  // console.log('Other Images data:', data);
  // console.log('Other Images loading:', isLoading);
  // console.log('Other Images error:', error);

  const othersImages = data || [];

  interface OtherImage {
    _id: string;
    imageUrl: string;
    redirectUrl?: string;
    status?: string;
    [key: string]: unknown;
  }

  // Filter only active other images
  const activeOthersImages = (othersImages as OtherImage[]).filter(
    (image: OtherImage) => image.status === "active"
  );

  // console.log('All other images:', othersImages);
  // console.log('Active other images:', activeOthersImages);

  const SLOTS = 2;

  const renderGridWrapper = (children: React.ReactNode, count = SLOTS) => (
    <div
      className="grid gap-4 sm:gap-5 h-full"
      style={{
        gridTemplateRows: `repeat(${count}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );

  if (isLoading) {
    return renderGridWrapper(
      Array.from({ length: SLOTS }).map((_, i) => (
        <div
          key={i}
          className="relative aspect-[16/9] w-full rounded-2xl bg-gray-200 animate-pulse"
        />
      )),
      SLOTS
    );
  }

  if (error || activeOthersImages.length === 0) {
    return renderGridWrapper(
      Array.from({ length: SLOTS }).map((_, i) => (
        <div
          key={i}
          className="relative aspect-[16/9] w-full rounded-2xl bg-gray-100 flex items-center justify-center text-center px-4"
        >
          <div className="text-gray-500 text-sm">
            {error ? `Error: ${error}` : "Additional content coming soon"}
          </div>
        </div>
      )),
      SLOTS
    );
  }

  // Take only the first 2 images
  const displayImages = activeOthersImages.slice(0, 2);
  const slotCount = Math.max(displayImages.length, SLOTS);

  // console.log("Display images:", displayImages);

  return renderGridWrapper(
    <>
      {displayImages.map(
        (
          image: OtherImage,
          index: number
        ) => (
          <div key={image._id} className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden">
            <Image
              src={image.imageUrl}
              alt={`Other image ${index + 1}`}
              fill
              className="object-cover"
              unoptimized
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
      {displayImages.length < slotCount &&
        Array.from({ length: slotCount - displayImages.length }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="relative aspect-[16/9] w-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 text-sm"
          >
            Additional content coming soon
          </div>
        ))}
    </>,
    slotCount
  );
}
