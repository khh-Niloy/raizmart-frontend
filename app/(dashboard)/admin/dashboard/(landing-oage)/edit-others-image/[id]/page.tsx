"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import {
  useGetOthersImagesQuery,
  useUpdateOthersImageMutation,
} from "@/app/redux/features/other-images/other-images.api";
import { IMAGE_ACCEPT, validateImageFileChange } from "@/lib/imageValidation";

const othersImageUpdateSchema = z.object({
  redirectUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
      message: "Provide a valid URL starting with http:// or https://",
    }),
  status: z.enum(["active", "inactive"], {
    required_error: "Status is required",
  }),
});

type OthersImageUpdateForm = z.infer<typeof othersImageUpdateSchema>;

interface OthersImage {
  _id: string;
  id?: string;
  imageUrl: string;
  redirectUrl?: string;
  status?: string;
}

export default function EditOthersImagePage() {
  const router = useRouter();
  const params = useParams();
  const othersImageId = params?.id as string;

  const {
    data,
    isLoading: isLoadingImages,
    isError,
  } = useGetOthersImagesQuery(undefined);

  const [updateOthersImage, { isLoading: isUpdating }] =
    useUpdateOthersImageMutation();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OthersImageUpdateForm>({
    resolver: zodResolver(othersImageUpdateSchema),
    defaultValues: {
      redirectUrl: "",
      status: "active",
    },
  });

  const othersImages: OthersImage[] = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  const currentOthersImage = useMemo(
    () =>
      othersImages.find(
        (image) => (image._id ?? image.id) === othersImageId
      ),
    [othersImages, othersImageId]
  );

  useEffect(() => {
    if (currentOthersImage) {
      setValue("redirectUrl", currentOthersImage.redirectUrl ?? "");
      const normalizedStatus =
        currentOthersImage.status === "inactive" ? "inactive" : "active";
      setValue("status", normalizedStatus);
      setPreviewImage(currentOthersImage.imageUrl);
    }
  }, [currentOthersImage, setValue]);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isValid = validateImageFileChange(event);
    if (!isValid) {
      setSelectedFile(null);
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const localPreview = URL.createObjectURL(file);
      setPreviewImage(localPreview);
    }
  };

  const onSubmit = async (values: OthersImageUpdateForm) => {
    if (!othersImageId) {
      toast.error("Invalid others image identifier.");
      return;
    }

    try {
      await updateOthersImage({
        id: othersImageId,
        image: selectedFile ?? undefined,
        redirectUrl: values.redirectUrl?.trim() || undefined,
        status: values.status,
      }).unwrap();

      toast.success("Others image updated successfully!");
      router.push("/admin/dashboard/all-other-images");
    } catch (error) {
      console.error("Update others image error:", error);
      toast.error("Failed to update others image.");
    }
  };

  if (isLoadingImages) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-48 text-gray-600">
          Loading others image...
        </div>
      </div>
    );
  }

  if (isError || !currentOthersImage) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Others Image Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t load the requested others image. It may have been
              removed or the link is invalid.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/dashboard/all-other-images")}
            >
              Back to all others images
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Others Image</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">Replace Image (optional)</Label>
              <Input
                id="image"
                type="file"
                accept={IMAGE_ACCEPT}
                onChange={handleImageChange}
              />
              {previewImage && (
                <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <Image
                    src={previewImage}
                    alt="Others image preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirectUrl">Redirect URL</Label>
              <Input
                id="redirectUrl"
                placeholder="https://example.com"
                {...register("redirectUrl")}
              />
              {errors.redirectUrl && (
                <p className="text-sm text-red-600">
                  {errors.redirectUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-600">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/dashboard/all-other-images")}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Others Image"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


