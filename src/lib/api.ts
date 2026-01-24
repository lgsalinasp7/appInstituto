/**
 * API Utilities
 * Helper functions for API calls
 */

/**
 * Standard API response type
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Create a success response
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Create an error response
 */
export function errorResponse<T = never>(error: string): ApiResponse<T> {
  return {
    success: false,
    error,
  };
}

/**
 * Handle API errors consistently
 */
export function handleApiError<T = never>(error: unknown): ApiResponse<T> {
  console.error("API Error:", error);
  
  if (error instanceof Error) {
    return errorResponse<T>(error.message);
  }
  
  return errorResponse<T>("An unexpected error occurred");
}

/**
 * Fetch wrapper with error handling
 */
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return errorResponse<T>(data.error || "Request failed");
    }

    return successResponse<T>(data);
  } catch (error) {
    return handleApiError<T>(error);
  }
}
