"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateOffersMutation } from "@/app/redux/features/offer/offer.api";

// Schema: a list of offer items, each with image + url + endAt
const offerItemSchema = z.object({
  image: z.instanceof(File).optional(),
  url: z.string().url().optional().or(z.literal("")),
  endAt: z.string().optional(),
});

const createOfferSchema = z.object({
  offers: z.array(offerItemSchema).min(1, "Add at least one offer"),
});

type CreateOfferForm = z.infer<typeof createOfferSchema>;

export default function CreateOfferPage() {
  const [previews, setPreviews] = useState<{ [index: number]: string }>({});
  const [createOffers, { isLoading: isSubmitting }] = useCreateOffersMutation();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateOfferForm>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      offers: [{ image: undefined, url: "", endAt: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "offers" });

  const handleImageChange = (index: number, file: File | undefined) => {
    setValue(`offers.${index}.image`, file as File | undefined);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => ({ ...prev, [index]: (e.target?.result as string) || "" }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const onSubmit = async (data: CreateOfferForm) => {
    try {
      const images = (data.offers || [])
        .map((o) => o.image)
        .filter((f): f is File => !!f);
      if (images.length === 0) {
        toast.error("Please upload at least one image");
        return;
      }
      const urlLinks = (data.offers || []).map((o) => o.url || "");
      const endAts = (data.offers || []).map((o) => o.endAt || "");
      await createOffers({ images, urlLinks, endAts }).unwrap();
      toast.success("Offers created successfully");
    } catch {
      toast.error("Failed to create offers");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Offer</h1>
        <p className="text-gray-600">Add pairs of image and URL. Use Add to append more.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Offer {index + 1}</span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      remove(index);
                      setPreviews((prev) => {
                        const next = { ...prev };
                        delete next[index];
                        return next;
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image upload */}
                <div className="space-y-2">
                  <Label>Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(index, e.target.files?.[0])}
                  />
                  {previews[index] && (
                    <div className="space-y-2">
                      <div className="relative w-full h-40 border border-gray-200 rounded overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previews[index]} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleImageChange(index, undefined)}
                          className="absolute top-2 right-2 bg-white/90 border rounded p-1"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                  </div>
                  )}
                  {errors.offers?.[index]?.image && (
                    <p className="text-sm text-red-600">{String(errors.offers[index]?.image?.message || '')}</p>
                  )}
                </div>

                {/* URL input */}
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    {...register(`offers.${index}.url`)}
                  />
                  {errors.offers?.[index]?.url && (
                    <p className="text-sm text-red-600">{String(errors.offers[index]?.url?.message || '')}</p>
                  )}
                </div>

                {/* End date-time per offer */}
                <div className="space-y-2">
                  <Label>End date & time</Label>
                  <Input
                    type="datetime-local"
                    {...register(`offers.${index}.endAt`)}
                  />
                  {errors.offers?.[index]?.endAt && (
                    <p className="text-sm text-red-600">{String(errors.offers[index]?.endAt?.message || '')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ image: undefined, url: "" })}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add another
          </Button>

          <Button type="submit" className="px-6" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}


