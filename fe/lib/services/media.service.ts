import { apiClient } from "../api/client";
import { ApiResponse } from "../types/article";

export const mediaService = {
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.upload<ApiResponse<{ url: string }>>(
      "/media/images",
      formData
    );

    return response.data;
  },
};
