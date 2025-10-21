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

    // Blog endpoints
    createBlog: builder.mutation({
      query: (formData) => ({
        url: "/blogs",
        method: "POST",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["BLOGS"],
    }),

    getBlogs: builder.query({
      query: () => ({
        url: "/blogs",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["BLOGS"],
    }),
  }),
})

export const { 
  useCreateBlogCategoryMutation, 
  useGetBlogCategoriesQuery,
  useCreateBlogMutation,
  useGetBlogsQuery 
} = blogCategoryApi
