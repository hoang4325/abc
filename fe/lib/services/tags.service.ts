import { apiClient } from "../api/client";
import { ApiResponse, Tag } from "../types/article";

export const tagsService = {
  async getTags(search?: string): Promise<Tag[]> {
    const params = search ? { search } : undefined;
    const response = await apiClient.get<ApiResponse<Tag[]>>("/tags", params);
    return response.data || [];
  },
};
