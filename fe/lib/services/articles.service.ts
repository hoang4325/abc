import { apiClient } from "../api/client";
import {
  ApiResponse,
  Article,
  ArticleListItem,
  ArticleQuery,
  CreateArticleInput,
  PaginationMeta,
  PublishArticleInput,
  UpdateArticleInput,
} from "../types/article";

export const articlesService = {
  async getArticles(
    query: ArticleQuery = {}
  ): Promise<{ data: ArticleListItem[]; meta: PaginationMeta }> {
    const params: Record<
      string,
      string | number | boolean | undefined | null
    > = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
      categoryId: query.categoryId,
      tag: query.tag,
      sort: query.sort,
      order: query.order,
    };

    const response = await apiClient.get<ApiResponse<ArticleListItem[]>>(
      "/articles",
      params
    );

    return {
      data: response.data || [],
      meta: response.meta || {
        page: query.page || 1,
        limit: query.limit || 20,
        total: (response.data || []).length,
        totalPages: 1,
      },
    };
  },

  async getArticleById(id: string): Promise<Article> {
    const response = await apiClient.get<ApiResponse<Article>>(`/articles/${id}`);
    return response.data;
  },

  async getArticleBySlug(slug: string): Promise<Article> {
    const response = await apiClient.get<ApiResponse<Article>>(
      `/articles/slug/${slug}`
    );
    return response.data;
  },

  async createArticle(input: CreateArticleInput): Promise<Article> {
    const response = await apiClient.post<ApiResponse<Article>>("/articles", input);
    return response.data;
  },

  async updateArticle(
    id: string,
    input: UpdateArticleInput
  ): Promise<Article> {
    const response = await apiClient.patch<ApiResponse<Article>>(
      `/articles/${id}`,
      input
    );
    return response.data;
  },

  async deleteArticle(id: string): Promise<{ deleted: boolean }> {
    const response = await apiClient.delete<
      ApiResponse<{ deleted: boolean }>
    >(`/articles/${id}`);
    return response.data;
  },

  async publishArticle(
    id: string,
    input?: PublishArticleInput
  ): Promise<Article> {
    const response = await apiClient.post<ApiResponse<Article>>(
      `/articles/${id}/publish`,
      input || {}
    );
    return response.data;
  },

  async archiveArticle(id: string): Promise<Article> {
    const response = await apiClient.post<ApiResponse<Article>>(
      `/articles/${id}/archive`,
      {}
    );
    return response.data;
  },
};
