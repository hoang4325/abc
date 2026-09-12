import { apiClient } from "../api/client";
import { ApiResponse, Category } from "../types/article";

export const categoriesService = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>("/categories");
    return response.data || [];
  },
};
