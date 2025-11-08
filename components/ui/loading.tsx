import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Reusable Product Card Skeleton
 * Used for product listing grids
 */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("border rounded-2xl p-3 bg-white", className)}>
      <Skeleton className="w-full h-48 mb-3" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-3" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

/**
 * Product Grid Skeleton
 * Shows multiple product card skeletons
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Page-level loading skeleton
 */
export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        {message && <p className="text-gray-600">{message}</p>}
      </div>
    </div>
  );
}

/**
 * Simple loading spinner
 */
export function Spinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-3",
    lg: "w-8 h-8 border-4",
  };

  return (
    <div
      className={cn(
        "border-gray-200 border-t-blue-600 rounded-full animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * Button loading state
 */
export function ButtonLoader({ className }: { className?: string }) {
  return <Spinner size="sm" className={cn("mr-2", className)} />;
}

/**
 * Blog card skeleton
 */
export function BlogCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Skeleton className="w-full h-48" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/**
 * Product detail page skeleton
 */
export function ProductDetailSkeleton() {
  return (
    <div className="w-full px-16 mx-auto py-20 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Skeleton className="w-full h-[480px] rounded-lg" />
          <div className="flex gap-3 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-16 h-16 rounded-md" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-9 w-3/4 mb-3" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-full" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Description Section */}
      <div className="mt-16 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

