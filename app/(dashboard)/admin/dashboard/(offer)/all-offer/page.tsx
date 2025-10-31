"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Image as ImageIcon, Trash2 } from "lucide-react";
import { useGetAllOffersQuery } from "@/app/redux/features/offer/offer.api";

export default function AllOfferPage() {
  const { data, isLoading, error } = useGetAllOffersQuery(undefined);
  const offers = (data?.data as any[]) || [];

  const handleDelete = async (id: string) => {
    // Wire up with offers API when available
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Offers</h1>
          <p className="text-gray-600">Manage offer images and links</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full bg-gray-200 animate-pulse rounded mb-4" />
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Offers</h1>
          <p className="text-gray-600">Manage offer images and links</p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading offers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Offers</h1>
        <p className="text-gray-600">Manage offer images and links</p>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
          <p className="text-gray-600">Create your first offer from Create Offer page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer: any) => (
            <Card key={offer._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Offer</CardTitle>
                  <Badge variant={offer.status === "active" ? "default" : "secondary"}>
                    {offer.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <img src={offer.imageUrl} alt="Offer preview" className="w-full h-full object-cover" />
                </div>

                {offer.urlLink && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ExternalLink className="h-4 w-4" />
                    <a
                      href={offer.urlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 truncate"
                    >
                      {offer.urlLink}
                    </a>
                  </div>
                )}

                {offer.createdAt && (
                  <div className="text-xs text-gray-500">
                    Created: {new Date(offer.createdAt).toLocaleDateString()}
                  </div>
                )}
                {offer.endAt && (
                  <div className="text-xs text-gray-500">
                    Ends: {new Date(offer.endAt).toLocaleString()}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(offer._id)} className="flex items-center gap-2">
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


