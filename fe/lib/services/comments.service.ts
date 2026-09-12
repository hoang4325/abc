import { apiClient } from "@/lib/api/client";
import {
  CommentItem,
  CreateCommentInput,
  CommentsResponse,
} from "@/lib/types/comment";

export const commentsService = {
  async getComments(
    articleId: string,
    params?: { page?: number; limit?: number }
  ): Promise<CommentsResponse> {
    return apiClient.get<CommentsResponse>(
      `/articles/${articleId}/comments`,
      params
    );
  },

  async createComment(
    articleId: string,
    input: CreateCommentInput
  ): Promise<{ success: boolean; data: CommentItem }> {
    return apiClient.post<{ success: boolean; data: CommentItem }>(
      `/articles/${articleId}/comments`,
      input
    );
  },

  async deleteComment(
    articleId: string,
    commentId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      `/articles/${articleId}/comments/${commentId}`
    );
  },
};
