"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Image as ImageIcon, Trash2, Edit } from "lucide-react";
import {
  useGetAllOffersQuery,
  useDeleteOfferMutation,
} from "@/app/redux/features/offer/offer.api";
import { toast } from "sonner";
import CountdownTimer from "@/components/ui/countdown-timer";

export default function AllOfferPage() {
  const { data, isLoading, error } = useGetAllOffersQuery(undefined);
  const offers = (data?.data as any[]) || [];
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteOfferMutation();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteOffer(deleteId).unwrap();
      toast.success("Offer deleted successfully");
      setDeleteId(null);
    } catch (e: any) {
      const errorMessage =
        e?.data?.message || e?.message || "Failed to delete offer";
      toast.error(errorMessage);
    }
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

                {offer.endAt && (
                  <div className="flex justify-center">
                    <CountdownTimer endAt={offer.endAt} darkLabels />
                  </div>
                )}

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

                <div className="flex justify-end gap-2">
                  <Link href={`/admin/dashboard/edit-offer/${offer._id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(offer._id)}
                    disabled={isDeleting}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Offer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this offer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


