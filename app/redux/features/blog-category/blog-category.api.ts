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

    getBlogCategoryById: builder.query({
      query: (id) => ({
        url: `/blog-categories/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (result, error, id) => [{ type: "BLOG_CATEGORIES", id }],
    }),

    updateBlogCategory: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/blog-categories/${id}`,
        method: "PATCH",
        data: payload,
      }),
      invalidatesTags: ["BLOG_CATEGORIES"],
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

    getBlogById: builder.query({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "GET",
      }),
      // Backend returns: { success: true, message: "...", data: blog }
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return response.data;
        }
        return response?.data ?? response;
      },
      providesTags: (result, error, id) => [{ type: "BLOGS", id }],
    }),

    updateBlog: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/blogs/${id}`,
        method: "PATCH",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: (result, error, arg) => ["BLOGS", { type: "BLOGS", id: arg.id }],
    }),
  }),
})

export const { 
  useCreateBlogCategoryMutation, 
  useGetBlogCategoriesQuery,
  useGetBlogCategoryByIdQuery,
  useUpdateBlogCategoryMutation,
  useCreateBlogMutation,
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useUpdateBlogMutation
} = blogCategoryApi
