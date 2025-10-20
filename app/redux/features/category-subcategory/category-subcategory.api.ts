import { baseApi } from "../../baseApi"

export const categorySubcategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Categories
    createCategory: builder.mutation({
      query: (payload) => ({
        url: "/categories",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["CATEGORIES"],
    }),

    getCategories: builder.query({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["CATEGORIES"],
    }),

    // Subcategories
    createSubcategory: builder.mutation({
      query: (payload) => ({
        url: "/subcategories",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["SUBCATEGORIES"],
    }),

    getSubcategories: builder.query({
      query: () => ({
        url: "/subcategories",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["SUBCATEGORIES"],
    }),
  }),
})

export const {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useCreateSubcategoryMutation,
  useGetSubcategoriesQuery,
} = categorySubcategoryApi
