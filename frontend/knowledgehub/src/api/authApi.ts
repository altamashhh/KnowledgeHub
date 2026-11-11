import { apiClient, getErrorMessage } from './client';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const authApi = {
  /**
   * Log in user with email and password
   * POST /api/v1/auth/login
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>(
        '/api/v1/auth/login',
        credentials
      );

      // Backend response:
      // {
      //   success: true,
      //   message: "Login successful",
      //   data: {
      //     token: "...",
      //     tokenType: "Bearer",
      //     expiresAt: "...",
      //     user: {
      //       id: 1,
      //       name: "Altamash Sheikh",
      //       email: "altamash0939@gmail.com"
      //     }
      //   }
      // }

      const responseData = response.data;
      const authData = responseData?.data;

      const token = authData?.token || '';

      const backendUser = authData?.user;

      const user = {
        id: backendUser?.id,
        email: backendUser?.email || credentials.email,
        fullName:
          backendUser?.name ||
          credentials.email.split('@')[0],
      };

      return {
        token,
        user,
        email: user.email,
        fullName: user.fullName,
      };
    } catch (error) {
      const errMessage = getErrorMessage(error);
      throw new Error(errMessage);
    }
  },

  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  async register(
    data: RegisterRequest
  ): Promise<{ message?: string; success: boolean }> {
    try {
      const payload = {
        fullName: data.fullName,
        name: data.fullName,
        email: data.email,
        password: data.password,
      };

      const response = await apiClient.post(
        '/api/v1/auth/register',
        payload
      );

      return {
        message:
          response.data?.message ||
          'Registration successful. Please log in.',
        success: true,
      };
    } catch (error) {
      const errMessage = getErrorMessage(error);
      throw new Error(errMessage);
    }
  },
};