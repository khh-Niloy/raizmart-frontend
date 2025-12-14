import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

export default function PaginationButtons({
  meta,
  updateParams,
}: {
  meta: { page: number; pages: number; total: number };
  updateParams: (updates: { page?: number }) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white shadow-sm px-4 sm:px-8 py-4 sm:py-6">
      <div className="text-sm text-gray-600">
        Showing page {meta.page} of {meta.pages} ({meta.total} products)
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            updateParams({ page: Math.max(1, (meta.page || 1) - 1) })
          }
          disabled={meta.page <= 1}
          className="rounded-full"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Prev
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, meta.pages) }, (_, i) => {
            let pageNum;
            if (meta.pages! <= 5) {
              pageNum = i + 1;
            } else if ((meta.page || 1) <= 3) {
              pageNum = i + 1;
            } else if ((meta.page || 1) >= meta.pages! - 2) {
              pageNum = meta.pages! - 4 + i;
            } else {
              pageNum = (meta.page || 1) - 2 + i;
            }
            return (
              <Button
                key={pageNum}
                variant={meta.page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => updateParams({ page: pageNum })}
                className="rounded-full w-10 h-10 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            updateParams({ page: Math.min(meta.pages!, (meta.page || 1) + 1) })
          }
          disabled={meta.page >= meta.pages}
          className="rounded-full"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
