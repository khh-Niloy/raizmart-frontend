import { baseApi } from "../../baseApi"

export const sliderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all sliders
    getSliders: builder.query({
      query: () => ({
        url: "/sliders",
        method: "GET",
      }),
      providesTags: ["SLIDERS"],
      transformResponse: (response: any) => response.data,
    }),
    
    // Create sliders (bulk upload)
    createSliders: builder.mutation({
      query: ({ images, redirectUrls }) => {
        const formData = new FormData();
        
        // Add all images
        images.forEach((image: File) => {
          formData.append('images', image);
        });
        
        // Add redirect URLs as JSON string
        formData.append('redirectUrls', JSON.stringify(redirectUrls));
        
        return {
          url: "/sliders",
          method: "POST",
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
      invalidatesTags: ["SLIDERS"],
    }),
    
    // Delete slider
    deleteSlider: builder.mutation({
      query: (id) => ({
        url: `/sliders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SLIDERS"],
    }),
  }),
})

export const {
  useGetSlidersQuery,
  useCreateSlidersMutation,
  useDeleteSliderMutation,
} = sliderApi
