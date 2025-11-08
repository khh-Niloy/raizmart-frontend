import { baseApi } from "../../baseApi"

interface ApiResponse<T> {
  data?: T;
}

export const categorySubcategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Categories
    createCategory: builder.mutation({
      query: (formData: FormData) => ({
        url: "/categories",
        method: "POST",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["CATEGORIES"],
    }),

    updateCategory: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["CATEGORIES"],
    }),

    getCategories: builder.query({
      query: () => ({
        url: "/categories?populate=subcategories.subSubcategories",
        method: "GET",
      }),
      transformResponse: <T,>(response: unknown): T => {
        const apiResponse = response as ApiResponse<T> 
        return (apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) as T;
      },
      providesTags: ["CATEGORIES"],
    }),

    // Subcategories
    createSubcategory: builder.mutation({
      query: (formData: FormData) => ({
        url: "/subcategories",
        method: "POST",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["SUBCATEGORIES"],
    }),

    updateSubcategory: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/subcategories/${id}`,
        method: "PATCH",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["SUBCATEGORIES"],
    }),

    getSubcategories: builder.query({
      query: () => ({
        url: "/subcategories?populate=subSubcategories",
        method: "GET",
      }),
      transformResponse: <T,>(response: unknown): T => {
        const apiResponse = response as ApiResponse<T>;
        return (apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) as T;
      },
      providesTags: ["SUBCATEGORIES"],
    }),

    // Sub-Subcategories
    createSubSubcategory: builder.mutation({
      query: (formData: FormData) => ({
        url: "/sub-subcategories",
        method: "POST",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["SUB_SUBCATEGORIES"],
    }),

    updateSubSubcategory: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/sub-subcategories/${id}`,
        method: "PATCH",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["SUB_SUBCATEGORIES"],
    }),

    getSubSubcategories: builder.query({
      query: () => ({
        url: "/sub-subcategories",
        method: "GET",
      }),
      transformResponse: <T,>(response: unknown): T => {
        const apiResponse = response as ApiResponse<T>;
        return (apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) as T;
      },
      providesTags: ["SUB_SUBCATEGORIES"],
    }),

    deleteSubSubcategory: builder.mutation({
      query: (id: string) => ({
        url: `/sub-subcategories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SUB_SUBCATEGORIES"],
    }),
  }),
})

export const {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoriesQuery,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useGetSubcategoriesQuery,
  useCreateSubSubcategoryMutation,
  useUpdateSubSubcategoryMutation,
  useGetSubSubcategoriesQuery,
  useDeleteSubSubcategoryMutation,
} = categorySubcategoryApi
