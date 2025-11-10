"use client";

import React from 'react';
import Image from 'next/image';
import { useGetSlidersQuery, useDeleteSliderMutation } from '@/app/redux/features/slider/slider.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function AllSliderImagesPage() {
  const { data, isLoading, error } = useGetSlidersQuery(undefined);
  const [deleteSlider] = useDeleteSliderMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteSlider(id).unwrap();
      toast.success('Slider deleted successfully');
    } catch (error) {
      toast.error('Failed to delete slider');
      console.error('Delete error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Slider Images</h1>
          <p className="text-gray-600">Manage your slider images</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Slider Images</h1>
          <p className="text-gray-600">Manage your slider images</p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading slider images</p>
        </div>
      </div>
    );
  }

  interface Slider {
    _id: string;
    imageUrl: string;
    redirectUrl?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  // Ensure data is an array (transformResponse already extracts data, so data should be the array)
  const sliders: Slider[] = Array.isArray(data) ? data : [];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Slider Images</h1>
        <p className="text-gray-600">Manage your slider images</p>
      </div>

      {sliders.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No slider images found</h3>
          <p className="text-gray-600">Create your first slider image to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.map((slider: Slider) => (
            <Card key={slider._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Slider Image</CardTitle>
                  <Badge variant={slider.status === 'active' ? 'default' : 'secondary'}>
                    {slider.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Preview */}
                <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <Image
                    src={slider.imageUrl}
                    alt="Slider preview"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Redirect URL */}
                {slider.redirectUrl && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ExternalLink className="h-4 w-4" />
                    <a 
                      href={slider.redirectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 truncate"
                    >
                      {slider.redirectUrl}
                    </a>
                  </div>
                )}

                {/* Created Date */}
                {slider.createdAt && (
                  <div className="text-xs text-gray-500">
                    Created: {new Date(slider.createdAt).toLocaleDateString()}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(slider._id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
