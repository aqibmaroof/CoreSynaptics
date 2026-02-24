import sendRequest from "./instance/sendRequest";
import { setTokens } from "./instance/tokenService";

export const LoginService = async (credentials) => {
  try {
    const data = await sendRequest({
      url: "/auth/login",
      method: "POST",
      data: credentials,
    });
    // Save tokens after successful login
    if (data?.access_token ) {
      setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const ChangePassword = async (payload) => {
  try {
    const data = await sendRequest({
      url: "/auth/change-password",
      method: "POST",
      data: payload,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const ForgotPassword = async (payload) => {
  try {
    const data = await sendRequest({
      url: "/auth/forgot-password",
      method: "POST",
      data: payload,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const Logout = async () => {
  try {
    const data = await sendRequest({
      url: "/auth/logout",
      method: "POST",
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const ResetPassword = async (payload) => {
  try {
    const data = await sendRequest({
      url: "/auth/reset-password",
      method: "POST",
      data: payload,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const GetUser = async (credentials) => {
  try {
    const data = await sendRequest({
      url: "/users/me",
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const RegisterService = async (userInfo) => {
  try {
    const data = await sendRequest({
      url: "/auth/register",
      method: "POST",
      data: userInfo,
    });
    // Save tokens after successful registration
    if (data?.accessToken && data?.refreshToken) {
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    }
    return data;
  } catch (error) {
    throw error;
  }
};

// Dummy User
// {
//   "success": true,
//   "message": "User registered successfully with email aqibmaroof786@gmail.com and phone +14547260592",
//   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWphZHNxa2swMDAwdHlhcHY3c3ZuNGx0IiwiZW1haWwiOiJhcWlibWFyb29mNzg2QGdtYWlsLmNvbSIsInBob25lIjoiKzE0NTQ3MjYwNTkyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY1OTk4MzEyLCJleHAiOjE3NjU5OTkyMTJ9.s8P2U9Wa9yyNJQuej0Q2m4lyL6FB5QU1kbgTyqLbRXw",
//   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWphZHNxa2swMDAwdHlhcHY3c3ZuNGx0IiwiZW1haWwiOiJhcWlibWFyb29mNzg2QGdtYWlsLmNvbSIsInBob25lIjoiKzE0NTQ3MjYwNTkyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY1OTk4MzEyLCJleHAiOjE3NjY2MDMxMTJ9.6KHUHYF9C9RBOyz1LT6k4hOAtL7dOW-F3qBlY1QMN00",
//   "role": "admin",
//   "userId": "cmjadsqkk0000tyapv7svn4lt",
//   "emailVerified": false,
//   "phoneVerified": false,
//   "profileComplete": false
// }
