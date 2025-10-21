import { baseApi } from "../../baseApi"

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Product
    createProduct: builder.mutation({
      query: (formData) => ({
        url: "/products",
        method: "POST",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["PRODUCTS"],
    }),
  }),
})

export const {
  useCreateProductMutation,
} = productApi
