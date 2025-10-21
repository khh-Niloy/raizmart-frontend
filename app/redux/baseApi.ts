import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({}),
  tagTypes: [
    "USER",
    "CATEGORIES",
    "SUBCATEGORIES",
    "BRANDS",
    "BLOG_CATEGORIES",
    "BLOGS",
    "PRODUCTS",
  ],
});
