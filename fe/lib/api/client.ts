import { ApiErrorResponse } from "../types/article";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "API_ERROR", status = 500) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...restOptions } = options;

  const cleanBase = BASE_URL.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = new URL(`${cleanBase}${cleanEndpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }

  const reqHeaders = new Headers(headers);

  const isFormData = restOptions.body instanceof FormData;
  if (!isFormData && !reqHeaders.has("Content-Type")) {
    reqHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(fullUrl.toString(), {
    ...restOptions,
    headers: reqHeaders,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    let errorCode = "API_ERROR";

    try {
      const errorJson = (await response.json()) as
        | ApiErrorResponse
        | { message?: string | string[]; code?: string };

      if ("error" in errorJson && errorJson.error) {
        errorMessage = errorJson.error.message || errorMessage;
        errorCode = errorJson.error.code || errorCode;
      } else if ("message" in errorJson && errorJson.message) {
        errorMessage = Array.isArray(errorJson.message)
          ? errorJson.message.join("; ")
          : errorJson.message;
        errorCode = errorJson.code || errorCode;
      }
    } catch {
    }

    throw new ApiError(errorMessage, errorCode, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>,
    init?: RequestInit
  ): Promise<T> {
    return request<T>(endpoint, { ...init, method: "GET", params });
  },

  post<T>(endpoint: string, body?: unknown, init?: RequestInit): Promise<T> {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, {
      ...init,
      method: "POST",
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body?: unknown, init?: RequestInit): Promise<T> {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, {
      ...init,
      method: "PATCH",
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string, init?: RequestInit): Promise<T> {
    return request<T>(endpoint, { ...init, method: "DELETE" });
  },

  upload<T>(endpoint: string, formData: FormData, init?: RequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...init,
      method: "POST",
      body: formData,
    });
  },
};
