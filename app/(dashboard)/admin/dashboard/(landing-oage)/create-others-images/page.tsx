"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateOthersImagesMutation } from "@/app/redux/features/other-images/other-images.api";

// Validation schema for others images
const othersImageSchema = z.object({
  image: z.instanceof(File).optional(),
  redirectUrl: z.string().url().optional().or(z.literal("")),
});

const othersImagesSchema = z.object({
  othersImages: z.array(othersImageSchema).length(2, "Exactly 2 others images are required"),
});

type OthersImagesForm = z.infer<typeof othersImagesSchema>;

export default function CreateOthersImagesPage() {
  const [othersPreviewImages, setOthersPreviewImages] = useState<{ [key: number]: string }>({});
  
  const [createOthersImages, { isLoading: isSubmitting }] = useCreateOthersImagesMutation();

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<OthersImagesForm>({
    resolver: zodResolver(othersImagesSchema),
    defaultValues: {
      othersImages: [
        { image: undefined, redirectUrl: "" }, 
        { image: undefined, redirectUrl: "" }
      ],
    },
  });

  // Handle others image upload
  const handleOthersImageUpload = (index: number, file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOthersPreviewImages(prev => ({
          ...prev,
          [index]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
      setValue(`othersImages.${index}.image`, file);
    }
  };

  // Remove others image
  const removeOthersImage = (index: number) => {
    setValue(`othersImages.${index}.image`, undefined);
    const newPreviews = { ...othersPreviewImages };
    delete newPreviews[index];
    setOthersPreviewImages(newPreviews);
  };

  const onSubmit = async (data: OthersImagesForm) => {
    try {
      // Validate that all required fields are filled
      const hasAllOthersImages = data.othersImages.every(others => 
        others.image
      );

      if (!hasAllOthersImages) {
        toast.error("Please upload both others images");
        return;
      }

      // console.log("Others images data being submitted:", {
      //   othersImages: data.othersImages.map(others => ({
      //     hasImage: !!others.image
      //   }))
      // });

      // Prepare data for RTK Query
      const images = data.othersImages.map(others => others.image!);
      const redirectUrls = data.othersImages.map(others => others.redirectUrl || '');

      // Use RTK Query mutation
      await createOthersImages({
        images,
        redirectUrls
      }).unwrap();

      // console.log("Others images uploaded successfully:", result);

      toast.success("Others images uploaded successfully!");
      
      // Reset form after successful submission
      setOthersPreviewImages({});
      
    } catch (error) {
      console.error("Error uploading others images:", error);
      toast.error(`Failed to upload others images: ${(error as Error).message}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Others Images</h1>
        <p className="text-gray-600">Upload 2 additional images for your landing page</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Others Images Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Others Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[0, 1].map((index) => (
              <div key={index} className="space-y-4">
                <div className="space-y-2">
                  <Label>Others Image {index + 1}</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleOthersImageUpload(index, file);
                          }
                        }}
                        className="cursor-pointer"
                      />
                    </div>
                    {othersPreviewImages[index] && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOthersImage(index)}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  {errors.othersImages?.[index]?.image && (
                    <p className="text-sm text-red-600">
                      {errors.othersImages[index]?.image?.message}
                    </p>
                  )}
                </div>

                {/* Image Preview */}
                {othersPreviewImages[index] && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={othersPreviewImages[index]}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Redirect URL */}
                <div className="space-y-2">
                  <Label htmlFor={`othersImages.${index}.redirectUrl`}>Redirect URL (Optional)</Label>
                  <Input
                    {...register(`othersImages.${index}.redirectUrl`)}
                    placeholder="https://example.com"
                    type="url"
                  />
                  {errors.othersImages?.[index]?.redirectUrl && (
                    <p className="text-sm text-red-600">
                      {errors.othersImages[index]?.redirectUrl?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              setOthersPreviewImages({});
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-[#02C1BE] hover:bg-[#02C1BE]/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uploading..." : "Upload Others Images"}
          </Button>
        </div>
      </form>
    </div>
  );
}
