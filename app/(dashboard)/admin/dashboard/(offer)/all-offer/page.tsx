"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Image as ImageIcon, Edit } from "lucide-react";
import {
  useGetAllOffersQuery,
  useUpdateOfferMutation,
} from "@/app/redux/features/offer/offer.api";
import { toast } from "sonner";
import CountdownTimer from "@/components/ui/countdown-timer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Offer {
  _id: string;
  imageUrl?: string;
  urlLink?: string;
  status: string;
  endAt?: string;
  createdAt?: string;
}

export default function AllOfferPage() {
  const { data, isLoading, error } = useGetAllOffersQuery(undefined);
  const allOffers: Offer[] = React.useMemo(() => (data?.data as Offer[]) || [], [data?.data]);
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");

  // Filter offers based on selected status
  const offers = React.useMemo(() => {
    if (statusFilter === "all") return allOffers;
    return allOffers.filter((offer: Offer) => offer.status === statusFilter);
  }, [allOffers, statusFilter]);

  const handleStatusToggle = async (offerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await updateOffer({
        id: offerId,
        status: newStatus as "active" | "inactive",
      }).unwrap();
      toast.success(`Offer status changed to ${newStatus}`);
    } catch (e: unknown) {
      const errorData = e as { data?: { message?: string }; message?: string };
      const errorMessage =
        errorData?.data?.message || errorData?.message || "Failed to update offer status";
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

      {/* Status Filter Buttons */}
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
          className={statusFilter === "all" ? "bg-black text-white hover:bg-black/90" : ""}
        >
          All Status
        </Button>
        <Button
          variant={statusFilter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("active")}
          className={statusFilter === "active" ? "bg-black text-white hover:bg-black/90" : ""}
        >
          Active
        </Button>
        <Button
          variant={statusFilter === "inactive" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("inactive")}
          className={statusFilter === "inactive" ? "bg-black text-white hover:bg-black/90" : ""}
        >
          Inactive
        </Button>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
          <p className="text-gray-600">Create your first offer from Create Offer page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer: Offer) => (
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
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Label htmlFor={`status-${offer._id}`} className="text-sm font-medium cursor-pointer">
                      Status
                    </Label>
                    <Switch
                      id={`status-${offer._id}`}
                      checked={offer.status === "active"}
                      onCheckedChange={() => handleStatusToggle(offer._id, offer.status)}
                      disabled={isUpdating}
                    />
                    <span className="text-sm text-gray-600">
                      {offer.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                {offer.imageUrl && (
                  <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    <Image src={offer.imageUrl} alt="Offer preview" fill className="object-cover" />
                  </div>
                )}

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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}


