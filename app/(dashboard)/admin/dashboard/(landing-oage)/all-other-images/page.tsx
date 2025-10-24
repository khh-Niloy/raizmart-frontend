"use client";

import React from 'react';
import { useGetOthersImagesQuery, useDeleteOthersImageMutation } from '@/app/redux/features/other-images/other-images.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function AllOtherImagesPage() {
  const { data, isLoading, error } = useGetOthersImagesQuery(undefined);
  const [deleteOthersImage] = useDeleteOthersImageMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteOthersImage(id).unwrap();
      toast.success('Others image deleted successfully');
    } catch (error) {
      toast.error('Failed to delete others image');
      console.error('Delete error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Others Images</h1>
          <p className="text-gray-600">Manage your others images</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Others Images</h1>
          <p className="text-gray-600">Manage your others images</p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading others images</p>
        </div>
      </div>
    );
  }

  const othersImages = data?.data || [];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Others Images</h1>
        <p className="text-gray-600">Manage your others images</p>
      </div>

      {othersImages.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No others images found</h3>
          <p className="text-gray-600">Create your first others image to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {othersImages.map((othersImage: any) => (
            <Card key={othersImage._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Others Image</CardTitle>
                  <Badge variant={othersImage.status === 'active' ? 'default' : 'secondary'}>
                    {othersImage.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Preview */}
                <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={othersImage.imageUrl}
                    alt="Others image preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Redirect URL */}
                {othersImage.redirectUrl && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ExternalLink className="h-4 w-4" />
                    <a 
                      href={othersImage.redirectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 truncate"
                    >
                      {othersImage.redirectUrl}
                    </a>
                  </div>
                )}

                {/* Created Date */}
                <div className="text-xs text-gray-500">
                  Created: {new Date(othersImage.createdAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(othersImage._id)}
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
