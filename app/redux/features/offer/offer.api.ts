import { baseApi } from "../../baseApi";

export const offerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOffers: builder.query({
      query: () => ({
        url: "/offers",
        method: "GET",
      }),
      providesTags: ["OFFERS"],
    }),

    getOfferById: builder.query({
      query: (id: string) => ({
        url: `/offers/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "OFFERS", id }],
    }),

    createOffers: builder.mutation({
      query: ({ images, urlLinks, endAts }: { images: File[]; urlLinks: string[]; endAts?: string[] }) => {
        const formData = new FormData();
        images.forEach((image) => formData.append("images", image));
        formData.append("urlLinks", JSON.stringify(urlLinks));
        if (endAts && endAts.length) {
          formData.append("endAts", JSON.stringify(endAts));
        }
        return {
          url: "/offers",
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      },
      invalidatesTags: ["OFFERS"],
    }),

    updateOffer: builder.mutation({
      query: ({
        id,
        image,
        imageUrl,
        urlLink,
        endAt,
        status,
      }: {
        id: string;
        image?: File;
        imageUrl?: string;
        urlLink?: string;
        endAt?: string | null;
        status?: "active" | "inactive";
      }) => {
        const formData = new FormData();
        
        // Add image file if provided (takes priority over imageUrl)
        if (image) {
          formData.append("image", image);
        }
        
        // Add imageUrl if provided (existing image, no new upload)
        if (imageUrl !== undefined && imageUrl.trim() !== "") {
          formData.append("imageUrl", imageUrl);
        }
        
        // Add urlLink if provided (can be empty string to clear)
        if (urlLink !== undefined) {
          formData.append("urlLink", urlLink);
        }
        
        // Add endAt if provided (can be empty string or null to clear)
        if (endAt !== undefined) {
          if (endAt === null || endAt === "") {
            formData.append("endAt", "");
          } else {
            // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO string
            // datetime-local format is already in local time, so new Date() will parse it correctly
            try {
              const dateValue = endAt.includes("T") && !endAt.includes("Z") && !endAt.includes(".") && endAt.length <= 16
                ? new Date(endAt).toISOString()
                : endAt; // Already ISO format
              formData.append("endAt", dateValue);
            } catch {
              // If parsing fails, send as-is (backend will handle validation)
              formData.append("endAt", endAt);
            }
          }
        }
        
        // Add status if provided
        if (status !== undefined) {
          formData.append("status", status);
        }

        return {
          url: `/offers/${id}`,
          method: "PATCH",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      },
      invalidatesTags: (result, error, arg) => ["OFFERS", { type: "OFFERS", id: arg.id }],
    }),

    deleteOffer: builder.mutation({
      query: (id: string) => ({
        url: `/offers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OFFERS"],
    }),
  }),
});

export const {
  useGetAllOffersQuery,
  useGetOfferByIdQuery,
  useCreateOffersMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offerApi;


