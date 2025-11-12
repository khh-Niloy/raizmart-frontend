import { baseApi } from "../../baseApi"

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
}

export const blogCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBlogCategory: builder.mutation({
      query: (payload: Record<string, unknown>) => ({
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
      transformResponse: <T,>(response: unknown): T => {
        const apiResponse = response as ApiResponse<T>;
        return (apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) as T;
      },
      providesTags: ["BLOG_CATEGORIES"],
    }),

    getBlogCategoryById: builder.query({
      query: (id: string) => ({
        url: `/blog-categories/${id}`,
        method: "GET",
      }),
      transformResponse: <T,>(response: unknown): T => {
        const apiResponse = response as ApiResponse<T>;
        return (apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) as T;
      },
      providesTags: (result, error, id) => [{ type: "BLOG_CATEGORIES", id }],
    }),

    updateBlogCategory: builder.mutation({
      query: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => ({
        url: `/blog-categories/${id}`,
        method: "PATCH",
        data: payload,
      }),
      invalidatesTags: ["BLOG_CATEGORIES"],
    }),

    // Blog endpoints
    createBlog: builder.mutation({
      query: (formData: FormData) => ({
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
      transformResponse: <T,>(response: unknown): T => {
        const apiResponse = response as ApiResponse<T>;
        return (apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) as T;
      },
      providesTags: ["BLOGS"],
    }),

    getBlogById: builder.query({
      query: (id: string) => ({
        url: `/blogs/${id}`,
        method: "GET",
      }),
      // Backend returns: { success: true, message: "...", data: blog }
      transformResponse: <T,>(response: unknown): T => {
        const apiResponse = response as ApiResponse<T>;
        if (apiResponse?.success && apiResponse?.data) {
          return apiResponse.data as T;
        }
        return ((apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) ?? apiResponse) as T;
      },
      providesTags: (result, error, id) => [{ type: "BLOGS", id }],
    }),

    updateBlog: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/blogs/${id}`,
        method: "PATCH",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: (result, error, arg) => ["BLOGS", { type: "BLOGS", id: arg.id }],
    }),

    deleteBlogCategory: builder.mutation({
      query: (id: string) => ({
        url: `/blog-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BLOG_CATEGORIES"],
    }),

    deleteBlog: builder.mutation({
      query: (id: string) => ({
        url: `/blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BLOGS"],
    }),
  }),
})

export const { 
  useCreateBlogCategoryMutation, 
  useGetBlogCategoriesQuery,
  useGetBlogCategoryByIdQuery,
  useUpdateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
  useCreateBlogMutation,
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useUpdateBlogMutation,
  useDeleteBlogMutation
} = blogCategoryApi
