import { baseApi } from "../../baseApi"

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder)=> ({
        login: builder.mutation({
            query: (userInfo)=>({
                url: "/auth/login",
                method: "POST",
                data: userInfo
            }),
            invalidatesTags: ["USER"],
        }),
        register: builder.mutation({
            query: (userInfo)=>({
                url: "/user/register",
                method: "POST",
                data: userInfo
            }),
            invalidatesTags: ["USER"],
        }),
        sendOTP: builder.mutation({
            query: (email)=>({
                url: "/otp/send",
                method: "POST",
                data: email
            })
        }),
        verifyOTP: builder.mutation({
            query: (payload)=>({
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
            transformResponse: (response: any)=> {
                return response.data;
            },
            providesTags: ["USER"]
        }),
        useLogout: builder.mutation({
            query: ()=>({
                url: "/auth/logout",
                method: "POST",
            }),
            invalidatesTags: ["USER"],
        })
    })
})

export const { useRegisterMutation, useLoginMutation, useSendOTPMutation, useVerifyOTPMutation, useUserInfoQuery, useUseLogoutMutation } = authApi