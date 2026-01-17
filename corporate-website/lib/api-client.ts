/**
 * API Client for Corporate Website
 * Handles communication with the Core API backend
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add any custom headers or tokens here if needed
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        // Handle common errors
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.error('Unauthorized access');
                    break;
                case 403:
                    console.error('Forbidden access');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error');
                    break;
                default:
                    console.error('API error:', error.response.status);
            }
        } else if (error.request) {
            console.error('Network error - no response received');
        } else {
            console.error('Error setting up request:', error.message);
        }

        return Promise.reject(error);
    }
);

// API Methods
export const api = {
    // Portal Health Check
    checkPortalHealth: async () => {
        const response = await apiClient.get('/api/portal/health');
        return response.data;
    },

    // User Registration
    register: async (userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        dateOfBirth: string;
    }) => {
        const response = await apiClient.post('/api/auth/register', userData);
        return response.data;
    },

    // User Login (returns token for portal redirect)
    login: async (credentials: {
        accountNumber: string;
        password: string;
    }) => {
        const response = await apiClient.post('/api/auth/login', credentials);
        return response.data;
    },

    // Contact Form Submission
    submitContactForm: async (formData: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }) => {
        const response = await apiClient.post('/api/contact', formData);
        return response.data;
    },

    // Account Opening Request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requestAccountOpening: async (applicationData: any) => {
        const response = await apiClient.post('/api/account-applications', applicationData);
        return response.data;
    },
};

export default apiClient;
