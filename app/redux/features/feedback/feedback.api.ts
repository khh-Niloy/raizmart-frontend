import { baseApi } from "../../baseApi";

interface CreateFeedbackPayload {
  fullName: string;
  phone: string;
  email: string;
  type: string;
  details: string;
}

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createFeedback: builder.mutation({
      query: (payload: CreateFeedbackPayload) => ({
        url: "/feedback/create-feedback",
        method: "POST",
        data: payload,
      }),
    }),
  }),
});

export const { useCreateFeedbackMutation } = feedbackApi;

