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
        url: "/categories?populate=subcategories.subSubcategories",
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
        url: "/subcategories?populate=subSubcategories",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["SUBCATEGORIES"],
    }),

    // Sub-Subcategories
    createSubSubcategory: builder.mutation({
      query: (payload) => ({
        url: "/sub-subcategories",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["SUB_SUBCATEGORIES"],
    }),

    getSubSubcategories: builder.query({
      query: () => ({
        url: "/sub-subcategories",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["SUB_SUBCATEGORIES"],
    }),

    updateSubSubcategory: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/sub-subcategories/${id}`,
        method: "PUT",
        data: payload,
      }),
      invalidatesTags: ["SUB_SUBCATEGORIES"],
    }),

    deleteSubSubcategory: builder.mutation({
      query: (id) => ({
        url: `/sub-subcategories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SUB_SUBCATEGORIES"],
    }),
  }),
})

export const {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useCreateSubcategoryMutation,
  useGetSubcategoriesQuery,
  useCreateSubSubcategoryMutation,
  useGetSubSubcategoriesQuery,
  useUpdateSubSubcategoryMutation,
  useDeleteSubSubcategoryMutation,
} = categorySubcategoryApi
