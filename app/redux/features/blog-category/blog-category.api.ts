import { baseApi } from "../../baseApi"

export const blogCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBlogCategory: builder.mutation({
      query: (payload) => ({
        url: "/blog-categories",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["BLOG_CATEGORIES"],
    }),

    getBlogCategories: builder.query({
      query: () => ({
        url: "/blog-categories",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["BLOG_CATEGORIES"],
    }),
  }),
})

export const { useCreateBlogCategoryMutation, useGetBlogCategoriesQuery } = blogCategoryApi
