import { baseApi } from "../../baseApi"

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface OTPPayload {
  email: string;
  otp: string;
}

interface ForgetPasswordCreateOTPPayload {
  email: string;
}

interface ForgetPasswordVerifyOTPPayload {
  email: string;
  otp: string;
}

interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface ApiResponse<T> {
  data?: T;
}

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder)=> ({
        login: builder.mutation({
            query: (userInfo: LoginPayload)=>({
                url: "/auth/login",
                method: "POST",
                data: userInfo
            }),
            invalidatesTags: ["USER"],
        }),
        register: builder.mutation({
            query: (userInfo: RegisterPayload)=>({
                url: "/user/register",
                method: "POST",
                data: userInfo
            }),
            invalidatesTags: ["USER"],
        }),
        changePassword: builder.mutation({
            query: (payload: ChangePasswordPayload)=>({
                url: "/auth/change-password",
                method: "POST",
                data: payload
            }),
            invalidatesTags: ["USER"],
        }),
        sendOTP: builder.mutation({
            query: (email: { email: string })=>({
                url: "/otp/send",
                method: "POST",
                data: email
            })
        }),
        verifyOTP: builder.mutation({
            query: (payload: OTPPayload)=>({
                url: "/otp/verify",
                method: "POST",
                data: payload
            })
        }),
        userInfo: builder.query({
            query: ()=>({
                url: "/user/me",
                method: "GET",
            }),
            transformResponse: (response: unknown): UserInfo | undefined => {
                const apiResponse = response as ApiResponse<UserInfo>;
                return apiResponse.data;
            },
            providesTags: ["USER"]
        }),
        useLogout: builder.mutation({
            query: ()=>({
                url: "/auth/logout",
                method: "POST",
            }),
            invalidatesTags: ["USER"],
        }),
        forgetPasswordCreateOTP: builder.mutation({
            query: (payload: ForgetPasswordCreateOTPPayload)=>({
                url: "/forget-password/create-otp",
                method: "POST",
                data: payload
            })
        }),
        forgetPasswordVerifyOTP: builder.mutation({
            query: (payload: ForgetPasswordVerifyOTPPayload)=>({
                url: "/forget-password/verify-otp",
                method: "POST",
                data: payload
            })
        }),
        resetPassword: builder.mutation({
            query: (payload: ResetPasswordPayload)=>({
                url: "/auth/reset-password",
                method: "POST",
                data: payload
            }),
            invalidatesTags: ["USER"],
        })
    })
})

export const { 
    useRegisterMutation, 
    useLoginMutation, 
    useChangePasswordMutation, 
    useSendOTPMutation, 
    useVerifyOTPMutation, 
    useUserInfoQuery, 
    useUseLogoutMutation,
    useForgetPasswordCreateOTPMutation,
    useForgetPasswordVerifyOTPMutation,
    useResetPasswordMutation
} = authApi