"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  useGetOfferByIdQuery,
  useUpdateOfferMutation,
} from "@/app/redux/features/offer/offer.api";
import Link from "next/link";

// Schema: All fields optional for easy updates
const updateOfferSchema = z.object({
  image: z.instanceof(File).optional(),
  imageUrl: z.string().optional(),
  urlLink: z.string().optional(),
  endAt: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

type UpdateOfferForm = z.infer<typeof updateOfferSchema>;

// Helper to convert ISO date to datetime-local format
const isoToDatetimeLocal = (isoString: string | undefined | null): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    // Convert to local datetime-local format (YYYY-MM-DDTHH:mm)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
};

export default function EditOfferPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [preview, setPreview] = useState<string | null>(null);
  const [hasNewImage, setHasNewImage] = useState(false);

  const { data, isLoading, error } = useGetOfferByIdQuery(id, {
    skip: !id,
  });
  const [updateOffer, { isLoading: isSubmitting }] = useUpdateOfferMutation();

  const offer = (data?.data as any) || data;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateOfferForm>({
    resolver: zodResolver(updateOfferSchema),
    defaultValues: {
      image: undefined,
      imageUrl: offer?.imageUrl || "",
      urlLink: offer?.urlLink || "",
      endAt: offer?.endAt ? isoToDatetimeLocal(offer.endAt) : "",
      status: (offer?.status || "active") as "active" | "inactive" | undefined,
    },
  });

  // Watch imageUrl to handle existing image
  const imageUrl = watch("imageUrl");

  // Populate form when offer data loads - use reset to avoid race conditions
  useEffect(() => {
    if (offer) {
      reset({
        image: undefined,
        imageUrl: offer.imageUrl || "",
        urlLink: offer.urlLink || "",
        endAt: isoToDatetimeLocal(offer.endAt),
        status: (offer.status || "active") as "active" | "inactive",
      });
      // Set preview to existing image
      if (offer.imageUrl) {
        setPreview(offer.imageUrl);
      }
    }
  }, [offer, reset]);

  const handleImageChange = (file: File | undefined) => {
    if (file) {
      setValue("image", file);
      setHasNewImage(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview((e.target?.result as string) || null);
      };
      reader.readAsDataURL(file);
    } else {
      setValue("image", undefined);
      setHasNewImage(false);
      // Restore existing image preview
      if (imageUrl) {
        setPreview(imageUrl);
      } else {
        setPreview(null);
      }
    }
  };

  const onSubmit = async (data: UpdateOfferForm) => {
    try {
      // Build payload - only include fields that user wants to update
      const payload: {
        id: string;
        image?: File;
        imageUrl?: string;
        urlLink?: string;
        endAt?: string | null;
        status?: "active" | "inactive";
      } = {
        id,
      };

      // Handle image: if new image uploaded, use it; otherwise keep existing imageUrl
      if (hasNewImage && data.image) {
        payload.image = data.image;
      } else if (!hasNewImage && data.imageUrl) {
        // Keep existing image
        payload.imageUrl = data.imageUrl;
      }

      // Handle urlLink - include if provided (can be empty string to clear)
      if (data.urlLink !== undefined) {
        payload.urlLink = data.urlLink || "";
      }

      // Handle endAt - include if provided (can be empty string to clear)
      if (data.endAt !== undefined) {
        payload.endAt = data.endAt && data.endAt.trim() !== "" ? data.endAt : null;
      }

      // Handle status - include if provided
      if (data.status !== undefined) {
        payload.status = data.status;
      }

      await updateOffer(payload).unwrap();
      toast.success("Offer updated successfully");
      router.push("/admin/dashboard/all-offer");
    } catch (e: any) {
      const errorMessage =
        e?.data?.message || e?.message || "Failed to update offer";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Offer</h1>
          <p className="text-gray-600">Loading offer details...</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
              <div className="h-40 w-full bg-gray-200 animate-pulse rounded" />
              <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Offer</h1>
          <p className="text-red-600">Error loading offer. Offer may not exist.</p>
        </div>
        <Link href="/admin/dashboard/all-offer">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Offers
          </Button>
        </Link>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Offer</h1>
          <p className="text-red-600">Offer not found</p>
        </div>
        <Link href="/admin/dashboard/all-offer">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Offers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/dashboard/all-offer">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Offer</h1>
        <p className="text-gray-600">
          Update offer details. All fields are optional - only update what you need to change.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Offer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image upload */}
            <div className="space-y-2">
              <Label>Image (Optional - upload new or keep existing)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files?.[0])}
              />
              {preview && (
                <div className="space-y-2">
                  <div className="relative w-full h-48 border border-gray-200 rounded overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {hasNewImage && (
                      <button
                        type="button"
                        onClick={() => handleImageChange(undefined)}
                        className="absolute top-2 right-2 bg-white/90 border rounded p-1 hover:bg-white"
                        aria-label="Remove new image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {!hasNewImage && (
                    <p className="text-xs text-gray-500">
                      Current image. Upload a new file to replace it.
                    </p>
                  )}
                  {hasNewImage && (
                    <p className="text-xs text-green-600">
                      New image selected. This will replace the current image.
                    </p>
                  )}
                </div>
              )}
              {errors.image && (
                <p className="text-sm text-red-600">
                  {errors.image.message as string}
                </p>
              )}
            </div>

            {/* URL input */}
            <div className="space-y-2">
              <Label>URL Link (Optional - leave empty to clear)</Label>
              <Input
                type="url"
                placeholder="https://example.com"
                {...register("urlLink")}
              />
              <p className="text-xs text-gray-500">
                Leave empty to remove the URL link from this offer.
              </p>
              {errors.urlLink && (
                <p className="text-sm text-red-600">
                  {errors.urlLink.message as string}
                </p>
              )}
            </div>

            {/* End date-time */}
            <div className="space-y-2">
              <Label>End Date & Time (Optional - leave empty to clear)</Label>
              <Input
                type="datetime-local"
                {...register("endAt")}
              />
              <p className="text-xs text-gray-500">
                Leave empty to remove the end date from this offer.
              </p>
              {errors.endAt && (
                <p className="text-sm text-red-600">
                  {errors.endAt.message as string}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status (Optional)</Label>
              <Controller
                key={offer?._id || "status"} // Force re-render when offer loads
                name="status"
                control={control}
                defaultValue={offer?.status || "active"}
                render={({ field }) => {
                  // Ensure we always have a valid value
                  const currentValue = field.value || offer?.status || "active";
                  return (
                    <Select
                      value={currentValue}
                      onValueChange={(value) =>
                        field.onChange(value as "active" | "inactive")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.status && (
                <p className="text-sm text-red-600">
                  {errors.status.message as string}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/dashboard/all-offer">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Offer"}
          </Button>
        </div>
      </form>
    </div>
  );
}

