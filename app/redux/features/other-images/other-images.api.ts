import { baseApi } from "../../baseApi"

export const othersImagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all others images
    getOthersImages: builder.query({
      query: () => ({
        url: "/others-images",
        method: "GET",
      }),
      providesTags: ["OTHERS_IMAGES"],
      transformResponse: (response: any) => response.data,
    }),
    
    // Create others images (bulk upload)
    createOthersImages: builder.mutation({
      query: ({ images, redirectUrls }) => {
        const formData = new FormData();
        
        // Add all images
        images.forEach((image: File) => {
          formData.append('images', image);
        });
        
        // Add redirect URLs as JSON string
        formData.append('redirectUrls', JSON.stringify(redirectUrls));
        
        return {
          url: "/others-images",
          method: "POST",
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
      invalidatesTags: ["OTHERS_IMAGES"],
    }),
    
    // Delete others image
    deleteOthersImage: builder.mutation({
      query: (id) => ({
        url: `/others-images/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OTHERS_IMAGES"],
    }),
  }),
})

export const {
  useGetOthersImagesQuery,
  useCreateOthersImagesMutation,
  useDeleteOthersImageMutation,
} = othersImagesApi
