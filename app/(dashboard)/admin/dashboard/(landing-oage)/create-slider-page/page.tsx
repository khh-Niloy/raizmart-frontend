"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateSlidersMutation } from "@/app/redux/features/slider/slider.api";

// Validation schema for slider images
const sliderImageSchema = z.object({
  image: z.instanceof(File).optional(),
  link: z.string().url().optional().or(z.literal("")),
});

const sliderPageSchema = z.object({
  numberOfSliders: z.number().min(1, "At least 1 slider is required").max(20, "Maximum 20 sliders allowed"),
  sliderImages: z.array(sliderImageSchema),
});

type SliderPageForm = z.infer<typeof sliderPageSchema>;

export default function CreateSliderPagePage() {
  const [previewImages, setPreviewImages] = useState<{ [key: number]: string }>({});
  const [showSliderInputs, setShowSliderInputs] = useState(false);
  const [numberOfSliders, setNumberOfSliders] = useState<number | "">("");
  
  const [createSliders, { isLoading: isSubmitting }] = useCreateSlidersMutation();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SliderPageForm>({
    resolver: zodResolver(sliderPageSchema),
    defaultValues: {
      numberOfSliders: 1,
      sliderImages: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sliderImages",
  });

  // Handle save button click - show slider inputs
  const handleSaveSliderCount = () => {
    const count = typeof numberOfSliders === "number" ? numberOfSliders : parseInt(numberOfSliders as string) || 0;
    if (count < 1 || count > 20) {
      toast.error("Please enter a number between 1 and 20");
      return;
    }
    
    // Clear existing fields
    fields.forEach((_, index) => remove(index));
    
      // Add new slider fields based on count
      for (let i = 0; i < count; i++) {
        append({
          image: undefined,
          link: "",
        });
      }
    
    setShowSliderInputs(true);
    setNumberOfSliders(""); // Reset the input value
    toast.success(`Ready to add ${count} slider images!`);
  };

  // Handle image upload
  const handleImageUpload = (index: number, file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => ({
          ...prev,
          [index]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
      setValue(`sliderImages.${index}.image`, file);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setValue(`sliderImages.${index}.image`, undefined);
    const newPreviews = { ...previewImages };
    delete newPreviews[index];
    setPreviewImages(newPreviews);
  };


  const onSubmit = async (data: SliderPageForm) => {
    try {
      // Validate that all required fields are filled
      const hasAllSliderImages = data.sliderImages.every(slider => 
        slider.image
      );

      if (!hasAllSliderImages) {
        toast.error("Please upload images for all slider images");
        return;
      }

      const count = typeof numberOfSliders === "number" ? numberOfSliders : parseInt(numberOfSliders as string) || 0;
      
      // console.log("Slider page data being submitted:", {
      //   numberOfSliders: count,
      //   sliderImages: data.sliderImages.map(slider => ({
      //     link: slider.link,
      //     hasImage: !!slider.image
      //   }))
      // });

      // Prepare data for RTK Query
      const images = data.sliderImages.map(slider => slider.image!);
      const redirectUrls = data.sliderImages.map(slider => slider.link || '');

      // Use RTK Query mutation
      const result = await createSliders({
        images,
        redirectUrls
      }).unwrap();

      // console.log("All sliders uploaded successfully:", result);

      toast.success(`Successfully created ${count} slider images!`);
      
      // Reset form after successful submission
      setPreviewImages({});
      setShowSliderInputs(false);
      fields.forEach((_, index) => remove(index));
      
    } catch (error) {
      console.error("Error creating slider page:", error);
      toast.error(`Failed to create slider page: ${(error as Error).message}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Slider Page</h1>
        <p className="text-gray-600">Design and configure your slider page</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Number of Sliders Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Step 1: Configure Slider Count
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfSliders">Number of Slider Images</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="numberOfSliders"
                  type="number"
                  min="1"
                  max="20"
                  value={numberOfSliders}
                  onChange={(e) => setNumberOfSliders(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className="w-32"
                />
                <Button
                  type="button"
                  onClick={handleSaveSliderCount}
                  className="bg-[#02C1BE] hover:bg-[#02C1BE]/90"
                >
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Dynamic Slider Images */}
        {showSliderInputs && fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Slider Image {index + 1}</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    remove(index);
                    const newPreviews = { ...previewImages };
                    delete newPreviews[index];
                    setPreviewImages(newPreviews);
                  }}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Slider Image</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(index, file);
                        }
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                  {previewImages[index] && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                {errors.sliderImages?.[index]?.image && (
                  <p className="text-sm text-red-600">
                    {errors.sliderImages[index]?.image?.message}
                  </p>
                )}
              </div>

              {/* Image Preview */}
              {previewImages[index] && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={previewImages[index]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Link URL */}
              <div className="space-y-2">
                <Label htmlFor={`sliderImages.${index}.link`}>Link URL (Optional)</Label>
                <Input
                  {...register(`sliderImages.${index}.link`)}
                  placeholder="https://example.com"
                  type="url"
                />
                {errors.sliderImages?.[index]?.link && (
                  <p className="text-sm text-red-600">
                    {errors.sliderImages[index]?.link?.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Submit Button - Only show when slider inputs are visible */}
        {showSliderInputs && (
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setShowSliderInputs(false);
                setPreviewImages({});
                fields.forEach((_, index) => remove(index));
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#02C1BE] hover:bg-[#02C1BE]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Slider Page"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
