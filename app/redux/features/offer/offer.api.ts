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
  }),
});

export const { useGetAllOffersQuery, useCreateOffersMutation } = offerApi;


